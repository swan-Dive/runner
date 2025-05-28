import { CanvasOptions } from "./types";

export class Canvas {
  container: HTMLDivElement;
  canvasDIV: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;

  constructor(container: HTMLDivElement, options: CanvasOptions) {
    this.container = container;
    this.canvasDIV = document.createElement("canvas");
    this.ctx = this.canvasDIV.getContext("2d");
    this.canvasDIV.width = options.width || 800;
    this.canvasDIV.height = options.height || 200;
    this.container.appendChild(this.canvasDIV);
  }

  getWidth() {
    return this.canvasDIV.width;
  }
  getHeight() {
    return this.canvasDIV.height;
  }

  drawScore(score: number, highScore: number) {
    let ctx = this.getContext();

    const OFFSET = 120;
    ctx.fillStyle = "#333";

    ctx.font = "14px main_font";
    let sc = "CS:";
    let hs = `HS:`;
    for (let i = 0; i < 5 - highScore.toString().length; ++i) {
      hs += "0";
    }
    for (let i = 0; i < 5 - score.toString().length; ++i) {
      sc += "0";
    }
    sc += score.toString();
    hs += highScore.toString();
    ctx.fillText(sc, this.getWidth() - OFFSET, 20);
    ctx.fillText(hs, this.getWidth() - OFFSET - 130, 20);
  }

  drawGameOver() {
    let ctx = this.getContext();
    ctx.fillStyle = "black";
    ctx.font = "24px main_font";
    const gameOverText = "GAME OVER";

    const restartText = "PRESS SPACE TO RESTART";
    ctx.fillText(gameOverText, this.getWidth() / 2 - 95, this.getHeight() / 2);
    ctx.font = "14px main_font";
    ctx.fillText(
      restartText,
      this.getWidth() / 2 - 140,
      this.getHeight() / 2 + 40
    );
  }

  getContext() {
    let ctx = this.ctx;
    if (!ctx) {
      throw new Error("No context provided");
    }
    return ctx;
  }

  clearContext() {
    if (this.ctx) this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
  }
}
