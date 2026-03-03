/**
 * Creative Classification Definitions
 *
 * Taxonomy and detection rules for labeling ad creatives.
 * Each type includes:
 *   - key          Unique identifier used in code
 *   - label        Human-readable name shown in the UI
 *   - description  Plain-language explanation of the type
 *   - detect       Signals an analyst or classifier looks for
 *   - examples     Concrete real-world examples
 *   - benchmarks   Typical performance characteristics
 */

// ─── Hook Types ────────────────────────────────────────────
// The "hook" is the opening strategy used in the first 1-3 seconds
// to stop a viewer from scrolling past the ad.

export const HOOK_TYPES = [
  {
    key: 'problem-solution',
    label: 'Problem-Solution',
    description:
      'Opens by stating a relatable problem the viewer faces, then immediately hints at or presents the product as the solution.',
    detect: [
      'Opens with a pain point, frustration, or "struggle" statement',
      'Uses phrases like "Tired of…", "Struggling with…", "Hate when…", "Ever deal with…"',
      'Problem is shown visually (messy desk, bad skin, tangled cords) before product appears',
      'Product reveal follows within 1-3 seconds as the "fix"',
      'Often uses split-frame or before → after transition at the hook',
    ],
    examples: [
      '"Tired of beard itch? We fixed it." — product jar appears',
      'Close-up of tangled earbuds → cut to wireless earbuds unboxing',
      'Person struggling with heavy luggage → cut to lightweight suitcase gliding',
    ],
    benchmarks: {
      avgThumbstop: '28-35%',
      bestFor: 'Conversion-focused campaigns',
      platforms: ['Meta', 'TikTok', 'YouTube'],
      notes: 'Consistently top 3 hook type by CPA across DTC brands',
    },
  },
  {
    key: 'social-proof',
    label: 'Social Proof',
    description:
      'Leads with evidence that other people trust, use, or love the product — reviews, numbers, endorsements, or crowd behavior.',
    detect: [
      'Opens with star ratings, review count, or award badges',
      'First frame shows customer quote, screenshot of a review, or UGC testimonial',
      'Uses phrases like "10,000+ 5-star reviews", "As seen on…", "#1 rated…"',
      'Shows multiple people using the product or a "wall of reviews"',
      'Influencer or recognizable face appears immediately',
      'Press logos (Forbes, Vogue, etc.) shown in opening frame',
    ],
    examples: [
      'TikTok screen recording scrolling through 5-star reviews',
      '"Over 50,000 customers switched this year" with counter animation',
      'Split screen of 4 different people using the product simultaneously',
    ],
    benchmarks: {
      avgThumbstop: '22-28%',
      bestFor: 'Mid-funnel and retargeting audiences',
      platforms: ['Meta', 'Google', 'YouTube'],
      notes: 'Strong conversion lift when paired with discount CTA',
    },
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    description:
      'Creates an information gap that the viewer can only close by watching. Teases a reveal, secret, or unexpected outcome.',
    detect: [
      'Opens with an incomplete statement or cliffhanger',
      'Uses phrases like "I can\'t believe this actually…", "This one trick…", "Wait for it…", "You won\'t expect…"',
      'Shows a surprising or unusual visual without explanation',
      'Text overlay with a bold claim or question that isn\'t immediately answered',
      'Product is intentionally hidden or blurred in the opening',
      'Pattern interrupt — something visually unexpected in frame 1',
    ],
    examples: [
      '"I tried 47 beard oils. Only ONE actually worked." — product hidden',
      'Close-up of mysterious package being opened, contents not visible yet',
      '"My dermatologist said to stop doing this…" — cut before reveal',
    ],
    benchmarks: {
      avgThumbstop: '30-40%',
      bestFor: 'Top-of-funnel awareness, high watch time',
      platforms: ['TikTok', 'YouTube', 'Meta'],
      notes: 'Highest thumbstop rate but can underperform on conversion if payoff is weak',
    },
  },
  {
    key: 'fomo',
    label: 'Fear of Missing Out',
    description:
      'Creates urgency or scarcity — the viewer feels they need to act now or miss a limited opportunity.',
    detect: [
      'Opens with countdown timer, "limited time", or "selling fast" language',
      'Uses phrases like "Last chance…", "Only X left…", "Ends tonight…", "Don\'t miss…"',
      'Shows stock counter, live purchase notifications, or cart abandonment reminder',
      'Red/urgent color treatment or flashing/pulsing elements',
      'Calendar or clock visual element prominent in first frame',
      'Sold-out badges on variant options to show scarcity',
    ],
    examples: [
      '"⚡ Flash Sale — 48 hours only. 70% OFF" with countdown overlay',
      'Screen recording showing "Only 3 left in stock" on product page',
      '"Your cart expires in 15 minutes" — retargeting creative',
    ],
    benchmarks: {
      avgThumbstop: '25-32%',
      bestFor: 'Retargeting, sale events, limited drops',
      platforms: ['Meta', 'Google'],
      notes: 'High short-term CVR but can cause fatigue if overused',
    },
  },
  {
    key: 'discount-offer',
    label: 'Discount/Offer',
    description:
      'Leads immediately with the deal — a percentage off, bundle price, free gift, or promo code front and center.',
    detect: [
      'First frame contains a price, percentage, or "FREE" callout',
      'Uses phrases like "Save 30%", "Buy 1 Get 1", "Free shipping", "Use code…"',
      'Price comparison shown (crossed-out original vs. sale price)',
      'Promo code displayed prominently as text overlay',
      'Product + price are both visible in the first frame',
      'Bundle visualization (multiple products grouped together with combined price)',
    ],
    examples: [
      'Large "40% OFF" text over product hero image — code "BEARD40"',
      'Side-by-side: "$89 → $49 today only" with product spinning',
      '"Free trimmer with every kit" — gift item highlighted in green',
    ],
    benchmarks: {
      avgThumbstop: '20-26%',
      bestFor: 'Bottom-funnel, price-sensitive audiences',
      platforms: ['Meta', 'Google', 'YouTube'],
      notes: 'Reliable CVR driver but lower brand equity; avoid for prospecting',
    },
  },
  {
    key: 'before-after',
    label: 'Before-After',
    description:
      'Shows a transformation — the state before using the product vs. after. The contrast is the hook.',
    detect: [
      'Split screen or side-by-side comparing two states',
      'Time-lapse or morph transition from "before" to "after"',
      'Uses labels "Before" / "After" or "Day 1" / "Day 30"',
      'Dramatic visual contrast (messy → clean, dull → vibrant, slow → fast)',
      'Person\'s reaction shot after seeing results',
      'Progress photos or video diary format',
    ],
    examples: [
      'Split screen: patchy beard on left → full beard on right, 30-day timeline',
      'Skin close-up morphing from acne-prone to clear over 4 weeks',
      'Cluttered room → same angle, fully organized after product use',
    ],
    benchmarks: {
      avgThumbstop: '26-34%',
      bestFor: 'Health, beauty, fitness, home improvement verticals',
      platforms: ['TikTok', 'Meta', 'YouTube'],
      notes: 'Very high engagement + save rate; strong purchase intent signal',
    },
  },
  {
    key: 'testimonial',
    label: 'Testimonial',
    description:
      'Opens with a real customer or influencer speaking directly about their experience with the product.',
    detect: [
      'Person speaking directly to camera in first frame',
      'Uses first-person language: "I\'ve been using…", "This changed my…", "Honestly, I didn\'t expect…"',
      'UGC aesthetic — filmed on phone, natural lighting, casual setting',
      'Customer name/handle shown as text overlay',
      'Audio-led — the voice/story drives the hook, not text or graphics',
      'Often starts mid-sentence for authenticity ("…so I finally tried it and—")',
    ],
    examples: [
      '"Okay so I\'ve been using this for 2 weeks and I have to be honest…"',
      'Creator unboxing on their kitchen counter, reacting in real-time',
      '"My husband noticed the difference before I did" — couple on couch',
    ],
    benchmarks: {
      avgThumbstop: '24-30%',
      bestFor: 'Trust-building, new customer acquisition',
      platforms: ['TikTok', 'Meta', 'YouTube'],
      notes: 'Outperforms polished brand content by 2-3x on engagement',
    },
  },
  {
    key: 'question-hook',
    label: 'Question Hook',
    description:
      'Opens with a direct question that speaks to the viewer\'s situation, creating an instant mental engagement.',
    detect: [
      'First line is a question (text or spoken)',
      'Uses "you" or "your" — addresses the viewer directly',
      'Phrases like "Did you know…?", "What if I told you…?", "Why are you still…?", "Have you tried…?"',
      'Question mark is the dominant visual element in frame 1',
      'Rhetorical or provocative question designed to make viewer pause',
      'Often followed by a 1-2 second pause before answering',
    ],
    examples: [
      '"Why is your beard so dry?" — text over close-up of dry skin',
      '"What if you could grow a full beard in 30 days?"',
      '"Did you know 90% of men use the wrong beard oil?"',
    ],
    benchmarks: {
      avgThumbstop: '26-33%',
      bestFor: 'Awareness campaigns, educational content',
      platforms: ['TikTok', 'YouTube', 'Meta'],
      notes: 'High thumbstop when question is specific; generic questions underperform',
    },
  },
];

