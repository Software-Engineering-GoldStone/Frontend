<template>
  <header class="game-header">
    <div class="player-info">
      <span ref="nicknameEl" class="nickname" @click="toggleProfile">
        닉네임: {{ nickname }}
        <!-- 헤더 내 펜 아이콘 제거 -->
      </span>
      <span>역할: {{ role }}</span>
    </div>
    <div class="game-status">
      <span>현재 턴: {{ turnPlayer }}</span>
      <span>금덩이 개수: {{ gold }}</span>
      <span>라운드: {{ round }}</span>
    </div>

    <!-- 프로필 팝업 -->
    <div v-if="showProfile" class="profile-popup" :style="popupStyle" @click.self="toggleProfile">
      <div class="profile-content" @click.stop>
        <button class="close-btn" @click="toggleProfile" aria-label="닫기">
          <font-awesome-icon icon="xmark" />
        </button>

        <h3>프로필</h3>
        <p class="profile-nickname">
          <strong>닉네임:</strong> {{ nickname }}
          <font-awesome-icon 
            icon="pen-to-square" 
            class="edit-icon-inline" 
            @click="editNickname"
            title="닉네임 수정"
          />
        </p>

        <h4>친구 목록</h4>
        <ul class="friend-list">
          <li v-for="(friend, index) in filteredFriends" :key="index">{{ friend }}</li>
        </ul>

        <h4>게임 전적 기록</h4>
        <p>승리: {{ gameRecord.win }} | 패배: {{ gameRecord.lose }}</p>

        <button @click="deleteAccount" class="delete-btn">계정 삭제</button>
      </div>
    </div>
  </header>
</template>

<script>
import { nextTick } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  components: { FontAwesomeIcon },
  props: {
    nickname: String,
    role: String,
    turnPlayer: String,
    gold: Number,
    round: Number,
    friends: Array,
    gameRecord: {
      type: Object,
      default: () => ({ win: 0, lose: 0 })
    }
  },
  data() {
    return {
      showProfile: false,
      popupStyle: {}
    };
  },
  computed: {
    filteredFriends() {
      return this.friends.filter(friend => friend !== this.nickname);
    }
  },
  methods: {
    toggleProfile() {
      this.showProfile = !this.showProfile;
      if (this.showProfile) {
        nextTick(() => this.setPosition());
      }
    },
    setPosition() {
      const nicknameEl = this.$refs.nicknameEl;
      if (nicknameEl) {
        const rect = nicknameEl.getBoundingClientRect();
        this.popupStyle = {
          position: 'fixed',
          top: `${rect.bottom + 5}px`,
          left: `${rect.left}px`,
          zIndex: 100
        };
      }
    },
    editNickname() {
      const newName = prompt('새 닉네임을 입력하세요', this.nickname);
      if (newName && newName.trim() !== '') {
        this.$emit('update:nickname', newName.trim());
      }
    },
    deleteAccount() {
      if (confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        this.$emit('delete-account');
      }
    }
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
  background-color: rgba(44, 62, 80, 0.9);
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.player-info {
  display: flex;
  align-items: center;
  flex: 1;               /* 추가: 공간 균등 분배 */
  gap: 15px;             /* 가독성 향상 */
}

.game-status {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 오른쪽 정렬 */
  flex: 1;                   /* 추가: 공간 균등 분배 */
  gap: 15px;                 /* 가독성 향상 */
}

.player-info span,
.game-status span {
  margin: 0; /* margin-right 대신 gap 으로 간격 처리 */
}

.nickname {
  cursor: pointer;
  text-decoration: underline;
  position: relative;
  display: inline-flex;
  align-items: center;
}



/* 헤더 내 펜 아이콘 제거했으므로 관련 스타일도 제거 */

/* 게임 상태 */
.game-status {
  font-size: 16px;
  display: flex;
  gap: 25px;
}

/* 프로필 팝업 스타일 */
.profile-popup {
  background-color: rgba(20, 20, 20, 0.95);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  color: white;
  position: fixed;
}

.profile-content {
  position: relative;
  padding-bottom: 50px;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: white;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-nickname {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
}

/* 프로필 내 펜 아이콘 */
.edit-icon-inline {
  cursor: pointer;
  color: #bbdefb;
  font-size: 16px;
  transition: color 0.3s ease;
}

.edit-icon-inline:hover {
  color: #90caf9;
}

.friend-list {
  list-style-type: none;
  padding-left: 0;
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 15px;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  background-color: #222;
  font-size: 14px;
}

.friend-list li {
  padding: 6px 4px;
  border-bottom: 1px solid #444;
}

.friend-list li:last-child {
  border-bottom: none;
}

.delete-btn {
  background-color: #e53935;
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  font-size: 14px;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 0;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #b71c1c;
}
</style>
