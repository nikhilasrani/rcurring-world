/**
 * Pure logic controller for dialogue paging.
 * Extracted to a separate file for unit testing without Phaser dependencies.
 */
export class DialogueController {
  private pages: string[];
  private currentPage: number;
  private name: string;

  constructor(pages: string[], name?: string) {
    this.pages = pages;
    this.currentPage = 0;
    this.name = name || '';
  }

  getCurrentPage(): string {
    return this.pages[this.currentPage];
  }

  hasMorePages(): boolean {
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

  reset(pages: string[], name?: string): void {
    this.pages = pages;
    this.currentPage = 0;
    this.name = name || '';
  }
}
