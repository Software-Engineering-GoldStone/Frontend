<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="playerList[0].nickname"
      :role="playerList[0].role"
      :turnPlayer="turnPlayer"
      :gold="myPlayer.gold"
      :round="round"
      :friends="playerList.map(p => p.nickname)"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" 
      class="fixed-sidebar" 
      @drop-on-player="onDropOnPlayer"/>

      <!-- 메인 화면 (배경 이미지) -->
      <div ref="room-background" class="room-background" >
        <!-- 드래그하여 맵 탐색하기 구현 -->
        <div 
          class="map-draggable-wrapper"
          @mousedown="startDragging"
          @mousemove="onDragging"
          @mouseup="stopDragging"
          @mouseleave="stopDragging"
          :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
        >
          <!-- 슬롯들이 유동적으로 꽉 차게 배치됨 -->
          <div class="slot-grid">
            <!-- 출발지 카드 전용 wrapper -->
            <div class="start-wrapper">
              <!-- 출발지 카드 (고정) -->
              <div class="drop-slot start-card">
                <img :src="startCard.image" alt="Start Card" class="dropped-card" />
              </div>
            </div>
            <!-- 목표 카드 1 (1행 8열) -->
            <div
              class="goal-wrapper goal-1"
              @dragover.prevent
              @drop.prevent="revealGoalCard(0)"
            >
              <div class="drop-slot goal-card">
                <img :src="goalCards[0].image" alt="Goal Card 1" class="dropped-card" />
              </div>
            </div>

            <!-- 목표 카드 2 -->
            <div
              class="goal-wrapper goal-2"
              @dragover.prevent
              @drop.prevent="revealGoalCard(1)"
            >
              <div class="drop-slot goal-card">
                <img :src="goalCards[1].image" alt="Goal Card 2" class="dropped-card" />
              </div>
            </div>

            <!-- 목표 카드 3 -->
            <div
              class="goal-wrapper goal-3"
              @dragover.prevent
              @drop.prevent="revealGoalCard(2)"
            >
              <div class="drop-slot goal-card">
                <img :src="goalCards[2].image" alt="Goal Card 3" class="dropped-card" />
              </div>
            </div>

            <div
              v-for="(slot, index) in slots" 
              :key="index"
              class="drop-slot"
              @mouseenter="hoveredSlot = index"
              @mouseleave="hoveredSlot = null"
              :class="{ hovered: hoveredSlot === index }"
              @dragover.prevent
              @drop.prevent="onCardDrop(index)"
            >
            <!-- 슬롯에 카드가 있으면 카드 렌더링 -->
            <img v-if="slot.card" :src="slot.card.image" alt="card" class="dropped-card" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      @dragover.prevent
      @drop.prevent="handleDiscardCard"
      @end-game="handleEndGame"
      @open-goldstone-popup="openGoldstonePopup"
    />

    <!-- 푸터  -->
    <Footer :cards="cards" @drag-card="onCardDrag" />

    <!-- 게임 결과 팝업 -->
    <GameResultPopup
      v-if="showGameResultPopup"
      :players="[...playerList]"
      :round="round"
      @close="closeGameResultPopup"
    />
    <!-- 금덩이 카드 분배 팝업 -->
    <GoldstoneCardDistributionPopup
      v-if="showGoldstoneCardDistributionPopup"
      :playerNames="playerNames"
      :distributedCards="distributedCards"
      :myNickname="myNickname"
      @confirm-gold="handleGoldConfirm"
      @close="closeGoldstoneCardDistributionPopup"
    />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import RightSidebar from '@/components/RightSidebar.vue';
import Footer from '@/components/Footer.vue';
import GameResultPopup from '@/components/GameResultPopup.vue';
import GoldstoneCardDistributionPopup from '@/components/GoldDistributionPopup.vue';
import player1 from '@/assets/player1.png';
import player2 from '@/assets/player2.png';
import player3 from '@/assets/player3.png';
import player4 from '@/assets/player4.png';
import player5 from '@/assets/player5.png';

