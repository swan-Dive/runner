// const MIDDLEGROUND_IMAGE_WIDTH = 3200;

// export class MiddleGround {
//   width: number;
//   height: number;
//   // img: HTMLImageElement = new Image();
//   offset: number = 0;
//   constructor(width: number, height: number) {
//     this.width = width;
//     this.height = height;
//     // this.img.src = "./dist/assets/game/stores.png";
//   }

//   reset() {
//     this.offset = 0;
//   }

//   draw(
//     ctx: CanvasRenderingContext2D | null,
//     gameEnding: boolean,
//     speed: number
//   ): void {
//     if (!ctx) {
//       throw new Error("No context provided");
//     }
//     if (!gameEnding) {
//       this.offset += speed / 2;
//       if (this.offset >= MIDDLEGROUND_IMAGE_WIDTH - this.width) {
//         this.offset = 0;
//       }
//     }
//     ctx.drawImage(
//       this.img,
//       this.offset,
//       0,
//       this.width,
//       this.height,
//       0,
//       this.height / 2,
//       this.width,
//       this.height / 2
//     );
//   }
// }
