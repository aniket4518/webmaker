import React, { useEffect, useState } from "react";

interface HeaderProps {
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scroll ? 'glassmorphism py-3' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm"></span>
          </div>
          <span className="text-2xl font-bold text-white">WebMaker AI</span>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8">
          {['Features', 'Templates', 'Pricing', 'About'].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors no-underline"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        
        {/* Call to Action */}
        <div className="hidden md:block">
          <button
            onClick={onGetStarted}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm"
          >
            Start
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
