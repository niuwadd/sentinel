export function useMqtt() {
  // TODO: 实现 mqtt.js 双 Broker 自动切换连接
  return {
    connectedBroker: null as 'local' | 'cloud' | null,
    status: 'disconnected' as 'connecting' | 'connected' | 'disconnected',
    connect: (_target: 'local' | 'cloud') => {},
  }
}
