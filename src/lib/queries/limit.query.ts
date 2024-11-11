class LimitQueryBuilder {
  protected isLimit = false;

  protected limitNum = 0;

  public limit(rowNum: number) {
    if (!this.isLimit) {
      this.isLimit = true;
    }
    if (typeof rowNum !== 'number') {
      throw new Error('Limit must be a number');
    }

    this.limitNum = rowNum;

    return this;
  }

  protected buildLimitQuery() {
    if (this.isLimit) {
      return `LIMIT ${this.limitNum}`;
    }
    return '';
  }
}

export { LimitQueryBuilder };
