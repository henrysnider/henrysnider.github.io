export class FlashcardsModel {
  static readonly PILE_COUNT = 6;
  static readonly BASE_PILE_POS = 0;

  private readonly piles: Flashcard[][] = Array.from(
    { length: FlashcardsModel.PILE_COUNT },
    () => [],
  );

  private currentCard: Flashcard | null = null;
  private currentPile: Flashcard[] = this.piles[FlashcardsModel.BASE_PILE_POS];
  private currentPilePos = FlashcardsModel.BASE_PILE_POS;
  private frontShowing = true;

  async populateCards(file: File | null): Promise<string> {
    if (file == null) {
      return '';
    }

    this.piles.forEach((pile) => pile.length = 0);
    this.currentPile = this.piles[FlashcardsModel.BASE_PILE_POS];
    this.currentPilePos = FlashcardsModel.BASE_PILE_POS;
    this.currentCard = null;
    this.frontShowing = true;

    const contents = await file.text();
    const lines = contents.split(/\r?\n/);
    if (lines.at(-1) === '') {
      lines.pop();
    }

    for (const line of lines) {
      this.currentPile.push(new Flashcard(line));
    }

    return this.getNextCard();
  }

  flipCard(): string | null {
    if (this.currentCard == null) {
      return null;
    }

    this.frontShowing = !this.frontShowing;

    return this.frontShowing ? this.currentCard.front : this.currentCard.back;
  }

  answered(correct: boolean): void {
    if (this.currentCard == null) {
      return;
    }

    const baseStack = this.piles[FlashcardsModel.BASE_PILE_POS];
    const currentIndex = this.currentPile.indexOf(this.currentCard);

    if (currentIndex >= 0) {
      this.currentPile.splice(currentIndex, 1);
    }

    if (correct && this.currentPilePos < FlashcardsModel.PILE_COUNT - 1) {
      this.piles[this.currentPilePos + 1].push(this.currentCard);
    } else {
      baseStack.push(this.currentCard);
    }

    if (this.currentPile.length === 0) {
      if (baseStack.length > 0) {
        this.currentPilePos = FlashcardsModel.BASE_PILE_POS;
        this.currentPile = baseStack;
      } else if (this.currentPilePos < FlashcardsModel.PILE_COUNT - 1) {
        this.currentPilePos += 1;
        this.currentPile = this.piles[this.currentPilePos];
      }
    }
  }

  getNextCard(): string {
    if (this.currentPile.length === 0) {
      this.currentCard = null;
      return '';
    }

    const nextIndex = Math.floor(Math.random() * this.currentPile.length);
    this.currentCard = this.currentPile[nextIndex];
    this.frontShowing = true;

    return this.currentCard.front;
  }

  getPileSize(pile: number): number {
    return this.piles[pile]?.length ?? 0;
  }
}

class Flashcard {
  private static readonly CARD_DELIMITER = '~';

  readonly front: string;
  readonly back: string;

  constructor(cardLine: string) {
    const pieces = cardLine.split(Flashcard.CARD_DELIMITER);
    this.front = pieces[0] ?? '';
    this.back = pieces.length > 1 ? pieces[1] : '';
  }
}

export default FlashcardsModel;
