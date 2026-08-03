#include "ac_codec.h"

#include <ArduinoJson.h>
#include <cstring>

namespace climelens {

bool parseAcCommand(const char* json, AcCommand& out) {
  JsonDocument doc;
  if (deserializeJson(doc, json) != DeserializationError::Ok) {
    return false;
  }

  const char* power = doc["payload"]["power"] | "";
  if (power[0] == '\0') {
    return false;
  }

  out.power = std::strcmp(power, "on") == 0;
  out.mode = doc["payload"]["mode"] | "auto";
  out.targetTemp = doc["payload"]["targetTemp"] | 24;
  out.fanSpeed = doc["payload"]["fanSpeed"] | "auto";
  out.swing = doc["payload"]["swing"] | false;
  return true;
}

}  // namespace climelens
