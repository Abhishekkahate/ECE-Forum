/// <reference types="vite/client" />

declare module 'qrcode' {
  export function toDataURL(
    text: string | Array<any>,
    options?: any
  ): Promise<string>;
  export function toDataURL(
    text: string | Array<any>,
    options: any,
    callback: (error: Error | null | undefined, url: string) => void
  ): void;
  export function toString(
    text: string | Array<any>,
    options?: any
  ): Promise<string>;
  export function toCanvas(
    canvasElement: HTMLCanvasElement,
    text: string | Array<any>,
    options?: any
  ): Promise<void>;
  export function create(data: string | Array<any>, options?: any): any;
}

declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}
