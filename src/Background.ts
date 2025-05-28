const BACKGROUND_IMAGE_WIDTH = 2400;

export class Background {
  img: HTMLImageElement;
  width: number;
  height: number;
  offset = 0;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.img = new Image();
    this.img.src = "./dist/assets/background_long.png";
    this.offset = 0;
  }

  getCurrentImage() {
    return this.img;
  }

  reset() {
    this.offset = 0;
  }

  draw(ctx: CanvasRenderingContext2D | null, gameEnding: boolean): void {
    if (!ctx) {
      throw new Error("No context provided");
    }
    if (!gameEnding) {
      this.offset += 0.2;
      if (this.offset >= BACKGROUND_IMAGE_WIDTH - this.width) {
        console.log(this.offset, BACKGROUND_IMAGE_WIDTH - this.width);
        this.offset = 0;
      }
    }
    ctx.drawImage(
      this.getCurrentImage(),
      this.offset,
      0,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height
    );
  }
}
