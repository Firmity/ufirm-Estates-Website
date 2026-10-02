// "use client";

// import React, { useEffect } from "react";
// import type { JSX } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import dynamic from "next/dynamic";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import {
//     FaBuilding,
//     FaUsersCog,
//     FaGlobeAsia,
//     FaMicrochip,
//     FaUsers,
//     FaGlobe,
//     FaCoins,
//     FaChartLine,
//     FaCogs,
//     FaTools,
// } from "react-icons/fa";

// // Components (dynamically imported)
// const ClientCarousel = dynamic(() => import("@/components/ClientCarousel"), {
//     ssr: false,
// });
// const NavBar = dynamic(() => import("@/components/NavBar").then(mod => mod.NavBar), { ssr: false });
// const HamburgerMenu = dynamic(() => import("@/components/Hamburger").then(mod => mod.HamburgerMenu), {
//     ssr: false,
// });

// export default function AboutusPage() {
//     useEffect(() => {
//         AOS.init({ duration: 1000, once: true });
//     }, []);

//     const roadmapSteps = [
//         {
//             year: "2016",
//             title: "Incorporation",
//             desc: "Incorporated from Royal Nest’s 25-year legacy; began delivering sustainable real estate services.",
//         },
//         {
//             year: "2018",
//             title: "Business Park Launch",
//             desc: "Launched UFIRM Business Park, a professional co-working and flex-office space spanning 80,000+ ft².",
//         },
//         {
//             year: "2020",
//             title: "Urest.in IFM Launch",
//             desc: "Established Urest.in as a dedicated Integrated Facility Management division, proving effectiveness during COVID-19 lockdowns.",
//         },
//         {
//             year: "2022",
//             title: "Green Residential Development",
//             desc: "Commenced ‘Royal Nest Forest View’ in Dharamshala – green-compliant, RERA & TCP approved residential apartments.",
//         },
//         {
//             year: "2024",
//             title: "Tech Platform Deployment",
//             desc: "Deployed 100% Made-in-India CMMS platform for real-time PPM, asset, inventory & workforce management.",
//         },
//         {
//             year: "2025",
//             title: "Profitability & Growth",
//             desc: "Achieved company-wide profitability (EBIT margin 4.03%) with 76.64% YoY revenue growth.",
//         },
//     ];

//     const vision2030 = {
//         title: "Vision 2030",
//         desc: "By 2030, UFIRM aims to be India’s most trusted, tech-enabled, and sustainable real estate services company, delivering value across build, manage, maintain, and enhance verticals.",
//         goals: [
//             {
//                 category: "BUILD – Projects",
//                 target: "Estate development portfolio to grow by 100%.",
//             },
//             {
//                 category: "Estate Advisory",
//                 target: "Manage and enable sales of real estate assets worth ₹100+ Crores.",
//             },
//             {
//                 category: "Facility Management",
//                 target:
//                     "urest.in to achieve 120% revenue growth in integrated facility management and manpower outsourcing. ",
//             },
//             {
//                 category: "Estate Technology",
//                 target:
//                     "Launch 3 globally accessible technology and ESG tools for smarter estate construction, maintenance & management. ",
//             },
//         ],
//     };

//     const iconMap: { [key: string]: JSX.Element } = {
//         "BUILD – Projects": <FaBuilding className="text-white text-xl" />,
//         "Estate Advisory": <FaChartLine className="text-white text-xl" />,
//         "Facility Management": <FaTools className="text-white text-xl" />,
//         "Estate Technology": <FaCogs className="text-white text-xl" />,
//     };

//     function Vision2030Card({ category, target }: { category: string; target: string }) {
//         return (
//             <div
//                 data-aos="fade-up"
//                 className="bg-[#e6f3f8] p-6 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
//             >
//                 <div className="flex items-center gap-4 mb-4">
//                     <div className="bg-[#146995] p-3 rounded-full w-12 h-12 flex items-center justify-center">
//                         {iconMap[category]}
//                     </div>
//                     <h3 className="text-xl font-semibold text-[#146995]">{category}</h3>
//                 </div>
//                 <p className="text-gray-800">{target}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white text-gray-800">
//             {/* Header */}
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

