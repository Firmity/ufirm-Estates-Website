// Privacy Policy — server component. The global fixed NavBar comes from
// src/app/ClientLayout.tsx; this page must NOT render its own (that was the
// duplicate-navbar bug in the previous version, preserved in the comment at
// the bottom of this file).

import type { Metadata } from "next";
import Link from "next/link";

import { CookieSettingsButton } from "@/components/legal/CookieSettingsButton";
import {
  Clause,
  GrievanceOfficer,
  LeadIn,
  LegalPage,
  LegalTable,
  MailLink,
  PhoneLink,
  Section,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy | UFirm",
  description:
    "How Ufirm Technologies Private Limited collects, uses, shares, stores and protects personal data.",
};

const DATA_TABLE_HEADERS = ["Category", "Examples", "Source", "Purpose", "Ground"];

const DATA_TABLE_ROWS: string[][] = [
  [
    "Website and enquiry data",
    "Name, work email, phone, company, role, messages, cookie identifiers",
    "You, your browser",
    "Reply to you, arrange demos, improve the website",
    "Your voluntary request (Section 7(a)); consent for marketing and non-essential cookies",
  ],
  [
    "Customer contacts and administrators",
    "Name, work email, phone, role, billing details, support tickets",
    "The customer and you",
    "Contract administration, billing, support, security notices",
    "Your voluntary provision for contract purposes (Section 7(a))",
  ],
  [
    "Platform security data",
    "IP address, device type, log-in times, audit logs",
    "Automatically",
    "Secure the Platform, detect misuse, meet CERT-In log duties",
    "Security duty (Section 8(5)); disclosure to CERT-In and authorities where law requires (Section 7(d)); notice at log-in",
  ],
  [
    "Job candidates",
    "CV, contact details, education, work history, interview and assessment notes",
    "You, referees, verification agencies",
    "Recruitment and verification",
    "Your consent",
  ],
  [
    "Employees and contractors",
    "Identity and address details, bank and tax details, attendance, appraisal and leave records, emergency contact",
    "You, our systems",
    "Employment, payroll, statutory compliance, security",
    "Employment purposes (Section 7(i)); consent for optional uses",
  ],
  [
    "Biometric data (staff only, optional)",
    "Encrypted facial Biometric Template",
    "You",
    "Attendance verification",
    "Your written consent",
  ],
  [
    "Vendors and advisers",
    "Contact and bank details, contract records",
    "You",
    "Procurement and payment",
    "Voluntary provision for contract purposes (Section 7(a))",
  ],
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      meta={
        <>
          <p>Last Updated: 10 June 2026</p>
          <p>Document control: Version 1.0 · Effective 19 June 2025.</p>
          <p>Reviewed: annually, or on change of purpose, vendor or law.</p>
        </>
      }
    >
      <div className="space-y-4 text-[15px] leading-relaxed text-[#334155] sm:text-base">
        <p>
          This Privacy Policy explains how Ufirm Technologies Private Limited, which operates the Firmity platform
          (“Firmity”, “we”, “us”), collects, uses, shares, stores and protects personal data. It is published to meet
          Section 5 of the Digital Personal Data Protection Act, 2023 (the “DPDP Act”), the DPDP Rules, 2025, Section
          43A of the Information Technology Act, 2000, and Rule 4 of the SPDI Rules, 2011.
        </p>
        <p className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/CookiePolicyPage" className="font-medium text-[#146995] hover:underline">
            Cookie Policy →
          </Link>
          <CookieSettingsButton />
        </p>
      </div>

      <Section n={1} title="Our two roles">
        <Clause n="1.1">
          <p>
            As Data Fiduciary, we decide why and how we process data about our own staff, job candidates, website
            visitors, prospects, vendors and the business contacts of our customers. This Policy covers that data.
          </p>
        </Clause>
        <Clause n="1.2">
          <p>
            As Data Processor, we process data on behalf of our customers who use Firmity, such as their employees,
            visitors and tenants. In that case the customer is the Data Fiduciary and we act only on its documented
            instructions. If you are one of those individuals, please read your organisation’s privacy notice, and
            send requests about that data to that organisation (see clause 12).
          </p>
        </Clause>
      </Section>

      <Section n={2} title="What we collect, why, and on what ground">
        <LegalTable
          caption="Categories of personal data, their source, purpose and legal ground"
          headers={DATA_TABLE_HEADERS}
          rows={DATA_TABLE_ROWS}
        />
        <Clause n="2.1">
          <p>
            <LeadIn>Sensitive data.</LeadIn> Biometric data is “sensitive personal data” under the SPDI Rules. We
            collect it only with your written consent, and we explain it in clause 8.
          </p>
        </Clause>
        <Clause n="2.2">
          <p>
            <LeadIn>No sale.</LeadIn> We do not sell personal data. We do not use it to make solely automated
            decisions with legal effect on you.
          </p>
        </Clause>
      </Section>

      <Section n={3} title="Who we share data with">
        <Clause n="3.1">
          <p>
            We share personal data only as needed, with: (a) service providers who process data for us under written
            contracts, including cloud hosting providers in India regions (such as Amazon Web Services or Google
            Cloud), SMS and email gateways, payroll, background-verification and recruitment providers, and IT
            support; (b) professional advisers, auditors and insurers; (c) courts, regulators, CERT-In, law-enforcement
            and other authorities, when the law requires or permits; (d) a buyer or successor in a merger, acquisition
            or reorganisation, on the same protections; and (e) our customers, where we process your data for them as
            their processor.
          </p>
        </Clause>
        <Clause n="3.2">
          <p>We keep a current list of the processors we use and will give it to you on request.</p>
        </Clause>
      </Section>

      <Section n={4} title="Where your data is stored">
        <Clause n="4.1">
          <p>
            We host data in India by default. We transfer personal data outside India only to a country that the
            Central Government has not restricted under Section 16 of the DPDP Act, and only under written terms that
            protect it.
          </p>
        </Clause>
      </Section>

      <Section n={5} title="Cookies">
        <Clause n="5.1">
          <p>
            Essential cookies keep the website working and do not need consent. Analytics and marketing cookies are
            used only if you consent through the cookie banner, and you can change your choice at any time from Cookie
            settings.
          </p>
          <p className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <CookieSettingsButton />
            <Link href="/CookiePolicyPage" className="font-medium text-[#146995] hover:underline">
              Read the Cookie Policy →
            </Link>
          </p>
        </Clause>
      </Section>

      <Section n={6} title="How we protect data">
        <Clause n="6.1">
          <p>
            We take reasonable security safeguards as Section 8(5) of the DPDP Act and Rule 8 of the SPDI Rules
            require, including encryption in transit (TLS 1.2 or higher) and at rest (AES-256), role-based access with
            multi-factor authentication for administrators, activity logging and monitoring, regular security testing,
            vendor due diligence, and staff training.
          </p>
        </Clause>
        <Clause n="6.2">
          <p>
            No system is completely secure, and we cannot guarantee absolute security. If a personal data breach
            affects you, we will notify the Data Protection Board of India and affected persons in the way the law
            requires, and cooperate with CERT-In.
          </p>
        </Clause>
      </Section>

      <Section n={7} title="How long we keep data">
        <Clause n="7.1">
          <p>
            We keep personal data only for as long as the purpose needs, or the law requires, as set out in our Data
            Retention and Disposal Policy. When that period ends, we erase or irreversibly anonymise it. Some records,
            such as accounting records, security logs and records needed for legal claims, are kept for longer periods
            fixed by law.
          </p>
        </Clause>
      </Section>

      <Section n={8} title="Biometric data">
        <Clause n="8.1">
          <p>
            If you choose facial-recognition attendance, we convert your face into an encrypted mathematical Biometric
            Template protected with AES-256 and do not store your raw facial image for this purpose. We use the
            template only to verify your attendance, and delete it within 30 days after you withdraw consent or leave.
            A manual alternative is always available, and choosing it carries no penalty.
          </p>
        </Clause>
      </Section>

      <Section n={9} title="Your rights">
        <Clause n="9.1">
          <p>
            Under the DPDP Act, you may ask us for: (a) a summary of your personal data we process, our processing
            activities, and the identities of those we have shared it with (Section 11); (b) correction, completion and
            updating of your data (Section 12); (c) erasure of data no longer needed for its purpose, unless the law
            requires us to keep it (Section 12); (d) redress of a grievance (Section 13); and (e) nomination of another
            person to exercise your rights if you die or become incapacitated (Section 14). You may also withdraw any
            consent you gave, at any time.
          </p>
        </Clause>
        <Clause n="9.2">
          <p>
            <LeadIn>How to ask.</LeadIn> Write to the Grievance Officer in clause 13, stating your name, how you deal
            with us and what you want. We will acknowledge within 7 days, ask you for information needed to verify your
            identity, and respond within 30 days, and in any case within the period set by the DPDP Rules, which we
            will not exceed.
          </p>
        </Clause>
        <Clause n="9.3">
          <p>
            <LeadIn>When we may decline.</LeadIn> We may decline or limit a request where we cannot reasonably verify
            your identity or authority; where the data is needed to comply with a law, to establish, exercise or defend
            legal claims, or to keep a security record; where granting it would disclose another person’s personal
            data; or where an exemption under Section 17 of the DPDP Act applies. We will tell you the reason and how
            to complain.
          </p>
        </Clause>
      </Section>

      <Section n={10} title="Your duties">
        <Clause n="10.1">
          <p>
            Under Section 15 of the DPDP Act you must comply with the law, not impersonate another person, not
            suppress material information when giving your data, not file a false or frivolous grievance or complaint,
            and give only verifiably authentic information with a request for correction or erasure. A breach of these
            duties may attract a penalty from the Data Protection Board of India.
          </p>
        </Clause>
      </Section>

      <Section n={11} title="Updates to this Policy">
        <Clause n="11.1">
          <p>
            We may update this Policy to reflect changes in our practices or the law. We will post the new version with
            its date, and notify you directly of material changes, and where a change needs fresh consent we will ask
            for it.
          </p>
        </Clause>
      </Section>

      <Section n={12} title="Data we process for customers">
        <Clause n="12.1">
          <p>
            If your data is in Firmity because a customer uses it (for example, as an employee, visitor or tenant of
            that customer), we process it only on that customer’s instructions. Send your requests to that customer. If
            you send them to us, we will pass them to the customer where we can identify it, and will not respond on
            the merits unless the law requires.
          </p>
        </Clause>
      </Section>

      <Section n={13} title="Grievance Officer and complaints">
        <Clause n="13.1">
          <div className="space-y-5">
            <div>
              <p className="mb-2 font-semibold text-[#1e3143]">Grievance Officer and Data Protection Officer</p>
              <GrievanceOfficer />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[#1e3143]">Support</p>
              <p>
                Support: <MailLink email="support@ufirm.in" />
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[#1e3143]">Talk to sales</p>
              <p>
                Sales: <MailLink email="info@ufirm.in" />
              </p>
              <p>
                M: <PhoneLink number="+91 92173 40884" />, <PhoneLink number="+91 97970 39690" />
              </p>
              <p>
                Landline: <PhoneLink number="+91 120 424 5551" />
              </p>
            </div>
          </div>
        </Clause>
        <Clause n="13.2">
          <p>
            If we do not resolve your grievance within the period above, or you are not satisfied, you may complain to
            the Data Protection Board of India, after first using this process (Section 13(3) of the DPDP Act).
          </p>
        </Clause>
      </Section>

      <Section n={14} title="Governing law">
        <Clause n="14.1">
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

/* ORIGINAL (commented out) — previous implementation, kept for reference.
   Not compiled; delete once the new page is signed off.

"use client";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "../../components/NavBar";
import { HamburgerMenu } from "../../components/Hamburger";

export default function PrivacyPolicy() {
    return (
        <div className="bg-white text-black min-h-screen ">

            <div className="absolute top-1 left-0 w-full z-50">
                <div className="flex items-center justify-between px-4 mt-1">
                    <Link href="/">
                        <Image className="dark:invert mt-9"
                            src={"/UFIRM ESTATES LOGO.webp"} alt={"UFIRM ESTATES LOGO"} width={100} height={100} />
                    </Link>
                    <div className="block lg:hidden">
                        <HamburgerMenu />
                    </div>

                    <div className="hidden lg:block">
                        <NavBar />
                    </div>
                </div>
            </div>
            <div className="pt-24 pb-8 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 max-w-6xl mx-auto mt-5">
                <p className="text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">Privacy Policy</p>
                <p className="text-right text-sm sm:text-base mb-6 ">Last updated 19-06-2025</p>

                <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">How We Protect You</p>
                <p className="text-sm sm:text-base md:text-lg mb-4 leading-relaxed">
                    UFIRM Technologies Pvt. Ltd. (“UFIRM”) is committed to protecting the privacy of information and data that may be used to identify you, your personal information. The intention of this privacy policy (the “Privacy Policy”) is to disclose our information-gathering practices and describe how we use your personal information. The effective date of this Privacy Policy is June 19, 2025.
                </p>

                <div className="mt-6">
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Information We Collect</p>
                    <p className="text-sm sm:text-base md:text-lg mb-2 leading-relaxed">
                        We collect personal information from you if you use our website, fill out forms on our website or on paper at events, or use any of our web-based products or services. The types of personal information we collect include,
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm sm:text-base md:text-lg leading-relaxed">
                        <li>Personalization information including, but not limited to, an uploaded profile photo</li>
                        <li>Identifiers: A real name, alias, postal address, email address, unique personal identifier, online identification, Internet Protocol address, email address, account name, Social Security number, driver’s license number, passport number, current or past job history, or other similar identifiers</li>
                        <li>Commercial Information: Records of personal property, products or services purchases, obtained, or considered, or other purchasing or consuming histories or tendencies.</li>
                        <li>Usage: Information on the user’s interaction the solution</li>
                        <li>Geolocation data: Physical location</li>
                    </ul>
                </div>

                <div className="mt-6">
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">How We Use Your Personal Information</p>
                    <p className="text-sm sm:text-base md:text-lg mb-2 leading-relaxed">
                        The personal information that we collect is used to perform our contractual obligations and for our other legitimate interests. In some cases, we may ask you for your consent to use your personal information, but any consent will be presented to you separately from this Privacy Policy. We may use your personal information for purposes including, but not limited to, the following:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm sm:text-base md:text-lg leading-relaxed">
                        <li>To deliver services, products, or transactions that you have requested</li>
                        <li>To improve our website, including upgrading security measures</li>
                        <li>To send you promotional materials or communications regarding our content and services that we feel may be of interest to you</li>
                        <li>To evaluate the products and services that we offer and develop new or improved products or services and to better understand UFIRM’s business environment</li>
                        <li>For educational purposes, such as polls conducted in webinars</li>
                        <li>To conduct general research on topics of interests to UFIRM and its customers</li>
                    </ul>
                </div>

                <div className="mt-6">
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">How We Share Your Personal Information</p>
                    <p className="text-sm sm:text-base md:text-lg mb-2 leading-relaxed">
                        We may share your information for any of these purposes with the following individuals and entities:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm sm:text-base md:text-lg leading-relaxed">
                        <li>Services used by UFIRM to aid our ability to provide the best possible experience to you.</li>
                        <li>UFIRM may need to share your information for law enforcement or other legal purposes. This type of sharing may be necessary in connection with a lawsuit, claim or investigation, governmental inquiry, court order, enforcement of legal rights (e.g., contract terms, intellectual property rights, etc.), safety issue, or other similar legal or security matter. Sharing your information for these reasons is not a regular event, but could arise from time to time. We will strive to limit the types and amount of information we may need to share for legal purposes to that which is reasonably necessary.</li>
                        <li>We may share (or receive) information about you, including personal contact information, in the event of an acquisition, merger, sale, corporate restructuring, bankruptcy, or other similar event that involves UFIRM. If such an event occurs, UFIRM will take reasonable steps to require that your information be handled in accordance with this Privacy Policy.</li>
                    </ul>
                </div>

                <div className="mt-6">
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Transfer of Information to the INDIA</p>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                        UFIRM is headquartered in the INDIA. Information we collect from you will be processed in the INDIA. In particular, UFIRM collects and transfers personal information to the INDIA only with your consent, to perform on a contract with you (or in your interest), or to fulfil a compelling legitimate interest of UFIRM in a manner that does not outweigh your rights and freedoms. UFIRM endeavours to apply suitable safeguards to protect the privacy and security of your personal information and to use it in a manner that is consistent with this Privacy Policy. UFIRM does not collect sensitive data such as data concerning health, gender, racial or ethnic origins, or genetic or personal information from children.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Data Retention</p>
                        <p>UFIRM retains personal information for as long as we have a legitimate business relationship with you or with an organization with which you are affiliated (such as your employer). We may also retain personal information about prospective customers or prospective employees until we determine that it is unlikely that we will provide you with services and/or employ you. We also may retain your personal information for as long as necessary to comply with our legal or contractual obligations.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Your Rights</p>
                        <p>If you do not want to receive promotional or marketing communications from UFIRM, you may opt-out at any time by clicking the “unsubscribe” link at the end of our emails. If you choose to unsubscribe, we will retain your contact information to ensure that we do not contact you again.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Security</p>
                        <p>UFIRM uses a number of security technologies and procedures to ensure your personal information is protected from unauthorized access, use, or disclosure. However, we cannot guarantee that third parties will not overcome these measures and gain access to your information. To the fullest extent permitted by law, UFIRM disclaims any warranty or guarantee that your information will be protected from misuse, appropriation, alteration, or loss.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Links to External Websites</p>
                        <p>This website contains links to websites that are not controlled by UFIRM. Please be aware that we are not responsible for the content, security, and privacy practices of external sites. We encourage you to familiarize yourself with the privacy policy of all websites where you submit personal information.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Cookies We Use</p>
                        <p>We and our authorized partners may use cookies and other information gathering technologies for a variety of purposes. These technologies may provide us with personal information, information about devices and networks you utilize to access our Websites, and other information regarding your interactions with our Websites.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Changes to Privacy Policy</p>
                        <p>From time to time, UFIRM may change or update this Privacy Policy. We recommend you regularly review this page. When we update this Privacy Policy, we will also revise the “last updated” date at the top of this page. UFIRM will use reasonable commercial efforts to notify you of changes to this Privacy Policy that materially change the disclosures made here.</p>
                    </div>

                    <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                        <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Contact Information</p>
                        <p>If you have any questions about our Security Policy, please contact us or send us a note at:</p>
                        <p className="mt-2">Landline: +91 120 424 5551</p>
                        <p>Email: <a href={`mailto:${"info@ufirm.in"}`} style={{ color: "blue" }}>
                            {"info@ufirm.in"}
                        </a> | <a href={`mailto:${"support@ufirm.in"}`} style={{ color: "blue" }}>
                                {"support@ufirm.in"}
                            </a></p>
                        <p>HO Address: H-64, Sector 63, Noida, Uttar Pradesh, India- 201307.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
*/
