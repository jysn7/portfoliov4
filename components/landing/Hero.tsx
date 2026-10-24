'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const COLS = 96;
const ROWS = 72;
const ERASER = -1;
const MAX_HISTORY = 60;
const NAME = 'Jayson Baloyi';

// Distance from the centre to a corner, so the intro bloom always covers the whole picture
const REVEAL = Math.ceil(Math.hypot(COLS / 2, (ROWS / 2) * 1.2)) + 6;

// 13 colours sampled from Van Gogh's The Starry Night (1889), dark to light.
// Keys 1-9 pick the first nine, 0 picks the tenth; the last three are click-only.
const SWATCHES = [
  { name: 'cypress black', css: '#1D1E1D' },
  { name: 'night navy', css: '#293861' },
  { name: 'deep blue', css: '#243784' },
  { name: 'cypress green', css: '#3C433B' },
  { name: 'ultramarine', css: '#1F37A6' },
  { name: 'cobalt', css: '#1C35C2' },
  { name: 'royal blue', css: '#325BC1' },
  { name: 'cerulean', css: '#3F69B6' },
  { name: 'sky blue', css: '#5680B4' },
  { name: 'mist', css: '#7394A1' },
  { name: 'pale sage', css: '#9DAF7D' },
  { name: 'moon gold', css: '#D4A610' },
  { name: 'star glow', css: '#C5C55C' },
] as const;

const GRID_LINES =
  'linear-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)';

const GRID_FADE = 'linear-gradient(to bottom, #000 45%, transparent 100%)';

type Tool = 'pencil' | 'eraser' | 'fill' | 'picker';
type Settings = { tool: Tool; color: number; size: number; mirror: boolean };
type Actions = { undo: () => void; redo: () => void; clear: () => void; reset: () => void; save: () => void };

