/**
 * hwplib-js — isomorphic HWP (Hangul Word Processor) read/write engine.
 *
 * The public surface is intentionally narrow and byte-oriented so the engine runs
 * identically in the browser, Electron, and Node:
 *
 *   read(bytes: Uint8Array)  -> HWPFile
 *   write(file: HWPFile)     -> Uint8Array
 *
 * The object model, reader, writer, and BlankFileMaker are ported 1:1 from
 * hwplib 1.1.10 (https://github.com/neolord0/hwplib). See README.md and NOTICE.
 */

export const HWPLIB_JS_VERSION = "0.1.0";

// --- binary + string primitives ---
export { BitFlag } from "./util/binary/BitFlag.js";
export { Compressor } from "./util/binary/Compressor.js";
export { Obfuscation } from "./util/binary/Obfuscation.js";
export { StringUtil } from "./util/StringUtil.js";

// --- core objects ---
export { RecordHeader } from "./object/RecordHeader.js";
export { FileVersion } from "./object/fileheader/FileVersion.js";

// --- compound-file / stream I/O ---
export { StreamReader } from "./util/compoundFile/reader/StreamReader.js";
export { StreamWriter } from "./util/compoundFile/writer/StreamWriter.js";
export { CompoundFileReader } from "./util/compoundFile/reader/CompoundFileReader.js";
export { CompoundFileWriter } from "./util/compoundFile/writer/CompoundFileWriter.js";

// --- engine entry points ---
export { HWPFile } from "./object/HWPFile.js";
export { HWPReader } from "./reader/HWPReader.js";
export { HWPWriter } from "./writer/HWPWriter.js";
export { BlankFileMaker } from "./tool/blankfilemaker/BlankFileMaker.js";
