import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2D68C4] text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium">
              Powered by GMX-Way Transportation Solutions
            </p>
            <p className="text-xs text-blue-100 mt-1">
              Professional Highway Inspection & Management Systems
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <a
              href="https://gmx-way.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors duration-200 flex items-center gap-1"
            >
              Visit GMX-Way.com
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://gmx-way.com/services"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors duration-200 flex items-center gap-1"
            >
              Our Services
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://gmx-way.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors duration-200 flex items-center gap-1"
            >
              Contact Us
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://gmx-way.com/support"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors duration-200 flex items-center gap-1"
            >
              Support
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-400 mt-4 pt-4 text-center">
          <p className="text-xs text-blue-100">
            © {new Date().getFullYear()} GMX-Way Transportation Solutions. All rights reserved. | 
            Random Milepost Generator v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}