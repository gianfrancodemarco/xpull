---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowComplete: true
date: 2026-02-17
inputDocuments:
  - 'planning-artifacts/product-brief-xpull-2026-02-16.md'
  - 'brainstorming/brainstorming-session-2026-02-16.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
classification:
  projectType: 'Web Application (SPA with social/gamification features)'
  domain: 'Developer Social / Gamification'
  complexity: 'medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - xpull

**Author:** Gianfranco
**Date:** 2026-02-17

## Executive Summary

**xpull** is a web platform that gamifies the developer experience using Git data. Developers connect their GitHub accounts and have their real-world coding activity — commits, pull requests, code reviews, and contributions — transformed into XP, levels, skill trees, achievements, and a living developer profile.

**Core vision:** Developer effort is invisible. Millions of developers write code daily, but growth goes unnoticed, effort goes unrecognized, and coding remains solitary. xpull makes the invisible visible — turning Git history into a personal RPG where you compete only with yourself.

**Key differentiators:**
- **AI-Native Architecture** — AI evaluates contribution quality (not volume), generates personalized content, and silently prevents gaming. The core intelligence powering every feature.
- **Triple Skill Tree Identity** — Language + Behavior + Archetype trees create a three-dimensional developer identity that emerges from observed behavior. No equivalent exists in developer tooling.
- **Anti-Hustle Philosophy as Architecture** — No streaks, no daily quests, no comments, no competitive rankings. Positive engagement only, enforced structurally, not by moderation.
- **The Unboxing** — Historical Git import with cascading level unlocks turns signup into the most exciting 5 minutes on the platform.

**Target users:** Professional developers (primary), beginner developers, passion/side-project developers, and engineering managers (B2B buyer, secondary).

**Project context:** Greenfield web application, side project, solo developer. MVP targets launch within 3-4 months of part-time development.

## Success Criteria

### User Success

- **Onboarding conversion:** >70% of signups complete the full Unboxing (connect Git, cascade through levels, view skill trees)
- **Unboxing emotional bar:** Users feel surprised and delighted — "I didn't know I'd already accomplished this much." The impulse is to screenshot and share.
- **Failure signal:** If a developer with years of history feels underleveled or the cascade feels slow/underwhelming, the Unboxing has failed.
- **Week-1 retention:** >40% of activated users return in week 2
- **Month-1 retention (North Star):** >30% of activated users still active after 30 days
- **Month-3 retention:** >20% of activated users still active after 90 days
- **Skill tree engagement:** >60% of active users visit their skill tree profile at least once per week
- **Qualitative signal:** Users describe xpull as "fun" or "cool" — not just "useful"
- **Organic sharing:** Users screenshot/share profiles or Unboxing experience without prompting

### Business Success

Side project — formal business metrics deferred. Personal success signals:

- **3-month signal:** 50-100 organic signups (not personally invited), at least 20 returning weekly
- **6-month signal:** Unprompted profile sharing, users you don't know engaging with the platform
- **Kill signal:** Fewer than 10 non-network signups after 3 months live — reassess the concept

### Measurable Outcomes

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Onboarding completion | >70% | Funnel analytics (signup → Git connect → cascade complete) |
| Week-1 retention | >40% | Cohort analysis |
| Month-1 retention | >30% | Cohort analysis |
| Skill tree weekly visits | >60% of active users | Page view analytics |
| Unboxing cascade time | <60 seconds | Performance monitoring |
| Page load time | <2 seconds | Lighthouse / RUM |
| Git sync latency | <15 min (webhook) | Pipeline monitoring |
| Organic share rate | >15% of active users/month | Share action tracking |

## User Journeys

### Journey 1: Alex — The Professional Developer (Success Path)

**Who:** Alex, 28, full-stack developer at a mid-size SaaS company. Writes TypeScript and Python daily, 3 years of experience, team of 8. Occasionally contributes to open source and tinkers with Rust on weekends.