//             {/* Banner */}
//             <div className="relative">
//                 <Image
//                     src="/Aboutus.webp"
//                     alt="About Banner"
//                     width={1600}
//                     height={900}
//                     priority
//                     placeholder="blur"
//                     blurDataURL="/Aboutus.jpg"
//                     className="w-full h-[60vh] sm:h-[50vh] lg:h-[80vh] object-cover"
//                 />
//                 <div className="absolute inset-0 bg-black/60 flex items-center px-10">
//                     <div className="text-white max-w-xl">
//                         <h1 className="text-4xl md:text-5xl font-extrabold mb-4">We Are UFIRM</h1>
//                         <p className="text-xl">
//                             Purpose-driven real estate services company committed to building, managing, maintaining, and enhancing real estate for <strong>People, Planet & Profits</strong>.
//                         </p>
//                     </div>
//                 </div>
//             </div>

//             <section className="p-10 px-10">
//                 <p className="text-lg">
//                     Founded in 2016 as an extension of the Royal Nest Group—with over 25 years of legacy and 8 million sq. ft. of successfully delivered residential and commercial projects—Ufirm now integrates four synergistic divisions under one roof.
//                 </p>
//             </section>

//             <section className="py-10 px-6 md:px-20 bg-[#e6f3f8]">
//                 <div className="text-center mb-12">
//                     <h2 className="text-5xl font-bold text-black">Our Divisions</h2>
//                     <p className="text-lg max-w-3xl mx-auto mt-4">
//                         From sales to service to smart solutions — every UFIRM arm is dedicated to excellence.
//                     </p>
//                 </div>
//                 <div className="grid md:grid-cols-2 gap-10 p-4">
//                     <Link href="https://urest.in/">
//                         <Feature
//                             icon={<FaUsersCog />}
//                             title="MAINTAIN – Facility Management"
//                             meaning='UREST.IN manages 95+ million ft² estates across India'
//                             deliverables='Maintenance, housekeeping, security, energy & water mgmt.'
//                         />
//                     </Link>
//                     <Link href="https://www.royalnestgroup.com/">
//                         <Feature
//                             icon={<FaBuilding />}
//                             title="BUILD – Projects"
//                             meaning="Complete lifecycle of project development with green building focus"
//                             deliverables='Feasibility → Design → Construction → Handover'
//                         />
//                     </Link>
//                     <Link href="/OurInnovation">
//                         <Feature
//                             icon={<FaMicrochip />}
//                             title="ENHANCE – Estate Technology"
//                             meaning='In-house CMMS & IoT for smarter, safer buildings'
//                             deliverables='Digital PPM, asset health, helpdesk, ESG dashboards'
//                         />
//                     </Link>
//                     <Link href="/Management&advisory">
//                         <Feature
//                             icon={<FaGlobeAsia />}
//                             title="MANAGE – Estate Advisory"
//                             meaning='Comprehensive strategic & financial advisory services for asset owners'
//                             deliverables='Market analysis, leasing strategy, CAPEX/OPEX optimization'
//                         />
//                     </Link>
//                 </div>
//             </section>

//             <section className="bg-white py-10">
//                 <h2 className="text-5xl font-bold text-black mb-15 text-center">
//                     UFIRM Roadmap
//                 </h2>

