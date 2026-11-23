/** Skaliert eine 1920×1080-Bühne passend in ihren Container (Letterboxing bei 16:10 / 4:3). */
export function fitStage(stage, container = stage.parentElement, onScale) {
  const fit = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const s = Math.min(w / 1920, h / 1080) || 0.1;
    stage.style.setProperty('--stage-scale', String(s));
    onScale?.(s);
  };
  fit();
  new ResizeObserver(fit).observe(container);
  return fit;
}