**Opening Scene:** It's a Thursday evening. Alex just merged his 4th PR of the week — a tricky refactor of the payment service. Nobody noticed. His GitHub profile is a sea of gray because everything is in private repos. He's been coding professionally for 3 years but has nothing to show for it. He scrolls Twitter and sees a colleague's post: a beautiful skill tree diagram with glowing nodes and the caption "Apparently I'm a Polyglot now?" He clicks the link.

**Rising Action:** Alex signs up and connects his GitHub account. The Unboxing begins. His screen goes dark, then "Level 1" appears. Immediately, it cascades — Level 2, 3, 4... each one revealing something. Level 5 unlocks his TypeScript branch, already 3 nodes deep. Level 8 shows a Python branch sprouting. Level 10 reveals a "Bug Slayer" title he didn't know he'd earned. Level 12 — his current level — lands with a final satisfying animation. His profile materializes: language skill trees with glowing nodes, a handful of badges, and a league placement (Silver). He's been coding for 3 years and for the first time, he can *see* it.

**Climax:** One month later, Alex opens his skill tree on a Sunday morning. The TypeScript branch has grown two new nodes since he started. A tiny Rust branch has appeared — just a seedling from his weekend experiments, but it's there. He stares at the screen and thinks: "I've been growing all along. I just never had a way to see it." He screenshots it and sends it to his team's Slack channel.

**Resolution:** xpull becomes part of Alex's weekly rhythm. He checks his profile after big PRs. He notices when his Rust branch grows. When a junior developer joins his team, the first thing Alex says is: "You should try xpull."

**Requirements revealed:** Git OAuth, historical import, Unboxing cascade animations, XP engine, skill tree visualization, level/league system, public profile, badges.

---

### Journey 2: Priya — The Beginner Developer (Success Path)

**Who:** Priya, 22, bootcamp graduate, 6 months into her first job. Fixes bugs, writes tests, does small features. Feels invisible next to senior colleagues.

**Opening Scene:** Priya sees Alex's skill tree screenshot in Slack. She's hesitant — "I've only been coding for 6 months." She signs up anyway.

**Rising Action:** Priya connects her GitHub. The cascade reaches Level 4. For a moment, comparison stings. But then she sees what she unlocked: a JavaScript branch with 2 nodes. A "Quality Guardian" node from all those tests. A "Bug Slayer" badge. The boring work that nobody celebrated — xpull noticed it. xpull gave it a name.

**Climax:** Two weeks in, Priya completes her first weekly quest: "Review 3 pull requests." She leaves her first real code review comment on a senior's PR — a genuine catch. Her Reviewer branch lights up with its first node. She feels, for the first time, like a real developer.

**Resolution:** Her JavaScript branch grows steadily. She starts a side project in Python and watches the new branch appear. She joins the React Tribe club and finds other early-career developers. She doesn't feel invisible anymore.

**Requirements revealed:** Rewarding low-level experience, quest system (post-MVP), clubs (post-MVP), profile as growth narrative with limited history.

---

### Journey 3: Marco — The Passion Developer (Success Path)

**Who:** Marco, 35, product manager by day, builds iOS apps and open-source tools evenings and weekends.

**Opening Scene:** Marco discovers xpull through a Developer Wrapped post on LinkedIn. He signs up for his side projects.

**Rising Action:** Marco connects his personal GitHub — 8 repos, Swift/Python/JavaScript. The Unboxing takes him to Level 9. His Swift branch is surprisingly deep — 4 nodes. He sees a "Polyglot" title. His evenings-and-weekends work has a shape now.

**Climax:** Three months in, Marco receives his first Monthly Postcard: "This month you shipped 23 commits across 2 projects. Your Swift branch grew by one node." He shares it on Twitter. It gets 200 likes.

**Resolution:** Marco's xpull profile becomes the portfolio he never had. He shares his xpull link at meetups instead of his GitHub. On xpull, he's a Level 14 Swift developer with a growing Kotlin branch — that's who he really is.

