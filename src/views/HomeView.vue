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
      this.$router.push('/room')
    }
  }
}
</script>

<style scoped>
.lobby {
  text-align: center;
  padding: 20px;
}

.create-room-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.create-room-btn:hover {
  background-color: #45a049;
}

.room-list {
  list-style-type: none;
  padding: 0;
}

.room-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.join-room-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.join-room-btn:hover {
  background-color: #0b7dda;
}
</style>