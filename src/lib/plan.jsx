// ── PLANS ─────────────────────────────────────────────────────────────────────
// One data model, three ceilings. A "client" exists for every account — the
// free and business tiers simply never show the word, because a solo marketer
// does not think of their own brand as a client. That is a UI decision, not a
// schema one, which is what makes upgrading a flag rather than a migration.

const PLANS = {
  free: {
    id: "free",
    label: "Free",
    clients: 1,
    seats: 1,
    // Counted on cards that are NOT published. A total cap would put someone
    // posting three times a week into a wall in three weeks — before they had
    // seen enough of the product to want to pay for it. Active-only means the
    // pipeline stays usable forever, and the ceiling arrives when they are
    // genuinely busy rather than on a timer.
    activeCards: 10,
    analytics: false,
    talent: false,
  },
  business: {
    id: "business",
    label: "Business",
    clients: 1,
    seats: 3,
    activeCards: Infinity,
    analytics: true,
    talent: true,
  },
  agency: {
    id: "agency",
    label: "Agency",
    clients: Infinity,
    seats: Infinity,
    activeCards: Infinity,
    analytics: true,
    talent: true,
  },
};

// Resolution order, and the default matters more than it looks:
//
//   profiles.plan  ->  localStorage  ->  "agency"
//
// Defaulting to "agency" is deliberate. There are already 29 workspaces on this
// database, none of which has a plan set. Defaulting those to "free" would
// silently cap existing accounts at one client and ten cards. New signups get
// their plan written explicitly at the moment they choose it, so the default
// only ever applies to accounts that predate plans.
const planOf = (profile, userId) => {
  const fromRow = profile && profile.plan;
  if (fromRow && PLANS[fromRow]) return PLANS[fromRow];
  try {
    const cached = userId && localStorage.getItem(`sk_plan_${userId}`);
    if (cached && PLANS[cached]) return PLANS[cached];
  } catch (e) {}
  return PLANS.agency;
};

// Free and Business both run the single-brand shell; only Agency sees clients.
const isSolo = plan => plan.clients === 1;

const activeCount = videos =>
  (videos || []).filter(v => v.stage !== "published").length;

// Returns null when there is room, or a reason when there isn't. Callers show
// the reason rather than silently refusing, which is the failure mode this
// codebase keeps getting caught by.
const cardLimitReason = (plan, videos) => {
  const used = activeCount(videos);
  if (used < plan.activeCards) return null;
  return {
    used,
    limit: plan.activeCards,
    title: `You've reached ${plan.activeCards} cards in progress`,
    body: "Publish or delete something to make room — published cards don't count towards the limit. Or upgrade for an unlimited pipeline.",
  };
};

export { PLANS, planOf, isSolo, activeCount, cardLimitReason };
