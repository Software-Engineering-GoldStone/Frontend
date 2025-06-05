import { describe, it, expect, beforeEach } from 'vitest';

function createMockComponent() {
  return {
    cards: [],
    availableCards: [
      { image: '/img/cards/a.png' },
      { image: '/img/cards/b.png' },
      { image: '/img/cards/c.png' }
    ],
    getRandomCard() {
      if (this.availableCards && this.availableCards.length > 0) {
        const index = Math.floor(Math.random() * this.availableCards.length);
        const card = this.availableCards[index];
        this.cards.push(card);
        this.availableCards.splice(index, 1);
      }
    }
  };
}

describe('getRandomCard()', () => {
  let component: ReturnType<typeof createMockComponent>;

  beforeEach(() => {
    component = createMockComponent();
  });

  it('카드를 cards에 추가하고 availableCards에서 제거한다', () => {
    const initialLength = component.availableCards.length;
    component.getRandomCard();
    expect(component.cards.length).toBe(1);
    expect(component.availableCards.length).toBe(initialLength - 1);
  });

  it('availableCards가 비어 있을 경우 아무 변화 없음', () => {
    component.availableCards = [];
    component.getRandomCard();
    expect(component.cards.length).toBe(0);
    expect(component.availableCards.length).toBe(0);
  });
});