**Requirements revealed:** Personal/open-source repo handling, profile as portfolio, shareable links, profile visibility controls (public/private), data storytelling (post-MVP).

---

### Journey 4: David — The Engineering Manager (B2B Adoption Path)

**Who:** David, 40, leads 15 engineers at a Series B startup. CTO wants "engineering metrics." Previous tracking tools caused team revolt.

**Opening Scene:** David notices 4 of his engineers have xpull links in Slack. He clicks one — it looks like a game, not surveillance. Three engineers enthusiastically explain it at retro. Nobody feels watched.

**Rising Action:** David signs up himself, reaches Level 7. He explores org features: aggregate-only dashboards, no individual drill-down. He enables org tier with explicit opt-in. 11 of 15 engineers opt in within a week.

**Climax:** The team skill map shows heavy TypeScript/Python but zero Rust/Go — exactly what they need for a planned migration. Team health ring shows weak Review engagement. No names, no individual data. David tells his CTO: "We need to hire for Rust, and we need to improve review culture." First time he can answer strategic questions without surveillance.

**Resolution:** David pitches xpull as "an engineering health tool developers chose voluntarily." It passes without pushback. He never uses it for performance reviews — architecturally impossible.

**Requirements revealed:** Aggregate-only org architecture, opt-in consent, team skill maps, team health rings (all post-MVP, but data model must support).

---

### Journey 5: Platform Operator — Admin/Operations

**Who:** Gianfranco, creator and sole operator.

**Opening Scene:** Launch week. 50 signups from Hacker News. Three things matter: Are Unboxings completing? Is Git sync working? Is anything on fire?

**Rising Action:** 47 of 50 Unboxings succeed. 2 fail (OAuth scope issues), 1 times out (80,000 commits). Git sync pipeline is healthy. One language detection misclassification flagged for fix.

**Climax:** Two weeks in, a popular tweet drives 200 signups in one day. Import queue backs up. You scale workers, monitor drain, watch error rates. It holds. No data loss.

**Resolution:** Daily: error rates and sync health. Weekly: retention and engagement metrics. Monthly: infrastructure costs. Operational burden is manageable as a side project.

**Requirements revealed:** Admin dashboard (sync health, errors, queue depth), alerting, user management, scaling controls.

---

### Journey 6: Sam — Edge Case / Failure Recovery (Sparse Data)

**Who:** Sam, 26, Alex's colleague. All professional code is in private GitLab repos. GitHub has 3 college hobby projects.

**Opening Scene:** Sam connects GitHub. Cascade: Level 1... 2... 3. Done. One tiny JavaScript branch. Three years of professional work invisible (GitLab not supported in MVP).

**Rising Action:** Sam feels deflated. The platform detects sparse data and shows contextual messaging: "Your journey is just beginning! GitLab and Bitbucket support is coming soon." A "Connect more sources" placeholder appears in settings.

**Climax:** Sam starts a Go side project on GitHub. Two weeks later, a new branch lights up. When GitLab launches (post-MVP), Sam gets a re-Unboxing — Level 3 jumps to Level 15 in a satisfying rush.

**Resolution:** The Unboxing must handle sparse data gracefully — an invitation, not a judgment. Bridge the gap with messaging and encouragement.

**Requirements revealed:** Sparse data detection, graceful messaging, multi-provider placeholder, user-visible imported-data transparency, re-Unboxing flow (post-MVP).

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| **Alex (Success)** | Git OAuth, historical import, Unboxing cascade, XP engine, skill trees, levels/leagues, public profile, badges |
| **Priya (Beginner)** | Rewarding low-level experience, quest system, growth-encouraging design, clubs (post-MVP) |
| **Marco (Passion Dev)** | Personal repo handling, profile as portfolio, shareable links, profile visibility controls, data storytelling (post-MVP) |
| **David (Eng Manager)** | Aggregate-only org dashboards, opt-in consent, team skill maps, team health rings (post-MVP) |
| **Platform Operator** | Admin dashboard, sync monitoring, error tracking, queue management, scaling controls |
| **Sam (Edge Case)** | Sparse data handling, graceful Unboxing degradation, multi-provider placeholder, user-visible imported-data transparency, re-Unboxing flow |

