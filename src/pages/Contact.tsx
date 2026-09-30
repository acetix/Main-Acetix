import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Bug,
  Clock,
  Database,
  Github,
  Lightbulb,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  type LucideIcon,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import { localizedTo } from '../lib/useLocalizedLink';
import { usePageSeo } from '../lib/usePageSeo';
import { firebaseEnabled } from '../lib/firebase';
import {
  githubHandle,
  githubUrl,
  telegramHandle,
  telegramUrl,
  useSiteConfig,
  whatsappUrl,
} from '../lib/siteConfig';

interface SocialChannel {
  label: string;
  caption: string;
  href: string;
  icon: LucideIcon;
  tile: string;
}

interface ContactCategory {
  label: string;
  caption: string;
  icon: LucideIcon;
  tile: string;
  internalTo?: string;
  href?: string;
}

const CATEGORY_CARD_CLASS =
  'group rounded-3xl border border-ink/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-ink/5';

export default function Contact() {
  usePageSeo(
    'Contact — get in touch',
    'Contact acetix: instant channels, tool suggestions, bug reports and general feedback. Replies usually within 48 hours.',
    '/contact',
  );
  // Re-resolve every render so links keep the current /<location> prefix.
  useLocation();
  const { config, source } = useSiteConfig();

  /* Categories route people to the right place: tools & bugs go to the
     public Suggestion Box (with the category pre-selected), general
     feedback opens an email with a ready-made subject. */
  const categories: ContactCategory[] = [
    {
      label: 'Suggest a tool',
      caption: 'A repetitive task, a missing converter — tell the public wishlist.',
      icon: Lightbulb,
      tile: 'from-brand to-sun',
      internalTo: '/suggest?category=Suggest%20tool',
    },
    {
      label: 'Bug report',
      caption: 'Something broke or misbehaves on a tool? Report it in one click.',
      icon: Bug,
      tile: 'from-rose-500 to-red-600',
      internalTo: '/suggest?category=Bug%20report',
    },
    {
      label: 'General feedback',
      caption: config.email.trim()
        ? `Thoughts, praise or rants — straight to ${config.email}.`
        : 'Thoughts, praise or rants — straight to the inbox.',
      icon: MessageSquare,
      tile: 'from-ink to-ink-2',
      href: `mailto:${config.email.trim()}?subject=${encodeURIComponent('General feedback — acetix.xyz')}`,
    },
  ];

  /* Channels are read from the cloud database (config/site) — the owner
     can change WhatsApp / Telegram / GitHub / email any time without a
     redeploy. */
  const channels: SocialChannel[] = [
    config.whatsapp.trim() && {
      label: 'WhatsApp',
      caption: 'Chat instantly',
      href: whatsappUrl(config.whatsapp),
      icon: MessageCircle,
      tile: 'from-emerald-500 to-green-600',
    },
    config.telegram.trim() && {
      label: 'Telegram',
      caption: telegramHandle(config.telegram),
      href: telegramUrl(config.telegram),
      icon: Send,
      tile: 'from-sky-400 to-sky-600',
    },
    config.github.trim() && {
      label: 'GitHub',
      caption: githubHandle(config.github),
      href: githubUrl(config.github),
      icon: Github,
      tile: 'from-ink to-ink-2',
    },
    config.email.trim() && {
      label: 'Email',
      caption: config.email,
      href: `mailto:${config.email}`,
      icon: Mail,
      tile: 'from-brand to-ember',
    },
  ].filter(Boolean) as SocialChannel[];

  return (
    <div className="mx-auto max-w-6xl min-w-0 overflow-x-clip px-6 pb-24 pt-32 md:pt-40">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          Contact
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Get in touch.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-smoke">
          Pick the fastest way to reach out — instant channels below, or a
          topic card if you have a tool idea, a bug, or general feedback.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={`mailto:${config.email.trim()}?subject=${encodeURIComponent('Quick question — acetix.xyz')}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-brand"
          >
            <Mail className="h-4 w-4" /> Send a quick email
          </a>
          <Link
            to={localizedTo('/suggest?category=Suggest%20tool')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-ink"
          >
            <Lightbulb className="h-4 w-4" /> Suggest a tool
          </Link>
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 px-4 py-3 text-xs font-medium text-smoke">
            <Clock className="h-3.5 w-3.5" /> {config.responseTime || 'Replies usually within 48 hours.'}
          </span>
        </div>
      </Reveal>

      {/* Instant channels */}
      <Reveal delay={0.05} className="min-w-0">
        <div className="mt-10 min-w-0 rounded-3xl border border-ink/10 bg-white p-7 md:p-10">
          <h2 className="font-display text-2xl font-bold">Instant channels</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-smoke">
            Live links, managed from the cloud
            {source === 'firebase' ? ' — currently synced.' : '.'}
          </p>
          {channels.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-sand/60 px-5 py-6 text-center text-sm text-smoke">
              চ্যানেলগুলো এখনো যোগ করা হয়নি — cloud database-এর siteConfig/site
              ডকুমেন্টে লিংক বসালেই এখানে দেখা যাবে।
            </p>
          ) : (
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={channel.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="group flex items-center gap-3.5 rounded-2xl border border-ink/10 bg-paper p-4 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${channel.tile}`}
                >
                  <channel.icon className="h-5 w-5 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-bold">
                    {channel.label}
                  </span>
                  <span className="block truncate text-xs text-smoke">
                    {channel.caption}
                  </span>
                </span>
              </a>
            ))}
          </div>
          )}
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal delay={0.08} className="min-w-0">
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-smoke">
          Pick a category
        </p>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 [&>*]:min-w-0">
          {categories.map((category) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${category.tile}`}
                  >
                    <category.icon className="h-6 w-6 text-white" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-smoke/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>
                <p className="mt-5 font-display text-lg font-bold">{category.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-smoke">{category.caption}</p>
              </>
            );

            return category.internalTo ? (
              <Link key={category.label} to={localizedTo(category.internalTo)} className={CATEGORY_CARD_CLASS}>
                {inner}
              </Link>
            ) : (
              <a key={category.label} href={category.href} className={CATEGORY_CARD_CLASS}>
                {inner}
              </a>
            );
          })}
        </div>
      </Reveal>

      {/* Status cards */}
      <div className="mt-8 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 [&>*]:min-w-0">
        <Reveal delay={0.12}>
          <div className="h-full rounded-3xl border border-ink/10 bg-white p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ember to-sun">
              <Database className="h-5 w-5 text-white" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Backend status</h3>
            <p className="mt-2 text-sm leading-relaxed text-smoke">
              {firebaseEnabled
                ? 'Backend is connected — projects, the wishlist and these links are live-synced from the cloud database.'
                : 'Running on bundled demo data. Backend keys would sync everything live.'}
            </p>
            <span
              className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                firebaseEnabled
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${firebaseEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {firebaseEnabled ? 'Cloud live' : 'Demo mode'}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="h-full rounded-3xl border border-ink/10 bg-white p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ink to-ink-2">
              <Clock className="h-5 w-5 text-white" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Response time</h3>
            <p className="mt-2 text-sm leading-relaxed text-smoke">{config.responseTime}</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
