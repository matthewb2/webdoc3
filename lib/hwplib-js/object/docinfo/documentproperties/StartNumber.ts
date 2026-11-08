/**
 * Information about various start numbers.
 * Ported from hwplib's `object.docinfo.documentproperties.StartNumber`.
 */
export class StartNumber {
  private page = 0;
  private footnote = 0;
  private endnote = 0;
  private picture = 0;
  private table = 0;
  private equation = 0;

  constructor() {}

  getPage(): number {
    return this.page;
  }

  setPage(page: number): void {
    this.page = page;
  }

  getFootnote(): number {
    return this.footnote;
  }

  setFootnote(footnote: number): void {
    this.footnote = footnote;
  }

  getEndnote(): number {
    return this.endnote;
  }

  setEndnote(endnote: number): void {
    this.endnote = endnote;
  }

  getPicture(): number {
    return this.picture;
  }

  setPicture(picture: number): void {
    this.picture = picture;
  }

  getTable(): number {
    return this.table;
  }

  setTable(table: number): void {
    this.table = table;
  }

  getEquation(): number {
    return this.equation;
  }

  setEquation(equation: number): void {
    this.equation = equation;
  }

  copy(from: StartNumber): void {
    this.page = from.page;
    this.footnote = from.footnote;
    this.endnote = from.endnote;
    this.picture = from.picture;
    this.table = from.table;
    this.equation = from.equation;
  }
}
