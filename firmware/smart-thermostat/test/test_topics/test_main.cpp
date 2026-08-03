#include <string>
#include <unity.h>
#include <topics.h>

#if defined(ARDUINO)
#include <Arduino.h>
#endif

using namespace climelens;

void test_sensor_data_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/living/data", sensorDataTopic("living").c_str());
}

void test_device_status_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/bedroom-a/status", deviceStatusTopic("bedroom-a").c_str());
}

void test_ac_control_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/bedroom-a/ac/ctrl", acControlTopic("bedroom-a").c_str());
}

void test_device_config_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/living/config", deviceConfigTopic("living").c_str());
}

void test_device_sync_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/living/sync", deviceSyncTopic("living").c_str());
}

void test_ota_topic() {
  TEST_ASSERT_EQUAL_STRING("house/room/bedroom-a/ota", otaTopic("bedroom-a").c_str());
}

void runAllTests() {
  RUN_TEST(test_sensor_data_topic);
  RUN_TEST(test_device_status_topic);
  RUN_TEST(test_ac_control_topic);
  RUN_TEST(test_device_config_topic);
  RUN_TEST(test_device_sync_topic);
  RUN_TEST(test_ota_topic);
}

void setup() {
  delay(2000);
  UNITY_BEGIN();
  runAllTests();
  UNITY_END();
}

void loop() {
  delay(10);
}

#if !defined(ARDUINO)
int main() {
  UNITY_BEGIN();
  runAllTests();
  return UNITY_END();
}
#endif
