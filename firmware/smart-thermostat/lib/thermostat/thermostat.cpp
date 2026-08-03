#include "thermostat.h"

namespace climelens {

HvacCommand decideThermostatAction(float tempCelsius, HvacCommand currentCommand) {
  if (tempCelsius > 30.0f) {
    return HvacCommand::cool;
  }
  if (tempCelsius < 22.0f && currentCommand == HvacCommand::cool) {
    return HvacCommand::stop;
  }
  return HvacCommand::none;
}

}  // namespace climelens
