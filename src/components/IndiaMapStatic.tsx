"use client";

import React, { useState } from "react";
import Image from "next/image";

// Types
type Marker = {
    name: string;
    description: string;
    Representative: string;
    Number: string;
    MailId: string;
    top: string;
    left: string;
};

type NCRChild = Omit<Marker, "top" | "left">;

type NCRGroupType = {
    name: string;
    top: string;
    left: string;
    children: NCRChild[];
};

type MarkerOrNCR = Marker | NCRGroupType;

// NCR Group
const ncrGroup: NCRGroupType = {
    name: "Delhi NCR",
    top: "35.6%",
    left: "32%",
    children: [
        {
            name: "Delhi",
            description: "A-13/S-1, Dilshad Garde, Delhi-110095",
            Representative: "Shalini Malik",
            Number: "+91 9289902481",
            MailId: "support@ufirm.in",
        },
        {
            name: "Noida",
            description:
                "H-64, Sector 63, Noida, Gautam Buddha Nagar, Uttar Pradesh- 201307",
            Representative: "Shalini Malik",
            Number: "+91 9289902481",
            MailId: "support@ufirm.in",
        },
        {
            name: "Faridabad",
            description:
                "Flat No. 0106, Tower T-10, RPS Savana Sector-88, Faridabad Haryana- 121002",
            Representative: "Pankaj Kumar",
            Number: "+91 9069363166",
            MailId: "pankaj.kumar@ufirm.in",
        },
        {
            name: "Gurugram",
            description: "C3 102 PWO Housing Complex Sector-43 Gurugram",
            Representative: "Ajay Yadav",
            Number: "+91 9958453389",
            MailId: "ajay.yadav@ufirm.in",
        },
    ],
};

// Regular markers
const markers: Marker[] = [
    {
        name: "Srinagar",
        description: "Zabarwan Colony brain, Srinagar, Jammu and Kashmir- 191121",
        Representative: "Jigyasa",
        Number: "+91 9289902483",
        MailId: "crm.ho@ufirm.in",
        top: "19%",
        left: "24%",
    },
    {
        name: "Jammu",
        description:
            "Royal Nest Hill View Sector-D, Sainik Colony Estn. Chowadhi, Near Ansal Grace Jammu-180011",
        Representative: "Jaswinder Kour",
        Number: "+91 9596796757",
        MailId: "crm@ufirm.in",
        top: "22%",
        left: "25.8%",
    },
    {
        name: "Dharamshala",
        description:
            "677Q+94M, Chakban Gharo, dharamshala, Himachal Pradesh 176217",
        Representative: "Nandini Singh",
        Number: "+91 9958288544",
        MailId: "crm@ufirm.in",
        top: "25%",
        left: "34%",
    },
    {
        name: "Dehradun",
        description:
            "Chakrata road SELAQUI INDUSTRIAL AREA central hope town Dehradun Uttarakhand-248011",
        Representative: "Mohan Negi",
        Number: "+91 7042344158",
        MailId: "mohan.negi@ufirm.in",
        top: "31%",
        left: "39%",
    },
    {
        name: "Jaipur",
        description:
            "C-163, Riico Residential Colony, Near Git, College Sitapura, Jaipur-302022",
        Representative: "Sachin Sharma",
        Number: "+91 9319101871",
        MailId: "sachin.sharma@ufirm.in",
        top: "37%",
        left: "26%",
    },
    {
        name: "Udaipur",
        description:
            "88 Charak Hostal Raza Colony, Mulla Talai, Udaipur-313001",
        Representative: "Nandini Singh",
        Number: "+91 9958288544",
        MailId: "crm@ufirm.in",
        top: "41%",
        left: "20%",
    },
    {
        name: "Ahmedabad",
        description:
            "Shop No.15, Manukrupa Plaza,Sanand, Ta-Sanand, Ahmedabad-382110",
        Representative: "Jigyasa",
        Number: "+91 9289902483",
        MailId: "crm.ho@ufirm.in",
        top: "52%",
        left: "12%",
    },
    {
        name: "Pune",
        description:
            "GAT NO. 354, A&B, NH-4, Old Mumbai - Pune Hwy, Maval, Vadgaon, Pune, Maharashtra-412106",
        Representative: "Sachin Sharma",
        Number: "+91 9319101871",
        MailId: "sachin.sharma@ufirm.in",
        top: "65%",
        left: "20%",
    },
    {
        name: "Hyderabad",
        description:
            "1-2 361/15, Phool Begh, Hemayathnagar, Indera Park, Hyderabad, Telangana - 500029",
        Representative: "Kishore Reddy",
        Number: "+91 9849203269",
        MailId: "kishore.reddy@ufirm.in",
        top: "66%",
        left: "37.6%",
    },
    {
        name: "Kolkata",
        description:
            "Purba Panchanna Gram, Abahani Club, Vip Nagar, Sub District South 21 Parganas, West Bengal-700100",
        Representative: "Ranadhir Biswas",
        Number: "+91 9903522839",
        MailId: "ranadhir.biswas@ufirm.in",
        top: "52%",
        left: "66%",
    },
];

