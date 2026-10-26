// Terms & Conditions — server component. The global fixed NavBar comes from
// src/app/ClientLayout.tsx; this page must NOT render its own. The previous
// Terms of Use implementation is preserved in the comment at the bottom.

import type { Metadata } from "next";

import {
  GrievanceOfficer,
  LegalPage,
  MailLink,
  PhoneLink,
  Section,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms & Conditions | UFirm",
  description:
    "Terms & Conditions governing access to and use of the Firmity platform, website and related services operated by Ufirm Technologies Private Limited.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      meta={<p>Effective Date: 1 March 2026 · Last Updated: 10 June 2026</p>}
    >
      <div className="space-y-4 text-[15px] leading-relaxed text-[#334155] sm:text-base">
        <p>
          These Terms &amp; Conditions (“Terms”) govern access to and use of the Firmity platform, website, software,
          and related services (collectively, the “Platform”) operated by Ufirm Technologies Private Limited
          (“Firmity”, “Ufirm”, “we”, “our”, or “us”).
        </p>
        <p>
          By accessing, registering for, subscribing to, or using the Platform, you acknowledge that you have read,
          understood, and agree to be bound by these Terms.
        </p>
      </div>

      <Section n={1} title="Platform Services">
        <p>
          Firmity is a cloud-based Software-as-a-Service (SaaS) platform that customers use to manage their
          operations, including data about their employees, visitors, and tenants.
        </p>
        <p>
          Firmity may modify, improve, enhance, replace, or discontinue certain features, functionalities, modules, or
          services from time to time to improve security, performance, compliance, reliability, and user experience.
        </p>
      </Section>

      <Section n={2} title="Eligibility and Authority">
        <p>
          You may use the Platform only if you are legally capable of entering into a binding agreement and are
          authorised to use the Platform. If you are accessing or using the Platform on behalf of a company,
          organisation, society, institution, or other legal entity, you represent and warrant that you have the
          authority to bind such entity to these Terms, and references to “you” shall include both the individual user
          and the applicable organisation.
        </p>
      </Section>

      <Section n={3} title="User Accounts and Responsibilities">
        <p>
          Certain Platform features require user registration and account creation. Users agree to provide accurate,
          complete, and current information and to promptly update such information when necessary. Users are
          responsible for maintaining the confidentiality of login credentials and for all activities conducted
          through their accounts. Users shall immediately notify Firmity of any suspected unauthorised access, misuse,
          or security breach relating to their accounts.
        </p>
      </Section>

      <Section n={4} title="Subscription and Access Rights">
        <p>
          Subject to compliance with these Terms and payment of applicable fees, Firmity grants customers a limited,
          non-exclusive, non-transferable, revocable right to access and use the Platform during the applicable
          subscription term. No ownership rights are transferred under these Terms, and all rights not expressly
          granted remain reserved by Firmity.
        </p>
      </Section>

      <Section n={5} title="Customer Responsibilities">
        <p>
          Customers are responsible for ensuring that their use of the Platform complies with all applicable laws,
          regulations, contractual obligations, employment requirements, privacy requirements, and industry standards.
          Customers are solely responsible for obtaining all necessary permissions, notices, authorisations, and
          consents from employees, contractors, visitors, vendors, residents, tenants, or other individuals whose
          information may be processed through the Platform. Customers further acknowledge responsibility for the
          accuracy, legality, quality, integrity, and ownership of all information uploaded to or processed through the
          Platform.
        </p>
      </Section>

      <Section n={6} title="Acceptable Use">
        <p>
          Users shall not misuse the Platform or attempt to interfere with its operation. Users shall not reverse
          engineer, decompile, disassemble, copy, modify, reproduce, distribute, resell, sublicense, scrape, or create
          derivative works from any portion of the Platform. Users shall not introduce malicious software, attempt
          unauthorised access, circumvent security controls, access data belonging to other customers, or use the
          Platform for unlawful, fraudulent, harmful, or abusive purposes.
        </p>
      </Section>

      <Section n={7} title="Accuracy of Information">
        <p>
          While Ufirm aims to provide accurate and reliable information, we do not guarantee the correctness or
          reliability of any content on the website and assume no liability for errors or omissions.
        </p>
      </Section>

      <Section n={8} title="Site Use Conditions">
        <p>
          You may download content solely for non-commercial, personal use. You must not copy, modify, display,
          distribute, or use content from the website for commercial purposes without prior written permission.
        </p>
        <p>
          You agree not to engage in unlawful activities or misuse the website in any way that could harm its integrity
          or performance.
        </p>
      </Section>

      <Section n={9} title="Unsolicited Submissions">
        <p>
          Ufirm does not accept unsolicited ideas or materials. Any submissions will be treated as non-confidential, and
          Ufirm is under no obligation to use or respond to them.
        </p>
      </Section>

      <Section n={10} title="Copyright Infringement">
        <p>
          If you believe content on the website infringes your copyright, contact us at{" "}
          <MailLink email="info@ufirm.in" /> with:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Your signature and contact details</li>
          <li>Description and location of the allegedly infringing material</li>
          <li>A statement of good faith belief</li>
          <li>A statement under penalty of perjury confirming accuracy</li>
        </ul>
      </Section>

      <Section n={11} title="Intellectual Property Rights">
        <p>
          The Platform, including its source code, object code, software architecture, databases, workflows, designs,
          interfaces, reports, trademarks, logos, documentation, proprietary methodologies, trade secrets, know-how,
          and all related intellectual property rights, is and shall remain the exclusive property of Ufirm
          Technologies Private Limited and its licensors. No rights, title, or ownership are transferred to any
          customer or user except for the limited access rights expressly granted under these Terms.
        </p>
      </Section>

      <Section n={12} title="Customer Data and Ownership">
        <p>
          Customers retain ownership of all operational, administrative, employee, attendance, visitor, and other
          business data submitted to or generated through their use of the Platform. In respect of such data, Firmity
          acts as a Data Processor and processes it only on the customer’s documented instructions, as described in the
          Privacy Policy, for the purpose of providing, maintaining, securing, and supporting the Platform in
          accordance with applicable agreements and laws.
        </p>
      </Section>

      <Section n={13} title="Attendance and Biometric Features">
        <p>
          Where enabled by a customer, the Platform may process attendance records, facial recognition attendance
          information, visitor records, and related workforce management data. Facial recognition attendance is
          optional for the individual, and biometric data is processed only with the individual’s written consent, as
          described in the Privacy Policy. Customers acknowledge that they are solely responsible for determining the
          legality of such processing within their jurisdiction and for obtaining all required notices, permissions,
          and consents prior to enabling these features. Firmity shall not be responsible for a customer’s failure to
          comply with applicable employment, labour, privacy, biometric information, or data protection laws.
        </p>
      </Section>

      <Section n={14} title="Third-Party Services and Integrations">
        <p>
          The Platform relies upon third-party service providers who process data for Firmity under written contracts,
          including cloud hosting providers, SMS and email gateways, background-verification and recruitment providers,
          and IT support providers, as described in the Privacy Policy. Firmity does not control, and shall not be
          responsible for, the availability or performance of third-party services outside its reasonable control. Use
          of third-party services may be governed by separate terms and policies established by such providers.
        </p>
      </Section>

      <Section n={15} title="Service Availability">
        <p>
          Firmity will use commercially reasonable efforts to maintain Platform availability, performance, and
          reliability. However, the Platform is provided on an “as available” basis and uninterrupted, error-free, or
          completely secure operation cannot be guaranteed. Scheduled maintenance, emergency maintenance, software
          updates, cyber incidents, internet disruptions, infrastructure failures, force majeure events, or
          circumstances beyond Firmity’s reasonable control may result in temporary interruptions or reduced
          availability. Unless expressly agreed under a separate written Service Level Agreement, no specific uptime
          commitment is guaranteed.
        </p>
      </Section>

      <Section n={16} title="Security">
        <p>
          Firmity takes reasonable security safeguards as described in the Privacy Policy, which may include encryption
          in transit and at rest, role-based access controls, multi-factor authentication for administrators, activity
          logging and monitoring, and regular security testing. No system is completely secure, and absolute security
          against all threats, vulnerabilities, or unauthorised access cannot be guaranteed.
        </p>
      </Section>

      <Section n={17} title="Fees and Payment">
        <p>
          Access to certain Platform services may require payment of subscription fees, implementation fees, support
          fees, onboarding fees, training fees, or other applicable charges. Customers agree to pay all fees in
          accordance with the applicable proposal, quotation, order form, invoice, subscription agreement, or other
          commercial arrangement. Failure to make timely payments may result in suspension, restriction, or
          termination of Platform access.
        </p>
      </Section>

      <Section n={18} title="Data Export, Account Closure and Deletion">
        <p>
          Subject to applicable laws, technical limitations, and verification requirements, customers may request data
          exports, account closure, or deletion of customer-controlled information processed through the Platform.
          Firmity keeps personal data only for as long as the purpose needs, or the law requires, as set out in the
          Privacy Policy, and some records, such as accounting records, security logs, and records needed for legal
          claims, are kept for longer periods fixed by law.
        </p>
      </Section>

      <Section n={19} title="Disclaimer of Warranties">
        <p>
          To the fullest extent permitted by applicable law, the Platform is provided on an “as is” and “as available”
          basis without warranties of any kind, whether express, implied, statutory, or otherwise. Firmity expressly
          disclaims all warranties including merchantability, fitness for a particular purpose, non-infringement,
          uninterrupted availability, accuracy, reliability, and suitability for any specific use case.
        </p>
      </Section>

      <Section n={20} title="Limitation of Liability">
        <p>
          Firmity shall not be liable for any indirect, incidental, special, punitive, exemplary, or consequential
          damages, including loss of profits, revenue, business opportunities, goodwill, data, anticipated savings, or
          business interruption arising from or relating to the Platform.
        </p>
      </Section>

      <Section n={21} title="Indemnification">
        <p>
          Customers agree to indemnify, defend, and hold harmless Ufirm Technologies Private Limited, its directors,
          officers, employees, affiliates, contractors, licensors, and representatives from and against any claims,
          damages, liabilities, penalties, fines, costs, or expenses arising from customer data, unlawful Platform use,
          regulatory non-compliance, employment disputes, privacy violations, infringement claims, or breaches of these
          Terms.
        </p>
      </Section>

      <Section n={22} title="Changes to the Platform and Terms">
        <p>
          Firmity reserves the right to modify, update, replace, suspend, discontinue, or enhance the Platform, its
          features, functionality, integrations, interfaces, and services at any time. Firmity may also revise these
          Terms periodically. Updated Terms will become effective upon publication on the Platform unless otherwise
          stated.
        </p>
      </Section>

      <Section n={23} title="Governing Law and Jurisdiction">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising out
          of or relating to these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of
          the competent courts located in Uttar Pradesh, India.
        </p>
      </Section>

      <Section n={24} title="Contact Information">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="font-semibold text-[#1e3143]">Ufirm Technologies Private Limited</p>
            <p>Brand Name: Firmity</p>
            <p>
              Website:{" "}
              <a
                href="https://www.ufirm.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#146995] hover:underline"
              >
                www.ufirm.in
              </a>
            </p>
            <p>
              Support: <MailLink email="support@ufirm.in" />
            </p>
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
          <GrievanceOfficer />
        </div>
      </Section>
    </LegalPage>
  );
}

