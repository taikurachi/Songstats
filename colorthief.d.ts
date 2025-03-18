// colorthief.d.ts
declare module "colorthief" {
  export default class ColorThief {
    getColor(image: HTMLImageElement): [number, number, number]; // RGB color
    getPalette(
      image: HTMLImageElement,
      colorCount?: number
    ): [number, number, number][]; // Array of RGB colors
  }
}
