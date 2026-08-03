#pragma once

#include <cstdint>

namespace climelens {

inline constexpr char ROOM_ID[] = "living";
inline constexpr char DEVICE_ID[] = "living";

inline constexpr uint8_t PIN_DHT22 = 4;
inline constexpr uint8_t PIN_IR_SEND = 32;
inline constexpr uint8_t PIN_IR_RECV = 15;
inline constexpr bool IR_ENABLED = false;

inline constexpr uint32_t SENSOR_INTERVAL_MS = 30000UL;
inline constexpr uint32_t MQTT_RECONNECT_MS = 5000UL;
inline constexpr uint32_t IR_LEARN_TIMEOUT_MS = 15000UL;

inline constexpr char WIFI_SSID[] = "ChinaNet-402";
inline constexpr char WIFI_PASSWORD[] = "13281245395";

inline constexpr char LOCAL_MQTT_HOST[] = "192.168.101.4";
inline constexpr uint16_t LOCAL_MQTT_PORT = 1883;

inline constexpr bool CLOUD_MQTT_ENABLED = false;
inline constexpr char CLOUD_MQTT_HOST[] = "cloud.emqx.io";
inline constexpr uint16_t CLOUD_MQTT_PORT = 8883;

inline constexpr char MQTT_CLIENT_ID[] = "esp32s3_living";

}  // namespace climelens
