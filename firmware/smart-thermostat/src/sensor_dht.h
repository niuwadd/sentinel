#pragma once

#include <cstdint>

#include <DHT.h>

class Dht22Sensor {
 public:
  explicit Dht22Sensor(uint8_t pin);
  bool begin();
  bool read(float& tempCelsius, float& humidityPercent);

 private:
  DHT dht_;
};