//                 <div className="w-full overflow-x-auto custom-scrollbar hidden md:block">
//                     <div className="relative inline-block">
//                         <div className="min-w-[1600px] relative z-10">
//                             <div className="flex gap-10 px-10">
//                                 {roadmapSteps.map((item, idx) => (
//                                     <div key={idx} className="w-[300px] shrink-0">
//                                         {item.title && (
//                                             <span className="text-xs text-white font-bold bg-blue-500 px-2 py-1 rounded uppercase">
//                                                 {item.title}
//                                             </span>
//                                         )}
//                                         <h3 className="text-xl font-bold mt-2">{item.year}</h3>
//                                         <p className="text-gray-700 mt-2">{item.desc}</p>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="flex overflow-hidden h-[200px]">
//                                 {[...Array(10)].map((_, i) => (
//                                     <div key={i} className="relative h-full" style={{ flexShrink: 0, width: 'auto', minWidth: '200px' }}>
//                                         <Image
//                                             src="/Aboutus/skyline.webp"
//                                             alt="Skyline"
//                                             width={200}
//                                             height={200}
//                                             className="h-full object-contain"
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="w-full md:hidden max-h-[400px] overflow-y-auto">
//                     <div className="flex flex-row items-stretch h-full">
//                         <div className="w-full flex flex-col gap-6 px-4 py-4">
//                             {roadmapSteps.reverse().map((item, idx) => (
//                                 <div key={idx} className="flex items-start gap-4">
//                                     <div className="w-full">
//                                         {item.title && (
//                                             <span className="text-xs text-white font-bold bg-blue-500 px-2 py-1 rounded uppercase w-full">
//                                                 {item.title}
//                                             </span>
//                                         )}
//                                         <h3 className="text-lg font-bold mt-1">{item.year}</h3>
//                                         <p className="text-gray-700 mt-1">{item.desc}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="w-1/2 relative">
//                             <Image
//                                 src="/Aboutus/building.webp"
//                                 alt="Building"
//                                 fill
//                                 className="object-fill"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className="py-15 px-6 md:px-20 bg-white text-black">
//                 <div className="text-center mb-10">
//                     <h2 className="text-5xl font-bold text-black">{vision2030.title}</h2>
//                     <p className="text-lg mt-4 max-w-3xl mx-auto text-gray-700">{vision2030.desc}</p>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-10 p-10">
//                     {vision2030.goals.map((goal, index) => (
//                         <Vision2030Card
//                             key={index}
//                             category={goal.category}
//                             target={goal.target}
//                         />
//                     ))}
//                 </div>
//             </section>

//             <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-[#e6f3f8] via-white to-[#e6f3f8] text-black">
//                 <div className="text-center mb-12">
//                     <h2 className="text-5xl font-bold">Our Vision & Mission</h2>
//                     <p className="text-gray-700 text-lg mt-4 font-medium">We deeply care for...</p>
//                     <div className="flex justify-center gap-8 mt-2">

//                         <div className="flex flex-col items-center">
//                             <FaUsers className="text-[#146995] text-4xl mb-2" />
//                             <span className="text-sm font-semibold text-gray-600">People</span>
//                         </div>
//                         <div className="flex flex-col items-center">
//                             <FaGlobe className="text-green-600 text-4xl mb-2" />
//                             <span className="text-sm font-semibold text-gray-600">Planet</span>
//                         </div>
//                         <div className="flex flex-col items-center">
//                             <FaCoins className="text-yellow-500 text-4xl mb-2" />
//                             <span className="text-sm font-semibold text-gray-600">Profits</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mb-12 bg-white/70 p-6 rounded-xl shadow-lg">
//                     <h3 className="text-2xl font-bold mb-2" style={{ color: "#146995" }}>VISION</h3>
//                     <h4 className="text-xl font-semibold mb-3">“Manage, Maintain, Enhance Estates”</h4>
//                     <p className="text-gray-800 leading-relaxed">
//                         We manage, maintain, and enhance estates with a focus on people, process, sustainability and technology.
//                         We start by building a strong partnership with clients to ensure seamless facility management.
//                         Next, we provide comprehensive maintenance to keep everything running smoothly.
//                         Finally, we enhance each property by integrating smart solutions and green building practices
//                         to elevate its value, sustainability and performance.
//                     </p>
//                 </div>

//                 <div className="bg-white/70 p-6 rounded-xl shadow-lg">
//                     <h3 className="text-2xl font-bold mb-2" style={{ color: "#146995" }}>MISSION</h3>
//                     <h4 className="text-xl font-semibold mb-3">
//                         “On mission to manage, maintain, and enhance estates while caring for people, planet, and profits.”
//                     </h4>
//                     <p className="text-gray-800 leading-relaxed">
//                         Create value by consciously managing, maintaining, and enhancing estates.
//                         We focus on building strong client relationships, providing efficient maintenance,
//                         and improving properties through smart, sustainable solutions.
//                         By caring for People, protecting the Planet, and driving Profits, we ensure long-term success
//                         and positive impact for all our stakeholders.
//                     </p>
//                 </div>
//             </section>
//             <ClientCarousel />
//         </div>
//     );
// }

// function Feature({ icon, title, meaning, deliverables }: { icon: React.ReactNode; title: string; meaning: string; deliverables: string }) {
//     return (
//         <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
//             <div className="text-[#146995] text-5xl mb-4">{icon}</div>
//             <h3 className="text-2xl font-semibold mb-2">{title}</h3>
//             <p className="text-gray-700 mb-1"><strong>Meaning:</strong> {meaning}</p>
//             <p className="text-gray-700"><strong>Deliverables:</strong> {deliverables}</p>
//         </div>
//     );
// }





















