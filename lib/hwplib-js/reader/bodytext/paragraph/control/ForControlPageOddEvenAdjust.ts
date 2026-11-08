import type { ControlPageOddEvenAdjust } from "../../../../object/bodytext/control/ControlPageOddEvenAdjust.js";
import type { StreamReader } from "../../../../util/compoundFile/reader/StreamReader.js";

export class ForControlPageOddEvenAdjust {
  public static read(pgoea: ControlPageOddEvenAdjust, sr: StreamReader): void {
    pgoea.getHeader().getProperty().setValue(sr.readUInt4());
  }
}
