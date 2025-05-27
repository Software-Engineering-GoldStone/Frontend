<template>
  <div class="lobby">
    <h2>게임 대기실</h2>

    <!-- 닉네임 입력 -->
    <input
      v-model="nickname"
      type="text"
      placeholder="닉네임"
      class="input-box"
    />

    <!-- 생년월일 입력 -->
    <input
      v-model="birthdate"
      type="date"
      class="input-box"
    />

    <button class="create-room-btn" @click="createRoom">게임 시작</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nickname: '',
      birthdate: ''
    };
  },
  methods: {
    createRoom() {
      if (!this.nickname || !this.birthdate) {
        alert('닉네임과 생년월일을 입력해주세요.');
        return;
      }
      // 저장이나 전역 상태 반영 등이 필요하면 여기서 처리
      this.$router.push('/room');
    }
  }
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
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.create-room-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.create-room-btn:hover {
  background-color: #45a049;
}
</style>
