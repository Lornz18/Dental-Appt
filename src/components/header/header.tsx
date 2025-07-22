import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="p-4 text-black dark:bg-gray-900 dark:text-white">
      <div className="container">
        <div className="flex items-center justify-between">
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
            {/* <h1 className="text-xl">Natural Smile Dental Clinic</h1> */}
          </div>
          <nav>
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
          <a href="/contact" className="btn-primary cursor-pointer">Contact Us</a>
        </div>
      </div>
    </header>
  );
}