// ─── Visual Types ──────────────────────────────────────────
// The "visual" is the primary production style / format of the creative.

export const VISUAL_TYPES = [
  {
    key: 'product-closeup',
    label: 'Product Close-up',
    description:
      'Camera is tightly framed on the product itself — textures, packaging, application, or details are the visual focus.',
    detect: [
      'Product fills 60%+ of the frame',
      'Shallow depth of field with product in sharp focus',
      'Macro/close-up shots showing texture, material, or details',
      'Hands interacting with product (opening, applying, holding)',
      'Clean background — studio, solid color, or minimal setting',
      'Rotating product shots or 360° spin',
      'No human face visible or face is cropped out',
    ],
    examples: [
      'Beard oil bottle rotating on white background with droplet falling',
      'Hands opening product packaging in ASMR style',
      'Extreme close-up of product texture being applied to skin',
    ],
    benchmarks: {
      avgWatchTime: '6-9s',
      bestFor: 'Product launches, catalog/shopping ads',
      platforms: ['Meta', 'Google', 'YouTube'],
      notes: 'Strong purchase intent; works best for visually appealing products',
    },
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle',
    description:
      'Shows the product being used naturally in an everyday setting — the focus is on the person and context, not just the product.',
    detect: [
      'Person shown in a recognizable real-world setting (home, gym, office, outdoors)',
      'Product is present but not dominating the frame',
      'Activity-focused — person is doing something (morning routine, cooking, commuting)',
      'Warm, aspirational color grading',
      'Multiple scene changes showing different use cases',
      'Background environment tells a story (cozy apartment, beach, urban street)',
    ],
    examples: [
      'Man applying beard oil as part of morning bathroom routine',
      'Woman using laptop at a cafe, product bag visible on table',
      'Couple hiking, one pulls product from backpack mid-trail',
    ],
    benchmarks: {
      avgWatchTime: '8-12s',
      bestFor: 'Brand awareness, top-of-funnel prospecting',
      platforms: ['Meta', 'TikTok', 'YouTube'],
      notes: 'Highest brand recall; lower direct response than close-up or UGC',
    },
  },
  {
    key: 'text-overlay',
    label: 'Text Overlay',
    description:
      'Text is the primary storytelling device — bold captions, kinetic typography, or listicle-style frames carry the message.',
    detect: [
      'Large text occupies 40%+ of the frame',
      'Text appears/animates as the primary content (not just subtitles)',
      'Minimal or no spoken audio — text drives the narrative',
      'Kinetic typography — words fly in, scale, or highlight sequentially',
      'Listicle format: "3 reasons…", "5 things you didn\'t know…"',
      'Background is static or slow-motion while text changes rapidly',
      'Bold fonts, high-contrast colors, emoji usage in text',
    ],
    examples: [
      'Black screen with white text: "Your beard deserves better" → product reveal',
      'Numbered list flying in: "1. Natural ingredients 2. No itch 3. Smells amazing"',
      'Product video playing in background, large text overlay drives the story',
    ],
    benchmarks: {
      avgWatchTime: '5-8s',
      bestFor: 'Sound-off environments, feed ads, quick messaging',
      platforms: ['Meta', 'Google'],
      notes: 'Essential for Meta feed where 85% of video is watched without sound',
    },
  },
  {
    key: 'split-screen',
    label: 'Split Screen',
    description:
      'Frame is divided into two or more panels showing simultaneous comparisons, reactions, or perspectives.',
    detect: [
      'Visible dividing line splitting the frame into 2+ panels',
      'Side-by-side comparison (us vs. them, before vs. after, expectation vs. reality)',
      'Two camera angles of the same moment shown simultaneously',
      'React/duet format — person reacting in one panel, content in other',
      'Top/bottom split common on TikTok (original + reaction)',
      'Different time periods shown side by side (Day 1 | Day 30)',
    ],
    examples: [
      'Left panel: generic beard oil, right panel: our product — side-by-side application',
      'Top: original TikTok review, bottom: brand owner reacting',
      'Split showing morning routine with product vs. without product',
    ],
    benchmarks: {
      avgWatchTime: '7-10s',
      bestFor: 'Competitive positioning, transformation content',
      platforms: ['TikTok', 'Meta'],
      notes: 'Natural fit for before-after hooks; high engagement on TikTok duet format',
    },
  },
  {
    key: 'talking-head',
    label: 'Talking Head',
    description:
      'A single person speaking directly to camera — presenter, founder, creator, or customer delivering a message face-to-face.',
    detect: [
      'Person\'s face and upper body are the primary visual (head + shoulders framing)',
      'Direct eye contact with camera — feels like a 1:1 conversation',
      'Audio is the primary channel — person is speaking throughout',
      'Minimal scene changes — mostly one continuous shot',
      'Background is casual/authentic (bedroom, office, car) not studio',
      'May include occasional B-roll cutaways but returns to speaker',
      'Subtitles/captions are often added as accessibility overlay',
    ],
    examples: [
      'Founder in their office: "Let me tell you why I created this…"',
      'Creator sitting on bed: "Okay I need to talk about this product…"',
      'Customer in car: "Just picked this up and I have to share…"',
    ],
    benchmarks: {
      avgWatchTime: '10-15s',
      bestFor: 'Trust-building, story-driven content, founder narratives',
      platforms: ['TikTok', 'YouTube', 'Meta'],
      notes: 'Highest watch time of any format; authenticity is key — overproduction kills it',
    },
  },
  {
    key: 'stop-motion',
    label: 'Stop Motion',
    description:
      'Animated sequence created from individual photos or frames — product assembles, ingredients appear, or scenes build frame-by-frame.',
    detect: [
      'Jerky/choppy motion characteristic of frame-by-frame photography',
      'Objects appear to move on their own (no visible hands)',
      'Flat-lay setup shot from above with items entering/assembling',
      'Ingredients or components assembling into final product',
      'Consistent fixed camera angle throughout',
      'Playful, crafted aesthetic — often colorful backgrounds',
      'Each frame is a distinct photo composited into video',
    ],
    examples: [
      'Ingredients sliding into frame on a marble surface, assembling into the product',
      'Beard grooming kit items unpacking themselves from box, lining up neatly',
      'Product bottle walking across desk, cap unscrewing itself',
    ],
    benchmarks: {
      avgWatchTime: '6-9s',
      bestFor: 'Ingredient storytelling, playful brand tone, social shares',
      platforms: ['Meta', 'TikTok'],
      notes: 'High share + save rate; expensive to produce but strong organic reach',
    },
  },
  {
    key: 'animation',
    label: 'Animation',
    description:
      'Motion graphics, 2D/3D animation, illustrated characters, or digitally generated visuals — no live-action footage.',
    detect: [
      'No real-world camera footage — entirely digitally created',
      'Motion graphics (animated icons, charts, data visualizations)',
      'Illustrated characters or mascots',
      '3D product renders with impossible camera moves (fly-through, exploded view)',
      'Animated text, transitions, and infographic-style storytelling',
      'Consistent art style throughout (flat design, isometric, hand-drawn)',
      'Screen recording or UI demo with animated annotations',
    ],
    examples: [
      '3D render of product exploding into ingredient layers',
      'Animated character demonstrating morning routine with product',
      'Infographic animation: "How it works" in 3 animated steps',
    ],
    benchmarks: {
      avgWatchTime: '5-8s',
      bestFor: 'Explainers, complex product features, B2B',
      platforms: ['YouTube', 'Google', 'Meta'],
      notes: 'Useful when live-action isn\'t possible; lower authenticity signal on TikTok',
    },
  },
];

