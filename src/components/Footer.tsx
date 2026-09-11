"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

const SubscribeSuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ top: "50%", left: "50%", scale: 0 }}
                                    animate={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        scale: [0, 1, 0],
                                        x: (Math.random() - 0.5) * 200,
                                        y: (Math.random() - 0.5) * 200,
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                                    className={`absolute w-2 h-2 rounded-sm ${["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500"][i % 5]
                                        }`}
                                />
                            ))}
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Check className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                        <p className="text-gray-600 mb-8">You have been subscribed to UFirm Newsletter!</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-[#1e3143] text-white font-semibold py-3 rounded-[8px] hover:bg-[#1f4e7a] transition-colors"
                        >
                            Great!
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Footer = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Demo request form state
    const [demoForm, setDemoForm] = useState({ fullName: "", phone: "", email: "" });
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                setIsSubscribed(true);
                setShowSuccessModal(true);
                setEmail("");
            } else {
                alert(data.error || "Something went wrong.");
            }
        } catch {
            alert("Error sending request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!demoForm.fullName || !demoForm.phone || !demoForm.email) {
            alert("Please fill in all fields.");
            return;
        }
        setIsDemoLoading(true);
        try {
            const response = await fetch("/api/demo-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(demoForm),
            });
            const data = await response.json();
            if (data.success) {
                alert("Demo request sent successfully! We'll contact you soon.");
                setDemoForm({ fullName: "", phone: "", email: "" });
            } else {
                alert(data.message || "Something went wrong.");
            }
        } catch {
            alert("Error sending request.");
        } finally {
            setIsDemoLoading(false);
        }
    };

    const productLinks = [
        { label: "Royal Nest Projects", href: "https://www.royalnestgroup.com/" },
        { label: "URest", href: "https://urest.in/" },
        { label: "Facility Tech", href: "/OurInnovation" },
        { label: "Real Estate Advisory", href: "/Management&advisory" },
        { label: "Firmity", href: "https://www.firmity.in" }
    ];

    const socialLinks = [
        { icon: FaInstagram, href: "https://www.instagram.com/ufirm_technologies/" },
        { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/ufirm-technologies-pvt-ltd/" },
        { icon: FaFacebookF, href: "https://www.facebook.com/ufirmtechnologies" },
        { icon: FaYoutube, href: "https://www.youtube.com/@ufirmtechnologies6437" }
    ];

    return (
        <footer className="bg-[#1e2d3d] text-white font-sans overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-12">
                <div className="flex flex-col lg:flex-row gap-2 lg:divide-x lg:divide-gray-500/50 items-stretch">

                    {/* Column 1: Our Headquarters */}
                    <div className="lg:w-1/3 lg:pr-12 flex flex-col h-full text-center lg:text-left">
                        <div className="mb-3"> {/* Height to match Title + Desc or just Title + Spacing */}
                            <h2 className="text-2xl font-semibold mb-2">Our Headquarters</h2>
                            <p className="text-xs text-gray-300 leading-relaxed max-w-[280px]">
                                H-64 Sector 63, Noida, Uttar Pradesh - 201301
                            </p>
                        </div>

                        <div className="flex-grow flex justify-center lg:justify-start">
                            <div className="w-full max-w-[420px] h-[270px] bg-gray-700 rounded-[8px] overflow-hidden mb-8 shadow-lg border border-white/10">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.7666936446317!2d77.3736843095074!3d28.627094484228977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce506ffd5bea1%3A0x722435e19d8f8354!2sUfirm%20Head%20Office!5e1!3m2!1sen!2sin!4v1768481222435!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale-[0.2] contrast-[1.1]"
                                />
                            </div>
                        </div>

                        <div className=" space-y-1 text-sm font-medium">
                            <p className="text-gray-200">+91 9289902483</p>
                            <p className="text-gray-300">support@ufirm.in</p>
                        </div>
                    </div>

                    {/* Mobile Separator */}
                    <div className="lg:hidden w-full h-px bg-gray-500/50 my-8"></div>

                    {/* Column 2: Get In Touch */}
                    <div className="lg:w-1/3 lg:px-12 flex flex-col h-full text-center lg:text-left">
                        <div className="mb-3">
                            <h2 className="text-2xl font-semibold">Get In Touch</h2>
                        </div>

                        <div className="flex-grow flex justify-center lg:justify-start">
                            <form onSubmit={handleDemoRequest} className="space-y-3 w-full max-w-[320px]">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={demoForm.fullName}
                                    onChange={(e) => setDemoForm({ ...demoForm, fullName: e.target.value })}
                                    className={cn(
                                        "w-full bg-[#aec2cc]/40 border-[0.5px] border-transparent rounded-[4px] px-4 py-3 text-[#1e3143] placeholder:text-[#1e2d3d]/60 font-medium cursor-pointer transition-all",
                                        "hover:border-blue-400/50 hover:bg-[#aec2cc]/50",
                                        "focus:bg-white focus:border-[#1e3143] focus:outline-none"
                                    )}
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={demoForm.phone}
                                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                                    className={cn(
                                        "w-full bg-[#aec2cc]/40 border-[0.5px] border-transparent rounded-[4px] px-4 py-3 text-[#1e3143] placeholder:text-[#1e2d3d]/60 font-medium cursor-pointer transition-all",
                                        "hover:border-blue-400/50 hover:bg-[#aec2cc]/50",
                                        "focus:bg-white focus:border-[#1e3143] focus:outline-none"
                                    )}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email id"
                                    value={demoForm.email}
                                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                                    className={cn(
                                        "w-full bg-[#aec2cc]/40 border-[0.5px] border-transparent rounded-[4px] px-4 py-3 text-[#1e3143] placeholder:text-[#1e2d3d]/60 font-medium cursor-pointer transition-all",
                                        "hover:border-blue-400/50 hover:bg-[#aec2cc]/50",
                                        "focus:bg-white focus:border-[#1e3143] focus:outline-none"
                                    )}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isDemoLoading}
                                    className={cn(
                                        "w-full py-4 rounded-[4px] font-bold text-sm transition-all duration-200 cursor-pointer shadow-xl",
                                        "bg-white text-[#1E3143] border-[0.5px] border-[#1E3143] shadow-[inset_0_0_0_1px_#1E3143]",
                                        "hover:bg-neutral-100 hover:shadow-inner hover:shadow-[inset_0_0_0_0.5px_#1E3143] hover:border-[#1E3143]",
                                        "active:bg-[#1484bc] active:text-white active:shadow-inner active:border-[#1484bc]",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {isDemoLoading ? "Sending..." : "Request Demo"}
                                </button>
                            </form>
                        </div>

                        <div className="mt-17 flex flex-col items-center lg:items-start gap-3">
                            <p className="text-sm font-medium text-gray-300">Connect with us on social media</p>
                            <div className="flex gap-4 justify-center lg:justify-start">
                                {socialLinks.map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "w-10 h-10 rounded-full bg-[#fafbf9]/20 flex items-center justify-center text-white transition-all border border-white/10 cursor-pointer",
                                            "hover:bg-[#fafbf9]/40",
                                            "active:shadow-inner active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                                        )}
                                    >
                                        <item.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Separator */}
                    <div className="lg:hidden w-full h-px bg-gray-500/50 my-8"></div>

                    {/* Column 3: Products & Subscribe Card */}
                    <div className="lg:w-1/3 lg:pl-12 flex flex-col h-full text-center lg:text-left">
                        <div className="mb-3">
                            <h2 className="text-2xl font-semibold">Products</h2>
                        </div>

                        <div className="flex-grow flex justify-center lg:justify-start">
                            <ul className="space-y-1 text-gray-300 font-medium w-full max-w-[340px] text-center lg:text-left">
                                {productLinks.map((link, i) => (
                                    <li key={i} className="relative group">
                                        <Link href={link.href} className="inline-flex items-center justify-center lg:justify-between w-full group transition-all duration-300">
                                            <span>{link.label}</span>
                                            <ArrowRight
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0"
                                                size={16}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-8 flex flex-col justify-end items-center lg:items-start h-[auto] min-h-[120px]">
                            <div className="relative group max-w-[300px] w-full">
                                <div className="absolute -inset-[1px] bg-blue-500/50 rounded-[8px] blur-[8px] opacity-70 group-hover:opacity-100 transition-opacity" />

                                <div className="relative bg-[#1e2d3d] border border-blue-400/30 rounded-[8px] p-4 shadow-2xl">
                                    <h3 className="text-sm font-bold mb-2">Stay Updated with property insights</h3>
                                    <p className="text-xs text-gray-400 mb-2 leading-snug">
                                        Subscribe to get the latest news and market insights delivered to your inbox
                                    </p>

                                    <form onSubmit={handleSubscribe} className="space-y-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                            className={cn(
                                                "w-full bg-[#aec2cc]/40 border-[0.5px] border-transparent rounded-[4px] px-4 py-3 text-[#1e3143] placeholder:text-[#1e2d3d]/60 font-medium cursor-pointer transition-all",
                                                "hover:border-blue-400/50 hover:bg-[#aec2cc]/50",
                                                "focus:bg-white focus:border-[#1e3143] focus:outline-none"
                                            )}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || isSubscribed}
                                            className={cn(
                                                "w-full py-3 rounded-[8px] font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center",
                                                "bg-[#006990] text-[#fafbf9]",
                                                "hover:bg-[#1f4e7a] hover:shadow-inner hover:shadow-[inset_0_0_0_0.2px_#1e3143]",
                                                "active:bg-[#1484bc] active:shadow-inner active:shadow-[inset_0_0_0_0.2px_#1e3143]",
                                                "disabled:bg-gray-600"
                                            )}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSubscribed ? "Subscribed!" : "Subscribe")}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Legal Bar */}
            <div className="bg-white py-6">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-5 flex-shrink-0">
                        {/* h-9 matches the navbar's Contact Us button height,
                            same reasoning as NavBar.tsx's logo. */}
                        <div className="h-9 w-auto flex items-center overflow-hidden">
                            <Image
                                src="/logos/Ufirm Logo Trimmed.png"
                                alt="UFIRM ESTATES"
                                width={100}
                                height={36}
                                className="h-9 w-auto object-contain cursor-pointer"
                                onClick={() => router.push("/")}
                            />
                        </div>
                        {/* <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e3143] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1f4e7a] active:bg-[#1484bc] transition-colors duration-200 whitespace-nowrap"
                        >
                            Portal Login
                        </Link> */}
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 text-gray-700">
                        <div className="flex flex-wrap justify-center gap-x-2 text-sm font-medium">
                            <Link href="/SecurityPolicyPage" className="hover:text-blue-600">Security Policy</Link>
                            <span className="text-gray-400">|</span>
                            <Link href="/PrivacyPolicypage" className="hover:text-blue-600">Privacy Policy</Link>
                            <span className="text-gray-400">|</span>
                            <Link href="/Sitepage" className="hover:text-blue-600">Site Map</Link>
                            <span className="text-gray-400">|</span>
                            <Link href="/TermsofUsePage" className="hover:text-blue-600">Terms of use</Link>
                            <span className="text-gray-400">|</span>
                            <Link href="/CareersPage/admin" className="hover:text-blue-600">Manage</Link>
                        </div>

                        <p className="text-xs font-semibold text-gray-500">
                            Copyright @ 2026 UFirm Tech Pvt. Ltd. All rights reserved
                        </p>
                    </div>
                </div>
            </div>

            <SubscribeSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
            />
        </footer>
    );
};

export default Footer;
