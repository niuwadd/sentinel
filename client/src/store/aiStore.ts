import { create } from 'zustand'
// 修复：使用相对路径 './types' 或根据实际项目结构调整路径
import type { AiDecisionPayload } from '@climelens/shared'

interface AiState {
  decisions: AiDecisionPayload[]
  aiActive: boolean
  addDecision: (decision: AiDecisionPayload) => void
  setAiActive: (active: boolean) => void
}

export const useAiStore = create<AiState>((set) => ({
  decisions: [],
  aiActive: false,
  addDecision: (decision) =>
    set((state) => ({ decisions: [...state.decisions, decision] })),
  setAiActive: (active) => set({ aiActive: active }),
}))
