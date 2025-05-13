<template>
    <div class="popup-overlay">
      <div class="popup-content">
        <h2>게임 결과</h2>
        
        <!-- 라운드 정보 -->
        <p><strong>라운드: {{ round }}</strong></p>
  
        <div class="result-list">
          <div v-for="(player, index) in sortedPlayers" :key="index" class="player-result">
            <span class="rank">{{ index + 1 }}위</span>
            <img :src="player.image" alt="플레이어 이미지" class="avatar" />
            <span class="name">{{ player.nickname }}</span>
            <span class="role">역할: {{ player.role }}</span>
            <span class="gold">금덩이: {{ player.gold }}개</span>
          </div>
        </div>
        
        <button @click="close">닫기</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      players: {
        type: Array,
        required: true
      },
      round: {
        type: Number,
        required: true
      }
    },
    computed: {
      sortedPlayers() {
        // gold를 기준으로 내림차순 정렬
        return this.players.slice().sort((a, b) => b.gold - a.gold);
      }
    },
    methods: {
      close() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .popup-content {
    background-color: white;
    padding: 30px;
    border-radius: 16px;
    width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .result-list {
    list-style: none;
    padding: 0;
    margin: 20px 0;
  }
  
  .player-result {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .name {
    font-weight: bold;
    margin-right: 8px;
  }
  
  .role {
    color: #666;
    margin-right: 8px;
  }
  
  .gold {
    color: goldenrod;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  