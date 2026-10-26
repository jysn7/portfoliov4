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
      'A portfolio site for a painting business, built so the work itself is the only thing competing for attention.',
    tags: ['Next.js', 'GSAP', 'Sanity'],
    image: '/new-work/canvas/canvas-home.png',

    role: 'Design & build',
    client: 'Canvas Studio',
    timeline: '5 weeks',
    status: 'Live',

    overview: [
      'Canvas is a small studio doing commissioned paintings and murals. Their old site was a Behance iframe, a bio, and a broken contact form. They did not want a bigger portfolio — they wanted the work to feel as considered as the room it hangs in.',
      'The brief was almost aggressively simple: let the paintings be the design. No hero carousel, no “about our process” fluff, no cookie banner fighting the art for attention.',
    ],
    highlights: [
      {
        title: 'Paintings at full bleed',
        text: 'Every piece opens edge-to-edge on its own page, with generous whitespace and a single line of context — title, medium, dimensions, availability.',
      },
      {
        title: 'Ink-into-frame transitions',
        text: 'GSAP handles the gallery → detail transition as a masked wipe, echoing the way a canvas is unrolled and framed. It stays out of the way of the image itself.',
      },
      {
        title: 'CMS the artist actually uses',
        text: 'Sanity with a custom schema for “painting” — upload, title, medium, price, sold flag. No layout knobs, so the site can never drift from its design.',
      },
      {
        title: 'Enquiries that land somewhere',
        text: 'A single, quiet “commission this” link on each piece opens a mail draft pre-filled with the title and dimensions — nothing else to fill in.',
      },
      {
        title: 'Quiet motion, not motion as brand',
        text: 'Animations are slow, small, and always in service of the image. Nothing spins, nothing bounces — the paintings stay still, the interface moves around them.',
      },
    ],
    challenge:
      'The old site could not be edited without a developer, which meant new work sat unsold for weeks. Any solution had to give the artist full control over content without giving them layout decisions.',
    solution:
      'A deliberately narrow CMS: upload an image, add five fields, and the site handles presentation. The gallery pulls the newest 12 pieces, groups by medium, and hides sold work behind a muted state rather than removing it — so a painting can keep selling itself long after it’s gone.',
    results: [
      { value: '12', label: 'pieces added in month one' },
      { value: '2×', label: 'enquiries per week' },
      { value: '0', label: 'developer tickets since launch' },
      { value: '1.1s', label: 'LCP on first view' },
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
    id: 'izakhiwo',
    title: 'Izakhiwo',
    category: 'web',
    year: 2024,
    description:
      'A quote-and-booking site for a roofing and plumbing contractor, built around a clean job-request flow that turns calls into structured jobs.',
    tags: ['Next.js', 'Supabase', 'Resend'],
    image: '/new-work/izakhiwo.png',

    role: 'Design & build',
    client: 'Izakhiwo Contractors',
    timeline: '6 weeks',
    status: 'Live',

    overview: [
      'Izakhiwo handles roofing and plumbing across Gauteng. Most of their work came from word-of-mouth calls that ended as a note on a scrap of paper — which meant quotes went out late and follow-ups were sporadic.',
      'The site needed to do the opposite of a brochure: take a messy phone enquiry and turn it into a structured job with photos, a description, and a clear next step for both the client and the contractor.',
    ],
    highlights: [
      {
        title: 'A quote request that gets it right the first time',
        text: 'A branching flow asks the right questions for roofing vs plumbing, requests the right photos, and returns a rough estimate range before the form is submitted.',
      },
      {
        title: 'Photo capture on the client side',
        text: 'Clients upload photos directly through the site — Supabase Storage handles resizing and gives the contractor a clean set to quote from.',
      },
      {
        title: 'Quotes that email both sides',
        text: 'Every job submission sends a Resend email to the contractor and a copy to the client — so the client has the reference number and photos in their inbox too.',
      },
      {
        title: 'Admin view that fits on one screen',
        text: 'A quiet internal dashboard shows every open job with photos and status — no CRM features they don’t use, no dashboards they’ll ignore.',
      },
      {
        title: 'Works offline-first on-site',
        text: 'The quote flow caches drafts locally so a contractor taking notes in a roof cavity with no signal can finish the request when they get back to the van.',
      },
    ],
    challenge:
      'The contractor did not want a booking system, a login, or a “customer portal” — they wanted to keep working from their phone while on a roof. Anything added had to fit the way they already worked, not the other way round.',
    solution:
      'The public site captures a structured job in under two minutes, and the contractor sees every new request in one inbox-style list they can open on their phone. No accounts, no admin app to install, no training.',
    results: [
      { value: '+38%', label: 'enquiries converting to quoted jobs' },
      { value: '−2 days', label: 'average time to quote' },
      { value: '5/5', label: 'client satisfaction on jobs' },
      { value: '180+', label: 'jobs logged in year one' },
    ],
    gallery: [
      '/new-work/izakhiwo-1.png',
      '/new-work/izakhiwo-2.png',
      '/new-work/izakhiwo-3.png',
      '/new-work/izakhiwo-4.png',
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
      { value: '3×', label: 'qualified enquiries per month' },
      { value: '98', label: 'Lighthouse performance' },
      { value: '4', label: 'projects from this site alone' },
      { value: '+64%', label: 'organic traffic in six months' },
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