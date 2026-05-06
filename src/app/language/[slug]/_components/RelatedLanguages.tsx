import Link from 'next/link';
import type { LanguageSummary } from '@/types/csvRankings';
import { formatNumber } from '@/lib/utils';

interface RelatedLanguagesProps {
  languages: LanguageSummary[];
}

export default function RelatedLanguages({ languages }: RelatedLanguagesProps) {
  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-3 text-base font-semibold text-foreground">
        Related Languages
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {languages.map(lang => (
          <li key={lang.slug}>
            <Link
              href={`/language/${lang.slug}`}
              className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3 transition-colors hover:bg-surface"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{lang.language}</p>
                <p className="text-xs text-muted">Rank #{lang.rank}</p>
              </div>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                {lang.compositeScore.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
