// context/LoaderContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoaderContextType {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  loaderText: string;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Loading...');

  const showLoader = (text: string = 'Loading...') => {
    setLoaderText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setLoaderText('Loading...');
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, loaderText }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center justify-center transform transition-all duration-500 animate-in fade-in zoom-in-95">

            {/* Minimalist Conic Ring Loader */}
            <div className="relative w-20 h-20">
              {/* Glowing Gradient Background */}
              <div
                className="absolute inset-0 rounded-full animate-spin bg-[conic-gradient(from_0deg,transparent_0deg,var(--primary-color)_360deg)]"
                style={{ animationDuration: '1.5s' }}
              ></div>

              {/* Inner Cutout to create the Ring effect */}
              {/* Matching the parent bg roughly or just generic black since backdrop is dark */}
              <div className="absolute inset-[3px] rounded-full bg-[#050505]"></div>

              {/* Optional: Central Pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-color animate-pulse shadow-[0_0_15px_var(--primary-color)]"></div>
              </div>
            </div>

            {/* Elegant Typography */}
            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm font-medium tracking-[0.25em] uppercase animate-pulse">
                {loaderText}
              </p>
            </div>

          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};