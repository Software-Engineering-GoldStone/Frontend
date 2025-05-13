<template>
    <div>
      <!-- Header 컴포넌트에 필요한 데이터 props 전달 -->
      <Header :nickname="nickname" :role="role" :turnPlayer="turnPlayer" :gold="gold" :round="round" />
  
      <!-- 게임 종료 버튼 -->
      <button @click="endGame">게임 종료</button>
  
      <!-- 게임 종료 후 결과 팝업 -->
      <GameResultPopup
        v-if="showResultPopup"
        :nickname="nickname"
        :role="role"
        :gold="gold"
        :round="round"
        @close="closeResultPopup"
      />
    </div>
  </template>
  
  <script>
  import Header from './Header.vue';
  import GameResultPopup from './GameResultPopup.vue'; // 게임 결과 팝업 컴포넌트
  
  export default {
    components: {
      Header,
      GameResultPopup
    },
    data() {
      return {
        showResultPopup: false,
        nickname: 'Player1', // 예시 데이터
        role: 'Inspector',  // 예시 데이터
        gold: 5,            // 예시 데이터
        round: 3,           // 예시 데이터
        turnPlayer: 'Player1' // 예시 데이터
      };
    },
    methods: {
      endGame() {
        this.showResultPopup = true; // 게임 종료 후 팝업을 띄움
      },
      closeResultPopup() {
        this.showResultPopup = false; // 팝업 닫기
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    margin: 20px;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  