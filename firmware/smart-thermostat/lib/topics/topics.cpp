#include "topics.h"

namespace climelens {

std::string sensorDataTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/data";
}

std::string deviceStatusTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/status";
}

std::string acControlTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/ac/ctrl";
}

std::string deviceConfigTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/config";
}

std::string deviceSyncTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/sync";
}

std::string otaTopic(const std::string& roomId) {
  return "house/room/" + roomId + "/ota";
}

}  // namespace climelens
