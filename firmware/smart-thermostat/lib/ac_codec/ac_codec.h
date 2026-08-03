#pragma once

#include <string>

namespace climelens {

struct AcCommand {
  bool power;
  std::string mode;
  int targetTemp;
  std::string fanSpeed;
  bool swing;
};

bool parseAcCommand(const char* json, AcCommand& out);

}  // namespace climelens
