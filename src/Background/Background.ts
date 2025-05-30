const BACKGROUND_IMAGE_WIDTH = 2400;
const BUILDINGS_MAPPER = [[0, 31, 450, 169]];

class Building {
  img: HTMLImageElement;
  sx: number;
  sy: number;
  swidth: number;
  sheight: number;
  width: number;
  height: number;
  offset: number;
  constructor(
    img: HTMLImageElement,
    sx: number,
    sy: number,
    swidth: number,
    sheight: number,
    canvasWidth: number
  ) {
    this.img = img;
    this.sx = sx;
    this.sy = sy;
    this.swidth = swidth;
    this.sheight = sheight;
    this.width = swidth;
    this.height = sheight;
    this.offset = canvasWidth;
  }

  update(gameEnding: boolean) {
    if (!gameEnding) {
      this.offset -= 0.4;
    }
  }

  isOOB() {
    return this.offset + this.swidth < 0;
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    ctx?.drawImage(
      this.img,
      this.sx,
      this.sy,
      this.swidth,
      this.sheight,
      this.offset,
      0,
      this.width,
      this.height
    );
  }
}

export class Background {
  img: HTMLImageElement;
  buildings_image: HTMLImageElement;
  width: number;
  frameCount: number = 0;
  height: number;
  offset = 0;
  buildings: Building[] = [];
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.img = new Image();
    this.buildings_image = new Image();
    this.img.src = "./dist/assets/background_long.png";
    this.buildings_image.src = "./dist/assets/game/stores2.png";
    this.offset = 0;
  }

  reset() {
    this.offset = 0;
  }

  update(timeDelta: number, gameEnding: boolean) {
    // this.frameCount++;
    // if (this.frameCount > (1 / timeDelta / 8) * 500 + Math.random() * 3000) {
    //   this.frameCount = 0;
    //   this.buildings.push(
    //     new Building(
    //       this.buildings_image,
    //       BUILDINGS_MAPPER[0][0],
    //       BUILDINGS_MAPPER[0][1],
    //       BUILDINGS_MAPPER[0][2],
    //       BUILDINGS_MAPPER[0][3],
    //       this.width
    //     )
    //   );
    //   console.log("SWAPN");
    // }
    // this.buildings.forEach((building) => {
    //   building.update(gameEnding);
    // });
    // this.buildings = this.buildings.filter((building) => !building.isOOB());
  }

  draw(ctx: CanvasRenderingContext2D | null, gameEnding: boolean): void {
    if (!ctx) {
      throw new Error("No context provided");
    }
    if (!gameEnding) {
      this.offset += 0.2;
      if (this.offset >= BACKGROUND_IMAGE_WIDTH - this.width) {
        this.offset = 0;
      }
    }

    ctx.drawImage(
      this.img,
      this.offset,
      0,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height
    );

    // this.buildings.forEach((building) => {
    //   building.draw(ctx);
    // });
  }
}