"use client";

import React, { useEffect } from "react";
import type { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import AOS from "aos";
import "aos/dist/aos.css";
import { NavBar } from "@/components/NavBar";
import {
    FaBuilding,
    FaUsersCog,
    FaGlobeAsia,
    FaMicrochip,
    FaUsers,
    FaGlobe,
    FaCoins,
    FaChartLine,
    FaCogs,
    FaTools,
} from "react-icons/fa";

const ClientCarousel = dynamic(() => import("@/components/ClientCarousel"), {
    ssr: false,
});

// ─── Design tokens ───────────────────────────────────────────────────────────
// Navy:   #0B1F3A   — authority, dark sections
// Brand:  #146995   — UFIRM blue, accents, borders
// Sky:    #EAF4FA   — light fill sections
// White:  #FFFFFF
// Slate:  #64748B   — body text
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutusPage() {
    useEffect(() => {
        AOS.init({ duration: 900, once: true, offset: 60 });
    }, []);

    const roadmapSteps = [
        { year: "2016", title: "Incorporation", desc: "Incorporated from Royal Nest's 25-year legacy; began delivering sustainable real estate services." },
        { year: "2018", title: "Business Park Launch", desc: "Launched UFIRM Business Park, a professional co-working and flex-office space spanning 80,000+ ft²." },
        { year: "2020", title: "Urest.in IFM Launch", desc: "Established Urest.in as a dedicated Integrated Facility Management division, proving effectiveness during COVID-19 lockdowns." },
        { year: "2022", title: "Green Residential Development", desc: "Commenced 'Royal Nest Forest View' in Dharamshala – green-compliant, RERA & TCP approved residential apartments." },
        { year: "2024", title: "Tech Platform Deployment", desc: "Deployed 100% Made-in-India CMMS platform for real-time PPM, asset, inventory & workforce management." },
        { year: "2025", title: "Profitability & Growth", desc: "Achieved company-wide profitability (EBIT margin 4.03%) with 76.64% YoY revenue growth." },
    ];

    const vision2030 = {
        title: "Vision 2030",
        desc: "By 2030, UFIRM aims to be India's most trusted, tech-enabled, and sustainable real estate services company, delivering value across build, manage, maintain, and enhance verticals.",
        goals: [
            { category: "BUILD – Projects", target: "Estate development portfolio to grow by 100%." },
            { category: "Estate Advisory", target: "Manage and enable sales of real estate assets worth ₹100+ Crores." },
            { category: "Facility Management", target: "urest.in to achieve 120% revenue growth in integrated facility management and manpower outsourcing." },
            { category: "Estate Technology", target: "Launch 3 globally accessible technology and ESG tools for smarter estate construction, maintenance & management." },
        ],
    };

    const iconMap: { [key: string]: JSX.Element } = {
        "BUILD – Projects": <FaBuilding className="text-[#146995] text-2xl" />,
        "Estate Advisory": <FaChartLine className="text-[#146995] text-2xl" />,
        "Facility Management": <FaTools className="text-[#146995] text-2xl" />,
        "Estate Technology": <FaCogs className="text-[#146995] text-2xl" />,
    };

    const divisions = [
        {
            href: "https://urest.in/",
            icon: <FaUsersCog className="text-[#146995] text-3xl" />,
            label: "01",
            title: "MAINTAIN",
            subtitle: "Facility Management",
            meaning: "UREST.IN manages 95+ million ft² estates across India",
            deliverables: "Maintenance, housekeeping, security, energy & water mgmt.",
        },
        {
            href: "https://www.royalnestgroup.com/",
            icon: <FaBuilding className="text-[#146995] text-3xl" />,
            label: "02",
            title: "BUILD",
            subtitle: "Projects",
            meaning: "Complete lifecycle of project development with green building focus",
            deliverables: "Feasibility → Design → Construction → Handover",
        },
        {
            href: "https://www.firmity.in/",
            icon: <FaMicrochip className="text-[#146995] text-3xl" />,
            label: "03",
            title: "ENHANCE",
            subtitle: "Estate Technology",
            meaning: "In-house CMMS & IoT for smarter, safer buildings",
            deliverables: "Digital PPM, asset health, helpdesk, ESG dashboards",
        },
        {
            href: "/Management&advisory",
            icon: <FaGlobeAsia className="text-[#146995] text-3xl" />,
            label: "04",
            title: "MANAGE",
            subtitle: "Estate Advisory",
            meaning: "Comprehensive strategic & financial advisory services for asset owners",
            deliverables: "Market analysis, leasing strategy, CAPEX/OPEX optimization",
        },
    ];

    return (
        <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <NavBar />

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <div className="relative pt-[64px]">
                <Image
                    src="/Aboutus.webp"
                    alt="About Banner"
                    width={1600}
                    height={900}
                    priority
                    placeholder="blur"
                    blurDataURL="/Aboutus.jpg"
                    className="w-full h-[55vw] min-h-[300px] max-h-[78vh] object-cover"
                />
                {/* Dark gradient from left */}
                <div
                    className="absolute inset-0 flex items-end pb-12 sm:pb-16 px-8 sm:px-14 md:px-20"
                    style={{ background: "linear-gradient(to right, rgba(11,31,58,0.88) 0%, rgba(11,31,58,0.55) 55%, rgba(11,31,58,0.1) 100%)" }}
                >
                    {/* Vertical rule — the signature accent */}
                    <div className="flex items-stretch gap-6 sm:gap-8">
                        <div className="w-1 rounded-full self-stretch" style={{ background: "#146995", minHeight: "80px" }} />
                        <div className="text-white max-w-2xl">
                            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3 opacity-70">
                                Since 2016 · Real Estate Services
                            </p>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] mb-4 tracking-tight">
                                We Are<br />UFIRM
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90 max-w-lg">
                                Purpose-driven real estate services company committed to building, managing, maintaining, and
                                enhancing real estate for <span className="font-semibold text-white">People, Planet &amp; Profits</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── INTRO STRIP ──────────────────────────────────────────────────── */}
            <div style={{ background: "#0B1F3A" }}>
                <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
                    <p className="text-base sm:text-lg leading-relaxed text-white/80">
                        Founded in 2016 as an extension of the Royal Nest Group — with over{" "}
                        <span className="text-white font-semibold">25 years of legacy</span> and{" "}
                        <span className="text-white font-semibold">8 million sq. ft.</span> of successfully delivered
                        residential and commercial projects — Ufirm now integrates four synergistic divisions under one roof.
                    </p>
                </div>
            </div>

            {/* ── OUR DIVISIONS ────────────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-20" style={{ background: "#EAF4FA" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 sm:mb-16">
                        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#146995" }}>
                            What we do
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1F3A] leading-tight">
                            Our Divisions
                        </h2>
                        <p className="text-base sm:text-lg mt-4 max-w-2xl text-slate-600">
                            From sales to service to smart solutions — every UFIRM arm is dedicated to excellence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {divisions.map((d) => (
                            <Link href={d.href} key={d.label}>
                                <div
                                    data-aos="fade-up"
                                    className="group bg-white rounded-2xl p-6 sm:p-8 h-full flex flex-col gap-4 border border-transparent transition-all duration-300 hover:border-[#146995] hover:shadow-xl hover:-translate-y-1"
                                    style={{ borderLeft: "4px solid #146995" }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 rounded-xl" style={{ background: "#EAF4FA" }}>
                                            {d.icon}
                                        </div>
                                        <span className="text-xs font-bold tracking-widest text-slate-300">{d.label}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: "#146995" }}>
                                            {d.title}
                                        </p>
                                        <h3 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] leading-tight">{d.subtitle}</h3>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                                        <p><span className="font-semibold text-slate-700">What it means: </span>{d.meaning}</p>
                                        <p><span className="font-semibold text-slate-700">Deliverables: </span>{d.deliverables}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── UFIRM ROADMAP — UNCHANGED ────────────────────────────────────── */}
            <section className="bg-white py-10">
                <h2 className="text-5xl font-bold text-black mb-15 text-center">
                    UFIRM Roadmap
                </h2>

                <div className="w-full overflow-x-auto custom-scrollbar hidden md:block">
                    <div className="relative inline-block">
                        <div className="min-w-[1600px] relative z-10">
                            <div className="flex gap-10 px-10">
                                {roadmapSteps.map((item, idx) => (
                                    <div key={idx} className="w-[300px] shrink-0">
                                        {item.title && (
                                            <span className="text-xs text-white font-bold bg-blue-500 px-2 py-1 rounded uppercase">
                                                {item.title}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold mt-2">{item.year}</h3>
                                        <p className="text-gray-700 mt-2">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex overflow-hidden h-[200px]">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="relative h-full" style={{ flexShrink: 0, width: "auto", minWidth: "200px" }}>
                                        <Image src="/Aboutus/skyline.webp" alt="Skyline" width={200} height={200} className="h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:hidden max-h-[400px] overflow-y-auto">
                    <div className="flex flex-row items-stretch h-full">
                        <div className="w-full flex flex-col gap-6 px-4 py-4">
                            {roadmapSteps.reverse().map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="w-full">
                                        {item.title && (
                                            <span className="text-xs text-white font-bold bg-blue-500 px-2 py-1 rounded uppercase w-full">
                                                {item.title}
                                            </span>
                                        )}
                                        <h3 className="text-lg font-bold mt-1">{item.year}</h3>
                                        <p className="text-gray-700 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="w-1/2 relative">
                            <Image src="/Aboutus/building.webp" alt="Building" fill className="object-fill" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VISION 2030 ──────────────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-20" style={{ background: "#0B1F3A" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 sm:mb-16">
                        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#146995" }}>
                            Looking ahead
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                            {vision2030.title}
                        </h2>
                        <p className="text-base sm:text-lg mt-4 max-w-3xl text-white/70 leading-relaxed">
                            {vision2030.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {vision2030.goals.map((goal, index) => (
                            <div
                                key={index}
                                data-aos="fade-up"
                                data-aos-delay={index * 80}
                                className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl flex-shrink-0" style={{ background: "#EAF4FA" }}>
                                        {iconMap[goal.category]}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{goal.category}</h3>
                                </div>
                                <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                                <p className="text-sm sm:text-base text-white/70 leading-relaxed">{goal.target}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VISION & MISSION ─────────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-20 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 sm:mb-16">
                        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#146995" }}>
                            Our purpose
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B1F3A] leading-tight">
                            Our Vision &amp; Mission
                        </h2>
                        <p className="mt-4 text-slate-500 font-medium text-sm sm:text-base">We deeply care for...</p>
                        <div className="flex gap-8 mt-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#EAF4FA" }}>
                                    <FaUsers className="text-[#146995] text-lg" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">People</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#e8f5e9" }}>
                                    <FaGlobe className="text-green-600 text-lg" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Planet</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fffbeb" }}>
                                    <FaCoins className="text-yellow-500 text-lg" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Profits</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Vision card */}
                        <div
                            data-aos="fade-up"
                            className="relative overflow-hidden rounded-2xl p-8 sm:p-10"
                            style={{ background: "#EAF4FA", borderLeft: "5px solid #146995" }}
                        >
                            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#146995" }}>Vision</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] mb-4">
                                &ldquo;Manage, Maintain, Enhance Estates&rdquo;
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                We manage, maintain, and enhance estates with a focus on people, process, sustainability and
                                technology. We start by building a strong partnership with clients to ensure seamless facility
                                management. Next, we provide comprehensive maintenance to keep everything running smoothly.
                                Finally, we enhance each property by integrating smart solutions and green building practices to
                                elevate its value, sustainability and performance.
                            </p>
                        </div>

                        {/* Mission card */}
                        <div
                            data-aos="fade-up"
                            data-aos-delay="100"
                            className="relative overflow-hidden rounded-2xl p-8 sm:p-10"
                            style={{ background: "#0B1F3A", borderLeft: "5px solid #146995" }}
                        >
                            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#146995" }}>Mission</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                                &ldquo;On mission to manage, maintain, and enhance estates while caring for people, planet, and profits.&rdquo;
                            </h3>
                            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                                Create value by consciously managing, maintaining, and enhancing estates. We focus on building
                                strong client relationships, providing efficient maintenance, and improving properties through
                                smart, sustainable solutions. By caring for People, protecting the Planet, and driving Profits,
                                we ensure long-term success and positive impact for all our stakeholders.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ClientCarousel />
        </div>
    );
}