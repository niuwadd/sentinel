export class ApiService {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  async getRooms() {
    // TODO: GET /api/rooms
    return fetch(`${this.baseUrl}/rooms`)
  }

  async getRoomHistory(roomId: string, range: string) {
    // TODO: GET /api/rooms/:id/data?range=
    return fetch(`${this.baseUrl}/rooms/${roomId}/data?range=${range}`)
  }

  async controlAc(roomId: string, command: unknown) {
    // TODO: POST /api/rooms/:id/ac/control
    return fetch(`${this.baseUrl}/rooms/${roomId}/ac/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    })
  }

  async getAiDecisions() {
    // TODO: GET /api/agent/decisions
    return fetch(`${this.baseUrl}/agent/decisions`)
  }
}

export const apiService = new ApiService()
