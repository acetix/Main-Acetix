import { Link, useLocation } from 'react-router-dom';
import { Ban, FileLock2, Mail, UserX } from 'lucide-react';
import Reveal from '../components/Reveal';
import { localizedTo } from '../lib/useLocalizedLink';
import { usePageSeo } from '../lib/usePageSeo';

const TLDR = [
  {
    icon: UserX,
    title: 'No accounts needed',
    copy: 'The tools themselves need no account — just open and use them; an optional Profile sign-in exists only for personalization.',
  },
  {
    icon: FileLock2,
    title: 'Your files stay yours',
    copy: 'Converters and document tools process everything in your browser. Files never touch a server.',
  },
  {
    icon: Ban,
    title: 'No ads, no trackers',
    copy: 'This hub site shows no ads and runs no third-party analytics, pixels, or behavioural profiling. Ever.',
  },
];

export default function Privacy() {
  usePageSeo(
    'Privacy — your data barely exists here',
    'acetix privacy policy: no accounts needed, files stay on your device, no ads or trackers on this hub. Plain-language privacy.',
    '/privacy',
  );
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  return (
    <div className="mx-auto max-w-4xl min-w-0 overflow-x-clip px-6 pb-24 pt-32 md:pt-40">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          Privacy
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          The short version: your data barely exists here.
        </h1>
        <p className="mt-4 text-sm text-smoke">Last updated: January 2025</p>
      </Reveal>

      <div className="mt-12 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-3 [&>*]:min-w-0">
        {TLDR.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.07}>
            <div className="h-full rounded-3xl border border-ink/10 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-sun">
                <item.icon className="h-5 w-5 text-white" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{item.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-14 space-y-10 leading-relaxed text-smoke">
          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              What is collected
            </h2>
            <p className="mt-3">
              Only one thing is intentionally stored: when you post in the{' '}
              <Link to={localizedTo('/suggest')} className="font-semibold text-brand hover:underline">
                Suggestion Box
              </Link>
              , your idea title, category, description and optional name are
              saved to a secure Google cloud database so the public
              wishlist can show them. That is the entire list.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Files and content
            </h2>
            <p className="mt-3">
              Converter, document and generator tools published on acetix run
              entirely in your browser using client-side JavaScript and
              WebAssembly. The files you open never leave your device, are
              never uploaded, and cannot be seen by anyone running acetix.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Cookies & preferences
            </h2>
            <p className="mt-3">
              Apart from the advertising cookies described above, a few tools
              keep preferences (like your last quality setting or palette
              history) in your own browser's local storage — that data stays
              on your machine and can be cleared by emptying browser storage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Advertising
            </h2>
            <p className="mt-3">
              This hub website (acetix.xyz) shows no ads itself. Some of the
              individual acetix projects linked from here may show clearly
              labeled ads from third-party ad networks (such as Google AdSense
              and Adsterra) to keep those tools free. Those networks may use
              cookies or similar technologies to serve and measure
              personalized or non-personalized ads, including the Google
              advertising cookie. You can opt out of personalized Google ads in{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand hover:underline"
              >
                Google Ads Settings
              </a>
              , and learn how Google uses data on partner sites at{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand hover:underline"
              >
                policies.google.com
              </a>
              . Ad-blockers may prevent ads from loading on those project
              sites; this hub keeps working either way.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Location URLs
            </h2>
            <p className="mt-3">
              To keep loading fast nearby, the address bar may show a regional
              prefix such as acetix.xyz/bd-dhaka/projects. This is only a
              display address: the region is guessed on your own device from
              timezone, language, or an approximate network lookup, refreshed
              automatically, and never saved to any account or cache file.
              Every regional address points to the same page, and search
              engines only index the plain address without the prefix — you
              can remove the prefix at any time and the site works the same.
              You can also pick a region manually from the location switcher
              in the footer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Third-party services
            </h2>
            <p className="mt-3">
              Hosting is provided by Vercel, and the contact-form datastore by
              a secure cloud provider. Both may process standard technical logs (IP
              address, browser, timestamps) required to serve the site
              securely. No content data is sold or shared with anyone.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Your choices
            </h2>
            <p className="mt-3">
              Want a suggestion you posted removed? Reach out via the{' '}
              <Link to={localizedTo('/contact')} className="font-semibold text-brand hover:underline">
                contact page
              </Link>{' '}
              and it will be removed from the cloud database. Nothing else about you is
              kept, so there is nothing else to delete.
            </p>
          </section>

          <section className="rounded-3xl bg-sand/60 p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink">
                <Mail className="h-5 w-5 text-paper" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Questions about this policy?
                </h2>
                <p className="mt-1.5 text-sm">
                  Use any channel on the{' '}
                  <Link to={localizedTo('/contact')} className="font-semibold text-brand hover:underline">
                    contact page
                  </Link>
                  . Privacy questions get answered as plainly as this page.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  );
}
