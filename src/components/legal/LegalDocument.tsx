// Shared layout pieces for the legal pages (Privacy Policy, Terms & Conditions,
// Cookie Policy), so all three read and number clauses identically. Server
// components — no hooks, no browser APIs.
//
// pt-[64px] clears the fixed global NavBar rendered by src/app/ClientLayout.tsx.
// These pages used to render their own second NavBar + logo on top of it,
// which is what produced the duplicate navbar.

import type { ReactNode } from "react";

export function LegalPage({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white pt-[64px] text-[#131720]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 md:px-8">
        <h1 className="text-3xl font-bold text-[#1e3143] sm:text-4xl">{title}</h1>
        {meta && <div className="mt-3 space-y-1 text-sm text-[#475569]">{meta}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

/** A numbered top-level section ("1  Our two roles"). */
export function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-10" aria-labelledby={`clause-${n}`}>
      <h2
        id={`clause-${n}`}
        className="flex items-baseline gap-3 border-b border-[#e2e8f0] pb-2 text-xl font-semibold text-[#1e3143] sm:text-2xl"
      >
        <span className="tabular-nums text-[#146995]">{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#334155] sm:text-base">{children}</div>
    </section>
  );
}

/** A numbered sub-clause ("1.1 ..."), number in the left gutter. */
export function Clause({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.75rem_1fr] gap-x-2">
      <span className="tabular-nums text-[#64748B]">{n}</span>
      <div className="min-w-0 space-y-3">{children}</div>
    </div>
  );
}

/** Bold lead-in used by clauses like "Sensitive data." / "No sale.". */
export function LeadIn({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-[#1e3143]">{children}</strong>;
}

/** Wide tables scroll sideways on small screens instead of squashing. */
export function LegalTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: ReactNode[][] }) {
  return (
    <div
      className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#f0f3f5] text-[#1e3143]">
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0] align-top">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-medium text-[#1e3143]" : "px-4 py-3"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className="text-[#146995] hover:underline">
      {email}
    </a>
  );
}

export function PhoneLink({ number, label }: { number: string; label?: string }) {
  return (
    <a href={`tel:${number.replace(/[^+\d]/g, "")}`} className="text-[#146995] hover:underline">
      {label ?? number}
    </a>
  );
}

/** Grievance Officer / DPO block — identical wording in the Privacy and Cookie policies. */
export function GrievanceOfficer() {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-[#1e3143]">Sanjeev Kumar</p>
      <p>Grievance Officer and DPO</p>
      <p>Ufirm Technologies Private Limited</p>
      <p>Sector-63 H-64 Noida</p>
      <p>
        Email: <MailLink email="dpo@ufirm.in" />
      </p>
      <p>
        M: <PhoneLink number="+91 98689 99648" />
      </p>
      <p>Hours: Monday to Friday, 10:00 to 18:00 IST</p>
    </div>
  );
}
