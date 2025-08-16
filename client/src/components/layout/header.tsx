import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, LogOut, Globe } from "lucide-react";

interface HeaderProps {
  showLanguageSelector?: boolean;
  showLogout?: boolean;
}

export default function Header({ showLanguageSelector = true, showLogout = true }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Heart className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-medium text-gray-900">HerVital</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {showLanguageSelector && (
            <Select defaultValue="EN">
              <SelectTrigger className="w-16 h-8 text-sm border border-gray-300 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">
                  <div className="flex items-center space-x-2">
                    <Globe size={12} />
                    <span>EN</span>
                  </div>
                </SelectItem>
                <SelectItem value="ZU">
                  <div className="flex items-center space-x-2">
                    <Globe size={12} />
                    <span>ZU</span>
                  </div>
                </SelectItem>
                <SelectItem value="XH">
                  <div className="flex items-center space-x-2">
                    <Globe size={12} />
                    <span>XH</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {showLogout && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-primary-600 p-2"
            >
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
