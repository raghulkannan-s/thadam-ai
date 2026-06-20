"use client";

import React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";


export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster 
        position="top-right" 
        richColors 
        theme="system" 
        expand={true} 
        closeButton={true}
        className="toaster-wrapper"
        offset={80}
      />
    </>
  );
}


