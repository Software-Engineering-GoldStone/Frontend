<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="nickname"
      :role="playerList.role"
      :turnPlayer="turnPlayer"
      :gold="myPlayer.gold"
      :round="round"
      :friends="playerList.map((p) => p.nickname)"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" class="fixed-sidebar" @drop-on-player="onDropOnPlayer" />

      <!-- 메인 화면 (배경 이미지) -->
      <div ref="room-background" class="room-background">
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
            <div
              v-for="(slot, index) in slots"
              :key="index"
              class="drop-slot"
              @click="logSlotCoordinates(slot)"
              @mouseenter="hoveredSlot = index"
              @mouseleave="hoveredSlot = null"
              :class="{ hovered: hoveredSlot === index }"
              @dragover.prevent
              @drop.prevent="handleDrop(slot)"
            >
              <!-- 슬롯에 카드가 있으면 카드 렌더링 -->
              <!-- 백엔드 기준 -->
              <!-- start cell : (0, 2) -> (13, 15) -->
              <!-- goal cell : (8, 0), (8, 2), (8, 4) -> (21, 13), (21, 15), (21, 17) -->
              <!-- 프론트로 치환하면 13의 차이가 발생 -->
              <img
                v-if="slot.x === 13 && slot.y === 15"
                :src="startCard.image"
                alt="start"
                class="dropped-card"
              />
              <img v-if="slot.card" :src="slot.card.image" alt="card" class="dropped-card" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      :deck-empty="availableCards && availableCards.length === 0"
      :user-id="userId"
      :game-room-id="gameRoomId"
      :host-player-id="hostPlayer ? hostPlayer.id : null"
      :turn-player="turnPlayer"
      @dragover.prevent
      @drop.prevent="handleDiscardCard"
      @end-game="handleEndGame"
      @open-goldstone-popup="openGoldstonePopup"
    />

    <!-- 푸터  -->
    <Footer :cards="cards" @drag-card="onCardDrag" />

    <!-- ✅ 수리 선택 팝업 (REPAIR_CARD_LIGHT 등 사용 시) -->
    <div v-if="repairPopup.show" class="repair-popup">
      <p>어떤 도구를 수리하시겠습니까?</p>
      <button
        v-for="block in repairPopup.blocksToChoose"
        :key="block"
        @click="resolveRepairChoice(block)"
      >
        {{ block.replace('DESTROY_', '') }} 수리
      </button>
    </div>

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
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import Footer from '@/components/Footer.vue'
import GameResultPopup from '@/components/GameResultPopup.vue'
import GoldstoneCardDistributionPopup from '@/components/GoldDistributionPopup.vue'
import player1 from '@/assets/player1.png'
import player2 from '@/assets/player2.png'
import player3 from '@/assets/player3.png'
import player4 from '@/assets/player4.png'
import player5 from '@/assets/player5.png'
import { convertToClientCellPos, getActionCardImageUrl, getPathCardImageUrl } from '@/utils.js'