// ─── Lookup maps for quick access ──────────────────────────

export const HOOK_TYPE_MAP = Object.fromEntries(
  HOOK_TYPES.map(h => [h.key, h])
);

export const VISUAL_TYPE_MAP = Object.fromEntries(
  VISUAL_TYPES.map(v => [v.key, v])
);

// ─── Classification helper ─────────────────────────────────
// Returns the matching definition object for a given label string.
// Handles both key-based and label-based lookups.

export function getHookDefinition(hookLabelOrKey) {
  if (!hookLabelOrKey) return null;
  const lower = hookLabelOrKey.toLowerCase().replace(/\s+/g, '-');
  return (
    HOOK_TYPE_MAP[lower] ||
    HOOK_TYPES.find(h => h.label.toLowerCase() === hookLabelOrKey.toLowerCase()) ||
    null
  );
}

export function getVisualDefinition(visualLabelOrKey) {
  if (!visualLabelOrKey) return null;
  const lower = visualLabelOrKey.toLowerCase().replace(/\s+/g, '-');
  return (
    VISUAL_TYPE_MAP[lower] ||
    VISUAL_TYPES.find(v => v.label.toLowerCase() === visualLabelOrKey.toLowerCase()) ||
    null
  );
}

// ─── All tag keys (for use in mockData random assignment) ──

export const HOOK_KEYS = HOOK_TYPES.map(h => h.label);
export const VISUAL_KEYS = VISUAL_TYPES.map(v => v.label);
