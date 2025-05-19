import React, { useEffect, useState } from "react";

const Header =( ) =>{
    const [Scroll,setScroll] =useState(false)
 
    useEffect (()=>{
      const handleScroll = ()=>{
        if (window.scrollY>20){
            setScroll(true)
        }
        else{
            setScroll(false)
        }
      }
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } ,[]);
   return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        scroll ? 'glassmorphism py-3' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">Webmaker</span>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8 text">
          {['Features', 'Templates', 'Pricing', 'About'].map((item) => (
            <li key={item}>
              <a
                href={`${item.toLowerCase()}`}
                className="text-gray-300 transition-colors no-underline"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        
        {/* Call to Action */}
        <div className="hidden md:block">
          <button
            className="px-6 py-2 rounded-lg bg-futuristic-gradient text-white font-semibold shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Get Started
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        {/* <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div> */}
      </div>
      
      {/* Mobile Menu */}
      {/* {mobileMenuOpen && (
        <div className="md:hidden glassmorphism mt-2">
          <div className="container mx-auto px-4 py-2">
            <ul className="space-y-4 py-4">
              {['Features', 'Templates', 'Pricing', 'About'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-300 hover:text-white py-2 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Button className="w-full bg-futuristic-gradient hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )} */}
    </nav>

 
    
    
    </>

   )
    
}

export default  Header;