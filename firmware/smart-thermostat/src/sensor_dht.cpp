#include "sensor_dht.h"

#include <math.h>

Dht22Sensor::Dht22Sensor(uint8_t pin) : dht_(pin, DHT22) {}

bool Dht22Sensor::begin() {
  dht_.begin();
  return true;
}

bool Dht22Sensor::read(float& tempCelsius, float& humidityPercent) {
  const float temp = dht_.readTemperature();
  const float humi = dht_.readHumidity();
  if (isnan(temp) || isnan(humi)) {
    return false;
  }
  tempCelsius = temp;
  humidityPercent = humi;
  return true;
}
