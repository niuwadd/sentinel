#include "ir_bridge.h"

#include <Arduino.h>

#include <IRutils.h>

IrBridge::IrBridge(uint16_t sendPin, uint16_t recvPin)
    : irsend_(sendPin), irrecv_(recvPin), hasCode_(false) {}

void IrBridge::begin() {
  irsend_.begin();
  irrecv_.enableIRIn();
  std::vector<uint16_t> raw;
  hasCode_ = loadRaw(raw);
}

bool IrBridge::learn(uint32_t timeoutMs, std::vector<uint16_t>& raw) {
  decode_results results;
  irrecv_.resume();
  irrecv_.enableIRIn();

  const uint32_t deadline = millis() + timeoutMs;
  while (millis() < deadline) {
    if (irrecv_.decode(&results)) {
      irrecv_.disableIRIn();
      if (results.rawlen > 3) {
        raw.assign(results.rawbuf, results.rawbuf + results.rawlen);
        hasCode_ = storeRaw(raw);
        return hasCode_;
      }
      irrecv_.resume();
    }
  }

  irrecv_.disableIRIn();
  return false;
}

bool IrBridge::storeRaw(const std::vector<uint16_t>& raw) {
  if (raw.empty()) {
    return false;
  }
  prefs_.begin(NVS_NAMESPACE, false);
  String encoded;
  for (size_t i = 0; i < raw.size(); ++i) {
    if (i > 0) {
      encoded += ',';
    }
    encoded += String(raw[i]);
  }
  const bool ok = prefs_.putString(NVS_KEY, encoded);
  prefs_.end();
  return ok;
}

bool IrBridge::loadRaw(std::vector<uint16_t>& raw) {
  prefs_.begin(NVS_NAMESPACE, true);
  const String encoded = prefs_.getString(NVS_KEY, "");
  prefs_.end();
  if (encoded.length() == 0) {
    return false;
  }

  raw.clear();
  int start = 0;
  while (start < encoded.length()) {
    const int comma = encoded.indexOf(',', start);
    const String token = comma < 0 ? encoded.substring(start) : encoded.substring(start, comma);
    raw.push_back(static_cast<uint16_t>(token.toInt()));
    if (comma < 0) {
      break;
    }
    start = comma + 1;
  }
  return !raw.empty();
}

bool IrBridge::hasCode() const {
  return hasCode_;
}

bool IrBridge::sendRaw(const std::vector<uint16_t>& raw) {
  if (raw.empty()) {
    return false;
  }
  irsend_.sendRaw(raw.data(), raw.size(), 38000);
  return true;
}

bool IrBridge::sendNec(uint16_t address, uint16_t command, uint16_t repeats) {
  const uint64_t data = (static_cast<uint64_t>(address) << 16) | command;
  irsend_.sendNEC(data, kNECBits, repeats);
  return true;
}

constexpr char IrBridge::NVS_NAMESPACE[];
constexpr char IrBridge::NVS_KEY[];
