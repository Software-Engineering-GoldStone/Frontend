import { io, Socket } from 'socket.io-client'
import { SocketRequestEventName } from '@/socket-helper/socket-event.constant.ts'

export class SocketIoHelper {
  private readonly SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  private readonly instance: Socket

  constructor() {
    this.instance = io(this.SOCKET_URL, { transports: ['websocket'], reconnection: false })

    this.instance.on('connect', () => console.log(`Socket connected with id: ${this.instance.id}`))
    this.instance.on('connect_error', (err) => console.error(`Socket connection error: ${err}`))
    this.instance.on('errorEvent', (err) => {
      console.error(`Socket error event: ${err}`)
      alert(`서버 오류가 발생했습니다.`)
    })
  }

  getInstance(): Socket {
    return this.instance
  }

  joinGameRoom(userId: string, gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.JOIN_GAME_ROOM, { userId, gameRoomId })
  }

  getGameRoomUsers(gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.GET_GAME_ROOM_USERS, { gameRoomId })
  }

  getGameState(gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.GET_GAME_STATE, { gameRoomId })
  }

  startGame(userId: string, gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.START_GAME, { userId, gameRoomId })
  }

  nextTurn(gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.NEXT_TURN, { gameRoomId })
  }

  getUserDeck(gameRoomId: string, userId: string): void {
    this.instance.emit(SocketRequestEventName.GET_USER_DECK, { gameRoomId, userId })
  }

  getGoalCellInfo(gameRoomId: string): void {
    this.instance.emit(SocketRequestEventName.GET_GOAL_CELL_INFO, { gameRoomId })
  }
}
