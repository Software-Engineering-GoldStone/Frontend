<template>
  <div ref="lobby-background" class="lobby-background">
    <!-- 게임 로고 이미지 -->
    <img src="@/assets/GameLogo2.png" alt="사보타지" class="game-logo" />

    <!-- 닉네임 입력 -->
    <input v-model="nickname" type="text" placeholder="닉네임" class="input-box" />

    <!-- 생년월일 입력 -->
    <input v-model="birthdate" type="date" class="input-box" />

    <button class="create-room-btn" @click="createRoom">게임 시작</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nickname: '',
      birthdate: '',
    }
  },

  mounted() {
    this.$socket.getInstance().on('gameRoomJoined', (room) => {
      this.$router.push({
        path: '/room', //Room.vue 로 이동
        query: {
          userId: this.$user.id,
          roomId: room.gameRoomId,
        },
      })
    })
  },
  methods: {
    async createRoom() {
      if (!this.nickname || !this.birthdate) {
        alert('닉네임과 생년월일을 입력해주세요.')
        return
      }
      try {
        // 1. 유저 생성 API 호출
        const userRes = await this.$axios.post('/users', {
          nickname: this.nickname,
          birthdate: this.birthdate,
        })

        localStorage.setItem('user', JSON.stringify(userRes.data))

        this.$user = userRes.data

        // 2. 게임방 입장 요청
        this.$socket.joinGameRoom(this.$user.id, this.$defaultGameRoomId)
      } catch (error) {
        console.error('API 호출 실패:', error)
        alert('서버 오류가 발생했습니다.')
      }
    },
  },
}
</script>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

.input-box {
  margin: 10px 0;
  padding: 8px 12px;
  font-size: 16px;
  width: 300px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.create-room-btn {
  background-color: #a79130;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.create-room-btn:hover {
  background-color: #ffd93f;
}
</style>
