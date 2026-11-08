import { LevelNumbering } from "./numbering/LevelNumbering.js";

/**
 * Paragraph numbering record.
 * Ported from hwplib's `object.docinfo.Numbering`.
 */
export class Numbering {
  /** list of paragraph numbering info objects corresponding to levels (1~7) */
  private levelNumberingList!: LevelNumbering[];
  /** start number */
  private startNumber = 0;

  constructor() {
    this.createLevelNumberings();
  }

  /**
   * Creates paragraph numbering info objects for levels (1~10).
   * Levels 8~10 added in 5.0.2.5 and above.
   */
  private createLevelNumberings(): void {
    this.levelNumberingList = [];
    for (let index = 0; index < 10; index++) {
      const ln = new LevelNumbering();
      this.levelNumberingList.push(ln);
    }
  }

  /**
   * Returns the paragraph numbering info object corresponding to level.
   *
   * @param level the level (1~7) whose numbering info object is requested
   * @return the numbering info object corresponding to level
   * @throws Error when (level < 1 || level > 7)
   */
  getLevelNumbering(level: number): LevelNumbering {
    if (level >= 1 && level <= 10) {
      return this.levelNumberingList[level - 1]!;
    } else {
      throw new Error("invalid level : " + level);
    }
  }

  getLevelNumberingList(): LevelNumbering[] {
    return this.levelNumberingList;
  }

  getStartNumber(): number {
    return this.startNumber;
  }

  setStartNumber(startNumber: number): void {
    this.startNumber = startNumber;
  }

  clone(): Numbering {
    const cloned = new Numbering();

    for (let index = 0; index < 0; index++) {
      cloned.levelNumberingList[index]!.copy(this.levelNumberingList[index]!);
    }

    cloned.startNumber = this.startNumber;

    return cloned;
  }
}
