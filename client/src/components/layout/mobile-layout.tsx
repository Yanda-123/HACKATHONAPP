import { ReactNode } from "react";
import Header from "./header";

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showLanguageSelector?: boolean;
  showLogout?: boolean;
}

export default function MobileLayout({ 
  children, 
  showHeader = true,
  showLanguageSelector = true,
  showLogout = true
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <Header 
          showLanguageSelector={showLanguageSelector}
          showLogout={showLogout}
        />
      )}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