export default {
  components: {
    Header,
    Sidebar,
    RightSidebar,
    Footer,
    GameResultPopup,
    GoldstoneCardDistributionPopup,
  },
  data() {
    return {
      socketInstance: this.$socket.getInstance(),
      gameRoomId: null,
      userId: null,
      hostPlayer: null,
      user: null,
      cards: [], // 유저 덱
      availablecards: [], // 카드 풀
      availableCardsFromServer: [], // 서버에서 가져온 카드 풀
      playerList: [], // 사이드바용 가공된 리스트
      users: [], // 소켓에서 직접 받는 사용자 리스트
      nickname: '',
      cellInfo: [],
      startCard: {
        image: '/img/cards/start.png',
      },
      goalCards: [
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
      ],
      round: 0,
      hoveredSlot: null,
      myNickname: null,
      turnPlayer: null,
      showGameResultPopup: false,
      showGoldstoneCardDistributionPopup: false,
      draggedCard: null,
      slots: Array.from({ length: 900 }, (_, index) => ({
        x: index % 30,
        y: Math.floor(index / 30),
        card: null,
      })),
      offset: { x: -256, y: -128 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      distributedCards: [],
      repairPopup: {
        show: false,
        userId: null,
        playerIndex: null,
        cardSubtype: null,
        blocksToChoose: [],
        statusCopy: [],
      },
    }
  },
  created() {
    this.gameRoomId = this.$route.query.roomId
    this.userId = this.$route.query.userId
    this.user = JSON.parse(localStorage.getItem('user'))
    this.myNickname = this.user.nickname

    this.$socket.getGameRoomUsers(this.gameRoomId)
    this.socketInstance.on('gameRoomUsers', ({ users }) => {
      this.users = users.map(({ user }) => {
        return {
          id: user.id,
          nickname: user.nickname,
          role: user.role || '광부',
          birthDate: user.birthDate,
        }
      })

      // 첫 번째 유저를 호스트로 설정
      if (this.users.length > 0) {
        this.hostPlayer = this.users[0]
      }
    })
  },
  mounted() {
    this.socketInstance.on('gameStarted', (data) => {
      this.round = data.round
      this.$socket.getGameState(this.gameRoomId)
      this.$socket.getGoalCellInfo(this.gameRoomId)
    })
    this.socketInstance.on('yourRole', (data) => (this.playerList.role = data))
    this.socketInstance.on('yourCardDeck', (data) => {
      this.cards = data.map((card) => {
        return {
          id: card.id,
          type: card.cardType,
          image:
            card.cardType === 'ACTION'
              ? getActionCardImageUrl(
                  card.actionCardType,
                  card.targetTool ? [card.targetTool] : card.repairableTools,
                )
              : getPathCardImageUrl(card.pathCardType),
        }
      })
    })
    this.socketInstance.on('gameState', ({ currentPlayerId, currentPlayerName }) => {
      this.turnPlayer = {
        id: currentPlayerId,
        name: currentPlayerName,
      }
      this.$socket.getUserDeck(this.gameRoomId, this.userId)
    })
    this.socketInstance.on('turnChanged', (data) => {
      this.turnPlayer = {
        id: data.nextPlayerId,
        name: data.nextPlayerName,
      }
      alert('다음 턴으로 넘어갑니다.')
      this.$socket.getUserDeck(this.gameRoomId, this.userId)
    })
    this.socketInstance.on('goalCellInfo', (data) => {
      data.forEach((cell) => {
        const idx = this.slots.findIndex(
          (slot) =>
            slot.x === convertToClientCellPos(cell.x) && slot.y === convertToClientCellPos(cell.y),
        )
        if (idx === -1) {
          console.error('slot not found')
          console.error(`Cell from server: ${cell}`)
          return
        }

        this.slots[idx] = {
          ...this.slots[idx],
          card: {
            ...cell.card,
            image: '/img/cards/goal_back.png',
          },
          sides: cell.sides,
        }
      })
    })

    this.nickname = this.user.nickname
  },
  watch: {
    users: {
      handler(data) {
        this.playerList = data.map((user) => ({
          userId: user.id,
          nickname: user.nickname,
          role: user.role || '없음',
          gold: 0,
          image: player1,
          highlight: false,
          status: [],
        }))
      },
      immediate: true,
      deep: true,
    },
    cards: {
      immediate: true,
      deep: true,
    },
    turnPlayer: {
      immediate: true,
      deep: true,
    },
  },
  computed: {
    myPlayer() {
      return this.playerList.find((p) => p.nickname === this.myNickname) || { gold: 0 }
    },
    playerNames() {
      return this.playerList
        .filter((p) => p.role === '광부') // 광부만 선택
        .map((p) => p.nickname)
    },
  },
  methods: {
    getBoardState() {
      const payload = {
        gameRoomId: this.gameRoomId,
      }
      console.log('getBoardState() payload: ', payload)

      this.$socket.emit('getBoardInfo', payload, (response) => {
        console.log('callback of getBoardState(): ', response)

        if (response && response.cellInfo) {
          this.cellInfo = response.cellInfo
        } else {
          console.warn('Invalid cellInfo response: ', response)
        }
      })
    },

    revealGoalCard(goalIndex) {
      // 드래그된 카드가 map 카드일 때만 실행
      console.log('draggedCard.subtype:', this.draggedCard.subtype)
      if (this.draggedCard.subtype !== 'MAP') {
        console.log('map 카드가 아닙니다.')
        return
      }

      // 이미 공개된 목표 카드면 무시
      const currentImage = this.goalCards[goalIndex].image
      if (currentImage !== '/img/cards/goal_back.png') {
        console.log('이미 공개된 목표 카드입니다.')
        return
      }

      const goalImages = [
        '/img/cards/goal_gold.png',
        '/img/cards/goal_rock_1.png',
        '/img/cards/goal_rock_2.png',
      ]
      const goalPos = [
        { x: 21, y: 13 },
        { x: 21, y: 15 },
        { x: 21, y: 17 },
      ]
      // const { x, y } =
      // const randomIndex = Math.floor(Math.random() * goalImages.length)

      const selectedImage = goalImages[goalIndex]

      // 카드 일시적으로 공개
      this.goalCards[goalIndex].image = selectedImage

      // 5초 후 다시 뒤집기
      setTimeout(() => {
        this.goalCards[goalIndex].image = '/img/cards/goal_back.png'
      }, 5000)

      this.removeDraggedCard()
      this.getRandomCard()
    },
    async handleDiscardCard() {
      const payload = {
        userId: this.userId,
        gameRoomId: this.gameRoomId,
        cardId: this.draggedCard.id,
      }

      this.$socket.emit('discardCard', payload, (response) => {
        console.log('payload: ', payload)
        if (response.success === 'true') {
          console.log('카드 버리기 성공: ', response.message)

          this.removeDraggedCard() // 로컬 카드에서 제거
          this.getRandomCard() // 새 카드 지급
        } else {
          console.error('카드 버리기 실패: ', response.message)
        }
      })
    },
    handleEndGame() {
      this.showGameResultPopup = true
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false
    },
    openGoldstonePopup() {
      this.showGoldstoneCardDistributionPopup = true
    },
    closeGoldstoneCardDistributionPopup() {
      this.showGoldstoneCardDistributionPopup = false
    },
    // 카드가 드래그되었을 때
    onCardDrag(card, event) {
      this.draggedCard = card
      const imagePath = card.image
      const fileName = imagePath.split('/').filter(Boolean).pop().replace('.png', '')

      // 파일명을 별도로 저장
      this.draggedCard.subtype = fileName
      console.log('드래그된 카드 파일명 subtype::::', this.draggedCard.subtype)

      if (event && event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify(card))
      }
    },
    // 백엔드 좌표와 매치
    getGridStyle(x, y) {
      return {
        gridColumn: `${13 + x} / span 1`,
        gridRow: `${17 - y} / span 1`,
      }
    },
    // 디버깅
    logSlotCoordinates(slot) {
      console.log(`🟦 Slot clicked at: (${slot.x}, ${slot.y})`)
    },
    // 카드별
    handleDrop(slot) {
      // 출발지 카드의 경우
      if (slot.x === 13 && slot.y === 15) return

      // 목적지 카드의 경우
      if (slot.x === 21 && slot.y === 13) {
        this.revealGoalCard(0)
      } else if (slot.x === 21 && slot.y === 15) {
        this.revealGoalCard(1)
      } else if (slot.x === 21 && slot.y === 17) {
        this.revealGoalCard(2)
      }

      // 일반 슬롯의 경우
      else {
        this.onCardDrop(slot.x, slot.y)
      }
    },
    // 카드가 드롭되었을 때 슬롯에 넣기
    async onCardDrop(x, y) {
      if (!this.draggedCard) return

      // 좌표에 해당하는 슬롯 찾기
      const slotnow = this.slots.find((s) => s.x === x && s.y === y)
      const payload = {
        userId: this.userId,
        cardId: this.draggedCard.id,
        cardType: 'ACTION',
        actionCardType: 'ROCKFALL',
        roomId: this.gameRoomId,
        targetCellX: x - 13,
        targetCellY: 17 - y,
      }

      // 낙석 카드를 이미 카드가 있는 슬롯에 드롭 -> 두 카드 모두 삭제
      if (this.draggedCard && this.draggedCard.subtype === 'rockfall') {
        if (!slotnow.card) return

        this.$socket.emit('useFallingRockCard', payload, (response) => {
          console.log('payload: ', payload)
          if (response.success === 'true') {
            slotnow.card = null
            this.removeDraggedCard()
            this.getRandomCard()
            console.log('낙석 카드 사용 성공: ', response.message)
          } else {
            console.warn('낙석 카드 실패: ', response.message)
          }
        })

        return
      } else if (
        this.draggedCard &&
        this.draggedCard.type === 'action' &&
        this.draggedCard.subtype !== 'rockfall'
      ) {
        console.log('이 action 카드는 슬롯에 놓을 수 없습니다.')
        return
      } else {
        if (this.draggedCard.type === 'path') {
          this.$socket.emit('usePathCard', payload, (response) => {
            console.log('payload: ', payload)
            if (response.success === 'true') {
              slotnow.card = this.draggedCard
              this.removeDraggedCard()
              this.getRandomCard()
              console.log('길 카드 배치 성공: ', response.message)
            } else {
              console.warn('길 카드 실패: ', response.message)
            }
          })
        }
      }
    },
    //player에게 행동카드 사용할 때
    onDropOnPlayer(userId) {
      console.log('드롭된 대상 userId:', userId)
      if (this.draggedCard.type !== 'ACTION') return

      const playerIndex = this.playerList.findIndex((p) => p.userId === userId)
      if (playerIndex === -1) return

      const player = this.playerList[playerIndex]
      const subtype = this.draggedCard.subtype // 예: DESTROY_CART
      const newStatus = [...player.status] // 기존 상태 복사

      const repairToBlockMap = {
        REPAIR_CART: ['DESTROY_CART'],
        REPAIR_LIGHT: ['DESTROY_LIGHT'],
        REPAIR_PICKAX: ['DESTROY_PICKAX'],
        REPAIR_CART_LIGHT: ['DESTROY_CART', 'DESTROY_LIGHT'],
        REPAIR_CART_PICKAX: ['DESTROY_CART', 'DESTROY_PICKAX'],
        REPAIR_LIGHT_PICKAX: ['DESTROY_LIGHT', 'DESTROY_PICKAX'],
      }

      // 파괴 카드라면 상태 추가
      if (subtype.startsWith('DESTROY')) {
        if (!newStatus.includes(subtype)) {
          newStatus.push(subtype)
        }
        // 서버 emit 생략...
      } else if (subtype.startsWith('REPAIR')) {
        // 실제 플레이어 상태에 있는 고장 상태만 필터링
        const possibleBlocks = repairToBlockMap[subtype] || []
        const blocksToRemove = possibleBlocks.filter((block) => newStatus.includes(block))

        // 복수 고장 상태가 2개 이상이면 팝업 띄움
        if (blocksToRemove.length > 1) {
          this.repairPopup = {
            show: true,
            userId,
            playerIndex,
            cardSubtype: subtype,
            blocksToChoose: blocksToRemove,
            statusCopy: newStatus,
          }
          return // 팝업 선택 후 처리
        }

        // 1개 이하면 바로 수리 처리
        blocksToRemove.forEach((block) => {
          const idx = newStatus.indexOf(block)
          if (idx !== -1) newStatus.splice(idx, 1)
        })
        // 서버 emit 생략...
      }

      // 상태 업데이트 반영
      this.playerList[playerIndex] = {
        ...player,
        status: newStatus,
      }

      // 카드 제거 + 새 카드 받기
      this.removeDraggedCard()
      this.getRandomCard()
    }, //onDropOnPlayer
    resolveRepairChoice(selectedBlock) {
      const { userId, playerIndex, cardSubtype, statusCopy } = this.repairPopup

      // 선택된 파괴 상태만 제거
      const idx = statusCopy.indexOf(selectedBlock)
      if (idx !== -1) statusCopy.splice(idx, 1)

      // 상태 업데이트
      this.playerList[playerIndex] = {
        ...this.playerList[playerIndex],
        status: statusCopy,
      }

      // emit 필요 시 사용
      /*
      this.$socket.emit('useRepairToolCard', {
        userId: this.userId,
        cardType: 'ACTION',
        actionCardType: 'REPAIR',
        targetUserId: userId,
        roomId: this.gameRoomId,
        selectedTool: this.extractToolType(selectedBlock),
      })
      */

      // 카드 제거 및 새 카드 지급
      this.removeDraggedCard()
      this.getRandomCard()

      // 팝업 닫기
      this.repairPopup = {
        show: false,
        userId: null,
        playerIndex: null,
        cardSubtype: null,
        blocksToChoose: [],
        statusCopy: [],
      }
    },

    extractToolType(subtype) {
      const tools = ['CART', 'LIGHT', 'PICKAX']
      return tools.filter((tool) => subtype.includes(tool))
    },
    // 맵 드래그하여 탐색할 때
    startDragging(event) {
      this.isDragging = true
      this.dragStart = {
        x: event.clientX - this.offset.x,
        y: event.clientY - this.offset.y,
      }
    },
    onDragging(event) {
      if (!this.isDragging) return
      const newX = event.clientX - this.dragStart.x
      const newY = event.clientY - this.dragStart.y
      this.offset = {
        x: Math.max(-960, Math.min(720, newX)),
        y: Math.max(-1680, Math.min(1440, newY)),
      }
    },
    stopDragging() {
      this.isDragging = false
    },
    handleGoldConfirm(goldAmount) {
      const me = this.playerList.find((p) => p.nickname === this.myNickname)
      if (me) {
        me.gold += goldAmount
      }
    },
    // 랜덤 카드 한 장 새로 획득
    getRandomCard() {
      if (this.availableCards && this.availableCards.length > 0) {
        // availableCards 는 카드 더미 (덱)
        const randomIndex = Math.floor(Math.random() * this.availableCards.length)
        const randomCard = this.availableCards[randomIndex]

        // 내 카드 배열(cards)에 추가
        this.cards.push(randomCard)

        // 덱(availableCards)에서는 제거
        this.availableCards.splice(randomIndex, 1)
      }
    },
    removeDraggedCard() {
      const index = this.cards.indexOf(this.draggedCard)
      if (index !== -1) {
        this.cards.splice(index, 1)
      }

      // 드래그 상태 초기화
      this.draggedCard = null
    },
  },
}
</script>
<style scoped>
.repair-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px 30px;
  border: 2px solid #444;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  text-align: center;
}

.repair-popup button {
  margin: 10px 5px 0;
  padding: 10px 14px;
  font-size: 14px;
  background-color: #f2f2f2;
  border: 1px solid #aaa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.repair-popup button:hover {
  background-color: #dcdcdc;
}
</style>
