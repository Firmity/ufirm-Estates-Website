'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutUs = () => {
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  interface Location {
    id: number;
    name: string;
    top: string;
    left: string;
    address: string;
    rep: string;
    phone: string;
    email: string;
    cities?: { name: string; description: string; rep: string; phone: string; email: string }[];
  }

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Location data with coordinates (as percentages of map container)
  const locations = [
    {
      id: 1,
      name: 'Srinagar',
      top: '12%',
      left: '24%',
      address: 'Zabarwan Colony brain, Srinagar, Jammu and Kashmir- 191121',
      rep: 'Jigyasa',
      phone: '+91 9289902483',
      email: 'crm.ho@ufirm.in'
    },
    {
      id: 2,
      name: 'Jammu',
      top: '16%',
      left: '23%',
      address: 'Royal Nest Hill View Sector-D, Sainik Colony Estn. Chowadhi, Near Ansal Grace Jammu-180011',
      rep: 'Jaswinder Kour',
      phone: '+91 9596796757',
      email: 'crm@ufirm.in'
    },
    {
      id: 3,
      name: 'Dharamshala',
      top: '18%',
      left: '30%',
      address: '677Q+94M, Chakban Gharo, dharamshala, Himachal Pradesh 176217',
      rep: 'Nandini Singh',
      phone: '+91 9958288544',
      email: 'crm@ufirm.in'
    },
    {
      id: 4,
      name: 'Dehradun',
      top: '26%',
      left: '33%',
      address: 'Chakrata Road, Selaqui Industrial Area, Central Hope Town, Dehradun, Uttarakhand - 248011',
      rep: 'Mohan Negi',
      phone: '+91 704 234 4158',
      email: 'mohan.negi@ufirm.in'
    },
    {
      id: 5,
      name: 'Delhi',
      top: '30%',
      left: '30.5%',
      address: 'A-13/S-1, Dilshad Garde, Delhi-110095',
      rep: 'Shalini Malik',
      phone: '+91 9289902481',
      email: 'support@ufirm.in',
      cities: [
        { name: 'Delhi', description: 'A-13/S-1, Dilshad Garde, Delhi-110095', rep: 'Shalini Malik', phone: '+91 9289902481', email: 'support@ufirm.in' },
        { name: 'Noida Head Office', description: 'H-64, Sector 63, Noida, Gautam Buddha Nagar, Uttar Pradesh- 201307', rep: 'Shalini Malik', phone: '+91 9289902481', email: 'support@ufirm.in' },
        { name: 'Faridabad', description: 'Flat No. 0106, Tower T-10, RPS Savana Sector-88, Faridabad Haryana- 121002', rep: 'Pankaj Kumar', phone: '+91 9069363166', email: 'pankaj.kumar@ufirm.in' },
        { name: 'Gurugram', description: 'C3 102 PWO Housing Complex Sector-43 Gurugram', rep: 'Ajay Yadav', phone: '+91 9958453389', email: 'ajay.yadav@ufirm.in' }
      ]
    },
    {
      id: 6,
      name: 'Jaipur',
      top: '35%',
      left: '27%',
      address: 'C-163, Riico Residential Colony, Near Git, College Sitapura, Jaipur-302022',
      rep: 'Sachin Sharma',
      phone: '+91 9319101871',
      email: 'sachin.sharma@ufirm.in'
    },
    {
      id: 7,
      name: 'Udaipur',
      top: '44%',
      left: '19%',
      address: '88 Charak Hostal Raza Colony, Mulla Talai, Udaipur-313001',
      rep: 'Nandini Singh',
      phone: '+91 9958288544',
      email: 'crm@ufirm.in'
    },
    {
      id: 8,
      name: 'Ahmedabad',
      top: '50%',
      left: '15%',
      address: 'Shop No.15, Manukrupa Plaza,Sanand, Ta-Sanand, Ahmedabad-382110',
      rep: 'Jigyasa',
      phone: '+91 9289902483',
      email: 'crm.ho@ufirm.in'
    },
    {
      id: 9,
      name: 'Pune',
      top: '67%',
      left: '22%',
      address: 'GAT NO. 354, A&B, NH-4, Old Mumbai - Pune Hwy, Maval, Vadgaon, Pune, Maharashtra-412106',
      rep: 'Sachin Sharma',
      phone: '+91 9319101871',
      email: 'sachin.sharma@ufirm.in'
    },
    {
      id: 10,
      name: 'Hyderabad',
      top: '68%',
      left: '35%',
      address: '1-2 361/15, Phool Begh, Hemayathnagar, Indera Park, Hyderabad, Telangana - 500029',
      rep: 'Kishore Reddy',
      phone: '+91 9849203269',
      email: 'kishore.reddy@ufirm.in'
    },
    {
      id: 11,
      name: 'Kolkata',
      top: '52%',
      left: '68%',
      address: 'Purba Panchanna Gram, Abahani Club, Vip Nagar, Sub District South 21 Parganas, West Bengal-700100',
      rep: 'Ranadhir Biswas',
      phone: '+91 9903522839',
      email: 'ranadhir.biswas@ufirm.in'
    },
  ];

  const handleDotClick = (location: Location) => {
    setSelectedLocation(location);
    if (location.cities) {
      setSelectedCity(location.cities[0].name);
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
  };

  const getSelectedCityData = () => {
    if (!selectedLocation?.cities) return null;
    return selectedLocation.cities.find(city => city.name === selectedCity);
  };

  const cityData = getSelectedCityData();

  return (
    <section className="bg-[#1e3143] min-h-screen py-8 px-6 sm:px-12 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Section with Text/Card and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Text Content or Location Card */}
          <div className="relative">
            {!selectedLocation ? (
              <div className={`text-left transition-opacity duration-500 ${!selectedLocation ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#fafbf9] mb-4">
                  About Ufirm
                </h2>
                <p className="text-m sm:text-m font-semibold text-[#fafbf9] mb-4 leading-relaxed">
                  Ufirm, founded in 2016 as part of the Royal Nest Group, aims to elevate India&apos;s real estate services.
                </p>
                <p className="text-base text-[#f0f3f5] leading-relaxed mb-6">
                  With over 25 years of legacy and 8 million sq. ft. of delivered projects, we offer proven expertise and a commitment to excellence. Ufirm integrates four core divisions—Green-Compliant Project Development, Profitable Estate Management, Skilled Facility Maintenance, and Value Enhancement through Technology—to serve the real estate lifecycle end-to-end. Our mission is rooted in delivering lasting value for People, Planet, and Profits, driven by a team deeply committed to quality and innovation.
                </p>
                <Link href="https://ufirm.in/Aboutuspage" className="text-[#fafbf9] hover:text-[#1484bc] transition-colors text-base">
                  Learn more →
                </Link>
              </div>
            ) : (
              <div
                className={`bg-[#fafbf9] rounded-lg p-6 relative transition-opacity duration-500 ${selectedLocation ? 'opacity-100' : 'opacity-0'}`}
                style={{ boxShadow: '0 0 15px 5px rgba(20, 132, 188, 0.4)' }}
                key={selectedCity || selectedLocation.id}
              >
                {/* Location Title and Close Button */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#1e3143]">
                    {cityData ? cityData.name : selectedLocation.name}
                  </h3>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-[#aec2cc] hover:bg-[#1f4e7a] active:bg-[#1484bc] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0"
                    aria-label="Close"
                  >
                    <span className="text-white text-xl leading-none">×</span>
                  </button>
                </div>

                {/* Custom Dropdown for Delhi region */}
                {selectedLocation.cities && (
                  <div className="mb-4 relative" ref={cityDropdownRef}>
                    {/* Dropdown trigger button */}
                    <button
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className={`w-full p-3 rounded border border-[#1e3143] text-[#131720] text-left cursor-pointer transition-all duration-300 flex justify-between items-center ${isCityDropdownOpen ? 'bg-[#aec2cc]' : 'bg-[#fafbf9] hover:bg-[#f0f3f5]'
                        }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <span>{selectedCity}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isCityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#fafbf9] border border-[#1e3143] rounded shadow-lg z-10 overflow-hidden">
                        {selectedLocation.cities.map((city) => (
                          <div
                            key={city.name}
                            onClick={() => {
                              setSelectedCity(city.name);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer transition-colors ${selectedCity === city.name
                              ? 'bg-[#aec2cc] text-[#131720]'
                              : 'bg-[#fafbf9] hover:bg-[#f0f3f5] text-[#131720]'
                              }`}
                          >
                            {city.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Address */}
                <p className="text-[#1e3143] text-sm mb-3 transition-opacity duration-300">
                  {cityData ? cityData.description : selectedLocation.address}
                </p>

                {/* Representative */}
                <p className="text-[#1e3143] text-sm mb-2 transition-opacity duration-300">
                  <span className="font-bold">Representative:</span> {cityData ? cityData.rep : selectedLocation.rep}
                </p>

                {/* Contact Number */}
                <p className="text-[#1e3143] text-sm mb-2 transition-opacity duration-300">
                  <span className="font-bold">Contact Number:</span> {cityData ? cityData.phone : selectedLocation.phone}
                </p>

                {/* Email */}
                <p className="text-sm transition-opacity duration-300">
                  <a href={`mailto:${cityData ? cityData.email : selectedLocation.email}`} className="text-[#1f4e7a] hover:underline">
                    {cityData ? cityData.email : selectedLocation.email}
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Map with Interactive Dots and Info Boxes */}
          <div className="hidden lg:relative lg:h-full lg:flex lg:flex-col lg:items-end lg:justify-end">
            <div className="relative w-fit">
              <Image
                src="/Assets/map_base.svg"
                alt="India Map with locations"
                width={350}
                height={350}
                className="w-[350px] h-auto object-contain"
              />

              {/* Interactive Dots */}
              {locations.map((location) => {
                const isActive = selectedLocation?.id === location.id;
                // We need a way to track hover state for each dot individually. 
                // Since we are mapping, we can't easily use a simple state variable without an ID map or moving this to a sub-component.
                // However, simpler is to use CSS group-hover logic with 3 absolute images controlling opacity, similar to before but with images.
                // OR better: Create a small sub-component or just use 3 images stacked and toggle visibility.

                return (
                  <button
                    key={location.id}
                    onClick={() => handleDotClick(location)}
                    className="absolute cursor-pointer group w-8 h-8 flex items-center justify-center"
                    style={{
                      left: location.left,
                      top: location.top,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label={`View ${location.name} location`}
                  >
                    <div
  className={`relative w-6 h-6 ${
    location.id === 5 ? 'delhi-dot' : ''
  }`}
>

                      {/* Default Dot - Visible by default, hidden on hover or active */}
                      <Image
                        src="/Assets/dot_Default.svg"
                        alt="Location"
                        fill
                        className={`transition-opacity duration-200 animate-pulse ${isActive ? 'opacity-0' : 'group-hover:opacity-0 opacity-100'}`}
                      />

                      {/* Hover Dot - Visible on hover, hidden if active */}
                      <Image
                        src="/Assets/dot_Hover.svg"
                        alt="Location Hover"
                        fill
                        className={`transition-opacity duration-200 ${isActive ? 'opacity-0' : 'group-hover:opacity-100 opacity-0'}`}
                      />

                      {/* Pressed/Active Dot - Visible only when active */}
                      <Image
                        src="/Assets/dot_Pressed.svg"
                        alt="Location Selected"
                        fill
                        className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </div>
                  </button>
                );
              })}

              {/* Info Boxes - Positioned based on your Image 2 */}
              {/* Top Left - 8 million+ SF projects delivered */}
              <div className={`absolute top-[10%] -left-[45%] bg-[#f0f3f5] rounded-lg px-4 py-3 text-center shadow-sm transition-opacity duration-500 ${!selectedLocation ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[#1e3143] text-sm font-medium">8 million+ SF<br />projects delivered</p>
              </div>

              {/* Top Right - 12 million+ SF facilities managed */}
              <div className={`absolute top-[5%] right-0 bg-[#f0f3f5] rounded-lg px-4 py-3 text-center shadow-sm transition-opacity duration-500 ${!selectedLocation ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[#1e3143] text-sm font-medium">12 million+ SF<br />facilities managed</p>
              </div>

              {/* Bottom Left - 250 crore+ deals monitored */}
              <div className={`absolute bottom-[15%] -left-[40%] bg-[#f0f3f5] rounded-lg px-4 py-3 text-center shadow-sm transition-opacity duration-500 ${!selectedLocation ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[#1e3143] text-sm font-medium">250 crore+ deals<br />monitored</p>
              </div>

              {/* Bottom Right - 0.5 million+ SF under development */}
              <div className={`absolute bottom-[10%] right-[5%] bg-[#f0f3f5] rounded-lg px-4 py-3 text-center shadow-sm transition-opacity duration-500 ${!selectedLocation ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[#1e3143] text-sm font-medium">0.5 million+ SF<br />under development</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#fafbf9] rounded-lg p-4 text-center border border-[#1484bc]"
            style={{ boxShadow: '0 0 15px 5px rgba(20, 132, 188, 0.4)' }}>
            <h3 className="text-3xl font-bold text-[#1484bc] mb-1">5</h3>
            <p className="text-[#1e3143] text-xs">Indian States</p>
          </div>

          <div className="bg-[#fafbf9] rounded-lg p-4 text-center border border-[#1484bc]"
            style={{ boxShadow: '0 0 15px 5px rgba(20, 132, 188, 0.4)' }}>
            <h3 className="text-3xl font-bold text-[#1484bc] mb-1">2500+</h3>
            <p className="text-[#1e3143] text-xs">Professionals</p>
          </div>

          <div className="bg-[#fafbf9] rounded-lg p-4 text-center border border-[#1484bc]"
            style={{ boxShadow: '0 0 15px 5px rgba(20, 132, 188, 0.4)' }}>
            <h3 className="text-3xl font-bold text-[#1484bc] mb-1">300+</h3>
            <p className="text-[#1e3143] text-xs">Sites managed</p>
          </div>

          <div className="bg-[#fafbf9] rounded-lg p-4 text-center border border-[#1484bc]"
            style={{ boxShadow: '0 0 15px 5px rgba(20, 132, 188, 0.4)' }}>
            <h3 className="text-3xl font-bold text-[#1484bc] mb-1">Diverse</h3>
            <p className="text-[#1e3143] text-xs">Multi-sector assets</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;