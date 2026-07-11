import React from 'react';
import { Waves } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ocean-bg flex min-h-screen items-center justify-center p-4">
      {/* Background animations */}
      <div className="wave-container">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
      
      {/* Floating particles */}
      <div className="particle h-16 w-16 left-[10%] top-[20%] animate-float" />
      <div className="particle h-24 w-24 right-[15%] top-[10%] animate-float-delayed opacity-50" />
      <div className="particle h-12 w-12 left-[20%] bottom-[30%] animate-float opacity-70" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg backdrop-blur-md">
            <Waves className="h-8 w-8 text-teal-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            SEAPEDIA
          </h1>
          <p className="mt-2 text-teal-100/80">
            Fresh seafood, straight from the source.
          </p>
        </div>

        {/* The glassmorphism card is applied in the pages themselves */}
        {children}
      </div>
    </div>
  );
}
