// Minimal File System Access API types (not always present in DOM lib)
export {};

declare global {
  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
    excludeAcceptAllOption?: boolean;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
  }

  interface FileSystemFileHandle {
    readonly kind: 'file';
    readonly name: string;
    getFile(): Promise<File>;
    createWritable(options?: unknown): Promise<FileSystemWritableFileStream>;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
  }

  interface Window {
    showSaveFilePicker?(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
    showOpenFilePicker?(options?: unknown): Promise<FileSystemFileHandle[]>;
  }
}
