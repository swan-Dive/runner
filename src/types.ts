export type PlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  jumping: boolean;
  ducking: boolean;
  images: {
    run: any;
    jump: any;
    shrink: any;
  };
  frameIndex: number;
  frameTimer: number;
  is_plumiting: boolean;
  shrinkFrameIndex: number;
  shrinkFrameTimer: number;
};

export type CanvasOptions = {
  width: number | undefined;
  height: number | undefined;
};
