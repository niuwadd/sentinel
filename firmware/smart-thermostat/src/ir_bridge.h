#pragma once

#include <cstdint>
#include <vector>

#include <IRrecv.h>
#include <IRsend.h>
#include <Preferences.h>

class IrBridge {
 public:
  IrBridge(uint16_t sendPin, uint16_t recvPin);
  void begin();
  bool learn(uint32_t timeoutMs, std::vector<uint16_t>& raw);
  bool storeRaw(const std::vector<uint16_t>& raw);
  bool loadRaw(std::vector<uint16_t>& raw);
  bool hasCode() const;
  bool sendRaw(const std::vector<uint16_t>& raw);
  bool sendNec(uint16_t address, uint16_t command, uint16_t repeats);

 private:
  static constexpr char NVS_NAMESPACE[] = "climelens";
  static constexpr char NVS_KEY[] = "ir_raw";

  IRsend irsend_;
  IRrecv irrecv_;
  Preferences prefs_;
  bool hasCode_;
};
