/**
 * Pure logic controller for dialogue paging.
 * Extracted to a separate file for unit testing without Phaser dependencies.
 */
export class DialogueController {
  private pages: string[];
  private currentPage: number;
  private name: string;
  private choicePage: number = -1;
  private choices: string[] = [];

  constructor(pages: string[], name?: string) {
    this.pages = pages;
    this.currentPage = 0;
    this.name = name || '';
  }

  getCurrentPage(): string {
    return this.pages[this.currentPage];
  }

  hasMorePages(): boolean {
    // On choice page, block normal advance — choices must be selected explicitly
    if (this.isChoicePage()) return false;
    return this.currentPage < this.pages.length - 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.pages.length - 1;
  }

  nextPage(): boolean {
    if (this.hasMorePages()) {
      this.currentPage++;
      return true;
    }
    return false;
  }

  shouldShowPageIndicator(): boolean {
    return this.hasMorePages();
  }

  getName(): string {
    return this.name;
  }

  /** Set choice data: which page index triggers choice mode and what the choices are */
  setChoiceData(choicePage: number, choices: string[]): void {
    this.choicePage = choicePage;
    this.choices = choices;
  }

  /** Returns true when the current page is the designated choice page */
  isChoicePage(): boolean {
    return this.choicePage >= 0 && this.currentPage === this.choicePage;
  }

  /** Returns the choices array */
  getChoices(): string[] {
    return this.choices;
  }

  /** Returns the number of choices */
  getChoiceCount(): number {
    return this.choices.length;
  }

  /** Select a choice by index, returns the choice text */
  selectChoice(index: number): string {
    return this.choices[index];
  }

  reset(pages: string[], name?: string): void {
    this.pages = pages;
    this.currentPage = 0;
    this.name = name || '';
    this.choicePage = -1;
    this.choices = [];
  }
}
