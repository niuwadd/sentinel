#include <Arduino.h>

#include <DHT.h>

DHT dht(4, DHT22);

void setup() {
  USBSerial.begin(115200);
  delay(1000);
  USBSerial.println("[DHT selftest] boot - reading every 3s on GPIO4");
  dht.begin();
}

void loop() {
  const float temp = dht.readTemperature();
  const float humi = dht.readHumidity();
  if (isnan(temp) || isnan(humi)) {
    USBSerial.println("[DHT selftest] read FAILED - check wiring / pullup resistor");
  } else {
    USBSerial.printf("[DHT selftest] %.1fC %.0f%%\n", temp, humi);
  }
  delay(3000);
}
