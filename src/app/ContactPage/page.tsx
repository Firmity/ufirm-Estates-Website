"use client";

import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { useState, useRef, useEffect } from "react";
import { FaLinkedin, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { HamburgerMenu } from "@/components/Hamburger";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const markers = [
    {
        name: "Noida",
        region: "North",
        address: "H-64, Sector-63, Noida, Gautam Buddha Nagar, Uttar Pradesh- 201307",
        representative: "Shalini Malik",
        phone: "+91 9289902481",
        email: "support@ufirm.in",
        mapQuery: "Ufirm+Business+Park+(Raamah+Projects)",
    },
    {
        name: "Delhi",
        region: "North",
        address: "A-13/S-1, Dilshad Garde, Delhi- 110095",
        representative: "Shalini Malik",
        phone: "+91 9289902481",
        email: "support@ufirm.in",
        mapQuery: "a,+789%2F1%2F3,+Street+No.13,+Mandoli+Extension,+Mandoli,+Delhi,+110093",
    },
    {
        name: "Faridabad",
        region: "North",
        address: "Flat No.0106, Tower T-10, RPS Savana Sector-88, Faridabad Haryana-121002",
        representative: "Pankaj Kumar",
        phone: "+91 9069363166",
        email: "pankaj.kumar@ufirm.in",
        mapQuery: "RPS+Savana",
    },
    {
        name: "Jammu",
        region: "North",
        address: "Royal Nest Hill View Sector-D, Sainik Colony Estn. Chowadhi, Near Ansal Grace Jammu-180011",
        representative: "Jaswinder Kour",
        phone: "+91 9596796757",
        email: "crm@ufirm.in",
        mapQuery: "Royal+Nest+Hill+View+Jammu",
    },
    {
        name: "Gurgaon",
        region: "North",
        address: "C3 102 PWO Housing Complex, Sector-43 Gurugram",
        representative: "Ajay Yadav",
        phone: "+91 9958453389",
        email: "ajay.yadav@ufirm.in",
        mapQuery: "PWO+Apartments",
    },
    {
        name: "West Bengal",
        region: "East",
        address: "Purba Panchanna Gram, Abahani Club, Vip Nagar, Sub District South 21 Parganas, West Bengal-700100",
        representative: "Ranadhir Biswas",
        phone: "+91 9903522839",
        email: "ranadhir.biswas@ufirm.in",
        mapQuery: "Purba+panchanna+gram",
    },
    {
        name: "Udaipur",
        region: "West",
        address: "88 Charak Hostal Raza Colony, Mulla Talai, Udaipur-313001",
        representative: "Nandini Singh",
        phone: "+91 9958288544",
        email: "crm@ufirm.in",
        mapQuery: "88+Charak+Hostel+Raza+Colony+Mulla+Talai+Udaipur+313001",
    },
    {
        name: "Telangana",
        region: "South",
        address: "1-2 361/15, Phool Begh, Hemayat nager, Indira Park, Hyderabad, Telangana-500029",
        representative: "Kishore Reddy",
        phone: "+91 9849203269",
        email: "kishore.reddy@ufirm.in",
        mapQuery: "Hemayat+nager",
    },
    {
        name: "Jaipur",
        region: "West",
        address: "C-163, Riico Residential Colony, Near Git, College Sitapura , Jaipur-302022",
        representative: "Sachin Sharma",
        phone: "+91 9319101871",
        email: "sachin.sharma@ufirm.in",
        mapQuery: "Riico+residential+colony,+sitapura",
    },
    {
        name: "Pune",
        region: "West",
        address: "GAT NO. 354, A&B, NH-4, Old Mumbai - Pune Hwy, Maval, Vadgaon, Pune, Maharashtra 412106",
        representative: "Sachin Sharma",
        phone: "+91 9319101871",
        email: "sachin.sharma@ufirm.in",
        mapQuery: "GAT+NO.+354,+A%26B,+NH-4,+Old+Mumbai+-+Pune+Hwy,+Maval,+Vadgaon,+Pune,+Maharashtra%C2%A0412106",
    },
    {
        name: "Dehradun",
        region: "North",
        address: "Chakrata road SELAQUI INDUSTRIAL AREA central hope town Dehradun Uttarakhand- 248011",
        representative: "Mohan Negi",
        phone: "+91 7042344158",
        email: "mohan.negi@ufirm.in",
        mapQuery: "Selakui,+Uttarakhand",
    },
    {
        name: "Ahmedabad",
        region: "West",
        address: "Shop No.15, Manukrupa Plaza,Sanand, Ta-Sanand, Ahmedabad-382110",
        representative: "Jigyasa",
        phone: "+91 9289902483",
        email: "crm.ho@ufirm.in",
        mapQuery: "Sanand,+Gujarat+382110",
    },
    {
        name: "Dharamshala",
        region: "North",
        address: "677Q+94M, Chakban Gharo, dharamshala, Himachal Pradesh-176217",
        representative: "Nandini Singh",
        phone: "+91 9958288544",
        email: "crm@ufirm.in",
        mapQuery: "Royal+Nest+Forest+View",
    },
    {
        name: "Srinagar",
        region: "North",
        address: "Zabarwan Colony brain, Srinagar, Jammu and Kashmir- 191121",
        representative: "Jigyasa",
        phone: "+91 9289902483",
        email: "crm.ho@ufirm.in",
        mapQuery: "Zabarwan+Peaks+Villa",
    },
];

// 👇 Extract all unique regions
const regions = [...new Set(markers.map((m) => m.region))];

export default function Contact() {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [, setIsVerified] = useState(false);

    // NEXT_PUBLIC_* vars are inlined at build time. If this deployment's build
    // env didn't set it, rendering <ReCAPTCHA sitekey={undefined}> throws
    // synchronously on mount ("Missing required parameters: sitekey"), which
    // crashes the whole page. Guard instead of trusting it's always present.
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    useEffect(() => {
        if (!recaptchaSiteKey) {
            console.error("[CONFIG_MISSING] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set for this build — reCAPTCHA widget disabled.");
        }
    }, [recaptchaSiteKey]);

    const [selectedRegion, setSelectedRegion] = useState("North");
    const filteredMarkers = markers.filter((m) => m.region === selectedRegion);
    const [selectedLocation, setSelectedLocation] = useState(filteredMarkers[0]);

    const [form, setForm] = useState({
        name: "", email: "", phone: "", category: "", message: "", receiveComm: true
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (type === 'checkbox' && 'checked' in e.target) ? (e.target as HTMLInputElement).checked : undefined;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await response.json();
        if (data.success) {
            alert("Your message has been sent!");
            setForm({ name: "", email: "", phone: "", category: "", message: "", receiveComm: true });
        } else {
            alert("Something went wrong. Please try again.");
        }
    };

    const handleCaptchaSubmission = async (token: string | null) => {
        if (token) {
            await fetch("/api", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            setIsVerified(true);
        } else {
            setIsVerified(false);
        }
    };

    return (
        <div>
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
            <div className="min-h-screen  flex justify-center items-center relative">
                <div className="absolute right-0 bottom-0 w-full h-full">
                    <Image
                        src="/Contact.webp"
                        alt="Handshake"
                        layout="fill"
                        objectFit="cover"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg z-10 mt-40 mb-20 text-black">
                    <h2 className="text-2xl font-bold mb-2 ">Connect with us today</h2>
                    <p className="mb-6">Fill out the form below to get started</p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input name="name" onChange={handleChange} value={form.name} type="text" placeholder="Full name" className="w-full border px-4 py-2 rounded-md text-black" />
                        <input name="email" onChange={handleChange} value={form.email} type="email" placeholder="Email address" className="w-full border px-4 py-2 rounded-md" />
                        <input name="phone" onChange={handleChange} value={form.phone} type="tel" placeholder="Mobile Number" className="w-full border px-4 py-2 rounded-md" />

                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            id="category"
                            name="category"
                            onChange={handleChange}
                            value={form.category}
                            className="w-full border px-4 py-2 rounded-md"
                        >
                            <option value="">Select category</option>
                            <option value="support">Support</option>
                            <option value="sales">Sales</option>
                            <option value="feedback">Feedback</option>
                        </select>

                        <textarea name="message" onChange={handleChange} value={form.message} placeholder="How can we help you?" className="w-full border px-4 py-2 rounded-md h-24" />

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="receiveComm"
                                name="receiveComm"
                                checked={form.receiveComm}
                                onChange={handleChange}
                                title="Receive communications from SILA"
                            />
                            <label htmlFor="receiveComm">I would like to receive communications from UFIRM</label>
                        </div>

                        <div className="w-fit h-[78px]  flex items-center justify-center rounded-md">
                            <span className="text-sm text-gray-500">
                                {recaptchaSiteKey ? (
                                    <ErrorBoundary tag="[RECAPTCHA_WIDGET]">
                                        <ReCAPTCHA
                                            sitekey={recaptchaSiteKey}
                                            ref={recaptchaRef}
                                            onChange={handleCaptchaSubmission}
                                            onExpired={() => setIsVerified(false)}
                                        />
                                    </ErrorBoundary>
                                ) : null}
                            </span>
                        </div>
                        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white w-full py-2 rounded-md font-medium">
                            Request a callback
                        </button>
                    </form>

                    <div className="mt-10">
                        <h3 className="text-lg font-semibold mb-4">Connect with us on Social</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/ufirm_technologies/" target="_blank" rel="noopener noreferrer" title="Instagram">
                                <FaInstagram className="w-7 h-7 text-black hover:text-gray-600 transition-colors" />
                            </a>
                            <a href="https://www.linkedin.com/company/ufirm-technologies-pvt-ltd/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <FaLinkedin className="w-7 h-7 text-black hover:text-gray-600 transition-colors" />
                            </a>
                            <a href="https://www.youtube.com/@ufirmtechnologies6437" target="_blank" rel="noopener noreferrer" title="YouTube">
                                <FaYoutube className="w-7 h-7 text-black hover:text-gray-600 transition-colors" />
                            </a>
                            <a href="https://www.facebook.com/ufirmtechnologies" target="_blank" rel="noopener noreferrer" title="Facebook">
                                <FaFacebook className="w-7 h-7 text-black hover:text-gray-600 transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Region Filter */}
            <div className="flex justify-center flex-wrap gap-3 mt-10 mb-4 z-10 relative">
                {regions.map((region) => (
                    <button
                        key={region}
                        onClick={() => {
                            const regionMarkers = markers.filter(m => m.region === region);
                            setSelectedRegion(region);
                            setSelectedLocation(regionMarkers[0]);
                        }}
                        className={`px-4 py-2 rounded-full font-medium border ${region === selectedRegion ? "bg-yellow-500 text-white" : "bg-white text-black"}`}
                    >
                        {region} India
                    </button>
                ))}
            </div>

            {/* Map + Branch Info */}
            <div className="flex flex-col lg:flex-row w-full mb-10">
                <div className="w-full lg:w-1/2 h-[300px] lg:h-[80vh]">
                    <iframe
                        title="Google Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${selectedLocation.mapQuery}&output=embed`}
                    />
                </div>

                <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto max-h-[400px] lg:max-h-[80vh]">
                    <h2 className="text-xl lg:text-2xl font-bold mb-4">Our Branches</h2>
                    <ul className="space-y-4">
                        {filteredMarkers.map((location, idx) => (
                            <li
                                key={idx}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedLocation.name === location.name
                                    ? 'bg-yellow-100 border-yellow-400'
                                    : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedLocation(location)}
                            >
                                <h3 className="font-semibold text-base lg:text-lg">{location.name}</h3>
                                <p className="text-sm text-gray-700 mb-1">{location.address}</p>
                                <p className="text-sm"><strong>Representative:</strong> {location.representative}</p>
                                <p className="text-sm"><strong>Phone:</strong> {location.phone}</p>
                                <p className="text-sm"><strong>Email:</strong> {location.email}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}