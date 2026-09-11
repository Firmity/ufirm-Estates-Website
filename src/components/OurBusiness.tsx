'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const OurBusiness = () => {

  const businesses = [
  {
    id: 1,
    name: 'Urest',
    logo: '/Assets/urestlogo.svg',
    image: '/Assets/urest.svg',
    description:
      'The Operations and facility management arm of the UFirm ecosystem. We deliver structured processes, trained manpower and site level accountability',
    link: 'https://urest.in/',
    isHalf: false,
  },
  {
    id: 3,
    name: 'UFirm',
    logo: '/Assets/ufirmlogo.svg',
    image: '/Assets/ufirm.svg',
    description:
      'We bring together strategy, on ground execution and technology',
    link: 'https://ufirm-estates-consulting.vercel.app/',
    isHalf: false,
  },
  {
    id: 4,
    name: 'RoyalNest',
    logo: '/Assets/royalnestlogo.svg',
    image: '/Assets/royalnest.svg',
    description:
      'We deliver high-integrity, green-certified real estate and infrastructure projects designed for long-term value',
    link: 'https://www.royalnestgroup.com/',
    isHalf: true,
  },
  {
    id: 2,
    name: 'Firmity',
    logo: '/Assets/firmitylogo.svg',
    image: '/Assets/laptop.svg',
    description: <>
      A <strong>CMMS-facility management </strong> platform under the UFirm umbrella. We bring structure transparency and accountability to day to day operations in one unified system</>,
    link: 'https://firmity.in/',
    isHalf: true,
  },
];


  const fullCards = businesses.filter(b => !b.isHalf);
  const halfCards = businesses.filter(b => b.isHalf);

  const handleCardClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-[#fafbf9] py-8 px-6 sm:px-12 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Title and Subtitle */}
        <div className="text-center mb-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1e3143] mb-4">
            Connecting Strategy, Operations and Technology
          </h2>
          <p className="text-m sm:text-m font-semibold text-[#1f4e7a] leading-relaxed max-w-4xl mx-auto">
            We integrate strategy, on-ground operations, and technology to transform real estate into consistently high performing investments.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {/* First Full Card */}
          {fullCards[0] && (
            <div
              className="group bg-[#f0f3f5] hover:bg-[#aec2cc] rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-xl ring-1 ring-inset ring-[#aec2cc] flex flex-col"
              onClick={() => handleCardClick(fullCards[0].link)}
            >
              {/* Image with padding */}
              <div className="px-4 lg:px-8 pt-6 lg:pt-8 pb-2">
                <div className="relative w-full h-28 lg:h-32">
                  <Image
                    src={fullCards[0].image}
                    alt={fullCards[0].name}
                    fill
                    className="object-cover object-center rounded-lg"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-2 flex flex-col">
                {/* Logo */}
                <div className="mb-2 h-9 flex items-center">
                  <Image
                    src={fullCards[0].logo}
                    alt={`${fullCards[0].name} logo`}
                    width={50}
                    height={36}
                    className="object-contain object-left"
                    style={{ height: '36px' }}
                  />
                </div>

                {/* Description */}
                <p className="text-[#131720] text-xs mb-2 leading-relaxed flex-grow">
                  {fullCards[0].description}
                </p>

                {/* Visit Site Link */}
                <Link
                  href={fullCards[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1f4e7a] text-sm font-medium hover:opacity-80 transition-opacity no-underline mt-auto pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Site
                </Link>
              </div>
            </div>
          )}

          {/* Second Full Card */}
          {fullCards[1] && (
            <div
              className="group bg-[#f0f3f5] hover:bg-[#aec2cc] rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-xl ring-1 ring-inset ring-[#aec2cc] flex flex-col"
              onClick={() => handleCardClick(fullCards[1].link)}
            >
              {/* Image with padding */}
              <div className="px-4 lg:px-8 pt-6 lg:pt-8 pb-2">
                <div className="relative w-full h-28 lg:h-32">
                  <Image
                    src={fullCards[1].image}
                    alt={fullCards[1].name}
                    fill
                    className="object-cover object-center rounded-lg"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-2 flex flex-col">
                {/* Logo */}
                <div className="mb-2 h-9 flex items-center">
                  <Image
                    src={fullCards[1].logo}
                    alt={`${fullCards[1].name} logo`}
                    width={80}
                    height={36}
                    className="object-contain object-left"
                    style={{ height: '36px' }}
                  />
                </div>

                {/* Description */}
                <p className="text-[#131720] text-xs mb-2 leading-relaxed flex-grow">
                  {fullCards[1].description}
                </p>

                {/* Visit Site Link */}
                <Link
                  href={fullCards[1].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1f4e7a] text-sm font-medium hover:opacity-80 transition-opacity no-underline mt-auto pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Site
                </Link>
              </div>
            </div>
          )}

          {/* Half Cards Container */}
          <div className="col-span-2 lg:col-span-1 grid grid-cols-2 lg:flex lg:flex-col gap-3 md:gap-6 lg:gap-12">
            {/* First Half Card */}
            {halfCards[0] && (
              <div
                className="bg-[#f0f3f5] hover:bg-[#aec2cc] rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-xl ring-1 ring-inset ring-[#aec2cc]"
                onClick={() => handleCardClick(halfCards[0].link)}
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Image - Left Side with padding */}
                  <div className="p-4 lg:p-2 w-full lg:w-1/3 flex-shrink-0">
                    <div className="relative w-full h-28 lg:h-full">
                      <Image
                        src={halfCards[0].image}
                        alt={halfCards[0].name}
                        fill
                        className="object-cover object-center rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="px-4 lg:px-0 lg:pr-2 py-2 flex flex-col flex-grow">
                    {/* Logo */}
                    <div className="mb-2 h-9 flex items-center">
                      <Image
                        src={halfCards[0].logo}
                        alt={`${halfCards[0].name} logo`}
                        width={60}
                        height={36}
                        className="object-contain object-left"
                        style={{ height: '36px' }}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-[#131720] text-xs mb-2 leading-relaxed flex-grow">
                      {halfCards[0].description}
                    </p>

                    {/* Visit Site Link */}
                    <Link
                      href={halfCards[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1f4e7a] text-sm font-medium hover:opacity-80 transition-opacity no-underline mt-auto pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Site
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Second Half Card */}
            {halfCards[1] && (
              <div
                className="bg-[#f0f3f5] hover:bg-[#aec2cc] rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-xl ring-1 ring-inset ring-[#aec2cc]"
                onClick={() => handleCardClick(halfCards[1].link)}
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Image - Left Side with padding */}
                  <div className="p-4 lg:p-2 w-full lg:w-1/3 flex-shrink-0">
                    <div className="relative w-full h-28 lg:h-full">
                      <Image
                        src={halfCards[1].image}
                        alt={halfCards[1].name}
                        fill
                        className="object-cover object-center rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="px-4 lg:px-0 lg:pr-2 py-2 flex flex-col flex-grow">
                    {/* Logo */}
                    <div className="mb-2 h-9 flex items-center">
                      <Image
                        src={halfCards[1].logo}
                        alt={`${halfCards[1].name} logo`}
                        width={90}
                        height={36}
                        className="object-contain object-left"
                        style={{ height: '36px' }}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-[#131720] text-xs mb-2 leading-relaxed flex-grow">
                      {halfCards[1].description}
                    </p>

                    {/* Visit Site Link */}
                    <Link
                      href={halfCards[1].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1f4e7a] text-sm font-medium hover:opacity-80 transition-opacity no-underline mt-auto pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Site
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurBusiness;
