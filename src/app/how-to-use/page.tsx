import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Key, TrendingUp, BarChart2, BookMarked, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Use',
  description: 'Learn how to use GitHub Ranking — explore trending repos, understand the composite score, and navigate all features.',
};

export default function HowToUsePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Explore
      </Link>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">How to use GitHub Ranking</h1>
      <p className="mb-10 text-base text-muted">
        A quick guide to everything this site can do.
      </p>

      {/* Section 1 */}
      <Section title="What is this site?">
        <p>
          GitHub Ranking is a read-only dashboard that ranks 30+ programming languages by real
          GitHub activity. Instead of relying on surveys or search-engine hits, it fetches live data
          directly from the GitHub REST API and computes a weighted composite score across four
          dimensions.
        </p>
        <p>
          The goal is simple: give developers, engineering managers, and educators an objective,
          data-backed view of which languages are growing, which are stable, and which are
          declining.
        </p>
      </Section>

      {/* Section 2 — Composite Score */}
      <Section title="How is the composite score calculated?">
        <p>
          Each language is scored across four independent metrics, all collected from the top-100
          most-starred repositories per language:
        </p>
        <ul className="mt-3 space-y-2">
          <ScoreRow label="Repositories" weight="25%" color="bg-blue-400" description="Total public repositories using the language" />
          <ScoreRow label="Stars" weight="30%" color="bg-amber-400" description="Total cumulative stars across all scanned repos" />
          <ScoreRow label="Forks" weight="20%" color="bg-purple-400" description="Total forks — a proxy for serious adoption" />
          <ScoreRow label="Activity (30d)" weight="25%" color="bg-emerald-400" description="Repositories with at least one push in the last 30 days" />
        </ul>
        <p className="mt-4">
          Each raw metric is min-max normalised to 0–100 across all 30 languages, then multiplied
          by its weight. The final score is therefore a number between 0 and 100, where{' '}
          <strong>100 = best</strong> across all dimensions simultaneously.
        </p>
        <div className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm">
          score = 0.25 × repos + 0.30 × stars + 0.20 × forks + 0.25 × activity
        </div>
      </Section>

      {/* Section 3 — Navigation */}
      <Section title="Navigating the site">
        <div className="space-y-5">
          <NavItem
            icon={<TrendingUp className="h-4 w-4" />}
            title="Explore (home)"
            href="/"
          >
            The homepage shows a scrollable feed of trending repositories. Use the tab bar to
            switch between <strong>Trending</strong> (most stars gained this week),{' '}
            <strong>Most starred</strong> (all-time top starred repos), and{' '}
            <strong>Discover</strong> (random selection across all languages).
            The search bar lets you find any public repository by name.
          </NavItem>

          <NavItem
            icon={<BarChart2 className="h-4 w-4" />}
            title="Language leaderboard"
            href="/"
          >
            From the Explore page, the leaderboard shows all 30 ranked languages with their
            composite score and individual metrics. Click a language name to open its detail page
            — you&apos;ll see metric bars, normalised scores, and a list of its top-100 repos.
          </NavItem>

          <NavItem
            icon={<BookMarked className="h-4 w-4" />}
            title="Top Ranking — Repositories"
            href="/top-ranking/repositories"
          >
            Browse the 100 most-starred, most-forked, or most recently active repositories on
            GitHub. Switch tabs between <em>Stars</em>, <em>Forks</em>, and <em>Trending</em>,
            and paginate through results.
          </NavItem>

          <NavItem
            icon={<Users className="h-4 w-4" />}
            title="Top Ranking — Users & Organisations"
            href="/top-ranking/users"
          >
            See the highest-followed GitHub users and organisations ranked in order. Useful for
            spotting the most influential individuals and companies in the open-source ecosystem.
          </NavItem>
        </div>
      </Section>

      {/* Section 4 — Access Token */}
      <Section title="Adding a GitHub Access Token">
        <p>
          The GitHub API allows only{' '}
          <a
            href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            60 unauthenticated requests per hour
          </a>
          . When the limit is reached, this site falls back to cached or demo data and shows a
          warning banner.
        </p>
        <p>
          By adding your own{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            personal access token
          </a>{' '}
          you raise the limit to 5,000 requests per hour and ensure live data is always shown.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Key className="h-4 w-4 text-accent" />
            How to create a token (2 minutes)
          </div>
          <ol className="space-y-2 text-sm text-foreground">
            <li>
              <span className="mr-2 font-semibold">1.</span>Go to{' '}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                github.com/settings/tokens/new
              </a>
            </li>
            <li>
              <span className="mr-2 font-semibold">2.</span>
              Give it any name (e.g. &ldquo;GitHub Ranking site&rdquo;).
            </li>
            <li>
              <span className="mr-2 font-semibold">3.</span>
              <strong>Do not select any scopes</strong> — no special permissions are required for
              reading public data.
            </li>
            <li>
              <span className="mr-2 font-semibold">4.</span>
              Click <em>Generate token</em> and copy the value.
            </li>
            <li>
              <span className="mr-2 font-semibold">5.</span>
              Click the <strong>⚙ Settings</strong> icon in the top-right of this site and choose{' '}
              <em>Add Access Token</em>. Paste and save.
            </li>
          </ol>
        </div>

        <p className="mt-4 text-sm text-muted">
          Your token is stored only in your browser&apos;s local storage and is never sent to our
          servers — it is used exclusively to call <code>api.github.com</code> from your browser.
          You can remove it at any time from the same settings panel.
        </p>
      </Section>

      {/* Section 5 — FAQ */}
      <Section title="Frequently asked questions">
        <div className="space-y-5">
          <Faq question="How often is the data refreshed?">
            Rankings are cached for 5 minutes. The cache is automatically invalidated on fresh
            page loads once expired. A cron job also refreshes data every 30 minutes server-side.
          </Faq>
          <Faq question="Why are only 30 languages ranked?">
            The ranking focuses on the 30 most widely-used languages by GitHub repository count.
            This keeps the comparison meaningful and the API usage within practical limits.
          </Faq>
          <Faq question="What counts as 'activity'?">
            A repository contributes to a language&apos;s activity score if it received at least
            one push in the last 30 days. Only the top-100 most-starred repos per language are
            sampled.
          </Faq>
          <Faq question="Can I export the data?">
            Not currently — this is a read-only dashboard. Data export (CSV, JSON) is on the
            roadmap.
          </Faq>
        </div>
      </Section>
    </main>
  );
}

// ─── Small layout components ──────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 border-b border-border pb-2 text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function ScoreRow({
  label,
  weight,
  color,
  description,
}: {
  label: string;
  weight: string;
  color: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <span>
        <strong>{label}</strong>{' '}
        <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-muted">
          ×{weight}
        </span>{' '}
        — {description}
      </span>
    </li>
  );
}

function NavItem({
  icon,
  title,
  href,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted">
        {icon}
      </div>
      <div>
        <Link href={href} className="text-sm font-semibold text-foreground hover:text-accent">
          {title}
        </Link>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold">{question}</p>
      <p className="mt-1 text-muted">{children}</p>
    </div>
  );
}
