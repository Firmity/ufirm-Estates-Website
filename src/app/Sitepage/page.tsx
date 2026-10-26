// "use client";
// import Head from "next/head";
// import Image from "next/image";
// import Link from "next/link";
// import { NavBar } from "@/components/NavBar";
// import { HamburgerMenu } from "@/components/Hamburger";

// export default function Sitemap() {
//     return (
//         <>
//             <div className="absolute top-1 left-0 w-full z-50">
//                 <div className="flex items-center justify-between px-4 mt-1">
//                     <Link href="/">
//                         <Image className="dark:invert mt-9"
//                             src={"/UFIRM ESTATES LOGO.webp"} alt={"UFIRM ESTATES LOGO"} width={100} height={100} />
//                     </Link>
//                     <div className="block lg:hidden">
//                         <HamburgerMenu />
//                     </div>

//                     <div className="hidden lg:block">
//                         <NavBar />
//                     </div>
//                 </div>
//             </div>
//             <div className="p-20">
//                 <Head>
//                     <title>Site Map</title>
//                 </Head>

//                 <div className="min-h-screen bg-white py-12 px-6 sm:px-12">
//                     <h1 className="text-3xl font-bold text-gray-800 mb-10">Site map</h1>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                         <div>
//                             <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Businesses</h2>
//                             <ul className="space-y-2 text-gray-700">
//                                 <li><Link href="https://urest.in/">➤ Facility Management</Link></li>
//                                 <li><Link href="/RoyalNestPage">➤ Royal Nest Projects</Link></li>
//                                 <li><Link href="/FacilityManagement">➤ Products</Link></li>
//                                 <li><Link href="/TechnologiesPage">➤ Technical Services</Link></li>
//                                 <li><Link href="/Management&advisory">➤ Real Estate Advisory</Link></li>
//                             </ul>

//                             <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Other links</h2>
//                             <ul className="space-y-2 text-gray-700">
//                                 <li><Link href="/PrivacyPolicypage">➤ Privacy Policy</Link></li>
//                                 <li><Link href="/SecurityPolicyPage">➤ Security Policy</Link></li>
//                                 <li><Link href="/TermsofUsePage">➤ Terms and Use</Link></li>
//                             </ul>
//                         </div>

//                         <div>
//                             <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick links</h2>
//                             <ul className="space-y-2 text-gray-700">
//                                 <li><Link href="/">➤ Home</Link></li>
//                                 <li><Link href="/Aboutuspage">➤ About Us</Link></li>
//                                 <li><Link href="/CareerPage">➤ Career</Link></li>
//                                 <li><Link href="/ContactPage">➤ Contact Us</Link></li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }
























"use client";
import Head from "next/head";
import Link from "next/link";

export default function Sitemap() {
    return (
        <>
            {/* The fixed global NavBar comes from src/app/ClientLayout.tsx - do not render another one here.
                pt-[64px] offsets its height. */}
            <div className="pt-[64px] min-h-screen bg-white py-12 px-6 sm:px-12">
                <Head>
                    <title>Site Map</title>
                </Head>
                <h1 className="text-3xl font-bold text-gray-800 mb-10">Site map</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Businesses</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li><Link href="https://urest.in/">➤ Facility Management</Link></li>
                            <li><Link href="/RoyalNestPage">➤ Royal Nest Projects</Link></li>
                            <li><Link href="/FacilityManagement">➤ Products</Link></li>
                            <li><Link href="/TechnologiesPage">➤ Technical Services</Link></li>
                            <li><Link href="/Management&advisory">➤ Real Estate Advisory</Link></li>
                        </ul>
                        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Other links</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li><Link href="/PrivacyPolicypage">➤ Privacy Policy</Link></li>
                            <li><Link href="/CookiePolicyPage">➤ Cookie Policy</Link></li>
                            <li><Link href="/TermsofUsePage">➤ Terms &amp; Conditions</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick links</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li><Link href="/">➤ Home</Link></li>
                            <li><Link href="/Aboutuspage">➤ About Us</Link></li>
                            <li><Link href="/CareerPage">➤ Career</Link></li>
                            <li><Link href="/ContactPage">➤ Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}