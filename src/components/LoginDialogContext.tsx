"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoginDialogContextType {
  showLogin: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(
  undefined
);

export function useLoginDialog() {
  const context = useContext(LoginDialogContext);
  if (!context) {
    throw new Error(
      "useLoginDialog must be used within a LoginDialogProvider"
    );
  }
  return context;
}

export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  return (
    <LoginDialogContext.Provider value={{ showLogin, openLogin, closeLogin }}>
      {children}
    </LoginDialogContext.Provider>
  );
}
