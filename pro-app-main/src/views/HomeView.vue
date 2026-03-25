<template>
  <div class="marketing-page">

    <!-- ── Marketing nav ─────────────────────────────── -->
    <header class="mkt-header">
      <div class="mkt-header-inner">
        <RouterLink to="/" class="mkt-brand">
          <img src="@/assets/logos/Logo1_WhiteBG_small.png" height="36" alt="Pocket Procedures" />
        </RouterLink>
        <nav class="mkt-nav">
          <a href="#features" class="mkt-nav-link">Features</a>
          <a href="#industries" class="mkt-nav-link">Industries</a>
          <a href="#stats" class="mkt-nav-link">Pricing</a>
          <RouterLink to="/about" class="mkt-nav-link">About</RouterLink>
        </nav>
        <div class="mkt-nav-actions">
          <RouterLink to="/login" class="mkt-btn-ghost">Sign in</RouterLink>
          <RouterLink to="/request-a-demo" class="mkt-btn-cta">Request a demo</RouterLink>
        </div>
      </div>
    </header>

    <!-- ── Hero ──────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-inner">

        <!-- Left: copy -->
        <div class="hero-copy">
          <span class="eyebrow">Built for regulated industries</span>
          <h1 class="hero-headline">
            Every procedure,<br>
            in your pocket.<br>
            Always current.
          </h1>
          <p class="hero-sub">
            Give your team instant access to the right procedure at the right moment —
            searchable, bookmarkable, and always up to date. Used by law enforcement,
            healthcare, and compliance teams.
          </p>
          <div class="hero-ctas">
            <RouterLink to="/request-a-demo" class="btn-primary-dark">Request a demo</RouterLink>
            <a href="#features" class="btn-ghost-dark">See how it works</a>
          </div>
          <div class="social-proof">
            <span><fa icon="circle-check" class="proof-icon" />Trusted by 3+ agencies</span>
            <span><fa icon="circle-check" class="proof-icon" />128+ procedures digitized</span>
          </div>
        </div>

        <!-- Right: procedure mockup card -->
        <div class="hero-mockup">
          <div class="mockup-card">
            <div class="mockup-chapter-label">PROCEDURES — CHAPTER 1</div>
            <div class="mockup-row" v-for="proc in mockProcedures" :key="proc.num">
              <span class="mockup-num">{{ proc.num }}</span>
              <span class="mockup-name">{{ proc.name }}</span>
              <span class="mockup-badge">Amended</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Why section ───────────────────────────────── -->
    <section id="features" class="why-section">
      <div class="section-inner">
        <p class="section-eyebrow">WHY POCKET PROCEDURES</p>
        <h2 class="section-headline">Built for the field, not the office</h2>
        <p class="section-sub">
          Designed for officers and compliance teams who need the right answer fast, under pressure.
        </p>
        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <div class="feature-icon-wrap">
              <fa :icon="f.icon" class="feature-icon" />
            </div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Stats bar ─────────────────────────────────── -->
    <section id="stats" class="stats-section">
      <div class="section-inner stats-inner">
        <div class="stat" v-for="s in stats" :key="s.label">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- ── Industries ────────────────────────────────── -->
    <section id="industries" class="industries-section">
      <div class="section-inner">
        <p class="section-eyebrow">WHO WE SERVE</p>
        <h2 class="section-headline">Built for teams where accuracy matters</h2>
        <div class="industries-grid">
          <div class="industry-card" v-for="ind in industries" :key="ind.title">
            <fa :icon="ind.icon" class="industry-icon" />
            <h3>{{ ind.title }}</h3>
            <p>{{ ind.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA band ───────────────────────────────────── -->
    <section class="cta-band">
      <div class="section-inner cta-inner">
        <h2>Ready to digitise your procedures?</h2>
        <p>Get your team live in days, not months.</p>
        <RouterLink to="/request-a-demo" class="btn-primary-light">Request a demo</RouterLink>
      </div>
    </section>

    <!-- ── Footer ────────────────────────────────────── -->
    <footer class="mkt-footer">
      <div class="mkt-footer-inner">
        <img src="@/assets/logos/Logo1_WhiteBG_small.png" height="28" alt="Pocket Procedures" class="footer-logo" />
        <div class="footer-links">
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
          <RouterLink to="/terms">Terms</RouterLink>
          <RouterLink to="/privacy">Privacy</RouterLink>
        </div>
        <p class="footer-copy">&copy; {{ year }} Pocket Procedures. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const year = new Date().getFullYear()

const mockProcedures = [
  { num: '01-01', name: 'Arrest' },
  { num: '01-02', name: 'Search of Persons' },
  { num: '01-03', name: 'Persons in Custody' },
  { num: '01-07', name: 'Identification' },
]

const features = [
  {
    icon: 'magnifying-glass',
    title: 'Instant search',
    desc: 'Find any procedure by name, number, or keyword in seconds.',
  },
  {
    icon: 'list-check',
    title: 'Role-based steps',
    desc: 'Each procedure shows exactly what your role requires — nothing more.',
  },
  {
    icon: 'bookmark',
    title: 'Bookmark & quiz',
    desc: 'Save critical procedures and test your knowledge with built-in quizzes.',
  },
  {
    icon: 'rotate',
    title: 'Always current',
    desc: 'Amendments update instantly — no more outdated printed manuals.',
  },
]

const stats = [
  { value: '128+', label: 'Procedures digitized' },
  { value: '3',    label: 'Industries served' },
  { value: '47+',  label: 'Active users' },
  { value: '100%', label: 'Web & mobile' },
]

const industries = [
  {
    icon: 'shield-halved',
    title: 'Law Enforcement',
    desc: 'Field-ready procedure access for patrol officers, investigators, and supervisors.',
  },
  {
    icon: 'heart-pulse',
    title: 'Healthcare',
    desc: 'Keep clinical protocols current and accessible at the point of care.',
  },
  {
    icon: 'building-columns',
    title: 'Compliance & Regulation',
    desc: 'Ensure every team member follows the latest approved procedures — always.',
  },
]
</script>

<style scoped lang="scss">
/* ── Palette shortcuts ──────────────────────────── */
$primary:   #1a2744;
$secondary: #2d3f6b;
$accent:    #3b82f6;
$light-bg:  #f8fafc;

/* ── Reset for full-bleed marketing page ────────── */
.marketing-page {
  margin: 0;
  padding: 0;
  font-family: inherit;
}

/* ── Marketing header ──────────────────────────── */
.mkt-header {
  background: $primary;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 8px rgba(0,0,0,0.18);
}

.mkt-header-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.mkt-brand img { display: block; }

.mkt-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.mkt-nav-link {
  color: rgba(255,255,255,0.78);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 5px;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
  }
}

.mkt-nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.mkt-btn-ghost {
  color: rgba(255,255,255,0.82);
  font-size: 0.875rem;
  text-decoration: none;
  padding: 0.35rem 0.75rem;
  border-radius: 5px;
  transition: color 0.15s;
  &:hover { color: #fff; }
}

.mkt-btn-cta {
  background: #fff;
  color: $primary;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  transition: opacity 0.15s;
  &:hover { opacity: 0.9; }
}

/* ── Hero ──────────────────────────────────────── */
.hero {
  background: $light-bg;
  padding: 5rem 1.5rem 4rem;
}

.hero-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  background: rgba(26,39,68,0.08);
  color: $primary;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(26,39,68,0.14);
}

.hero-headline {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.18;
  margin: 0 0 1.25rem;
}

.hero-sub {
  font-size: 1.05rem;
  color: #4b5563;
  line-height: 1.65;
  margin-bottom: 2rem;
  max-width: 520px;
}

.hero-ctas {
  display: flex;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-primary-dark {
  background: $primary;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.65rem 1.4rem;
  border-radius: 7px;
  text-decoration: none;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
}

.btn-ghost-dark {
  background: #fff;
  color: $primary;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.65rem 1.4rem;
  border-radius: 7px;
  border: 1.5px solid #d1d5db;
  text-decoration: none;
  transition: border-color 0.15s;
  &:hover { border-color: $primary; }
}

.social-proof {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: #6b7280;
}

.proof-icon {
  color: #059669;
  margin-right: 0.3rem;
}

/* Procedure mockup card */
.hero-mockup {
  display: flex;
  justify-content: center;
}

.mockup-card {
  background: $primary;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 40px rgba(26,39,68,0.22);
}

.mockup-chapter-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.mockup-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  &:last-child { border-bottom: none; }
}

.mockup-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  font-family: monospace;
  flex-shrink: 0;
  width: 38px;
}

