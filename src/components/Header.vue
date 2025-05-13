<template>
  <header class="game-header">
    <div class="player-info">
      <span>닉네임: {{ nickname }}</span>
      <span>역할: {{ role }}</span>
    </div>
    <div class="game-status">
      <span>현재 턴: {{ turnPlayer }}</span>
      <span>점수: {{ score }}</span>
      <span>라운드: {{ round }}</span>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    nickname: String,
    role: String,
    turnPlayer: String,
    score: Number,
    round: Number
  }
};
</script>

<style scoped>
.game-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(44, 62, 80, 0.9); /* 반투명 헤더 */
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.player-info span,
.game-status span {
  margin-right: 15px;
}

.player-info,
.game-status {
  display: flex;
  align-items: center;
}
</style>
