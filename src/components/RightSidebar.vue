<template>
  <aside class="right-sidebar">
    <div class="card-action-wrapper">
      <div class="card-action-zones">
        <!-- deckEmpty가 false일 때만 draw-zone 표시 -->
        <div v-if="!deckEmpty" class="zone draw-zone" @click="drawCard">
          <img :src="drawCardImage" alt="카드 뽑기 이미지" class="zone-icon" />
        </div>
        <div class="zone discard-zone" @click="discardCard" @drop="onDrop" @dragover.prevent>
          <img :src="disCardImage" alt="카드 버리기 이미지" class="zone-icon" />
        </div>
      </div>

      <!-- 게임 종료 버튼 -->
      <button class="end-game-button" @click="endGame">게임 종료</button>
      <!-- 금덩이 카드 분배 버튼 -->
      <button class="distribute-goldstone-cards-button" @click="openGoldstonePopup">
        금덩이 분배
      </button>
      <!-- 게임 시작 버튼: userId 와 hostPlayerId 가 같을 때만 보임 -->
      <button v-if="userId === hostPlayerId" class="start-game-button" @click="startGame">
        게임 시작
      </button>
      <!-- 30초 타이머 -->
      <div v-if="timer > 0" class="timer">남은 시간: {{ timer }}초</div>
    </div>

    <!-- 타이머 종료 팝업 -->
    <div v-if="showTimerEndPopup" class="popup-overlay">
      <div class="popup-content">
        <button class="close-button" @click="closeTimerEndPopup" aria-label="팝업 닫기">
          <font-awesome-icon icon="xmark" />
        </button>
        <p>⏰ 다음 턴으로 넘어갑니다.</p>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    hostPlayerId: String,
    deckEmpty: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    gameRoomId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      drawCardImage: '/img/cards/playable_back.png',
      disCardImage: '/img/ui/discard.png',
      timer: 0,
      timerInterval: null,
      showTimerEndPopup: false,
    }
  },
  methods: {
    drawCard() {
      this.$emit('draw-card')
    },
    discardCard() {
      this.$emit('discard-card')
    },
    startGame() {
      const payload = {
        userId: this.userId,
        gameRoomId: this.gameRoomId,
      }

      this.$socket.emit('startGame', payload)
      this.startTimer()
    },
    endGame() {
      this.$emit('end-game')
    },
    openGoldstonePopup() {
      this.$emit('open-goldstone-popup')
    },
    onDrop(event) {
      const data = event.dataTransfer.getData('application/json')
      if (!data) return
      try {
        const card = JSON.parse(data)
        this.$emit('discard-card', card)
      } catch (e) {
        console.error('카드 JSON 파싱 실패:', e)
      }
    },
    startTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }
      this.timer = 30
      this.showTimerEndPopup = false

      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--
        } else {
          clearInterval(this.timerInterval)
          this.timerInterval = null
          this.showTimerEndPopup = true // 타이머 종료 후 팝업 표시
        }
      }, 1000)
    },
    closeTimerEndPopup() {
      this.showTimerEndPopup = false
    },
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  },
}
</script>

<style scoped>
.right-sidebar {
  width: 160px;
  height: calc(100vh - 45px);
  border-left: 1px solid #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 45px;
  right: 0;
  z-index: 10;
}

/* 감싸는 래퍼 */
.card-action-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 100%;
}

/* 카드 뽑기/버리기 영역 */
.card-action-zones {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* 각 영역 공통 스타일 */
.zone {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.zone-icon {
  width: 100%;
  height: 100px;
  object-fit: contain;
}

/* 게임 종료 버튼 */
.end-game-button {
  margin-top: 30px;
  padding: 10px 20px;
  width: 100%;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.end-game-button:hover {
  background-color: #c0392b;
}

/* 게임 종료 버튼 */
.start-game-button {
  margin-top: 30px;
  padding: 10px 20px;
  width: 100%;
  background-color: #250329;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.start-game-button:hover {
  background-color: #6a2660;
}

.distribute-goldstone-cards-button {
  margin-top: 30px;
  padding: 10px 20px;
  width: 100%;
  background-color: #b8b47b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.distribute-goldstone-cards-button:hover {
  background-color: #a88320;
}

.timer {
  margin-top: 15px;
  font-size: 18px;
  color: yellow;
  text-align: center;
  font-weight: bold;
}

/* 팝업 오버레이 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 팝업 내용 */
.popup-content {
  position: relative;
  background-color: white;
  padding: 25px 40px 30px 30px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  font-size: 20px;
  color: #222;
  max-width: 320px;
  text-align: center;
}

/* 닫기 버튼 */
.close-button {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #000;
}
</style>
