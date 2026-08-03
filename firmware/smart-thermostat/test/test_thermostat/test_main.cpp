#include <unity.h>
#include <thermostat.h>

#if defined(ARDUINO)
#include <Arduino.h>
#endif

using namespace climelens;

void test_force_cooling_above_30() {
  TEST_ASSERT_EQUAL(HvacCommand::cool, decideThermostatAction(30.1f, HvacCommand::none));
}

void test_stop_cooling_below_22() {
  TEST_ASSERT_EQUAL(HvacCommand::stop, decideThermostatAction(21.9f, HvacCommand::cool));
}

void test_no_action_in_comfort_band() {
  TEST_ASSERT_EQUAL(HvacCommand::none, decideThermostatAction(25.0f, HvacCommand::cool));
}

void test_boundary_30_is_not_forced() {
  TEST_ASSERT_EQUAL(HvacCommand::none, decideThermostatAction(30.0f, HvacCommand::none));
}

void test_boundary_22_is_not_stopped() {
  TEST_ASSERT_EQUAL(HvacCommand::none, decideThermostatAction(22.0f, HvacCommand::cool));
}

void runAllTests() {
  RUN_TEST(test_force_cooling_above_30);
  RUN_TEST(test_stop_cooling_below_22);
  RUN_TEST(test_no_action_in_comfort_band);
  RUN_TEST(test_boundary_30_is_not_forced);
  RUN_TEST(test_boundary_22_is_not_stopped);
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
