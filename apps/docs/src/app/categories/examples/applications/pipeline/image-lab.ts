/**
 * Model of the image lab demo: what flows along the edges and how it is drawn. A picture is a tree of CSS operations,
 * so previews are plain elements with `filter` and `mix-blend-mode`; only the export rasterizes it on a canvas.
 */

export type PortType = 'image' | 'number';

export type FilterFn = 'brightness' | 'contrast' | 'saturate' | 'hue' | 'blur' | 'grayscale' | 'sepia' | 'invert';

/** Blend modes shared by CSS `mix-blend-mode` and canvas `globalCompositeOperation`. */
export type BlendMode = 'multiply' | 'screen' | 'overlay' | 'difference' | 'soft-light';

export type Picture =
  | { kind: 'image'; src: string }
  | { kind: 'filter'; fn: FilterFn; amount: number; input: Picture }
  | { kind: 'blend'; mode: BlendMode; a: Picture; b: Picture };

/** Every filter takes an amount from 0 to 1; blur scales with the drawn width, so a preview matches the export. */
export const FILTERS: Record<
  FilterFn,
  { label: string; amount: number; css: (amount: number, width: number) => string }
> = {
  brightness: { label: 'Brightness', amount: 0.6, css: (a) => `brightness(${(0.2 + a * 1.6).toFixed(2)})` },
  contrast: { label: 'Contrast', amount: 0.6, css: (a) => `contrast(${(0.2 + a * 1.6).toFixed(2)})` },
  saturate: { label: 'Saturate', amount: 0.6, css: (a) => `saturate(${(a * 3).toFixed(2)})` },
  hue: { label: 'Hue', amount: 0.25, css: (a) => `hue-rotate(${Math.round(a * 360)}deg)` },
  blur: { label: 'Blur', amount: 0.2, css: (a, width) => `blur(${(a * width * 0.05).toFixed(1)}px)` },
  grayscale: { label: 'Grayscale', amount: 1, css: (a) => `grayscale(${a.toFixed(2)})` },
  sepia: { label: 'Sepia', amount: 0.8, css: (a) => `sepia(${a.toFixed(2)})` },
  invert: { label: 'Invert', amount: 1, css: (a) => `invert(${a.toFixed(2)})` },
};

export const BLEND_MODES: BlendMode[] = ['screen', 'multiply', 'overlay', 'difference', 'soft-light'];

/** Built-in pictures: inline SVG, so the demo needs no network and the export canvas is never tainted. */
export const SAMPLES = [
  {
    id: 'sunset',
    name: 'Sunset',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1e3a8a"/><stop offset=".55" stop-color="#f97316"/><stop offset="1" stop-color="#fde68a"/>
      </linearGradient></defs>
      <rect width="400" height="260" fill="url(#g)"/>
      <circle cx="270" cy="150" r="42" fill="#fef3c7"/>
      <path d="M0 260V170l70-50 80 55 70-45 80 55 60-35 40 20v90z" fill="#7c2d12"/>
      <path d="M0 260v-50l90-35 90 40 80-25 140 35v35z" fill="#431407"/>
    </svg>`,
  },
  {
    id: 'lake',
    name: 'Lake',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#bae6fd"/><stop offset=".6" stop-color="#e0f2fe"/>
      </linearGradient></defs>
      <rect width="400" height="260" fill="url(#g)"/>
      <path d="M0 160l80-90 60 50 70-80 90 100 50-40 50 60z" fill="#475569"/>
      <path d="M150 50l60-20 30 35-40-10z" fill="#f8fafc"/>
      <path d="M0 160l60-30 80 35 90-40 90 45 80-20v20z" fill="#15803d"/>
      <rect y="160" width="400" height="100" fill="#0e7490"/>
      <path d="M40 190h90M210 210h120M90 235h70" stroke="#a5f3fc" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'bokeh',
    name: 'Bokeh',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" fill="#0f172a"/>
      <g opacity=".85">
        <circle cx="60" cy="70" r="46" fill="#f472b6"/><circle cx="170" cy="190" r="60" fill="#38bdf8"/>
        <circle cx="300" cy="60" r="38" fill="#facc15"/><circle cx="350" cy="190" r="52" fill="#a78bfa"/>
        <circle cx="240" cy="120" r="24" fill="#4ade80"/><circle cx="40" cy="220" r="30" fill="#fb923c"/>
      </g>
    </svg>`,
  },
].map((sample) => ({ ...sample, src: 'data:image/svg+xml;utf8,' + encodeURIComponent(sample.svg) }));

/** Rasterizes a picture with the same operations the preview applies in CSS. */
export async function renderPicture(picture: Picture, width: number, height: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  switch (picture.kind) {
    case 'image':
      drawCover(context, await loadImage(picture.src), width, height);
      break;
    case 'filter':
      context.filter = FILTERS[picture.fn].css(picture.amount, width);
      context.drawImage(await renderPicture(picture.input, width, height), 0, 0);
      break;
    case 'blend': {
      const [a, b] = await Promise.all([
        renderPicture(picture.a, width, height),
        renderPicture(picture.b, width, height),
      ]);
      context.drawImage(a, 0, 0);
      context.globalCompositeOperation = picture.mode;
      context.drawImage(b, 0, 0);
    }
  }
  return canvas;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** `object-fit: cover` on a canvas. */
function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}
