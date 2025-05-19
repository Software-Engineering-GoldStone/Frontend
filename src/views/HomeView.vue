<template>
  <div class="lobby">
    <h2>게임 대기실</h2>
    <button class="create-room-btn" @click="createRoom">게임 시작</button>
  </div>
</template>

<script>
export default {
  methods: {
    createRoom() {
      this.$router.push('/room');
    }
  }
}
</script>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  justify-content: center; /* 수직 가운데 정렬 */
  align-items: center;     /* 수평 가운데 정렬 */
  height: 100vh;           /* 화면 전체 높이 */
  text-align: center;
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