const ICONS = {
  pencil: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z'],
  eraser: [
    'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21',
    'M22 21H7',
    'm5 11 9 9',
  ],
  fill: [
    'm19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z',
    'm5 2 5 5',
    'M2 13h15',
    'M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z',
  ],
  picker: [
    'm2 22 1-1h3l9-9',
    'M3 21v-3l9-9',
    'm15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z',
  ],
  mirror: [
    'M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3',
    'M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3',
    'M12 20v2',
    'M12 14v2',
    'M12 8v2',
    'M12 2v2',
  ],
  undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'],
  redo: ['M21 7v6h-6', 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13'],
  save: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  clear: [
    'M3 6h18',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  ],
  reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
} as const;
type IconName = keyof typeof ICONS;

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const TOOLS: { id: Tool; label: string; key: string; icon: IconName }[] = [
  { id: 'pencil', label: 'Pencil', key: 'B', icon: 'pencil' },
  { id: 'eraser', label: 'Eraser', key: 'E', icon: 'eraser' },
  { id: 'fill', label: 'Fill', key: 'F', icon: 'fill' },
  { id: 'picker', label: 'Pick colour', key: 'I', icon: 'picker' },
];

const SIZES = [
  { n: 1, dot: 'size-1' },
  { n: 2, dot: 'size-2' },
  { n: 3, dot: 'size-3' },
] as const;

/* ------------------------------------------------------------------ */
/* The picture: The Starry Night, sampled from the painting itself,    */
/* reduced to a 96x72 grid and 13 colours (error-diffused for a        */
/* painterly grain). One character per cell, base-36 palette index.    */
/* The steeple, church and lit windows are drawn in by hand because    */
/* they are too small to survive sampling.                             */
/* ------------------------------------------------------------------ */
const SCENE_ROWS = [
  '1318118a989180181118811122472649a962622646887297176674142111142162224268272287889899278877792411',
  '111248799aaa971122429991222477a999a8672717297a98717161452424227712661172762627217877827722222777',
  '4722289abbca892254299b98221251aac999624478839766876944568983747886682772787281972222979999676444',
  '4224488abbb9a6425248899942444999ca981aaa972781882645567777189147767417712271789877799aaaaaa99877',
  '2122299aacc99844422413112822289989188aaaa758221144424589aaa99867272486612778271679aacaaa9aaa8777',
  '22223788a99998545114442777245879a9876aaca96467452445548cacac9c76476472217766119a99aaaacccaaa99cc',
  '7116558788889446500554442222262452254891325472477624298aacbaa974774621227676299aaaacccccccaac899',
  '72346746669645466002542554724676554554455444467422262889aacaa9a4414126276678789aaacccacccaacaa99',
  '7152242724552724400544545546244542756555644272145542479a9993999221417227677899aacacccbbbbcaaa888',
  '821228455667442460359932446452427642211247255741424252699998982622221216778899aaacccbbcaccc9a999',
  '975345665555224470193aaaa5444466417117781131937184744424889746222626442646689aaccccbbccccccaaa99',
  '9856674464564544103a9ac9c2546664328777667888819124374444712777727665554768688aacccbbbcccccaacaaa',
  '89624476581674671089abbba7645214767878889998898989899814267712166847867267898accacbbbccccccaa988',
  '9377666446677425108cabbaa54426676781789aaa99899977888888841228678999997676779aacccbbbbccccccac99',
  '8387476467225444207accaaa65278787888acaa312199998986988997741188aa9899968668aaacccbbbbbccccbaa99',
  '9839744472682266104676865562878889879998899aa3987678677996812429aa9aa988566699cacccbbbbbbbbb9a99',
  '988a84122746564410455456228887998818aa97788777889994878988984269aaaca998676688aaacccbbbbbbbaaa99',
  '9889986921266444602769788986799889aa99977773171887a8627798792469a9ab9a9a67769799ccccccbcccaa9a99',
  '8887a3998222245420386898877aa99783898722686764889498872619797664a999999977766a778caccccccccac988',
  '87898a989998867883099787889998788997112674278868188998887499676799a99989676569998aacaacccaaa9977',
  '99769993999999987900998889998778981212784a827887868879798529666677687868687559669aaaaccaaa9a9788',
  '89786998983999887300988999a6799a7211878899897778789179688826274776774887877762a78a9989a889878877',
  '89a87488888777889300388998778aaaa7178998889988688886888a8818286727664667887787698776789998888877',
  '88999927886999883000389879999abaa7187979988a8887898789898987128776776688874768657788896777778988',
  '8a989893178993983000388899649aca9888688788799797878889798894118611777888817776878678667921988877',
  '879988889988898830303899812889aa9677788887789987749898898988877766777777787787877866888888888766',
  '9a98999978999398303039628717188767889878868288877977889897249661333368478797797767766667723268aa',
  '979a89889988890830003628720267281887997888728888479889877469999a99972987878987778778777767789aaa',
  '188889999888890330033788711181277778998989862878987878989787899899999788787779887887878988accaaa',
  '7267899889988900030306818118118768698887a8991786877898774899a9997788998887777787887678999aca99aa',
  '7488787888877100000001871777127668788886979982822787247289a888781887489789688888668899aaaaa9a9aa',
  '179a99227677910000030111177777726777888978999987812267899999867869246887897887868ac999aaaaca9a99',
  '77aaa86768acaa003000008228776678998888789978977788a87697784678787978798886977789aaaaacaaaaaa9999',
  '27caa8876aaaca0000003097888888999999897788998898888999898467879a867999798637778aa9caa9a9aaa99aaa',
  '178988777aaaca300000003318789aa9a9a899778778987799998774782879a78697899886777aaa9aa99aaaa99999aa',
  '767667778aaaaa33000003188779a9aaaa9a9a76772789897986276998788888788788987626a9aa9a99a999a99aa999',
  '8688777768caca3000000037788a9aaaaaaaa99767879874125477718877986976788998726aa9aaa9a9998999a99199',
  '7722278788899800000000177889aaaaabaaaa9922111898877779827882798899989898419aaaaaaa8a78a933300000',
  '72889717746663030003003777999aaacbaa9999875771745767782287888897788889848aaa99aa9999889900001100',
  '81176127767860000000303781199aaa9caaaa8988797887888777871178899874628789a9a9a9aaa888998930011122',
  '81678998627673000000000778189a9aa999a9987879878788881288a889aaaaaaaaaa9a999aa99a7a99310100010011',
  '712aa9982418600030000308888899a9aaaa999877774787988769aa9a9999a9aa9aa9aa9aa9c989998a142201112100',
  'acaa9ac985467300000000093183899a99999868989aa9aaaa789caaaaa9999a9988898999887899a9a3112101120200',
  'aa9899aa8976800000000001189169a8998969baa9a999aaaa999aaa9999a99999999999998999932112212000010111',
  '9a8889aaaa9870000000303337137767778acaaa9a99aa99a9aaaa97298989999a9aa999978141112221138886878755',
  'aa8889a99a9993000300000337308899aac9a99aaa9987989a9999287789311110096546810242000202666898684866',
  '98889899aa9a9300000000330100399999999998988898aa978799a98322427112221188100110111178777676687822',
  '9989a7889987610000030003080009999999982788819888877881a24211421221211010103126555666884886888866',
  'a887789879899300000030300100003999a8778888897717899989a57247222121100452465567757686678797777766',
  '824279899878780000003030380000038217988913118899887121a22271814421024576767766766778878977787666',
  '981658987998890003003030009030001178783242120188112168a42712115210476267677164566686676766771766',
  '199989777629980300000030001000000367125541221221224262a6462219107665297817931778029998988773a311',
  '121197789876680030000000000300000004542442242122416776a982111246615113719188938991399939a3333933',
  '001145525542110030000000000030000003000002219112101221a9422442744493013330010111933a9133a989a933',
  '313002111100030000300000000000300300100110111993990271a999982191198211303aa333333a22aaa81a3a3a33',
  '111312011002000000000000300000000000223200330188117171a9887989998119389993489a3651321928aa3137aa',
  '312103140313000300030000003000300030112009882411017119a99119111211001111311189117919991191799100',
  '00012111342030000000000000300000003011009619171111a21a999118181117191100100131211131898891939900',
  '1101441004100033003303003300000000003036161221319aaa1a999210881778811211081181388887199890113999',
  '23133013121300300003000003000030000000033003010999999a9991108631001013b1300211111193310033977933',
  '33133a311130300000003000000030000000001103310003a9999a909190110131011011818111111899910983133322',
  '3333114212130000000300000000000300000031000113b9a9999a90946301003b188399991011000217710000110111',
  '100031111110030000300000000300000000000011110039a9099a9091100000331110337a7c30303131100319111000',
  '131111399333000000000000030030000030000003110013a9099a9990330100011000087b13b9981333077271999888',
  '111321030333333000000300000330003003000003031331333333333330101100001131311039991901880399301177',
  '111110331333000000000000000030000001000000003000039333000031113330011219a2311aca39019a3339112711',
  '0100333a3133000000000000000030000000000300003030381113133c303000000018181173221301013b0333033333',
  '13333333a033300000030000000000000000000000000333000000330ab3331993030101013121209899183010333100',
  '13023a03aa33103300003000003000000000000330001111113313330033331333339389901113218878893033003311',
  '301313030333333100000000030000000000000000003933133331030003333333338911191271130212211333313300',
  '100c0a330213103000000330000300000030000003000103333339000030300339999999038311110000000030303333',
  '3a33aaa3913a3ac330000330303303003330300030033311111111113390993333111112339011003330331033331333',
];

function buildScene(): Int8Array {
  const g = new Int8Array(COLS * ROWS).fill(ERASER);
  for (let r = 0; r < ROWS; r++) {
    const row = SCENE_ROWS[r];
    for (let c = 0; c < COLS; c++) g[r * COLS + c] = parseInt(row[c], 36);
  }
  return g;
}

const SCENE = buildScene();

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const pad = (n: number) => String(n).padStart(2, '0');

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const settings = useRef<Settings>({ tool: 'pencil', color: 11, size: 1, mirror: false });
  const actions = useRef<Actions>({ undo() {}, redo() {}, clear() {}, reset() {}, save() {} });

  const [ui, setUi] = useState<Settings>(settings.current);
  const [hist, setHist] = useState({ undo: 0, redo: 0 });

  const update = useCallback((patch: Partial<Settings>) => {
    settings.current = { ...settings.current, ...patch };
    setUi(settings.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx2d = canvas?.getContext('2d');
    if (!root || !canvas || !wrap || !ctx2d) return;
    const ctx = ctx2d;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasRound = typeof ctx.roundRect === 'function';

    const cells = SCENE.slice();
    const lift = new Float32Array(COLS * ROWS);
    const tgt = { x: -99, y: -99 };
    const ptr = { x: -99, y: -99, on: false };
    const hover = { c: -1, r: -1 };
    const reveal = { r: reduced ? REVEAL : 0 };
    const scan = { x: -6 };
    const ripples: { c: number; r: number; t: number }[] = [];
    let down = false;
    let last: { c: number; r: number } | null = null;
    let visible = true;
    let inside = false;

    const undoStack: Int8Array[] = [];
    const redoStack: Int8Array[] = [];
    let needSnap = false;
    let wipeTween: gsap.core.Tween | null = null;

    const syncHist = () => setHist({ undo: undoStack.length, redo: redoStack.length });
    const snapshot = () => {
      undoStack.push(cells.slice());
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0;
      syncHist();
    };

    let colors: string[] = [];
    let dotColor = '#71717a';
    let inkColor = '#888';
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const tok = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
      colors = SWATCHES.map((s) => s.css);
      dotColor = tok('--muted-foreground', '#71717a');
      inkColor = tok('--foreground', '#888');
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let W = 0;
    let H = 0;
    let cell = 0;
    let dpr = 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cell = W / COLS;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const fillBox = (x: number, y: number, w: number, h: number, r: number) => {
      if (hasRound) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
      } else ctx.fillRect(x, y, w, h);
    };
    const strokeBox = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      if (hasRound) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
      ctx.stroke();
    };

    const updateCount = () => {
      let n = 0;
      for (const v of cells) if (v >= 0) n++;
      if (countRef.current) countRef.current.textContent = `${n} px`;
    };
    updateCount();

    const write = (i: number, v: number, bump = 0.9) => {
      if (cells[i] === v) return false;
      if (needSnap) {
        snapshot();
        needSnap = false;
      }
      cells[i] = v;
      lift[i] += bump;
      return true;
    };

    const stamp = (c: number, r: number) => {
      const s = settings.current;
      const v = s.tool === 'eraser' ? ERASER : s.color;
      const lo = -Math.floor(s.size / 2);
      for (let dr = lo; dr < lo + s.size; dr++) {
        for (let dc = lo; dc < lo + s.size; dc++) {
          const cc = c + dc;
          const rr = r + dr;
          if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS) continue;
          write(rr * COLS + cc, v);
          if (s.mirror) write(rr * COLS + (COLS - 1 - cc), v);
        }
      }
    };

    const paintLine = (c: number, r: number) => {
      if (last) {
        const n = Math.max(Math.abs(c - last.c), Math.abs(r - last.r));
        for (let k = 1; k <= n; k++) {
          stamp(Math.round(last.c + ((c - last.c) * k) / n), Math.round(last.r + ((r - last.r) * k) / n));
        }
      } else stamp(c, r);
      last = { c, r };
      updateCount();
    };

    const floodFill = (c: number, r: number) => {
      const target = settings.current.color;
      const from = cells[r * COLS + c];
      if (from === target) return;
      const seen = new Uint8Array(COLS * ROWS);
      const stack = [r * COLS + c];
      while (stack.length) {
        const i = stack.pop()!;
        if (seen[i] || cells[i] !== from) continue;
        seen[i] = 1;
        write(i, target, 0.5);
        const x = i % COLS;
        const y = (i / COLS) | 0;
        if (x > 0) stack.push(i - 1);
        if (x < COLS - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - COLS);
        if (y < ROWS - 1) stack.push(i + COLS);
      }
      updateCount();
    };

    const applyWipe = (upTo: number, target: Int8Array | null) => {
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c <= upTo && c < COLS; c++) {
          const i = r * COLS + c;
          write(i, target ? target[i] : ERASER, 0.6);
        }
      updateCount();
    };
    const wipe = (target: Int8Array | null) => {
      wipeTween?.kill();
      needSnap = true;
      if (reduced) return applyWipe(COLS, target);
      const w = { x: -1 };
      wipeTween = gsap.to(w, {
        x: COLS,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => applyWipe(w.x, target),
      });
    };

    const restore = (from: Int8Array[], to: Int8Array[]) => {
      const prev = from.pop();
      if (!prev) return;
      wipeTween?.kill();
      needSnap = false;
      to.push(cells.slice());
      for (let i = 0; i < cells.length; i++) if (cells[i] !== prev[i]) lift[i] += 0.7;
      cells.set(prev);
      syncHist();
      updateCount();
    };

    const save = () => {
      const scale = 12;
      const out = document.createElement('canvas');
      out.width = COLS * scale;
      out.height = ROWS * scale;
      const o = out.getContext('2d');
      if (!o) return;
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
      o.fillStyle = bg || '#ffffff';
      o.fillRect(0, 0, out.width, out.height);
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] < 0) continue;
        o.fillStyle = colors[cells[i]];
        o.fillRect((i % COLS) * scale, ((i / COLS) | 0) * scale, scale, scale);
      }
      out.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'starry-night.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    actions.current = {
      undo: () => restore(undoStack, redoStack),
      redo: () => restore(redoStack, undoStack),
      clear: () => wipe(null),
      reset: () => wipe(SCENE),
      save,
    };

    const locate = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const fx = ((e.clientX - rect.left) / rect.width) * COLS;
      const fy = ((e.clientY - rect.top) / rect.height) * ROWS;
      return {
        fx,
        fy,
        c: Math.min(COLS - 1, Math.max(0, Math.floor(fx))),
        r: Math.min(ROWS - 1, Math.max(0, Math.floor(fy))),
      };
    };

    const onEnter = (e: PointerEvent) => {
      const p = locate(e);
      ptr.x = tgt.x = p.fx - 0.5;
      ptr.y = tgt.y = p.fy - 0.5;
      ptr.on = true;
    };
    const onMove = (e: PointerEvent) => {
      const p = locate(e);
      if (!ptr.on) {
        ptr.x = p.fx - 0.5;
        ptr.y = p.fy - 0.5;
        ptr.on = true;
      }
      tgt.x = p.fx - 0.5;
      tgt.y = p.fy - 0.5;
      hover.c = p.c;
      hover.r = p.r;
      if (coordRef.current) coordRef.current.textContent = `x ${pad(p.c)}  y ${pad(p.r)}`;
      if (down) paintLine(p.c, p.r);
    };
    const onLeave = () => {
      ptr.on = false;
      ptr.x = ptr.y = tgt.x = tgt.y = -99;
      hover.c = hover.r = -1;
      if (coordRef.current) coordRef.current.textContent = 'x --  y --';
    };
    const onDown = (e: PointerEvent) => {
      const p = locate(e);
      const tool = settings.current.tool;
      if (!reduced) ripples.push({ c: p.c, r: p.r, t: performance.now() / 1000 });

      if (tool === 'picker') {
        const v = cells[p.r * COLS + p.c];
        if (v >= 0) update({ color: v, tool: 'pencil' });
        else update({ tool: 'eraser' });
        return;
      }
      if (tool === 'fill') {
        needSnap = true;
        floodFill(p.c, p.r);
        return;
      }
      down = true;
      last = null;
      needSnap = true;
      canvas.setPointerCapture(e.pointerId);
      paintLine(p.c, p.r);
    };
    const onUp = () => {
      down = false;
      last = null;
      needSnap = false;
    };

    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const enter = () => (inside = true);
    const leave = () => (inside = false);
    root.addEventListener('mouseenter', enter);
    root.addEventListener('mouseleave', leave);

    const TOOL_KEYS: Record<string, Tool> = { b: 'pencil', e: 'eraser', f: 'fill', i: 'picker' };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!inside && !root.contains(document.activeElement)) return;

      const k = e.key.toLowerCase();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) actions.current.redo();
        else actions.current.undo();
        return;
      }
      if (mod && k === 'y') {
        e.preventDefault();
        actions.current.redo();
        return;
      }
      if (mod || e.altKey) return;

      if (TOOL_KEYS[k]) return update({ tool: TOOL_KEYS[k] });
      if (k >= '0' && k <= '9') {
        const n = k === '0' ? 9 : Number(k) - 1;
        if (n >= SWATCHES.length) return;
        const cur = settings.current.tool;
        return update({ color: n, tool: cur === 'eraser' || cur === 'picker' ? 'pencil' : cur });
      }
      if (k === '[') return update({ size: Math.max(1, settings.current.size - 1) });
      if (k === ']') return update({ size: Math.min(3, settings.current.size + 1) });
      if (k === 'm') return update({ mirror: !settings.current.mirror });
    };
    window.addEventListener('keydown', onKey);

    const render = () => {
      if (!visible || !cell) return;
      const now = performance.now() / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (ptr.on) {
        ptr.x += (tgt.x - ptr.x) * 0.25;
        ptr.y += (tgt.y - ptr.y) * 0.25;
      }
      while (ripples.length && now - ripples[0].t > 2.6) ripples.shift();

      const cx = COLS / 2 - 0.5;
      const cy = ROWS / 2 - 0.5;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;

          const appear = reveal.r - Math.hypot(col - cx, (row - cy) * 1.2);
          if (appear <= 0) continue;
          const pop = easeOutBack(Math.min(appear / 4, 1));

          let bump = 0;
          const dp = Math.hypot(col - ptr.x, row - ptr.y);
          if (dp < 3.6) {
            const k = 1 - dp / 3.6;
            bump += k * k * 0.9;
          }
          const ds = Math.abs(col - scan.x);
          if (ds < 2.5) bump += (1 - ds / 2.5) * 0.3;
          for (const rp of ripples) {
            const age = now - rp.t;
            const ph = age * 14 - Math.hypot(col - rp.c, row - rp.r);
            if (ph > 0 && ph < 4) bump += Math.sin((ph / 4) * Math.PI) * 0.7 * (1 - age / 2.6);
          }

          lift[i] += (bump - lift[i]) * 0.25;
          const b = lift[i];
          const v = cells[i];
          const px = (col + 0.5) * cell;
          const py = (row + 0.5) * cell;

          if (v >= 0) {
            // Cells slightly overlap so the painting reads as one image with no seams
            const s = cell * 1.04 * (1 + b * 0.35) * pop;
            ctx.fillStyle = colors[v];
            fillBox(px - s / 2, py - b * cell * 0.1 - s / 2, s, s, s * 0.1);
          } else {
            const s = cell * (0.12 + b * 0.2) * pop;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = dotColor;
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
            ctx.globalAlpha = 1;
          }
        }
      }

      const st = settings.current;

      if (st.mirror) {
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = inkColor;
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.restore();
      }

      if (ptr.on && hover.c >= 0 && hover.r >= 0) {
        const brush = st.tool === 'pencil' || st.tool === 'eraser';
        const sz = brush ? st.size : 1;
        const lo = -Math.floor(sz / 2);
        const cols = [hover.c + lo];
        if (brush && st.mirror) cols.push(COLS - sz - hover.c - lo);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = inkColor;
        for (const c0 of cols) {
          const x = c0 * cell;
          const y = (hover.r + lo) * cell;
          const w = sz * cell;
          if (st.tool === 'pencil') {
            ctx.globalAlpha = 0.45;
            ctx.fillStyle = colors[st.color];
            fillBox(x + cell * 0.08, y + cell * 0.08, w - cell * 0.16, w - cell * 0.16, cell * 0.18);
            ctx.globalAlpha = 1;
          }
          strokeBox(x + 0.75, y + 0.75, w - 1.5, w - 1.5, cell * 0.2);
        }
      }
    };
    gsap.ticker.add(render);

    const gsapCtx = gsap.context(() => {
      gsap
        .timeline({ repeat: -1 })
        .set(caretRef.current, { opacity: 0 }, 0.55)
        .set(caretRef.current, { opacity: 1 }, 1.1);

      if (reduced) return;

      gsap.fromTo('[data-char]', { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.03 });
      gsap.fromTo(
        '[data-in]',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.5 }
      );
      gsap.fromTo(
        windowRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.3 }
      );
      gsap.to(reveal, { r: REVEAL, duration: 2.8, ease: 'power2.out', delay: 0.6 });
      gsap.fromTo('[data-hint]', { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.6 });
      gsap.fromTo(
        '[data-arrow]',
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.5, delay: 1.8 }
      );
      gsap.fromTo(
        scan,
        { x: -6 },
        { x: COLS + 6, duration: 3, ease: 'none', repeat: -1, repeatDelay: 5, delay: 4 }
      );
    }, root);

    return () => {
      gsap.ticker.remove(render);
      gsapCtx.revert();
      wipeTween?.kill();
      gsap.killTweensOf([reveal, scan]);
      themeObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('keydown', onKey);
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [update]);

  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const toolBtn = `grid size-8 shrink-0 place-items-center rounded-lg border-[1.5px] border-transparent text-foreground transition-colors duration-150 hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background disabled:pointer-events-none disabled:opacity-30 ${focus}`;
  const barBtn =
    'grid size-7 place-items-center rounded-md text-primary-foreground transition-colors duration-150 hover:bg-primary-foreground/15 focus-visible:outline-2 focus-visible:outline-primary-foreground disabled:pointer-events-none disabled:opacity-40';
  const divider = 'mx-1 h-6 w-px bg-foreground/20';

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background px-6 pb-24 pt-24 sm:px-10 md:pt-28 lg:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: GRID_LINES,
          backgroundSize: '36px 36px',
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
        }}
      />

      {/* 64rem keeps the 4:3 painting from getting taller than a laptop screen */}
      <div className="relative w-full" style={{ maxWidth: '64rem' }}>
        <div className="mb-12 md:mb-14">
          <h1
            aria-label={NAME}
            className="font-display font-soft text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-none tracking-[-0.035em] text-foreground"
          >
            {NAME.split('').map((ch, i) => (
              <span key={i} aria-hidden className="-mb-3 inline-block overflow-hidden pb-3 pr-0.5 align-bottom">
                <span data-char className="inline-block">
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              </span>
            ))}
          </h1>
          <p data-in className="mt-3 font-display font-soft text-lg italic text-foreground md:text-xl">
            Software engineer
            <span
              ref={caretRef}
              aria-hidden
              className="ml-1 inline-block h-[0.8em] w-[0.42em] translate-y-[0.08em] rounded-xs bg-foreground"
            />
          </p>
          <p data-in className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            Founder of Monostudios, a web studio in South Africa. Computer science student at Eduvos.
          </p>
        </div>

        <div className="relative">
          <div
            data-hint
            aria-hidden
            className="pointer-events-none absolute -top-10 right-6 hidden items-end gap-1.5 text-muted-foreground sm:flex md:right-10"
          >
            <span className="pb-1 font-display text-base italic">click, drag, doodle</span>
            <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
              <path data-arrow pathLength={1} d="M3 5 C 20 1, 36 8, 38 29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path data-arrow pathLength={1} d="M31 22 L38 30 L43 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div
            ref={windowRef}
            className="relative overflow-hidden rounded-xl border-[1.5px] border-foreground bg-card shadow-[6px_6px_0_var(--primary)]"
          >
            <div className="flex h-10 items-center justify-between border-b-[1.5px] border-foreground bg-primary pl-3 pr-2 font-pixel text-sm text-primary-foreground">
              <span className="flex items-center gap-2.5">
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-2.5 rounded-sm border-[1.5px] border-primary-foreground" />
                  ))}
                </span>
                starry-night.png
              </span>
              <span className="flex items-center gap-1">
                <span ref={countRef} className="mr-2">
                  0 px
                </span>
                <button type="button" title="Undo (Ctrl/Cmd Z)" aria-label="Undo" disabled={hist.undo === 0} onClick={() => actions.current.undo()} className={barBtn}>
                  <Icon name="undo" />
                </button>
                <button type="button" title="Redo (Ctrl/Cmd Shift Z)" aria-label="Redo" disabled={hist.redo === 0} onClick={() => actions.current.redo()} className={barBtn}>
                  <Icon name="redo" />
                </button>
                <button type="button" title="Save as PNG" aria-label="Save as PNG" onClick={() => actions.current.save()} className={barBtn}>
                  <Icon name="save" />
                </button>
              </span>
            </div>

            <div
              role="toolbar"
              aria-label="Tools"
              className="flex flex-wrap items-center gap-1 border-b-[1.5px] border-foreground px-2 py-2"
            >
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={`${t.label} (${t.key})`}
                  aria-label={t.label}
                  aria-keyshortcuts={t.key}
                  aria-pressed={ui.tool === t.id}
                  onClick={() => update({ tool: t.id })}
                  className={toolBtn}
                >
                  <Icon name={t.icon} />
                </button>
              ))}

              <span className={divider} aria-hidden />

              {SIZES.map((s) => (
                <button
                  key={s.n}
                  type="button"
                  title={`Brush ${s.n}px ([ and ])`}
                  aria-label={`Brush size ${s.n}`}
                  aria-pressed={ui.size === s.n}
                  onClick={() => update({ size: s.n })}
                  className={toolBtn}
                >
                  <span className={`${s.dot} rounded-xs bg-current`} />
                </button>
              ))}

              <span className={divider} aria-hidden />

              <button
                type="button"
                title="Mirror (M)"
                aria-label="Mirror"
                aria-keyshortcuts="M"
                aria-pressed={ui.mirror}
                onClick={() => update({ mirror: !ui.mirror })}
                className={toolBtn}
              >
                <Icon name="mirror" />
              </button>

              <span className="flex-1" aria-hidden />

              <button type="button" title="Restore the original picture" aria-label="Reset picture" onClick={() => actions.current.reset()} className={toolBtn}>
                <Icon name="reset" />
              </button>
              <button type="button" title="Clear canvas" aria-label="Clear canvas" onClick={() => actions.current.clear()} className={toolBtn}>
                <Icon name="clear" />
              </button>
            </div>

            <div ref={wrapRef} className="relative w-full" style={{ aspectRatio: `${COLS} / ${ROWS}` }}>
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Interactive pixel canvas of Starry Night. Click and drag to draw, use the toolbar above to change brush."
                className="absolute inset-0 h-full w-full cursor-crosshair select-none"
                style={{ touchAction: 'pan-y' }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-foreground px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Colour">
                {SWATCHES.map((s, i) => {
                  const on = ui.color === i && ui.tool !== 'eraser';
                  const hotkey = i < 9 ? String(i + 1) : i === 9 ? '0' : undefined;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      title={hotkey ? `${s.name} (${hotkey})` : s.name}
                      aria-label={s.name}
                      aria-keyshortcuts={hotkey}
                      aria-pressed={on}
                      onClick={() =>
                        update({ color: i, tool: ui.tool === 'eraser' || ui.tool === 'picker' ? 'pencil' : ui.tool })
                      }
                      className={`size-6 rounded-md border-[1.5px] border-foreground transition-transform duration-200 hover:-translate-y-0.5 ${focus} ${
                        on ? '-translate-y-0.5 shadow-[2px_2px_0_var(--foreground)]' : ''
                      }`}
                      style={{ background: s.css }}
                    />
                  );
                })}
              </div>

              <p className="flex items-center gap-4 font-pixel text-xs text-muted-foreground" aria-hidden>
                <span>
                  {ui.tool} {ui.tool === 'pencil' || ui.tool === 'eraser' ? `${ui.size}px` : ''}
                  {ui.mirror ? ' mirror' : ''}
                </span>
                <span ref={coordRef} className="tabular-nums">
                  x --  y --
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}