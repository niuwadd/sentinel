#include <unity.h>
#include <ota_cmd.h>

#if defined(ARDUINO)
#include <Arduino.h>
#endif

using namespace climelens;

void test_parse_ota_command() {
  const char* json =
      "{\"deviceId\":\"bedroom-a\",\"action\":\"ota\","
      "\"url\":\"http://192.168.1.10/firmware.bin\",\"version\":\"1.0.1\"}";

  OtaCommand cmd;
  TEST_ASSERT_TRUE(parseOtaCommand(json, cmd));
  TEST_ASSERT_EQUAL_STRING("http://192.168.1.10/firmware.bin", cmd.url.c_str());
  TEST_ASSERT_EQUAL_STRING("1.0.1", cmd.version.c_str());
}

void test_reject_missing_url() {
  const char* json = "{\"deviceId\":\"bedroom-a\",\"action\":\"ota\",\"version\":\"1.0.1\"}";

  OtaCommand cmd;
  TEST_ASSERT_FALSE(parseOtaCommand(json, cmd));
}

void test_reject_invalid_json() {
  OtaCommand cmd;
  TEST_ASSERT_FALSE(parseOtaCommand("{bad", cmd));
}

void runAllTests() {
  RUN_TEST(test_parse_ota_command);
  RUN_TEST(test_reject_missing_url);
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
