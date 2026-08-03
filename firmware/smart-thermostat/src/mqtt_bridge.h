#pragma once

#include <functional>
#include <vector>

#include <PubSubClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

class MqttBridge {
 public:
  using MessageHandler = std::function<void(const String& topic, const String& payload)>;

  MqttBridge();
  void begin(MessageHandler handler);
  void loop();
  bool connected() const;
  bool connectToLocal();
  bool connectToCloud();
  void publish(const char* topic, const char* payload, bool retained = false);
  void subscribe(const char* topic);

 private:
  void resubscribe(PubSubClient& client);

  WiFiClient localTcp_;
  WiFiClientSecure cloudTls_;
  PubSubClient localClient_;
  PubSubClient cloudClient_;
  PubSubClient* active_;
  MessageHandler handler_;
  std::vector<String> subscriptions_;
  uint32_t lastReconnectMs_;
};
