"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, MenuItem } from "./ui/NavBar";
import { NavButton } from "./ui/NavButton";
import { cn } from "@/utils/cn";
import { useLoginDialog } from "./LoginDialogContext";
import { Compass } from "lucide-react";
import {
    Menu as MenuIcon,
    X as CloseIcon,
    Info,
    Building2,
    Home,
    Cpu,
    Wrench,
    Briefcase,
    UserPlus,
    Phone,
    User,
    ClipboardList, // New icon for Facility Management
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function NavBar() {
    const [active, setActive] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    // Mobile State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const router = useRouter();

    const { openLogin } = useLoginDialog();
    const servicesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
                setIsServicesOpen(false);
                setActive(null);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Push/Shrink Effect for Main Content
    useEffect(() => {
        const main = document.querySelector("main");

        if (isMobileMenuOpen) {
            if (main) {
                main.style.transition = "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.5s ease, opacity 0.5s ease";
                main.style.transform = "scale(0.93) translateX(-10%)"; // Push to left and shrink
                main.style.borderRadius = "20px";
                main.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                main.style.overflow = "hidden"; // Clip content to rounded corners
            }
        } else {
            if (main) {
                main.style.transform = "none";
                main.style.borderRadius = "0";
                main.style.boxShadow = "none";
                main.style.overflow = "visible";
            }
        }

        return () => {
            // Cleanup
            if (main) {
                main.style.transform = "none";
                main.style.borderRadius = "0";
                main.style.boxShadow = "none";
                main.style.overflow = "visible";
            }
        };
    }, [isMobileMenuOpen]);


    // Mobile Menu Links Data
    const mobileLinks = [
        // { label: "Hire", href: "/CareerPage", icon: UserPlus }, // old careers page — replaced by /CareersPage below
        { label: "Hire", href: "/CareersPage", icon: UserPlus },
        // Changed icon to ClipboardList for "Facility Management"
        { label: "Facility Management", href: "https://urest.in/", icon: ClipboardList },
        { label: "Royal Nest Projects", href: "https://www.royalnestgroup.com/", icon: Home },
        { label: "Facility Tech", href: "/OurInnovation", icon: Cpu },
        { label: "Technical Services", href: "/TechnologiesPage", icon: Wrench },
        { label: "Real Estate Advisory", href: "/Management&advisory", icon: Briefcase },
        { label: "About Us", href: "/Aboutuspage", icon: Info },
        // { label: "Track Complaints", href: "https://admin.urest.in:8092/", icon: Compass },
        // Removed Contact Us from here to treat it specially
    ];

    // Matches desktop LoginDialog icons: Building2, User, Briefcase
    const mobileLoginLinks = [
        { label: "Client Login", href: "https://account.ufirm.in/Account/Login", icon: Building2 },
        { label: "Employee Login", href: "https://admin.urest.in:8084/", icon: User },
        { label: "Facility Manager Login", href: "https://account.ufirm.in/Account/Login", icon: Briefcase },
        { label: "Track Complaints", href: "https://admin.urest.in:8092/", icon: Compass }, // Added to mobile menu
    ];

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 z-40 w-full transition-shadow duration-200",
                isScrolled && "shadow-md"
            )}
        >
            <div className="relative z-50 bg-white">
                <Menu
                    logo={
                        // h-9 matches the Contact Us button's own height
                        // (py-2 + text-sm ≈ 36px) so the top of the logo
                        // lines up with the top of that button.
                        <div className="h-9 w-auto flex items-center overflow-hidden">
                            <Image
                                src="/logos/Ufirm Logo Trimmed.png"
                                alt="UFirm Estates"
                                width={100}
                                height={36}
                                className="cursor-pointer h-9 w-auto object-contain"
                                onClick={() => router.push("/")}
                            />
                        </div>
                    }
                    actions={
                        <>
                            <div className="hidden lg:flex items-center space-x-3">
                                <NavButton
                                    variant="primary"
                                    className="cursor-pointer mr-3"
                                    onClick={() => window.open("https://ufirm.in/ContactPage", "_blank", "noopener,noreferrer")}
                                >
                                    Contact us
                                </NavButton>
                                <NavButton
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={openLogin}
                                >
                                    Login
                                </NavButton>
                            </div>

                            {/* Mobile Hamburger Trigger */}
                            <button
                                className={cn(
                                    "lg:hidden p-2 rounded-md transition-colors",
                                    "hover:bg-gray-100 active:bg-gray-200"
                                )}
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <MenuIcon className="h-6 w-6 text-[#131720]" />
                            </button>
                        </>
                    }
                >
                    <div className="hidden lg:flex items-center space-x-10">
                        <div
                            className="relative"
                            ref={servicesRef}
                            onClick={() => setIsServicesOpen(!isServicesOpen)}
                        >
                            <MenuItem
                                setActive={setActive}
                                active={active}
                                item="Services"
                            // No href to avoid jumping
                            />
                        </div>

                        <MenuItem
                            setActive={setActive}
                            active={active}
                            item="About us"
                            href="/Aboutuspage"
                        />
                        {/* <MenuItem
                            setActive={setActive}
                            active={active}
                            item="Hire"
                            href="https://ufirm.in/CareerPage"
                        /> */}
                        <MenuItem
                            setActive={setActive}
                            active={active}
                            item="Hire"
                            href="/CareersPage"
                        />
                        {/* Removed Track Complaints from desktop menu */}
                    </div>
                </Menu>
            </div>

            {/* Desktop Dropdown */}
            <div className="hidden lg:block">
                {isServicesOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/20 z-30"
                            style={{ top: '64px' }}
                            onClick={() => setIsServicesOpen(false)}
                        />
                        <div
                            className="fixed left-0 w-screen bg-white shadow-xl border-b border-gray-100 z-40 flex flex-col items-start"
                            style={{ top: '64px', height: 'auto' }}
                            onMouseLeave={() => setIsServicesOpen(false)}
                        >
                            <div className="w-full flex flex-col py-4 gap-4">
                                <div
                                    className="w-full group hover:bg-[#F0F3F5] active:bg-[#aec2cc] transition-colors cursor-pointer border-b border-transparent"
                                    onClick={() => {
                                        setIsServicesOpen(false);
                                        setActive(null);
                                        window.location.href = "https://urest.in/";
                                    }}
                                >
                                    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-4 flex flex-col">
                                        <h3 className="text-[#131720] font-semibold text-sm mb-1">
                                            Integrated Facility Management
                                        </h3>
                                        <p className="text-[#1f4e7a] group-hover:text-[#131720] group-active:text-[#131720] text-xs font-medium">Urest</p>
                                    </div>
                                </div>
                                <div
                                    className="w-full group hover:bg-[#F0F3F5] active:bg-[#aec2cc] transition-colors cursor-pointer border-b border-transparent"
                                    onClick={() => {
                                        setIsServicesOpen(false);
                                        setActive(null);
                                        router.push("/OurInnovation");
                                    }}
                                >
                                    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-4 flex flex-col">
                                        <h3 className="text-[#131720] font-semibold text-sm mb-1">
                                            CMMS and Facility Tech
                                        </h3>
                                        <p className="text-[#1f4e7a] group-hover:text-[#131720] group-active:text-[#131720] text-xs font-medium">Firmity</p>
                                    </div>
                                </div>
                                <div
                                    className="w-full group hover:bg-[#F0F3F5] active:bg-[#aec2cc] transition-colors cursor-pointer"
                                    onClick={() => {
                                        setIsServicesOpen(false);
                                        setActive(null);
                                        window.location.href = "https://www.royalnestgroup.com/";
                                    }}
                                >
                                    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-4 flex flex-col">
                                        <h3 className="text-[#131720] font-semibold text-sm mb-1">
                                            Infrastructure Development
                                        </h3>
                                        <p className="text-[#1f4e7a] group-hover:text-[#131720] group-active:text-[#131720] text-xs font-medium">Royal Nest Group</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            // Sidebar Background: Neutral Light (#fafbf9 or white), Text: Primary (#1e3143)
                            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-[#fafbf9] backdrop-blur-xl z-[70] shadow-2xl lg:hidden overflow-y-auto border-l border-white/20"
                        >
                            <div className="p-5 flex flex-col h-full relative">
                                {/* Fancy Close Button Positioned absolutely */}
                                <div className="absolute top-5 right-5 z-10">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-[#1e3143] hover:rotate-90 hover:scale-105 active:scale-95 transition-all duration-300"
                                        aria-label="Close menu"
                                    >
                                        <CloseIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Spacer */}
                                <div className="h-12"></div>

                                <div className="flex-1 flex flex-col gap-4">
                                    {/* Login Card - Background: Primary (#1e3143), Text: Neutral (#fafbf9) */}
                                    <div className="bg-[#1e3143] rounded-2xl p-4 shadow-md">
                                        <h3 className="text-base font-semibold text-[#fafbf9] mb-3 px-1">Login</h3>
                                        <div className="h-px w-full bg-[#fafbf9]/20 mb-2"></div>
                                        <div className="space-y-1">
                                            {mobileLoginLinks.map((link) => (
                                                <Link
                                                    key={link.label}
                                                    href={link.href}
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#fafbf9]/10 active:bg-[#fafbf9]/20 group transition-all duration-200"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {/* Icon container */}
                                                    <div className="p-1.5 bg-[#fafbf9]/10 rounded-full group-hover:bg-[#fafbf9]/20 transition-colors">
                                                        <link.icon className="h-4 w-4 text-[#fafbf9]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-[#fafbf9]">{link.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Links */}
                                    <div className="flex flex-col gap-1">
                                        <h3 className="px-2 text-xs font-semibold text-[#1e3143]/60 uppercase tracking-wider mb-1">Menu</h3>
                                        {mobileLinks.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                // Sidebar Text: Primary (#1e3143) - Changed font-bold/semibold to font-medium/normal as requested
                                                className={cn(
                                                    "flex items-center space-x-3 p-2.5 rounded-xl transition-all duration-200",
                                                    "text-[#1e3143] hover:bg-white hover:shadow-sm hover:shadow-gray-200/50",
                                                    "active:scale-[0.98] active:bg-gray-100/50"
                                                )}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <link.icon className="h-5 w-5 text-[#1e3143]" />
                                                <span className="text-[15px] font-medium">{link.label}</span>
                                            </Link>
                                        ))}

                                        {/* Primary Contact Us CTA */}
                                        <div className="pt-2 px-1">
                                            <NavButton
                                                variant="primary"
                                                className="w-full flex justify-center items-center gap-2 py-3 shadow-md"
                                                onClick={() => window.open("https://ufirm.in/ContactPage", "_blank", "noopener,noreferrer")}
                                            >
                                                <Phone className="h-4 w-4" />
                                                Contact Us
                                            </NavButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