// Component
export default function IndiaMapStatic() {
    const [activeMarker, setActiveMarker] = useState<number | null>(null);
    const [selectedNCR, setSelectedNCR] = useState(0);
    const [ncrActive, setNcrActive] = useState(false);

    const showSidebar = activeMarker !== null || ncrActive;

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            <div className="flex flex-wrap md:flex-nowrap gap-4 transition-all duration-500">
                <div className={`${showSidebar ? "md:w-2/3" : "w-full"} relative`}>
                    <Image
                        src="/ufirm india map.webp"
                        alt="India Map"
                        width={1500}
                        height={1800}
                        className="w-full h-full object-contain"
                        priority
                    />
                    {[...markers, ncrGroup].map((marker: MarkerOrNCR, index) => {
                        const isNCR = marker.name === "Delhi NCR";

                        return (
                            <div
                                key={marker.name}
                                role="button"
                                aria-label={`Marker for ${marker.name}`}
                                tabIndex={0}
                                className="absolute"
                                style={{
                                    top: marker.top,
                                    left: marker.left,
                                    transform: "translate(-50%, -100%)",
                                }}
                                onClick={() => {
                                    setActiveMarker(isNCR ? null : index);
                                    setNcrActive(isNCR);
                                    setSelectedNCR(0);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`${isNCR ? "w-8 h-8 text-blue-800" : "w-6 h-6 text-blue-600"} hover:scale-110 transition-transform duration-200`}
                                    fill="currentColor"
                                    viewBox="0 0 384 512"
                                >
                                    <path d="M168 0C75.2 0 0 75.2 0 168c0 87.5 130.4 222.4 154.7 245.5 7.2 6.8 18.4 6.8 25.6 0C217.6 390.4 348 255.5 348 168 348 75.2 272.8 0 168 0zm0 240c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z" />
                                </svg>
                            </div>
                        );
                    })}
                </div>

                {showSidebar && (
                    <div className="w-full md:w-2/3 bg-white rounded-lg shadow-lg border p-5 h-fit relative">
                        <button
                            onClick={() => {
                                setActiveMarker(null);
                                setNcrActive(false);
                            }}
                            className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                            aria-label="Close panel"
                        >
                            ×
                        </button>

                        {ncrActive ? (
                            <>
                                <label
                                    htmlFor="ncr-region-select"
                                    className="block text-sm font-semibold mb-2"
                                >
                                    Select Region:
                                </label>
                                <select
                                    id="ncr-region-select"
                                    value={selectedNCR}
                                    onChange={(e) => setSelectedNCR(Number(e.target.value))}
                                    className="mb-4 border rounded px-2 py-1 w-full"
                                >
                                    {ncrGroup.children.map((child, i) => (
                                        <option key={i} value={i}>
                                            {child.name}
                                        </option>
                                    ))}
                                </select>

                                {Object.entries(ncrGroup.children[selectedNCR]).map(([key, val]) => (
                                    <p key={key} className="text-sm mb-1">
                                        <strong>{key}:</strong> {val}
                                    </p>
                                ))}
                            </>
                        ) : (
                            activeMarker !== null && (
                                <>
                                    {Object.entries(markers[activeMarker]).map(([key, val]) =>
                                        key !== "top" && key !== "left" ? (
                                            <p key={key} className="text-sm mb-1">
                                                <strong>{key}:</strong> {val}
                                            </p>
                                        ) : null
                                    )}
                                </>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
