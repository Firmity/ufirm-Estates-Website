"use client";
import React, { useState } from "react";
import Link from "next/link";
import { X as CloseIcon, Menu as MenuIcon, ChevronRight } from "lucide-react";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <div className="lg:hidden fixed top-10 right-4 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black/20 p-2 rounded-xl text-white"
            title="Open menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="lg:hidden fixed right-0 top-0 w-64 bg-black/70 text-white p-4 space-y-4 shadow-lg z-[1000] max-h-screen overflow-y-auto transition-transform duration-300 ease-in-out"
          style={{
            height: '100dvh',
            paddingTop: 'env(safe-area-inset-top, 20px)',
            paddingBottom: 'env(safe-area-inset-bottom, 20px)',
          }}
        >
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white p-2 rounded"
              title="Close menu"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Login Dropdown */}
            <div>
              <button
                className="flex justify-between items-center w-full py-2 text-lg font-semibold"
                onClick={() => setIsLoginOpen(!isLoginOpen)}
              >
                <span>Login</span>
                <ChevronRight
                  className={`transition-transform duration-300 ${isLoginOpen ? "rotate-90" : "rotate-0"}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isLoginOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <div className="ml-4 space-y-2 mt-2">
                  <Link
                    href="https://account.ufirm.in/Account/Login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 text-sm text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Client Login
                  </Link>
                  <Link
                    href="https://admin.urest.in:8097/"
                    className="block py-1 text-sm text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Employee Login
                  </Link>
                  <Link
                    href="https://account.ufirm.in/Account/Login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 text-sm text-gray-300 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Facility Management Login
                  </Link>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            {[
              ["Hire", "/CareersPage"],
              ["Facility Management", "https://urest.in/"],
              ["Royal Nest Projects", "https://www.royalnestgroup.com/"],
              ["Facility Tech", "/OurInnovation"],
              ["Technical Services", "/TechnologiesPage"],
              ["Real Estate Advisory", "/Management&advisory"],
              ["About Us", "/Aboutuspage"],
              ["Contact Us", "/ContactPage"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="block py-2 text-lg"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
