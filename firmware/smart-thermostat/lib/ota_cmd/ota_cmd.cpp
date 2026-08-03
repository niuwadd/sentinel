#include "ota_cmd.h"

#include <ArduinoJson.h>

namespace climelens {

bool parseOtaCommand(const char* json, OtaCommand& out) {
  JsonDocument doc;
  if (deserializeJson(doc, json) != DeserializationError::Ok) {
    return false;
  }

  const char* url = doc["url"] | "";
  if (url[0] == '\0') {
    return false;
  }

  out.url = url;
  out.version = doc["version"] | "";
  return true;
}

}  // namespace climelens
