#include <unity.h>
#include <ac_codec.h>

#if defined(ARDUINO)
#include <Arduino.h>
#endif

using namespace climelens;

void test_parse_full_command() {
  const char* json =
      "{\"deviceId\":\"bedroom-a\",\"type\":\"command\",\"action\":\"ac_control\","
      "\"payload\":{\"power\":\"on\",\"mode\":\"cool\",\"targetTemp\":24,\"fanSpeed\":\"auto\","
      "\"swing\":true},\"source\":\"manual\",\"viaBroker\":\"local\",\"reason\":\"手动\","
      "\"timestamp\":\"2026-08-01T00:00:00.000Z\"}";

  AcCommand cmd;
  TEST_ASSERT_TRUE(parseAcCommand(json, cmd));
  TEST_ASSERT_TRUE(cmd.power);
  TEST_ASSERT_EQUAL_STRING("cool", cmd.mode.c_str());
  TEST_ASSERT_EQUAL(24, cmd.targetTemp);
  TEST_ASSERT_EQUAL_STRING("auto", cmd.fanSpeed.c_str());
  TEST_ASSERT_TRUE(cmd.swing);
}

void test_parse_power_off_defaults() {
  const char* json =
      "{\"deviceId\":\"living\",\"type\":\"command\",\"action\":\"ac_control\","
      "\"payload\":{\"power\":\"off\"},\"source\":\"manual\",\"viaBroker\":\"local\","
      "\"reason\":\"关闭\",\"timestamp\":\"2026-08-01T00:00:00.000Z\"}";

  AcCommand cmd;
  TEST_ASSERT_TRUE(parseAcCommand(json, cmd));
  TEST_ASSERT_FALSE(cmd.power);
  TEST_ASSERT_EQUAL_STRING("auto", cmd.mode.c_str());
  TEST_ASSERT_EQUAL(24, cmd.targetTemp);
  TEST_ASSERT_EQUAL_STRING("auto", cmd.fanSpeed.c_str());
  TEST_ASSERT_FALSE(cmd.swing);
}

void test_reject_invalid_json() {
  AcCommand cmd;
  TEST_ASSERT_FALSE(parseAcCommand("{not-json", cmd));
}

void runAllTests() {
  RUN_TEST(test_parse_full_command);
  RUN_TEST(test_parse_power_off_defaults);
  RUN_TEST(test_reject_invalid_json);
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
