import React from 'react';
import Navigation from './Navigation';
import { KUBA_LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-kuba-dark text-white font-sans selection:bg-kuba-yellow selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-kuba-yellow text-kuba-black h-14 flex items-center justify-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <img src={KUBA_LOGO_URL} alt="KUBA" className="w-8 h-8 rounded-full border-2 border-black" />
          <h1 className="text-xl font-black tracking-tighter uppercase">KUBA APP</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16 pb-20 px-4 max-w-md mx-auto min-h-screen flex flex-col">
        {children}
      </main>

      <Navigation />
    </div>
  );
};

export default Layout;