## Domain-Specific Requirements

### GitHub API Constraints

- **Rate limits:** 5,000 requests/hour for authenticated users. Historical imports must stay within limits or queue gracefully.
- **OAuth scopes:** Minimum necessary permissions. Private repo names and code content require explicit consent.
- **Webhook reliability:** Webhooks can fail or arrive out of order. Pipeline must handle retries, deduplication, and eventual consistency.
- **API versioning:** GitHub deprecates API versions periodically. Abstraction layer required to isolate changes from core logic.

### Git Data Privacy

- **Repo name visibility:** Private repository names never appear on public profiles. Aggregate language/activity data only.
- **Data minimization:** Store only derived metrics and metadata — no full diffs, file contents, or comment threads.
- **User data deletion:** Users can disconnect and delete all imported data. GDPR-style right to erasure — builds trust.

### Gamification Design Patterns

- **Anti-anxiety leagues:** Based on personal XP thresholds, not competitive rankings. Everyone can reach Diamond. No demotion.
- **XP curve sustainability:** No "wall" at higher levels. Active developers always feel progress. Test with simulated 6-12 month profiles.
- **Skill tree "stuck" prevention:** Active developers always have at least one reachable next node.
- **Hidden formula:** XP formula opaque to prevent gaming; general principles transparent ("quality over quantity").

### Social Platform Trust & Safety

- **Identity verification:** Git OAuth provides baseline identity. Prevent impersonation via verified Git account linking.
- **Anti-gaming:** AI-based detection of artificial patterns (split commits, rubber-stamp reviews). Silent zero-reward, no shaming.
- **Future moderation:** Data model supports content flagging for when custom posts/clubs launch (v1.5+).

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. AI-Native Gamification Architecture (Core Innovation)**

AI is the foundation, not a bolt-on. Quality evaluation replaces volume counting. Anti-gaming detection makes the system trustworthy. Skill routing bridges Git metadata and developer intent. Content generation (avatars, narratives) personalizes every experience.

**Why novel:** Existing tools measure quantity (WakaTime, GitHub stats) or use rule-based scoring (Duolingo). xpull combines AI quality assessment with gamification — viable only recently as LLM costs dropped.

**2. Triple Skill Tree Identity System (Core Innovation)**

