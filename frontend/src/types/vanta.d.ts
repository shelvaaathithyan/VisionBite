declare module 'vanta/dist/vanta.net.min' {
  type VantaEffect = {
    destroy: () => void;
  };

  type VantaNetOptions = {
    el: HTMLElement;
    THREE?: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
  };

  const NET: (options: VantaNetOptions) => VantaEffect;
  export default NET;
}
