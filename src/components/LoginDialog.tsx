"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginDialog } from "@/components/LoginDialogContext";
import Link from "next/link";
import { Building2, User, Briefcase } from "lucide-react";

export function LoginDialog() {
  const { showLogin, closeLogin } = useLoginDialog();

  const loginOptions = [
    {
      icon: Building2,
      label: "Client Login",
      href: "https://account.ufirm.in/Account/Login",
    },
    {
      icon: User,
      label: "Employee Login",
      href: "https://admin.urest.in:8084/",
    },
    {
      icon: Briefcase,
      label: "Facility Manager Login",
      href: "https://account.ufirm.in/Account/Login",
    },
  ];

  return (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          key="loginDialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4"
          onClick={closeLogin}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#1e3143] rounded-[4px] max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-5 border-b border-neutral-200/20">
              <h2 className="text-xl font-bold text-white text-left">
                Login
              </h2>
            </div>

            {/* Login Options */}
            <div className="divide-y divide-neutral-200/20">
              {loginOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={index}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeLogin}
                    className="flex items-center gap-3 px-8 py-4 text-white hover:bg-[#1484bc] transition-all duration-200 group"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
