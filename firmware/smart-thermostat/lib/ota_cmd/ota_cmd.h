#pragma once

#include <string>

namespace climelens {

struct OtaCommand {
  std::string url;
  std::string version;
};

bool parseOtaCommand(const char* json, OtaCommand& out);

}  // namespace climelens