Three-dimensional developer identity from observed behavior: Language Trees (what you code), Behavior Trees (how you work), Role Archetype Trees (who you're becoming). Emergent identity — the platform reveals your archetype based on sustained patterns.

**Why novel:** No platform creates emergent identity from observed behavior across three axes.

**3. Anti-Hustle Philosophy as Architecture (Design Innovation)**

No streaks, no daily quests, no comments, no competitive rankings, no demotion. Every successful gamification product uses anxiety as engagement. xpull bets sustainable engagement can be built on positive reinforcement alone.

### Market Context & Competitive Landscape

| Competitor/Analog | What They Do | xpull's Differentiation |
|-------------------|-------------|------------------------|
| **GitHub Profiles** | Static contribution graph, pinned repos | Living progression with skill trees, levels, narrative |
| **WakaTime** | Private coding time tracking | Social, gamified, quality-based (not time-based) |
| **CodeWars/LeetCode** | Gamified coding challenges | Based on real-world work, not artificial exercises |
| **Strava** (analog) | Gamified fitness tracking | Same philosophy applied to coding |
| **Duolingo** (analog) | Gamified language learning | Anti-hustle (no streaks, no anxiety), AI-native quality |
| **LinearB/Pluralsight Flow** | Engineering analytics for managers | Developer-first, gamification layer, not surveillance |

**Timing advantage:** AI image generation and LLM quality evaluation became cost-viable at scale in 2024-2025.

### Innovation Validation

| Innovation | Validation Method | Success Signal |
|-----------|-------------------|----------------|
| AI quality scoring | AI evaluation on 500+ real commits vs. human assessment | >70% correlation with human judgment |
| Triple skill trees | User testing with 20+ developers reviewing their trees | >80% say "this feels accurate" |
| Anti-hustle engagement | Track retention without streaks/daily pressure | Month-1 retention >25% |
| The Unboxing | Record 10 onboarding sessions | >70% completion, spontaneous sharing observed |
| No-comments social | Monitor feed engagement in beta | >20% interaction rate without comments |

## Web Application Specific Requirements

### Architecture Overview

SPA with selective SSR/SSG. Two rendering contexts:
- **Authenticated app:** Client-side SPA with client-side routing. Dashboard, settings, Unboxing, skill tree exploration.
- **Public profiles:** Server-side rendered. Crawlable HTML, Open Graph meta tags, dynamic social sharing previews.
- **API layer:** RESTful, JSON, OAuth-authenticated. Serves SPA and future integrations.

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 | Primary |
| Firefox | Latest 2 | Primary |
| Safari (desktop + mobile) | Latest 2 | Primary |
| Edge | Latest 2 | Secondary |
| Mobile Chrome | Latest 2 | Primary |
| IE11 | Not supported | — |

**Runtime:** ES2020+, WebGL/Canvas API, CSS Grid/Flexbox, Web Animations API.

### Responsive Design

- Desktop-first for core experience (skill trees, Unboxing, dashboard)
- Fully responsive profile pages (mobile-optimized for social sharing)
- Breakpoints: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- Skill tree on mobile: condensed card-based view with touch navigation
- Unboxing on mobile: functional but desktop-optimized

### SEO & Social Sharing

**SSR/SSG pages:** Public profiles (`xpull.dev/{username}`), landing pages
**SPA-only pages:** Dashboard, settings, Unboxing

**Social sharing:** Open Graph tags, dynamic OG images (skill tree summary, level, avatar), Twitter Cards, JSON-LD structured data for developer profiles.

### Implementation Considerations

- **State management:** Server as source of truth; client caches and validates on key actions
- **Authentication:** GitHub OAuth → backend token exchange → JWT/session auth. Token refresh for long sessions
- **Assets:** SVGs for badges, icons, league emblems (scalable, small footprint). CDN for raster images.
- **URL structure:** `/username` (profiles), `/dashboard`, `/settings`, `/unboxing`. Client-side router with server fallback.

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Experience MVP — validate that the core emotional loop works (connect Git → see your growth → feel delighted → come back).

The MVP is the smallest product that delivers the **signature experience**: the Unboxing cascade, visible skill tree growth, and a profile worth sharing. If those three things work, everything else layers on. If they don't, quests, feeds, and social features won't save it.

**Resource:** Solo developer, side project. MVP target: 3-4 months part-time. Infrastructure budget: <$50/month.

### Phase 1 — MVP

**Journeys supported:** Alex (full), Priya (minus quests/clubs), Sam (sparse data), Operator (minimal).

| # | Capability | Justification |
|---|-----------|---------------|
| 1 | GitHub OAuth connection | Without Git data, nothing works |
| 2 | Historical Git import pipeline | Powers the Unboxing |
| 3 | Ongoing Git sync (webhooks) | Platform feels dead without it |
| 4 | XP calculation engine (heuristic v1) | Core gamification loop |
| 5 | Level & league system | XP → levels → leagues progression |
| 6 | Language skill tree engine | Node unlock logic per language |
| 7 | Skill tree visualization | Interactive visual centerpiece |
| 8 | The Unboxing experience | Signature first-time experience |
| 9 | Developer profile page | Public, shareable URL |
| 10 | Badge & title system | Achievements with limited showcase slots |
| 11 | Sparse data handling | Graceful messaging, "connect more sources" placeholder |
| 12 | Basic admin visibility | Error logs, sync health, user counts |

**Explicitly NOT in MVP:** No feed, no social, no Pulls, no quests, no rings, no AI scoring (heuristic only), no AI avatars, no clubs, no org features, no GitLab/Bitbucket, no data storytelling.

### Phase 2 — Engagement Loop (v1.1, ~2 months post-launch)

| Feature | Dependency | Purpose |
|---------|-----------|---------|
| Developer Rings | XP engine | Weekly return-visit loop |
| Weekly Quests (10-15) | XP engine, rings | Goal-directed engagement |
| Basic Achievement Feed | Profile, levels | Social proof layer |
| AI Quality Scoring (v1) | XP engine, LLM API | Fairer, harder to game |
| Secret Quests (5-10) | Quest system | Delight and discovery |

### Phase 3 — Social & Identity (v1.5, ~4-6 months post-launch)

| Feature | Dependency | Purpose |
|---------|-----------|---------|
| Pulls | Feed, connections | Platform-native social gesture |
| Typed/Reaction Pulls | Pulls system | Richer social interaction |
| Affinity Clubs | Profiles | Community around shared interests |
| Behavior Skill Trees | Git pipeline, AI | Second identity dimension |
| Role Archetype Trees | Behavior trees, AI | Third dimension — emergent identity |
| Monthly Postcards | Data pipeline, AI | Shareable data storytelling |
| Project Spotlight | Profiles | Portfolio feature |
| Monthly/Epic Quests | Quest system | Longer-arc engagement |

### Phase 4 — Platform & Scale (v2.0+, ~9-12 months post-launch)

| Feature | Dependency | Purpose |
|---------|-----------|---------|
| AI-Generated Avatars | AI pipeline | Signature visual identity |
| Developer Wrapped | 12 months data, AI | Viral growth engine |
| Organization Features | User base | B2B tier, bottom-up adoption |
| GitLab/Bitbucket Support | Pipeline abstraction | Expand addressable market |
| Re-Unboxing Flow | Multi-provider | Delivers on sparse-data promise |
| Seasonal/Event Items | Active community | Collectibility |
| Platform Integrations | Stable API | IDE, Slack ecosystem |

### Risk Mitigation

**Technical Risks:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Skill tree visualization complexity | High | Use proven library (D3.js, React Flow). Prototype early. Simplified layout if custom canvas too costly. |
| GitHub API rate limits | Medium | Queue imports, batch calls, exponential backoff. Chunk processing for massive histories. |
| Heuristic XP feels unfair | Medium | Opaque formula, transparent principles. Feedback mechanism. AI upgrade in v1.1. Test with 20+ real histories. |
| Unboxing animation performance | Medium | Profile on low-end devices. Skip button. `prefers-reduced-motion` support. |

**Market Risks:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Developers don't care about gamification | High | Validate Unboxing with 10-20 beta users before public launch. |
| Anti-hustle = no return visits | High | Monitor week-1 retention. If <25%, experiment with gentle nudges (not streaks). |
| GitHub-only limits market | Medium | Acceptable for MVP. GitLab/Bitbucket in Phase 4. |

**Resource Risks:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Solo developer burnout | High | Strict MVP scope. Ship 12 capabilities, nothing more. |
| Scope creep into Phase 2 | Medium | Hard line: no quests, no feed, no social in MVP. |
| Infrastructure costs | Medium | Serverless/managed services. Target <$50/month for <1,000 users. |

## Functional Requirements

### 1. Git Data Connection & Sync

- **FR1:** Users can authenticate with GitHub via OAuth to grant xpull access to their Git activity data
- **FR2:** Users can select which GitHub accounts and repositories xpull has access to
- **FR3:** The system can import a user's complete historical Git data (commits, PRs, reviews, languages) upon connection
- **FR4:** The system can process historical imports of up to 50,000 commits without failure
- **FR5:** The system can continuously sync new Git activity via webhooks
- **FR6:** The system can detect programming languages and attribute activity to specific languages
- **FR7:** The system can handle GitHub API rate limits by queuing and batching without data loss
- **FR8:** Users can disconnect their GitHub account and delete all imported data
- **FR9:** The system can handle webhook failures with retry and deduplication

### 2. Developer Progression

- **FR10:** The system can calculate XP for each Git activity using a heuristic quality-weighting algorithm
- **FR11:** The system can determine a user's level based on a defined XP-per-level curve
- **FR12:** The system can assign motivation leagues (Bronze through Diamond) based on personal XP thresholds
- **FR13:** Users can view their current XP, level, and league status
- **FR14:** The system can award badges when predefined criteria are met (for example, `Bug Slayer` for >=10 merged bug-fix PRs in 30 days)
- **FR15:** The system can award titles when predefined level or milestone thresholds are reached (for example, Level 15 or Polyglot criteria met)
- **FR16:** Users can select up to 6 badges to showcase on their public profile
- **FR17:** The system can produce deterministic XP and level outputs so the same activity history always returns the same result
- **FR18:** The system can keep exact XP weights private while publishing at least three scoring principles ("quality over quantity", "review depth matters", and "anti-gaming checks apply")

### 3. Skill Tree System

- **FR19:** The system can generate a language skill tree with one branch per detected language
- **FR20:** The system can unlock skill tree nodes based on Git activity thresholds per language
- **FR21:** The system can display locked nodes alongside unlocked nodes to show the growth path
- **FR22:** Users can explore skill trees via interactive visual diagram (pan, zoom, select)
- **FR23:** Users can view node details (meaning, unlock criteria, earned status)
- **FR24:** The system can ensure active developers (>=5 qualifying activities in the last 30 days) always have at least one reachable next node (unlockable within <=20 additional qualifying activities)

### 4. Onboarding (The Unboxing)

- **FR25:** New users experience a cascading level-unlock sequence replaying their Git progression
- **FR26:** The system can progressively reveal UI features during Unboxing as level thresholds are reached
- **FR27:** The system can display cascade animations for earned badges, titles, and skill tree nodes during Unboxing
- **FR28:** Users can skip or fast-forward the Unboxing
- **FR29:** The system can display contextual encouragement messaging when sparse-data criteria are met (fewer than 50 commits in imported history)
- **FR30:** The system can display a "Connect more sources" placeholder when only one Git provider is connected
- **FR31:** Users can enable a reduced-motion alternative that replaces non-essential animations with static or minimal-motion transitions

### 5. Developer Profile

- **FR32:** Users can view their profile (level, league, skill trees, titles, badges)
- **FR33:** Users can access public profiles through a shareable URL path pattern (`xpull.dev/{username}`)
- **FR34:** Users can customize profile with bio and external links
- **FR35:** Users can choose a display username
- **FR36:** Public profiles render Open Graph meta tags for social sharing
- **FR37:** Dynamic OG images generated per profile (skill tree summary, level, league)
- **FR38:** Public profiles can be crawled and indexed by search engines and include metadata required for social previews

### 6. Data Privacy & Account Management

- **FR39:** The system can ensure private repository names, file paths, and code never appear on public profiles
- **FR40:** The system can store only derived metrics and metadata and can exclude raw code, diffs, and comment threads
- **FR41:** Users can view what data xpull has collected
- **FR42:** Users can delete their account and all associated data
- **FR43:** Users can control profile visibility (public or private)

### 7. Platform Operations

- **FR44:** Operators can view Git sync pipeline health (webhooks, queue depth, error rates)
- **FR45:** Operators can view aggregate platform metrics (users, active users, Unboxing completion)
- **FR46:** Operators can investigate individual sync failures
- **FR47:** The system can alert operators when import or webhook error rate exceeds 5% for 5 consecutive minutes
- **FR48:** The system supports up to 1,000 users without degradation

## Non-Functional Requirements

### Performance

- **NFR1:** Public profile first contentful render is <=1.5s at p75 on standard broadband, as measured by RUM and Lighthouse CI
- **NFR2:** Authenticated pages reach largest contentful render <=2.5s at p75 on broadband desktop and modern mobile, as measured by RUM
- **NFR3:** Skill tree initial render completes in <=500ms and interaction frame rate remains >=50 FPS on supported devices, as measured by browser performance traces
- **NFR4:** Unboxing transitions < 200ms each; full cascade (up to 15 levels) < 60 seconds including analysis
- **NFR5:** API responses < 300ms at 95th percentile for user-facing actions
- **NFR6:** Initial critical-path frontend assets are <=250KB compressed on first load, as measured by build artifact reports
- **NFR7:** Cumulative layout shift is <=0.1 at p75 on all user-facing pages, as measured by Lighthouse CI and RUM
- **NFR8:** Historical imports process at >=1,000 commits/minute for repositories with <=2,000 average files per commit batch, as measured in import pipeline telemetry

### Security

- **NFR9:** All data encrypted in transit (TLS 1.2+) and at rest
- **NFR10:** GitHub OAuth tokens stored encrypted, never exposed to client
- **NFR11:** OAuth tokens scoped to minimum permissions, refreshed before expiration
- **NFR12:** Sessions expire after 30 minutes of inactivity by default (configurable 15-120 minutes), and secure logout invalidates active session tokens within 5 seconds
- **NFR13:** All API endpoints authenticated except public profiles
- **NFR14:** All endpoints enforce rate limiting (default 120 requests/minute per user; auth endpoints 20 requests/minute per IP), as measured by API gateway logs
- **NFR15:** No secrets, tokens, or credentials in application logs
- **NFR16:** Passes OWASP Top 10 vulnerability checks

### Scalability

- **NFR17:** The system supports 1,000 concurrent users with p95 API latency <=500ms and error rate <=1% under MVP load-test profile
- **NFR18:** Import queue handles 200 concurrent jobs without data loss
- **NFR19:** Import processing capacity scales independently of interactive user request capacity, verified by doubling import throughput without increasing p95 API latency by more than 10%
- **NFR20:** Persistent storage supports growth from 1,000 to 10,000 users without requiring data-model redesign, as measured by load and migration tests
- **NFR21:** Monthly infrastructure operating cost remains <$50 at MVP baseline (<=1,000 MAU and <=200 concurrent users), as measured by billing dashboards

### Reliability

- **NFR22:** 99.5% uptime monthly (~3.6 hours downtime/month)
- **NFR23:** XP/level calculations deterministic — reprocessing always produces identical results
- **NFR24:** No confirmed user data loss occurs during failures, deployments, or restarts; recovery objectives are RPO <=5 minutes and RTO <=30 minutes
- **NFR25:** Git sync auto-recovers from transient GitHub API failures (exponential backoff)
- **NFR26:** Failed imports retried 3x before flagging for operator review
- **NFR27:** Daily full backups and 15-minute incremental recovery points are retained for at least 30 days, and monthly restore drills succeed at >=99% rate

### Accessibility

- **NFR28:** WCAG 2.1 Level AA compliance across all user-facing pages
- **NFR29:** Skill tree keyboard-navigable (arrow keys, Tab, Enter) with screen reader text alternative
- **NFR30:** All animations respect `prefers-reduced-motion`; Unboxing has non-animated alternative
- **NFR31:** Color never sole status indicator — icons, labels, or patterns accompany all color coding
- **NFR32:** 100% of forms include programmatically associated labels, linked error messages, and submission feedback, as verified by automated accessibility tests and manual QA checks
- **NFR33:** Keyboard focus indicators have >=3:1 contrast ratio and logical tab order across all interactive views, as verified by accessibility audits

### Integration

- **NFR34:** Graceful handling of GitHub API rate limits (HTTP 429) with queued retry
- **NFR35:** GitHub API abstracted behind internal interface for version tolerance
- **NFR36:** Webhook processing handles out-of-order, duplicate, and delayed delivery
- **NFR37:** GitHub OAuth succeeds on first attempt for >95% of users
- **NFR38:** GitHub API outages (5xx) handled without crash; work queued for retry
