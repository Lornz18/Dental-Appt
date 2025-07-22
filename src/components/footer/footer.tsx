// components/Footer.js

import { Facebook, Twitter } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 px-4 w-full bg-foreground text-background dark:bg-gray-800 dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-y-6">
        {/* Footer Left: Copyright and Logo (Optional) */}
        <div className="text-center md:text-left">
          <p className="text-sm">
            © {currentYear} Your Dental Clinic. All rights reserved.
          </p>
          {/* You could add a small logo here if you have one */}
          {/* <div className="mt-2">
            <Link href="/" className="text-lg font-bold">
              YourClinic
            </Link>
          </div> */}
        </div>

        {/* Footer Center: Navigation Links */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-sm">
          <Link href="/about" className="hover:text-primary dark:hover:text-primary-dark transition-colors">
            About Us
          </Link>
          <Link href="/dentist" className="hover:text-primary dark:hover:text-primary-dark transition-colors">
            Dentist
          </Link>
          <Link href="/service" className="hover:text-primary dark:hover:text-primary-dark transition-colors">
            Services
          </Link>
        </div>

        {/* Footer Right: Social Media Links (Optional) */}
        <div className="flex space-x-4">
          {/* Replace with actual social media icons and links */}
          <Facebook></Facebook>
          <Twitter></Twitter>
        </div>
      </div>
    </footer>
  );
};

export default Footer;