export default {
  components: {
    Header,
    Sidebar,
    RightSidebar,
    Footer,
    GameResultPopup,
    GoldstoneCardDistributionPopup
  },
  data() {
    return {
      startCard: {
        image: '/img/cards/start.png'
      },
      goalCards: [
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' }
      ],
      round: 2,
      hoveredSlot: null,
      playerList: [
        { nickname: '강승희', role: '광부', gold: 0, image: player1, highlight: false, status: []},
        { nickname: '이혜민', role: '사보타지', gold: 0, image: player2, highlight: false, status: [] },
        { nickname: 'player3', role: '광부', gold: 0, image: player3, highlight: false, status: [] },
        { nickname: 'player4', role: '사보타지', gold: 0, image: player4, highlight: false, status: [] },
        { nickname: 'player5', role: '광부', gold: 0, image: player5, highlight: false, status: [] }
      ],
      myNickname: '이혜민',
      turnPlayer: '이혜민',
      showGameResultPopup: false,
      showGoldstoneCardDistributionPopup: false,
      cards: [
        { type: 'action', subtype: 'map', image: '/img/cards/map.png' },
        { type: 'action', subtype: 'rockfall', image: '/img/cards/rockfall.png' },
        { type: 'action', subtype: 'block_cart', image: '/img/cards/block_cart.png' },
        { type: 'action', subtype: 'block_lantern', image: '/img/cards/block_lantern.png' },
        { type: 'action', subtype: 'block_pickaxe', image: '/img/cards/block_pickaxe.png' },
        { type: 'action', subtype: 'repair_cart', image: '/img/cards/repair_cart.png' },
        { type: 'action', subtype: 'repair_lantern', image: '/img/cards/repair_lantern.png' },
        { type: 'action', subtype: 'repair_pickaxe', image: '/img/cards/repair_pickaxe.png' },
        { type: 'path', image: '/img/cards/path_right_1.png' },
        { type: 'path', image: '/img/cards/path_right_2.png' },
        { type: 'path', image: '/img/cards/path_right_3.png' },
        { type: 'path', image: '/img/cards/path_right_4.png' },
        { type: 'path', image: '/img/cards/path_left_1.png' },
        
      ],
      availableCards: [   // 아직 안 가진 카드들 덱(예시)
          { id: 1, type: 'path', subtype: 'path_crossroad_1', image: '/img/cards/path_crossroad_1.png' },
          { id: 2, type: 'path', subtype: 'path_crossroad_2', image: '/img/cards/path_crossroad_2.png' },
          { id: 3, type: 'path', subtype: 'path_crossroad_3', image: '/img/cards/path_crossroad_3.png' },
          { id: 4, type: 'path', subtype: 'path_crossroad_4', image: '/img/cards/path_crossroad_4.png' },
          { id: 5, type: 'path', subtype: 'path_crossroad_5', image: '/img/cards/path_crossroad_5.png' },
          { id: 6, type: 'action', subtype: 'repair_cart', image: '/img/cards/repair_cart.png' },
          { id: 7, type: 'action', subtype: 'repair_lantern', image: '/img/cards/repair_lantern.png' },
          { id: 8, type: 'action', subtype: 'repair_pickaxe', image: '/img/cards/repair_pickaxe.png' },
          { id: 9, type: 'action', subtype: 'repair_cart_lantern', image: '/img/cards/repair_cart_lantern.png' },
          { id: 10, type: 'action', subtype: 'repair_cart_pickaxe', image: '/img/cards/repair_cart_pickaxe.png' },
          { id: 11, type: 'action', subtype: 'repair_lantern_pickaxe', image: '/img/cards/repair_lantern_pickaxe.png' }

      ],
      draggedCard: null,
      slots: Array(900).fill(null).map(() => ({ card: null })), // 슬롯 배열 초기화
      offset: { x: 32, y: 288 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      distributedCards: []
    };
  },
  computed: {
    myPlayer() {
      return this.playerList.find(p => p.nickname === this.myNickname) || { gold: 0 };
    },
    playerNames() {
      return this.playerList
        .filter(p => p.role === '광부') // 광부만 선택
        .map(p => p.nickname);
    }
  },
  methods: {
    revealGoalCard(goalIndex) {
      // 드래그된 카드가 map 카드일 때만 실행
      if (!this.draggedCard || this.draggedCard.image !== '/img/cards/map.png') {
        console.log('map 카드가 아닙니다.');
        return;
      }

      // 이미 공개된 목표 카드면 무시
      const currentImage = this.goalCards[goalIndex].image;
      if (currentImage !== '/img/cards/goal_back.png') {
        console.log('이미 공개된 목표 카드입니다.');
        return;
      }

      // 랜덤하게 goal_gold / goal_rock_1 / goal_rock_2 중 하나 선택
      const goalImages = [
        '/img/cards/goal_gold.png',
        '/img/cards/goal_rock_1.png',
        '/img/cards/goal_rock_2.png'
      ];
      const randomIndex = Math.floor(Math.random() * goalImages.length);

      const selectedImage = goalImages[randomIndex];

      // 카드 일시적으로 공개
      this.goalCards[goalIndex].image = selectedImage;

      // 5초 후 다시 뒤집기
      setTimeout(() => {
        this.goalCards[goalIndex].image = '/img/cards/goal_back.png';
      }, 2000);

      // map 카드는 카드 목록에서 제거
      const index = this.cards.indexOf(this.draggedCard);
      if (index !== -1) {
        this.cards.splice(index, 1);
      }

      // 드래그 상태 초기화
      this.draggedCard = null;

      this.getRandomCard();
    },
    handleDiscardCard() {
      console.log('카드 버리기');
      // 카드 목록에서 드래그한 카드 하나만 제거
      const index = this.cards.indexOf(this.draggedCard);
        if (index !== -1) {
          this.cards.splice(index, 1);
        }
        
        // 드래그 상태 초기화
        this.draggedCard = null;

        this.getRandomCard();

    },
    handleEndGame() {
      this.showGameResultPopup = true;
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false;
    },
    openGoldstonePopup() {
      this.showGoldstoneCardDistributionPopup = true;
    },
    closeGoldstoneCardDistributionPopup() {
      this.showGoldstoneCardDistributionPopup = false;
    },
    // 카드가 드래그되었을 때
    onCardDrag(card, event) {
      this.draggedCard = card;

      if (event && event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify(card));
      }  
      
    },
    // 카드가 드롭되었을 때 슬롯에 넣기
    onCardDrop(slotIndex) {
      if (!this.draggedCard) return;

      // 이미 카드가 있는 슬롯에 드롭 -> 두 카드 모두 삭제
      if (this.draggedCard && this.draggedCard.subtype === 'rockfall') {

        if (this.slots[slotIndex].card) {
            // 기존 슬롯 카드 삭제
          this.slots[slotIndex].card = null;

          // rockfall 카드도 카드 목록에서 삭제
          const index = this.cards.indexOf(this.draggedCard);
          if (index !== -1) {
            this.cards.splice(index, 1);
          }
          this.getRandomCard();
        }
      } else if (this.draggedCard && this.draggedCard.type === 'action' && this.draggedCard.subtype !== 'rockfall') {
          console.log('이 action 카드는 슬롯에 놓을 수 없습니다.');
          return;
      } else {
          this.slots[slotIndex].card = this.draggedCard;

          const index = this.cards.indexOf(this.draggedCard);
          if (index !== -1) {
            this.cards.splice(index, 1);
          }

          this.draggedCard = null;

          this.getRandomCard();
      }
    },
    onDropOnPlayer(playerIndex) {
      

      if (!this.draggedCard || this.draggedCard.type !== 'action') return;

      const subtype = this.draggedCard.subtype;
      const player = this.playerList[playerIndex];

      // 수리/블록 카드만 처리
      const validTypes = [
        'block_cart', 'block_lantern', 'block_pickaxe',
        'repair_cart', 'repair_lantern', 'repair_pickaxe',
        'repair_cart_lantern', 'repair_cart_pickaxe', 'repair_lantern_pickaxe'
      ];

      if (!validTypes.includes(subtype)) return;

      // 수리 카드 대응 관계 설정
      const repairToBlockMap = {
        repair_cart: ['block_cart'],
        repair_lantern: ['block_lantern'],
        repair_pickaxe: ['block_pickaxe'],
        repair_cart_lantern: ['block_cart', 'block_lantern'],
        repair_cart_pickaxe: ['block_cart', 'block_pickaxe'],
        repair_lantern_pickaxe: ['block_lantern', 'block_pickaxe']
      };

      if (subtype.startsWith('repair')) {
        const blockTypes = repairToBlockMap[subtype];

        // 플레이어가 수리 대상 block 중 하나라도 가지고 있는지 확인
        const hasMatchingBlock = blockTypes.some(block => player.status.includes(block));

        if (hasMatchingBlock) {
        // 첫 번째 일치하는 block 하나만 제거
        const blockToRemove = blockTypes.find(block => player.status.includes(block));
        if (blockToRemove) {
          const index = player.status.indexOf(blockToRemove);
          if (index !== -1) {
            player.status.splice(index, 1);
          }
        }

        this.getRandomCard();
      } else {
        return; // 수리할 대상이 없으면 아무것도 하지 않음
      }

      } else {
        // block 카드일 경우: 중복 없이 추가
        if (!player.status.includes(subtype)) {
          player.status.push(subtype);
          this.getRandomCard();
        }
      }

      // 드래그한 카드 제거
      const cardIdx = this.cards.indexOf(this.draggedCard);
      if (cardIdx !== -1) {
        this.cards.splice(cardIdx, 1);
      }

      this.draggedCard = null;
    },

    // 맵 드래그하여 탐색할 때
    startDragging(event) {
      this.isDragging = true;
      this.dragStart = {
        x: event.clientX - this.offset.x,
        y: event.clientY - this.offset.y
      };
    },
    onDragging(event) {
      if (!this.isDragging) return;
      const newX = event.clientX - this.dragStart.x;
      const newY = event.clientY - this.dragStart.y;
      this.offset = {
        x: Math.max(-900, Math.min(900, newX)),
        y: Math.max(-1440, Math.min(1440, newY))
      };
    },
    stopDragging() {
      this.isDragging = false;
    },
    handleGoldConfirm(goldAmount) {
      const me = this.playerList.find(p => p.nickname === this.myNickname);
      if (me) {
        me.gold += goldAmount;
      }
    },
    // 랜덤 카드 한 장 새로 획득하는 코드 예시
    getRandomCard() {
      if (this.availableCards && this.availableCards.length > 0) {
        // availableCards 는 카드 더미 (덱)라고 가정
        const randomIndex = Math.floor(Math.random() * this.availableCards.length);
        const randomCard = this.availableCards[randomIndex];

        // 내 카드 배열(cards)에 추가
        this.cards.push(randomCard);

        // 덱(availableCards)에서는 제거
        this.availableCards.splice(randomIndex, 1);
      }
    }
  }
};
</script>