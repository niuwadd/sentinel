#pragma once

namespace climelens {

enum class HvacCommand { none, cool, stop };

HvacCommand decideThermostatAction(float tempCelsius, HvacCommand currentCommand);

}  // namespace climelens
