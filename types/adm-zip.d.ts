declare module 'adm-zip' {
  interface IZipEntry {
    entryName: string
    getData(): Buffer
    getData(encoding: string): string
  }

  class AdmZip {
    constructor(buffer?: Buffer | string)
    getEntries(): IZipEntry[]
    updateFile(entryName: string, data: Buffer): void
    toBuffer(): Buffer
  }

  export = AdmZip
}
