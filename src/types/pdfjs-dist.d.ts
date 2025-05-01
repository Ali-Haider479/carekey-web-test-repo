declare module 'pdfjs-dist/legacy/build/pdf' {
  import pdfjsLib from 'pdfjs-dist'
  export = pdfjsLib
}

declare module 'pdfjs-dist/legacy/build/pdf.worker?worker' {
  const workerSrc: string
  export default workerSrc
}
