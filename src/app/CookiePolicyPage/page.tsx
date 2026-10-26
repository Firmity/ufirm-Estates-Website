// Cookie Policy — server component. Pairs with src/components/CookieConsent.tsx
// (the banner) and src/lib/cookieConsent.ts (the consent cookie). If the
// banner's behaviour changes, update the matching clauses here (3, 4, 5)
// and bump CONSENT_POLICY_VERSION so visitors are asked again.

import type { Metadata } from "next";
import Link from "next/link";

import { CookieSettingsButton } from "@/components/legal/CookieSettingsButton";
import {
  Clause,
  GrievanceOfficer,
  LeadIn,
  LegalPage,
  LegalTable,
  Section,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Cookie Policy | UFirm",
  description:
    "How Ufirm Technologies Private Limited uses cookies and similar technologies on its website, and how to change your choice.",
};

const COOKIE_TABLE_HEADERS = ["Category", "Purpose", "Set by", "Duration", "Ground"];

const COOKIE_TABLE_ROWS: string[][] = [
  [
    "Essential",
    "Keep the website working and remember your cookie choice.",
    "Firmity (first party)",
    "Up to 12 months, or until you clear it",
    "Not needed",
  ],
  [
    "Analytics",
    "Understand how visitors reach and use the website, such as pages viewed, device type and traffic source, so that we can improve it.",
    "Firmity and service providers acting for us",
    "As fixed by each cookie; stated in the cookie list (clause 8)",
    "Your consent",
  ],
  [
    "Marketing",
    "Measure which campaigns and channels bring visitors to Firmity and how well our communications perform.",
    "Firmity and service providers acting for us",
    "As fixed by each cookie; stated in the cookie list (clause 8)",
    "Your consent",
  ],
];

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" meta={<p>Last Updated: 10 June 2026</p>}>
      <div className="space-y-4 text-[15px] leading-relaxed text-[#334155] sm:text-base">
        <p>
          This Cookie Policy explains how Ufirm Technologies Private Limited, which operates the Firmity platform
          (“Firmity”, “we”, “us”), uses cookies and similar technologies on the Firmity website. It forms part of, and
          must be read together with, our{" "}
          <Link href="/PrivacyPolicypage" className="font-medium text-[#146995] hover:underline">
            Privacy Policy
          </Link>
          . It is published under the Digital Personal Data Protection Act, 2023 (the “DPDP Act”), the DPDP Rules,
          2025, Section 43A of the Information Technology Act, 2000, and Rule 4 of the SPDI Rules, 2011.
        </p>
        <p>
          <CookieSettingsButton />
        </p>
      </div>

      <Section n={1} title="Our role">
        <Clause n="1.1">
          <p>
            For visitors to this website and prospects, we are the Data Fiduciary: we decide why and how cookies are
            used on this website. This Policy covers that use.
          </p>
        </Clause>
        <Clause n="1.2">
          <p>
            Where a customer uses Firmity for its own employees, visitors or tenants, the customer is the Data
            Fiduciary and we act as its Data Processor, as set out in clause 1 of the Privacy Policy. This Policy does
            not change that.
          </p>
        </Clause>
      </Section>

      <Section n={2} title="What cookies are">
        <Clause n="2.1">
          <p>
            Cookies are small text files that a website places on your device when you visit it. They let the website
            recognise your device, remember your choices and measure how the website is used.
          </p>
        </Clause>
        <Clause n="2.2">
          <p>
            Similar technologies, such as browser local storage and session storage, work in the same way. In this
            Policy, “cookies” includes them.
          </p>
        </Clause>
        <Clause n="2.3">
          <p>
            First-party cookies are set by Firmity. Third-party cookies are set by service providers who process data
            for us under written contracts (see clause 3 of the Privacy Policy).
          </p>
        </Clause>
      </Section>

      <Section n={3} title="Categories of cookies we use">
        <LegalTable
          caption="Categories of cookies, their purpose, who sets them, duration and ground"
          headers={COOKIE_TABLE_HEADERS}
          rows={COOKIE_TABLE_ROWS}
        />
        <Clause n="3.1">
          <p>
            <LeadIn>Essential items in use.</LeadIn> One first-party cookie, named ufirm_consent, that remembers your
            cookie choice (up to 12 months). It holds a random identifier, your choice, the date and time, and the
            version of this Policy, and it stays on your device. We do not keep a separate copy on our servers.
          </p>
        </Clause>
        <Clause n="3.2">
          <p>
            We do not sell personal data, and we do not use cookies to make solely automated decisions with legal
            effect on you.
          </p>
        </Clause>
        <Clause n="3.3">
          <p>
            We also count visits to the website in aggregate, using a method that sets no cookies, stores nothing on
            your device and does not identify you. This counting does not depend on your choice.
          </p>
        </Clause>
      </Section>

      <Section n={4} title="Consent">
        <Clause n="4.1">
          <p>
            Essential cookies keep the website working and do not need consent. Analytics and marketing cookies are used
            only if you consent through the cookie banner.
          </p>
        </Clause>
        <Clause n="4.2">
          <p>
            Nothing in the analytics or marketing categories that sets a cookie or stores information on your device is
            used before you accept.
          </p>
        </Clause>
        <Clause n="4.3">
          <p>
            Under Section 6 of the DPDP Act, consent must be free, specific, informed, unconditional and unambiguous,
            and given by a clear affirmative action. The banner therefore offers two options of equal prominence,
            Accept and Reject, with nothing pre-selected. Accept enables analytics and marketing cookies together.
            Reject keeps essential cookies only.
          </p>
        </Clause>
        <Clause n="4.4">
          <p>If you reject, the website works as normal, and choosing Reject carries no penalty.</p>
        </Clause>
        <Clause n="4.5">
          <p>
            We ask again when this Policy changes in a way that needs fresh consent, and in any case when your choice
            is 12 months old.
          </p>
        </Clause>
      </Section>

      <Section n={5} title="Changing or withdrawing consent">
        <Clause n="5.1">
          <p>
            You may change or withdraw your choice at any time using Cookie settings, here or on the Privacy Policy
            page. Withdrawing is as easy as giving consent.
          </p>
          <p>
            <CookieSettingsButton />
          </p>
        </Clause>
        <Clause n="5.2">
          <p>
            When you withdraw, we stop loading analytics and marketing scripts and remove the analytics and marketing
            cookies that we can reach on our own domain. Cookies set on other domains may stay until you delete them in
            your browser. Withdrawal does not affect processing done before you withdrew.
          </p>
        </Clause>
        <Clause n="5.3">
          <p>
            You can also block or delete cookies in your browser settings. Blocking essential cookies may stop parts of
            the website from working, and if your browser blocks our consent cookie we will ask for your choice on every
            visit.
          </p>
        </Clause>
      </Section>

      <Section n={6} title="Who sets cookies">
        <Clause n="6.1">
          <p>
            If you accept, analytics and marketing cookies may be set by service providers who process data for us
            under written contracts, as described in clause 3 of the Privacy Policy. We keep a current list of the
            processors we use and will give it to you on request.
          </p>
        </Clause>
      </Section>

      <Section n={7} title="Where data is stored">
        <Clause n="7.1">
          <p>
            We host data in India by default. We transfer personal data outside India only as clause 4 of the Privacy
            Policy allows.
          </p>
        </Clause>
      </Section>

      <Section n={8} title="Cookie list">
        <Clause n="8.1">
          <p>
            We maintain a current list of the cookies and similar technologies in use, with each one’s name, provider,
            purpose and duration. Write to the Grievance Officer in clause 11 and we will give it to you.
          </p>
        </Clause>
      </Section>

      <Section n={9} title="Your rights and complaints">
        <Clause n="9.1">
          <p>
            Your rights under the DPDP Act, how to exercise them, and when we may decline a request are set out in
            clause 9 of the Privacy Policy. They apply to the personal data described in this Policy.
          </p>
        </Clause>
        <Clause n="9.2">
          <p>
            Send a grievance to the Grievance Officer in clause 11. If it is not resolved within the period stated in
            the Privacy Policy, or you are not satisfied, you may complain to the Data Protection Board of India, after
            first using this process (Section 13(3) of the DPDP Act).
          </p>
        </Clause>
      </Section>

      <Section n={10} title="Updates to this Policy">
        <Clause n="10.1">
          <p>
            We may update this Policy to reflect changes in our practices or the law. We will post the new version with
            its date, and where a change needs fresh consent we will ask for it.
          </p>
        </Clause>
      </Section>

      <Section n={11} title="Grievance Officer and Data Protection Officer">
        <GrievanceOfficer />
      </Section>

      <Section n={12} title="Governing law">
        <Clause n="12.1">
          <p>
            This Policy is governed by the laws of India. Subject to your rights before the Data Protection Board of
            India and any other forum the law gives you, the courts at Uttar Pradesh have jurisdiction over disputes
            about it.
          </p>
        </Clause>
      </Section>
    </LegalPage>
  );
}
