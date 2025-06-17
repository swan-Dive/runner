const BACKGROUND_IMAGE_WIDTH = 2241;
const BUILDINGS_MAPPER = [[0, 31, 450, 169]];
class Building {
    constructor(img, sx, sy, swidth, sheight, canvasWidth) {
        this.img = img;
        this.sx = sx;
        this.sy = sy;
        this.swidth = swidth;
        this.sheight = sheight;
        this.width = swidth;
        this.height = sheight;
        this.offset = canvasWidth;
    }
    update(gameEnding) {
        if (!gameEnding) {
            this.offset -= 0.4;
        }
    }
    isOOB() {
        return this.offset + this.swidth < 0;
    }
    draw(ctx) {
        ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(this.img, this.sx, this.sy, this.swidth, this.sheight, this.offset, 0, this.width, this.height);
    }
}
export class Background {
    constructor(width, height) {
        this.frameCount = 0;
        this.offset = 0;
        this.buildings = [];
        this.width = width;
        this.height = height;
        this.img = new Image();
        // this.buildings_image = new Image();
        this.img.src = "./dist/assets/game/background.png";
        // this.buildings_image.src = "./dist/assets/game/stores2.png";
        this.offset = 0;
    }
    reset() {
        this.offset = 0;
    }
    // update(timeDelta: number, gameEnding: boolean) {
    //   // this.frameCount++;
    //   // if (this.frameCount > (1 / timeDelta / 8) * 500 + Math.random() * 3000) {
    //   //   this.frameCount = 0;
    //   //   this.buildings.push(
    //   //     new Building(
    //   //       this.buildings_image,
    //   //       BUILDINGS_MAPPER[0][0],
    //   //       BUILDINGS_MAPPER[0][1],
    //   //       BUILDINGS_MAPPER[0][2],
    //   //       BUILDINGS_MAPPER[0][3],
    //   //       this.width
    //   //     )
    //   //   );
    //   //   console.log("SWAPN");
    //   // }
    //   // this.buildings.forEach((building) => {
    //   //   building.update(gameEnding);
    //   // });
    //   // this.buildings = this.buildings.filter((building) => !building.isOOB());
    // }
    draw(ctx, gameEnding) {
        if (!ctx) {
            throw new Error("No context provided");
        }
        if (!gameEnding) {
            this.offset += 1;
            if (this.offset >= BACKGROUND_IMAGE_WIDTH - this.width) {
                this.offset = 0;
            }
        }
        ctx.drawImage(this.img, this.offset, 0, this.width, this.height, 0, 0, this.width, this.height - 25);
        // this.buildings.forEach((building) => {
        //   building.draw(ctx);
        // });
    }
}