.mockup-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
}

.mockup-badge {
  font-size: 0.62rem;
  font-weight: 700;
  background: rgba(245,158,11,0.2);
  color: #fbbf24;
  border: 1px solid rgba(245,158,11,0.35);
  padding: 1px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* ── Why / Features ────────────────────────────── */
.why-section {
  background: #fff;
  padding: 5rem 1.5rem;
}

.section-inner {
  max-width: 1140px;
  margin: 0 auto;
  text-align: center;
}

.section-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: $accent;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.section-headline {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.section-sub {
  font-size: 1rem;
  color: #6b7280;
  max-width: 540px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: left;
}

.feature-card {
  background: $light-bg;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.feature-icon-wrap {
  width: 40px;
  height: 40px;
  background: $primary;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon {
  color: #fff;
  font-size: 1rem;
}

.feature-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.4rem;
}

.feature-desc {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.55;
  margin: 0;
}

/* ── Stats ─────────────────────────────────────── */
.stats-section {
  background: $primary;
  padding: 3.5rem 1.5rem;
}

.stats-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.25rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 0.4rem;
}

.stat-label {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Industries ────────────────────────────────── */
.industries-section {
  background: $light-bg;
  padding: 5rem 1.5rem;
}

.industries-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: left;
  margin-top: 3rem;
}

.industry-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 2rem 1.5rem;
}

.industry-icon {
  font-size: 1.5rem;
  color: $primary;
  margin-bottom: 1rem;
}

.industry-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.industry-card p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* ── CTA band ──────────────────────────────────── */
.cta-band {
  background: $secondary;
  padding: 4rem 1.5rem;
}

.cta-inner {
  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  p {
    color: rgba(255,255,255,0.7);
    font-size: 1rem;
    margin-bottom: 1.75rem;
  }
}

.btn-primary-light {
  background: #fff;
  color: $primary;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.7rem 1.5rem;
  border-radius: 7px;
  text-decoration: none;
  display: inline-block;
  transition: opacity 0.15s;
  &:hover { opacity: 0.9; }
}

/* ── Footer ────────────────────────────────────── */
.mkt-footer {
  background: #0f172a;
  padding: 2.5rem 1.5rem;
}

.mkt-footer-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-logo { opacity: 0.75; filter: brightness(0) invert(1); }

.footer-links {
  display: flex;
  gap: 1.25rem;
  flex: 1;
  a {
    color: rgba(255,255,255,0.55);
    font-size: 0.82rem;
    text-decoration: none;
    &:hover { color: #fff; }
  }
}

.footer-copy {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin: 0;
}

/* ── Responsive ────────────────────────────────── */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero-headline { font-size: 2rem; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .industries-grid { grid-template-columns: 1fr; }
  .mkt-nav { display: none; }
}

@media (max-width: 560px) {
  .features-grid { grid-template-columns: 1fr; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .hero-headline { font-size: 1.75rem; }
}
</style>
