export enum SocketRequestEventName {
  JOIN_GAME_ROOM = 'joinGameRoom',
  GET_GAME_ROOM_USERS = 'getGameRoomUsers',
  GET_GAME_STATE = 'getGameState',
  START_GAME = 'startGame',
  NEXT_TURN = 'nextTurn',
  GET_USER_DECK = 'getUserDeck',
  GET_GOAL_CELL_INFO = 'getGoalCellInfo',
  PLAY_CARD = 'playCard',
  DISCARD_CARD = 'discardCard',
  GET_BOARD_INFO = 'getBoardInfo',
}

export enum SocketResponseEventName {}
