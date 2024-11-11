
class OffsetQueryBuilder {
  protected isOffset = false;

  protected offsetStart: number = 0;

  public offset(start: number) {
    if (!this.isOffset) {
      this.isOffset = true;
    }
    if (typeof start !== 'number') {
      throw new Error('Start must be a number');
    }
    this.offsetStart = start;
    return this;
  }

  protected buildOffsetQuery(): string {
    if (this.isOffset) {
      return `OFFSET ${this.offsetStart}`;
    }
    return '';
  }
}

export { OffsetQueryBuilder };