/* ORIGINAL (commented out) — previous implementation, kept for reference.
   Not compiled; delete once the new page is signed off.

"use client";
import Link from "next/link";
import { NavBar } from "../../components/NavBar";
import Image from "next/image";
import { HamburgerMenu } from "../../components/Hamburger";

export default function TermsofUsePage() {
    return (
        <div className="bg-white text-black min-h-screen  ">

            <div className="absolute top-1 left-0 w-full z-50">
                <div className="flex items-center justify-between px-4 mt-1">
                    <Link href="/">
                        <Image className="dark:invert mt-9"
                                    src={"/UFIRM ESTATES LOGO.webp"} alt={"UFIRM ESTATES LOGO"} width={100} height={100}  />
                    </Link>
                    <div className="block lg:hidden">
                        <HamburgerMenu />
                    </div>

                    <div className="hidden lg:block">
                        <NavBar />
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto p-6 sm:p-12 mt-20">
                <h1 className="text-3xl font-bold mb-6 text-center">Terms of Use</h1>

                <p className="mb-4">
                    By accessing and using this website (the &quot;Site&quot;), provided by UFIRM Technologies Private Limited (“UFIRM Technologies”), you acknowledge that you have read, understood, and agree to be bound by the following Terms and Conditions. UFIRM Technologies reserves the right to modify these Terms of Use at any time without prior notice. Your continued use of the Site constitutes your acceptance of any changes.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Accuracy of Information</h2>
                <p className="mb-4">
                    While UFIRM Technologies aims to provide accurate and reliable information, we do not guarantee the correctness or reliability of any content on the Site and assume no liability for errors or omissions.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Site Use Conditions</h2>
                <p className="mb-4">
                    You may download content solely for non-commercial, personal use. You must not copy, modify, display, distribute, or use content from the Site for commercial purposes without prior written permission.
                </p>
                <p className="mb-4">
                    You agree not to engage in unlawful activities or misuse the Site in any way that could harm its integrity or performance.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Unsolicited Submissions</h2>
                <p className="mb-4">
                    UFIRM Technologies does not accept unsolicited ideas or materials. Any submissions will be treated as non-confidential, and UFIRM Technologies is under no obligation to use or respond to them.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Disclaimers</h2>
                <ul className="list-disc ml-6 mb-4">
                    <li>The Site is provided &quot;as is&quot; without warranties of any kind.</li>
                    <li>UFIRM Technologies is not responsible for errors, omissions, or the content of linked third-party sites.</li>
                    <li>No liability is accepted for Site availability, software/equipment compatibility, or damages resulting from its use.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
                <p className="mb-4">
                    In no event will UFIRM Technologies or its affiliates be liable for any damages arising from the use of this Site. Total liability will not exceed the amount paid to UFIRM Technologies in the month of the liability event.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Indemnification</h2>
                <p className="mb-4">
                    You agree to indemnify and hold UFIRM Technologies harmless from any claims or damages resulting from your use of the Site or violation of these terms.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Copyright Infringement</h2>
                <p className="mb-2">
                    If you believe content on the Site infringes your copyright, contact us at <a href={`mailto:${"info@ufirm.in"}`} style={{ color: "blue" }}>
                        {"info@ufirm.in"}
                    </a> with:
                </p>
                <ul className="list-disc ml-6 mb-4">
                    <li>Your signature and contact details</li>
                    <li>Description and location of the allegedly infringing material</li>
                    <li>A statement of good faith belief</li>
                    <li>A statement under penalty of perjury confirming accuracy</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Jurisdiction</h2>
                <p className="mb-4">
                    This Site is operated from Noida, Uttar Pradesh, India and governed by Indian laws. Disputes must be raised within six months and will be subject to Noida jurisdiction.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Data Collection & Use</h2>
                <p className="mb-4">
                    UFIRM Technologies collects data such as IP addresses, usage patterns, and device details to enhance user experience and services. Information may also be shared with affiliates to monitor performance.
                </p>
                <p className="mb-4">
                    Personal information is collected where voluntarily submitted, such as when requesting services. We do not knowingly collect data from children under 16.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
                <p className="mb-4">
                    UFIRM Technologies PVT LTD<br />
                    Registered office at H-64,<br />
                    Sector 63,<br />
                    Noida – 201301<br />
                    Email: <a href={`mailto:${"info@ufirm.in"}`} style={{ color: "blue" }}>
                        {"info@ufirm.in"}
                    </a> | <a href={`mailto:${"support@ufirm.in"}`} style={{ color: "blue" }}>
                        {"support@ufirm.in"}
                    </a>
                </p>

                <p className="text-sm text-gray-500 mt-6">Revised: 20.06.2025</p>
            </div>
        </div>
    );
}
*/
