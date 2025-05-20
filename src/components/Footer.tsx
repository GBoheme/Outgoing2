
import React from "react";
import { Copyright } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-[#1c1a22] to-[#221F26] dark:from-[#1c1c1c] dark:to-[#1c1c1c] py-4 px-6 border-t border-gray-700/20 dark:border-gray-800/20">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-400 dark:text-gray-500 text-sm font-cairo">
          نظام إدارة الوثائق الواردة والصادرة
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#f3d676] flex items-center justify-center text-black font-bold text-xs">
            GB
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            <span className="font-cairo">جميع الحقوق محفوظة © {currentYear}</span>
            <span className="mx-1">|</span>
            <span className="text-[#D4AF37] dark:text-primary font-medium flex items-center">
              <Copyright className="h-3.5 w-3.5 mr-1" />
              Ghaith Boheme
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
