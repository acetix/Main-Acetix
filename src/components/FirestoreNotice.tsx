import { useState } from 'react';
import { Check, Copy, Database, X } from 'lucide-react';
import { FIRESTORE_RULES_SNIPPET } from '../lib/firestoreRules';
import type { ProjectsState } from '../lib/useProjects';

interface FirestoreNoticeProps {
  state: ProjectsState;
}

/**
 * Shown on the Projects page while the catalogue is NOT live — explains in
 * one glance why demo data is visible and gives the exact fix (rules snippet
 * with a copy button). Disappears by itself once Firestore serves the data.
 */
export default function FirestoreNotice({ state }: FirestoreNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (dismissed || (state !== 'empty' && state !== 'blocked')) return null;

  async function copyRules() {
    try {
      await navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — the <details> block below has the text */
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-50 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15">
            <Database className="h-5 w-5 text-amber-600" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-amber-900">
              {state === 'blocked'
                ? 'Firestore পড়া যাচ্ছে না — Rules আপডেট দরকার'
                : 'projects কালেকশন এখনো খালি'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
              {state === 'blocked'
                ? 'মনে হচ্ছে Rules-এ read অ্যাক্সেস খোলা নেই — নিচের Rules পেস্ট করে Publish করুন।'
                : 'এই সাইটে কোনো ডেমো ডেটা নেই — যা দেখবেন, সব সরাসরি Firestore থেকে আসে। দুটি ছোট ধাপে লাইভ করুন:'}
            </p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm font-medium text-amber-900">
              <li>
                <b>Console → Firestore → Data</b>-এ <b>projects</b> কালেকশনে প্রতিটি প্রজেক্ট
                একটি ডকুমেন্ট হিসেবে যোগ করুন — <b>Document ID-টাই URL-এর slug</b> হবে,
                সেভ করে পেজ রিলোড করলেই এখানে দেখা যাবে
              </li>
              <li>
                সোশ্যাল লিংকের জন্য <b>siteConfig</b> কালেকশনে <b>site</b> নামে একটি ডকুমেন্ট
                বানান (ফিল্ডের তালিকা: FIRESTORE_STRUCTURE.md)
              </li>
              <li>
                পড়তে সমস্যা হলে নিচের Rules পেস্ট করে <b>Publish</b> করুন
              </li>
            </ol>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void copyRules()}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-paper transition hover:bg-brand"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> কপি হয়েছে!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Rules কপি করুন
                  </>
                )}
              </button>
              <a
                href="https://console.firebase.google.com/project/acetix1/firestore/rules"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-brand"
              >
                Rules Console খুলুন →
              </a>
            </div>

            <details className="mt-4 rounded-2xl bg-white/60 px-4 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-amber-900">
                Firestore Security Rules (দেখতে ক্লিক করুন)
              </summary>
              <pre className="mt-3 overflow-x-auto text-[10px] leading-relaxed text-ink/70">
                {FIRESTORE_RULES_SNIPPET}
              </pre>
            </details>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          className="rounded-full p-1.5 text-amber-700 transition hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
