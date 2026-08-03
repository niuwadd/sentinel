#include <Arduino.h>
#include <WiFi.h>

#include <time.h>

#include <ArduinoJson.h>
#include <ac_codec.h>
#include <ota_cmd.h>
#include <thermostat.h>
#include <topics.h>

#include "config.h"
#include "ir_bridge.h"
#include "mqtt_bridge.h"
#include "ota_updater.h"
#include "sensor_dht.h"

using namespace climelens;

Dht22Sensor gSensor(PIN_DHT22);
IrBridge gIr(PIN_IR_SEND, PIN_IR_RECV);
MqttBridge gMqtt;

bool gWifiConnected = false;
HvacCommand gCurrentCommand = HvacCommand::none;
float gLastTemp = 25.0f;
unsigned long gLastSensorMs = 0;

String isoNow() {
  const time_t now = time(nullptr);
  struct tm timeinfo;
  if (!gmtime_r(&now, &timeinfo)) {
    return "1970-01-01T00:00:00Z";
  }
  char buffer[32];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

void publishStatus(const char* status) {
  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["status"] = status;
  doc["timestamp"] = isoNow();

  String payload;
  serializeJson(doc, payload);
  gMqtt.publish(deviceStatusTopic(ROOM_ID).c_str(), payload.c_str());
}

void publishSensor(float temp, float humi) {
  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["type"] = "sensor";
  doc["temp"] = temp;
  doc["humi"] = humi;
  doc["heatIndex"] = temp;
  doc["battery"] = 100;
  doc["rssi"] = WiFi.RSSI();
  doc["broker"] = "local";
  doc["status"] = "online";
  doc["timestamp"] = isoNow();

  String payload;
  serializeJson(doc, payload);
  gMqtt.publish(sensorDataTopic(ROOM_ID).c_str(), payload.c_str());
}

void runLocalFallback(float temp) {
  const HvacCommand action = decideThermostatAction(temp, gCurrentCommand);
  if (action == gCurrentCommand) {
    return;
  }

  if (!IR_ENABLED || !gIr.hasCode()) {
    return;
  }

  std::vector<uint16_t> raw;
  if (gIr.loadRaw(raw)) {
    gIr.sendRaw(raw);
    gCurrentCommand = action;
  }
}

void onMqttMessage(const String& topic, const String& payload) {
  if (topic == String(acControlTopic(ROOM_ID).c_str())) {
    AcCommand cmd;
    if (parseAcCommand(payload.c_str(), cmd)) {
      std::vector<uint16_t> raw;
      if (IR_ENABLED && gIr.loadRaw(raw)) {
        gIr.sendRaw(raw);
      }
      gCurrentCommand = cmd.power ? HvacCommand::cool : HvacCommand::none;
    }
    return;
  }

  if (topic == String(otaTopic(ROOM_ID).c_str())) {
    OtaCommand cmd;
    if (parseOtaCommand(payload.c_str(), cmd)) {
      performOtaUpdate(String(cmd.url.c_str()));
    }
  }
}

void setup() {
  USBSerial.begin(115200);
  delay(300);
  USBSerial.printf("[setup] boot t=%lu\n", millis());

  USBSerial.printf("[setup] sensor t=%lu\n", millis());
  gSensor.begin();
  if (IR_ENABLED) {
    USBSerial.printf("[setup] ir t=%lu\n", millis());
    gIr.begin();
  }
  USBSerial.printf("[setup] mqtt t=%lu\n", millis());
  gMqtt.begin(onMqttMessage);
  gMqtt.subscribe(acControlTopic(ROOM_ID).c_str());
  gMqtt.subscribe(otaTopic(ROOM_ID).c_str());

  USBSerial.printf("[setup] wifi begin t=%lu\n", millis());
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  configTime(8 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  USBSerial.printf("[setup] done t=%lu\n", millis());
}

void loop() {
  gMqtt.loop();

  const bool nowConnected = WiFi.status() == WL_CONNECTED;
  if (nowConnected != gWifiConnected) {
    gWifiConnected = nowConnected;
    USBSerial.printf("[wifi] status: %s\n", nowConnected ? "connected" : "disconnected");
    publishStatus(nowConnected ? "online" : "offline");
  }

  if (gWifiConnected && gMqtt.connected()) {
    static bool mqttLogged = false;
    if (!mqttLogged) {
      mqttLogged = true;
      USBSerial.println("[mqtt] connected");
    }
  } else {
    static bool mqttLostLogged = false;
    if (!mqttLostLogged) {
      mqttLostLogged = true;
      USBSerial.println("[mqtt] waiting for connection");
    }
  }

  const unsigned long now = millis();
  if (now - gLastSensorMs < SENSOR_INTERVAL_MS) {
    return;
  }
  gLastSensorMs = now;

  float temp;
  float humi;
  if (gSensor.read(temp, humi)) {
    gLastTemp = temp;
    USBSerial.printf("[sensor] %.1fC %.0f%%\n", temp, humi);
    if (gWifiConnected) {
      publishSensor(temp, humi);
    } else {
      runLocalFallback(temp);
    }
  } else if (gWifiConnected) {
    USBSerial.println("[sensor] read failed");
    publishStatus("fault");
  }
}
