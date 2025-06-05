<template>
  <div ref="lobby-background" class="lobby-background" >
  <!-- 게임 로고 이미지 -->
  <img src="@/assets/GameLogo2.png" alt="사보타지" class="game-logo" />
  
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
import { io } from "socket.io-client";

export default {
  data() {
    return {
      socket: null,
      nickname: '',
      birthdate: ''
    };
  },
  created() {
  this.socket = io('http://localhost:3000');

  // 소켓 연결 완료 이벤트 핸들러
  this.socket.on('connect', () => {
    console.log('Socket connected with id:', this.socket.id);
  });

  this.socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  this.socket.on('userList', (userList) => {
    console.log('소켓으로 받은 유저 리스트:', userList);
    this.users = userList; 
  });

  },
  methods: {
    createRoom() {
      if (!this.nickname || !this.birthdate) {
        alert('닉네임과 생년월일을 입력해주세요.');
        return;
      }

      // 1. 유저 생성 요청
      this.socket.emit('createUser', {
        nickname: this.nickname,
        birthdate: this.birthdate
      }, (user) => {
        console.log('생성된 유저:', user);

        // 2. 게임방 입장 요청
        this.socket.emit('joinRoom', { userId: user.userId }, (room) => {
          console.log('입장한 게임룸:', room);

          // 3. 라우팅
          this.$router.push({
            path: '/room', //Room.vue 로 이동
            query: {
              roomId: room.roomId,
              userId: user.userId,
              nickname: user.nickname
            }
          });
        });
      });
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
