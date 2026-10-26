// Security Policy page — intentionally disabled (content commented out below).
//
// The route is kept as a stub that returns a 404 instead of deleting the
// folder, so old links/bookmarks get a clean "not found" rather than a build
// error, and the original markup stays here if the page is ever restored.
// Links to this route were removed from the Footer, Sitemap and login pages.
// To restore: delete this stub and uncomment the original below.

import { notFound } from "next/navigation";

export default function SecurityPolicyPage(): never {
  notFound();
}

/* ORIGINAL (commented out) — previous implementation, kept for reference.
   Not compiled; delete once the new page is signed off.

"use client";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "../../components/NavBar";
import { HamburgerMenu } from "../../components/Hamburger";

export default function SecurityPolicyPage() {
    return (
        <div className="bg-white text-black min-h-screen ">

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
            <div className="pt-24 pb-8 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 max-w-6xl mx-auto mt-5">
                <p className="text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">Security Policy</p>
                <p className="text-right text-sm sm:text-base mb-6 ">Last updated 19-06-2025</p>

                <p className="text-sm sm:text-base md:text-lg mb-4 leading-relaxed">
                    We know how important your personal information is, which is why we employ some of the most advanced technology for Internet security available today. When you access our site through HTTPS, sensitive information you send, such as passwords and bank account numbers, are encrypted using the industry standard <b>TLS (Transport Layer Security)</b> protocol, commonly called <b>SSL (Secure Sockets Layer)</b>, ensuring your data is safe, secure, and available only to authorized users in your organization.
                </p>

                <div className="mt-6">
                    <p className="text-sm sm:text-base md:text-lg mb-2 leading-relaxed">
                        We provide each user with a unique username that can be used to reliably track which user account triggered an action within the software. Each username has a password that is hashed with bcrypt, which prevents anyone from decrypting or recovering the password. In addition, users can log in through Google to prove they own the email address associated with their user account in UFIRM. When using Google to log in, the user relies on Google’s security to safeguard their credentials.
                    </p>
                </div>
                <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                    <p className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold">Questions</p>
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
    );
}
*/
