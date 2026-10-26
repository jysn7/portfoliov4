// components/work/featured.ts
// Case-study data for the "Featured" section on /works.
// Each entry is a full CaseView: card info + everything used inside the case-study overlay.

export type CaseImage = string;

export type CaseHighlight = {
  title: string;
  text: string;
};

export type CaseResult = {
  value: string;
  label?: string;
};

export type CaseView = {
  id: string;
  title: string;
  category: string;
  year: number;

  // card
  description: string;
  tags: string[];
  image: CaseImage;

  // case study header
  role?: string;
  client?: string;
  timeline?: string;
  status?: string;

  // sections
  overview: string[];
  highlights: CaseHighlight[];
  challenge?: string;
  solution?: string;
  results: CaseResult[];
  gallery: CaseImage[]; // up to 4 extra images (2 pairs)

  // links
  href?: string;
  repo?: string;
};

/* ------------------------------------------------------------------ */
/* The featured projects                                               */
/* ------------------------------------------------------------------ */

export const FEATURED: CaseView[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'tyga',
    title: 'TYGA',
    category: 'web',
    year: 2025,
    description:
      'A management platform for a golf academy — bookings, coaching schedules and student progress in one place, built with the student team I lead.',
    tags: ['Next.js', 'Supabase', 'Tailwind', 'Stripe'],
    image: '/new-work/tyga-home.png',

    role: 'Lead developer & designer',
    client: 'TYGA Golf Academy',
    timeline: '10 weeks',
    status: 'Live',

    overview: [
      'TYGA (The Youth Golf Academy) ran their entire operation out of WhatsApp, a paper diary and three separate spreadsheets. Coaches double-booked slots, parents chased confirmations, and no one could answer “how is my child progressing?” without digging through notebooks.',
      'They needed one place where a coach could see their day, a parent could book and pay, and an admin could see the health of the academy at a glance — without adding a full-time operator to the payroll.',
    ],
    highlights: [
      {
        title: 'One schedule, everyone in sync',
        text: 'Coaches, students and admins see the same live calendar. Bookings and cancellations propagate through Supabase realtime channels, so no two people can claim the same slot.',
      },
      {
        title: 'Progress that a parent can read',
        text: 'Each session produces a short structured note — skill focus, drills, next steps. Parents get a clean timeline per child instead of a WhatsApp thread.',
      },
      {
        title: 'Payments without an ops team',
        text: 'Stripe-backed booking, invoice generation and monthly statements roll up automatically. Admins see outstanding balances at a glance and parents get reminders.',
      },
      {
        title: 'Built for the coach on the range',
        text: 'The session-note flow is one screen, keyboard-friendly, and works on a phone with one hand while holding a bucket of balls in the other.',
      },
      {
        title: 'Figma-first, then shipped',
        text: 'Every screen was designed and reviewed in Figma with the academy owner before a line of code was written — the wireframes still drive new features today.',
      },
    ],
    challenge:
      'Replace four tools with one without forcing the academy to close for a week to migrate. Every screen had to be learnable in five minutes by someone who does not enjoy software.',
    solution:
      'We shipped a thin slice first — bookings + session notes — ran it in parallel with their old process for two weeks, then turned off the spreadsheets once the data matched. Payments and reporting followed in a second slice, so nothing had to be learned all at once.',
    results: [
      { value: '−72%', label: 'admin time per week' },
      { value: '3×', label: 'faster parent responses' },
      { value: '0', label: 'double-bookings since launch' },
      { value: '312', label: 'sessions logged in month one' },
    ],
    gallery: [
      '/new-work/tyga-auth.png',
      '/new-work/tyga-dashboard.png',
      '/new-work/tyga-mobile.png',
      '/new-work/tyga-figma.png',
    ],
    href: undefined,
    repo: undefined,
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'canvas',
    title: 'Canvas',
    category: 'web',
    year: 2024,
    description:
      'A painting-focused template built so the artwork is the interface — full-bleed canvases, calm motion, and a CMS that keeps the design locked.',
    tags: ['Next.js', 'GSAP', 'Sanity'],
    image: '/new-work/canvas/canvas-home.png',

    role: 'Design & build',
    client: 'Canvas',
    timeline: '5 weeks',
    status: 'Live',

    overview: [
      'Canvas is a self-contained template for painters, muralists and small studios who want their work to breathe on the screen. The goal from the first sketch was to strip away everything that competes with the painting — no hero carousels, no “about our process” fluff, no cookie banners fighting the art for attention.',
      'What’s left is a quiet gallery-first site where every page is designed around a single piece, and the interface stays out of the way while still feeling considered.',
    ],
    highlights: [
      {
        title: 'Paintings at full bleed',
        text: 'Each piece opens edge-to-edge on its own page, with generous whitespace and a single line of context — title, medium, dimensions, availability.',
      },
      {
        title: 'Ink-into-frame transitions',
        text: 'GSAP handles the gallery → detail transition as a masked wipe, echoing the way a canvas is unrolled and framed. It stays out of the way of the image itself.',
      },
      {
        title: 'CMS that keeps the design intact',
        text: 'A custom Sanity schema for “painting” — upload, title, medium, price, sold flag. No layout knobs, so the template can never drift away from its design.',
      },
      {
        title: 'Enquiries that land somewhere',
        text: 'A single, quiet “commission this” link on each piece opens a mail draft pre-filled with the title and dimensions — nothing else to fill in.',
      },
      {
        title: 'Quiet motion, not motion as brand',
        text: 'Animations are slow, small and always in service of the image. Nothing spins, nothing bounces — the paintings stay still and the interface moves around them.',
      },
    ],
    challenge:
      'Painting portfolios are usually either over-designed (competing with the art) or under-designed (a Behance iframe and a broken contact form). The template had to sit exactly between the two: quiet, but not anonymous — beautiful, but never louder than the work.',
    solution:
      'The layout holds a single, confident scale for the paintings, backed by a tight motion system that only ever uses slow masked wipes and gentle fades. Typography is set at a small, consistent scale so nothing on the page competes with the artwork. Every content decision is scoped down so the user can only edit the painting — not the design.',
    results: [
      { value: '1.1s', label: 'LCP on first view' },
      { value: '0', label: 'layout knobs to break' },
      { value: '4', label: 'page templates total' },
      { value: '100', label: 'Lighthouse accessibility' },
    ],
    gallery: [
      '/new-work/canvas/canvas-double.png',
      '/new-work/canvas/canvas-welcome.png',
      '/new-work/canvas/canvas-mobile.png',
      '/new-work/canvas/canvas-about.png',
    ],
    href: undefined,
    repo: undefined,
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'edition',
    title: 'Edition',
    category: 'web',
    year: 2024,
    description:
      'A publishing platform where writers post essays, readers like and share them, and everyone has a profile worth looking at.',
    tags: ['Next.js', 'Sanity', 'Clerk'],
    image: '/new-work/edition/edition-home.png',

    role: 'Design & build',
    client: 'Edition',
    timeline: '7 weeks',
    status: 'Live',

    overview: [
      'Edition is a writing platform built around the idea that posting an essay should feel as easy as posting a note, and reading one should feel like opening a magazine — not scrolling a feed.',
      'The goal was to give writers a fast, distraction-free place to publish, readers a calm way to discover new work, and every writer a profile that reads like a mini-publication of their own.',
    ],
    highlights: [
      {
        title: 'Publishing that stays out of the way',
        text: 'Writers compose in a focused editor backed by Sanity, with image uploads, drafts and scheduled publishing — no dashboard detours between an idea and a published essay.',
      },
      {
        title: 'Auth that doesn’t feel like auth',
        text: 'Clerk handles sign-in, sessions and account settings so the only thing a new writer sees is a “start writing” button — no custom login UI to maintain.',
      },
      {
        title: 'Likes and shares that mean something',
        text: 'Readers can like a post and share it with a clean, medium-aware link preview. Likes roll into each writer’s profile so their best work surfaces over time.',
      },
      {
        title: 'Writer profiles that read like mini-publications',
        text: 'Every profile shows a writer’s latest posts, their tags, and a short bio — designed more like a magazine masthead than a social feed.',
      },
      {
        title: 'Reader-first typography',
        text: 'A serif-led scale, generous line height and a max measure tuned for long reading. The whole layout is built to make 3000-word essays comfortable on a phone.',
      },
    ],
    challenge:
      'Publishing platforms tend to collapse into one of two shapes: social feeds that bury writing under reactions, or heavy CMSs that make publishing feel like filing paperwork. Edition had to feel like a feed to write in, and like a magazine to read.',
    solution:
      'The editor and the reader are treated as two separate products that share one data model. Publishing is a single focused screen; reading is a long-form layout built around typography, not around cards or likes. Profiles sit between the two — the writer’s best work, presented without the noise of a feed.',
    results: [
      { value: '2 min', label: 'median time-to-publish' },
      { value: '2×', label: 'return readers first 3 weeks' },
      { value: '100', label: 'Lighthouse performance' },
      { value: '4', label: 'core routes total' },
    ],
    gallery: [
      '/new-work/edition/edition-new.png',
      '/new-work/edition/edition-account.png',
      '/new-work/edition/edition-post.png',
      '/new-work/edition/edition-mobile.png',
    ],
    href: undefined,
    repo: undefined,
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'monostudios',
    title: 'Monostudios',
    category: 'web',
    year: 2023,
    description:
      'The site for my web studio — an animated WebGL front end over a Payload CMS, built to demo what the studio actually does.',
    tags: ['Next.js', 'WebGL', 'Payload CMS', 'GSAP'],
    image: '/new-work/mono/mono-home.png',

    role: 'Design, build & content',
    client: 'MonoStudios',
    timeline: '8 weeks',
    status: 'Live',

    overview: [
      'MonoStudios is my own studio, which means the site doubles as a portfolio and a live brief for clients: it has to demonstrate the kind of interactive work the studio sells, without becoming a WebGL tech demo that forgets to be a business site.',
      'The brief to myself was simple: something a client remembers a week later, and something they can actually use to hire the studio without waiting for a call.',
    ],
    highlights: [
      {
        title: 'An opening that sets the tone',
        text: 'A single WebGL scene handles the hero — a slow, ink-like distortion on the studio wordmark — and then dissolves as you scroll, handing the page back to typography.',
      },
      {
        title: 'Scroll that reads like a brief',
        text: 'GSAP ScrollTrigger drives the whole page as a narrative: what the studio is, what it does, three pieces of proof, and one very direct CTA.',
      },
      {
        title: 'Editing without a deploy',
        text: 'Payload CMS handles case studies, service pages and the studio bio. Everything the studio changes monthly is editable; the layout is locked.',
      },
      {
        title: 'Performance as a design constraint',
        text: 'The WebGL scene is lazy-loaded and skipped entirely on reduced motion or low-power devices — the page must still feel premium without it.',
      },
      {
        title: 'Content that ranks',
        text: 'Case studies are written as essays, not link lists — which turned out to be the single biggest driver of organic traffic to the studio.',
      },
    ],
    challenge:
      'Interactive sites have a habit of breaking on older phones, on bad networks, or for people who just want to read. The site had to lead with the interactive idea while still being a perfectly usable site with none of it.',
    solution:
      'The WebGL scene is treated as an enhancement, not the floor. The static layout, typography, transitions and content all hold on their own; the 3D hero only layers on top when the device can afford it. Every animation respects `prefers-reduced-motion`.',
    results: [
      { value: '2×', label: 'qualified enquiries per month' },
      { value: '98', label: 'Lighthouse performance' },
      { value: '4', label: 'projects from this site alone' },
      { value: '+44%', label: 'organic traffic in six months' },
    ],
    gallery: [
      '/new-work/mono/mono-mobile.png',
      '/new-work/mono/mono-pricing.png',
      '/new-work/mono/mono-contact.png',
      '/new-work/mono/mono-code.png',
    ],
    href: undefined,
    repo: undefined,
  },
];

/* Convenience export if you just want the four cards on the works index. */
export default FEATURED;