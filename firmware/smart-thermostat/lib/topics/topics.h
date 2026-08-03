#pragma once

#include <string>

namespace climelens {

std::string sensorDataTopic(const std::string& roomId);
std::string deviceStatusTopic(const std::string& roomId);
std::string acControlTopic(const std::string& roomId);
std::string deviceConfigTopic(const std::string& roomId);
std::string deviceSyncTopic(const std::string& roomId);
std::string otaTopic(const std::string& roomId);

}  // namespace climelens
