import { describe, it, expect, vi } from 'vitest'
import { mount, config } from '@vue/test-utils'
import Room from '../../src/views/Room.vue'

// Mock font-awesome-icon component
config.global.components = {
  'font-awesome-icon': {
    template: '<span />'
  }
}

interface Card {
  image: string;
  type: string;
  subtype?: string;
}

vi.useFakeTimers()

describe('Integration Test - revealGoalCard()', () => {
    it('map 카드 드롭 시 카드 공개 후 2초 뒤 다시 닫힘', async () => {
        const card: Card = { 
          image: '/img/cards/map.png',
          type: 'action',
          subtype: 'map'
        }
      
        const wrapper = mount(Room, {
          data() {
            return {
              startCard: { image: '/img/cards/start.png' },
              goalCards: [
                { image: '/img/cards/goal_back.png' },
                { image: '/img/cards/goal_back.png' },
                { image: '/img/cards/goal_back.png' }
              ],
              draggedCard: null,
              cards: [card],
              availableCards: [],
              round: 1,
              hoveredSlot: null,
              playerList: [
                { nickname: 'player1', role: '광부', gold: 0, image: '', highlight: false, status: [] }
              ],
              myNickname: 'player1',
              turnPlayer: 'player1',
              showGameResultPopup: false,
              showGoldstoneCardDistributionPopup: false,
              slots: Array(900).fill(null).map(() => ({ card: null })),
              offset: { x: 0, y: 0 },
              isDragging: false,
              dragStart: { x: 0, y: 0 },
              distributedCards: []
            }
          }
        })
      
        // @ts-ignore - 테스트 목적으로 타입 체크 무시
        wrapper.vm.draggedCard = card
        wrapper.vm.revealGoalCard(0)
      
        const revealed = wrapper.vm.goalCards[0].image
        expect(revealed).not.toBe('/img/cards/goal_back.png')
      
        vi.advanceTimersByTime(2000)
        await wrapper.vm.$nextTick()
      
        expect(wrapper.vm.goalCards[0].image).toBe('/img/cards/goal_back.png')
        expect(wrapper.vm.draggedCard).toBe(null)
        expect(wrapper.vm.cards.length).toBe(0)
      })

  it('map 카드 3번 드롭 시 상태 초기화 및 이미지 랜덤성 확인', async () => {
    const wrapper = mount(Room, {
      data() {
        return {
          startCard: { image: '/img/cards/start.png' },
          goalCards: [
            { image: '/img/cards/goal_back.png' },
            { image: '/img/cards/goal_back.png' },
            { image: '/img/cards/goal_back.png' }
          ],
          draggedCard: null,
          cards: [
            { image: '/img/cards/map.png', type: 'action', subtype: 'map' },
            { image: '/img/cards/map.png', type: 'action', subtype: 'map' },
            { image: '/img/cards/map.png', type: 'action', subtype: 'map' }
          ],
          availableCards: [],
          round: 1,
          hoveredSlot: null,
          playerList: [
            { nickname: 'player1', role: '광부', gold: 0, image: '', highlight: false, status: [] }
          ],
          myNickname: 'player1',
          turnPlayer: 'player1',
          showGameResultPopup: false,
          showGoldstoneCardDistributionPopup: false,
          slots: Array(900).fill(null).map(() => ({ card: null })),
          offset: { x: 0, y: 0 },
          isDragging: false,
          dragStart: { x: 0, y: 0 },
          distributedCards: []
        }
      }
    })

    const revealedImages: string[] = []

    for (let i = 0; i < 3; i++) {
      // @ts-ignore - 테스트 목적으로 타입 체크 무시
      wrapper.vm.draggedCard = wrapper.vm.cards[0]
      wrapper.vm.revealGoalCard(i)
      revealedImages.push(wrapper.vm.goalCards[i].image)
      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.goalCards[i].image).toBe('/img/cards/goal_back.png')
    }

    const uniqueImages = [...new Set(revealedImages)]
    expect(uniqueImages.length).toBeGreaterThan(1) // 랜덤성 확인
  })
})
