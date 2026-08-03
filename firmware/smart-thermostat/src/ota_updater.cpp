#include "ota_updater.h"

#include <HTTPClient.h>
#include <Update.h>
#include <WiFiClient.h>

namespace climelens {

bool performOtaUpdate(const String& url) {
  HTTPClient http;
  if (!http.begin(url)) {
    return false;
  }

  const int statusCode = http.GET();
  if (statusCode != HTTP_CODE_OK) {
    http.end();
    return false;
  }

  const int totalSize = http.getSize();
  WiFiClient* stream = http.getStreamPtr();
  if (!Update.begin(totalSize)) {
    http.end();
    return false;
  }

  const size_t written = Update.writeStream(*stream);
  http.end();
  if (written != static_cast<size_t>(totalSize) || !Update.end()) {
    return false;
  }

  ESP.restart();
  return true;
}

}  // namespace climelens
