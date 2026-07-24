export function useAiDecision() {
  // TODO: 从 Zustand store 读取 AI 决策数据
  return {
    decisions: [] as unknown[],
    aiActive: false,
  }
}
