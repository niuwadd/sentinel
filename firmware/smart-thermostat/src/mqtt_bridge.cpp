#include "mqtt_bridge.h"

#include <Arduino.h>
#include <WiFi.h>

#include "config.h"

using namespace climelens;

MqttBridge::MqttBridge()
    : localClient_(localTcp_), cloudClient_(cloudTls_), active_(nullptr), lastReconnectMs_(0) {}

void MqttBridge::begin(MessageHandler handler) {
  handler_ = handler;
  localClient_.setServer(LOCAL_MQTT_HOST, LOCAL_MQTT_PORT);
  cloudClient_.setServer(CLOUD_MQTT_HOST, CLOUD_MQTT_PORT);
  localClient_.setSocketTimeout(3000);
  cloudClient_.setSocketTimeout(3000);
  cloudTls_.setInsecure();

  localClient_.setCallback([this](char* topic, uint8_t* payload, unsigned int length) {
    if (handler_) {
      handler_(String(topic), String(reinterpret_cast<char*>(payload), length));
    }
  });
  cloudClient_.setCallback([this](char* topic, uint8_t* payload, unsigned int length) {
    if (handler_) {
      handler_(String(topic), String(reinterpret_cast<char*>(payload), length));
    }
  });
}

bool MqttBridge::connectToLocal() {
  if (localClient_.connected()) {
    return true;
  }
  if (!localClient_.connect(MQTT_CLIENT_ID)) {
    return false;
  }
  active_ = &localClient_;
  resubscribe(localClient_);
  return true;
}

bool MqttBridge::connectToCloud() {
  if (!CLOUD_MQTT_ENABLED) {
    return false;
  }
  if (cloudClient_.connected()) {
    return true;
  }
  if (!cloudClient_.connect(MQTT_CLIENT_ID)) {
    return false;
  }
  active_ = &cloudClient_;
  resubscribe(cloudClient_);
  return true;
}

void MqttBridge::loop() {
  localClient_.loop();
  cloudClient_.loop();

  if (active_ && active_->connected()) {
    return;
  }
  active_ = nullptr;

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  const uint32_t now = millis();
  if (now - lastReconnectMs_ < MQTT_RECONNECT_MS) {
    return;
  }
  lastReconnectMs_ = now;

  if (!connectToLocal()) {
    connectToCloud();
  }
}

bool MqttBridge::connected() const {
  return active_ != nullptr && active_->connected();
}

void MqttBridge::publish(const char* topic, const char* payload, bool retained) {
  if (!connected()) {
    return;
  }
  active_->publish(topic, payload, retained);
}

void MqttBridge::subscribe(const char* topic) {
  subscriptions_.emplace_back(topic);
  if (connected()) {
    active_->subscribe(topic);
  }
}

void MqttBridge::resubscribe(PubSubClient& client) {
  for (const String& topic : subscriptions_) {
    client.subscribe(topic.c_str());
  }
}
