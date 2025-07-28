import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // Import useState

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State to manage mobile menu visibility

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="p-4 text-black bg-white dark:bg-gray-900 dark:text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto"> {/* Added mx-auto for centering */}
        <div className="flex items-center justify-between">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-3 rounded-2xl bg-primary cursor-pointer">
              <Link href="/">
                <Image
                  src="/icons/tooth.png"
                  alt="logo"
                  width={25}
                  height={25}
                  priority
                />
              </Link>
            </div>
            {/* Uncomment if you want to display the clinic name */}
            {/* <h1 className="text-xl">Natural Smile Dental Clinic</h1> */}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex"> {/* Hidden on small screens, shown on medium and up */}
            <ul className="flex space-x-8">
              <li>
                <a
                  href="/about"
                  className="hover:text-primary transition-all duration-300"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/dentist"
                  className="hover:text-primary transition-all duration-300"
                >
                  Dentist
                </a>
              </li>
              <li>
                <a
                  href="/service"
                  className="hover:text-primary transition-all duration-300"
                >
                  Services
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact Button - Shown on desktop */}
          <div className="hidden md:block"> {/* Hidden on small screens, shown on medium and up */}
            <a href="/contact" className="btn-primary cursor-pointer">Contact Us</a>
          </div>

          {/* Mobile Burger Button */}
          <div className="md:hidden flex items-center"> {/* Shown only on small screens */}
            <button
              onClick={toggleMobileMenu}
              className="focus:outline-none" // Remove default focus outline
              aria-label="Toggle mobile menu" // For accessibility
            >
              <div className="space-y-1 cursor-pointer">
                <div
                  className={`w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-current transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full text-white bg-gray-900 dark:bg-gray-800 p-4 shadow-lg z-40">
            <ul className="flex flex-col space-y-4">
              <li>
                <a
                  href="/about"
                  className="block py-2 hover:text-primary transition-all duration-300"
                  onClick={toggleMobileMenu} // Close menu on link click
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/dentist"
                  className="block py-2 hover:text-primary transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  Dentist
                </a>
              </li>
              <li>
                <a
                  href="/service"
                  className="block py-2 hover:text-primary transition-all duration-300"
                  onClick={toggleMobileMenu}
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="block py-2 btn-primary-mobile" // Custom styling for mobile contact
                  onClick={toggleMobileMenu}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}