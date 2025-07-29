// pages/index.js

"use client";

import { Clipboard, HomeIcon, MessageSquare, Search, } from "lucide-react";
import { useEffect, useState } from 'react'; // Import useState
import Image from "next/image";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Link from "next/link";

// Interface for a Service, mirroring your backend model for type safety
interface Service {
  _id: string; // Assuming your API returns _id from MongoDB
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]); // State to hold fetched services
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    AOS.init({
      duration: 500,
    });
  }, []);

  // Fetch services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const response = await fetch('/api/services'); // Your API endpoint for services

        if (!response.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Assuming your API returns data in a structure like { services: [...] }
        // Adjust if your API response is different. If it's just an array, use data directly.
        if (data && Array.isArray(data.data)) {
          setServices(data.data);
        } else if (Array.isArray(data)) {
          setServices(data); // If the API directly returns an array
        } else {
          throw new Error("Invalid data format received from API.");
        }

      } catch (err) {
        console.error("Failed to fetch services:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching services.");
        }
        setServices([]); // Clear services on error
      } finally {
        setLoading(false); // Set loading to false once fetch is complete
      }
    };

    fetchServices();
  }, []); // Empty dependency array means this effect runs once on mount

  // Helper function to get an icon based on service name (optional, for variety)
  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'general dentistry':
        return <HomeIcon className="text-primary dark:text-primary-dark" />;
      case 'cosmetic dentistry':
        return <Search className="text-primary dark:text-primary-dark" />;
      case 'specialty treatments':
        return <Clipboard className="text-primary dark:text-primary-dark" />;
      // Add more cases for other services
      default:
        return <Clipboard className="text-primary dark:text-primary-dark" />; // Default icon
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-16 bg-background text-foreground font-sans transition-colors duration-300 dark:bg-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-4">
        <div className="md:w-1/2 text-center md:text-left z-10">
          <h1 data-aos="fade-up" className="text-5xl md:text-6xl font-bold leading-tight mb-4 text-foreground dark:text-white animate-fadeIn">
            Experience Your Healthiest Smile.
          </h1>
          <p data-aos="fade-right" className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fadeIn animation-delay-200 dark:text-gray-300">
            Discover compassionate, advanced dental care tailored to your unique
            needs.
          </p>
          <div data-aos="fade-bottom" className="flex justify-center md:justify-start animate-fadeIn animation-delay-400">
            <Link
              href="/appointment"
              className="cursor-pointer bg-primary hover:bg-secondary text-white hover:text-primary dark:hover:text-primary dark:bg-primary-dark dark:hover:bg-secondary-dark font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 inline-block"
            >
              Book Your Appointment
            </Link>
          </div>
        </div>
        <div data-aos="fade-left" className="md:w-1/2 mt-8 md:mt-0 flex justify-center z-10">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/banner.jpg"
              alt="Smiling patient with dentist"
              fill
              className="object-cover opacity-90"
              priority // Added priority for better LCP
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full transition-colors duration-300 bg-white dark:bg-gray-900 dark:text-white">
        <div data-aos="fade-top"  className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground dark:text-white animate-fadeIn">
            Why Choose Our Clinic?
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200 dark:text-gray-300">
            We are dedicated to providing exceptional dental care with a
            personal touch. Discover the difference our commitment makes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-400 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="p-4 rounded-full bg-primary/10 dark:bg-primary-dark/20 mb-4">
              <svg
                className="w-12 h-12 text-primary dark:text-primary-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground dark:text-white">
              Advanced Technology
            </h3>
            <p className="text-foreground/70 dark:text-gray-300">
              Utilizing the latest dental equipment for precise diagnostics and
              comfortable treatments.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-600 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="p-4 rounded-full bg-primary/10 dark:bg-primary-dark/20 mb-4">
              <svg
                className="w-12 h-12 text-primary dark:text-primary-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground dark:text-white">
              Gentle & Compassionate Care
            </h3>
            <p className="text-foreground/70 dark:text-gray-300">
              Our friendly team ensures a relaxing and stress-free experience
              for every patient.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-800 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="p-4 rounded-full bg-primary/10 dark:bg-primary-dark/20 mb-4">
              <svg
                className="w-12 h-12 text-primary dark:text-primary-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143M13 7l5.714 2.143L21 12l-5.714 2.143m0 0H13a2 2 0 01-2-2V9a2 2 0 012-2h3m7 10a2 2 0 012 2v2M5 3h6a2 2 0 012 2v10a2 2 0 002 2h6"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground dark:text-white">
              Expert Dental Team
            </h3>
            <p className="text-foreground/70 dark:text-gray-300">
              Highly skilled dentists and hygienists dedicated to your oral
              health and well-being.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section - Dynamically Loaded */}
      <section className="py-20 px-4 w-full mx-auto transition-colors duration-300 bg-primary/5 dark:bg-gray-900 text-foreground dark:text-white">
        <div className="max-w-7xl mx-auto">
          <div data-aos="fade-top" className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground dark:text-white animate-fadeIn">
              Our Comprehensive Services
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200 dark:text-gray-300">
              From routine check-ups to specialized treatments, we offer a full
              spectrum of dental solutions.
            </p>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center py-10">
              <p className="text-foreground/70 dark:text-gray-300 animate-pulse">Loading services...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={service._id} // Use the unique _id as the key
                  className="flex items-center bg-white p-5 rounded-lg shadow-sm hover:shadow-xl transition duration-300 animate-fadeIn dark:bg-gray-700 "
                  style={{ animationDelay: `${index * 200 + 400}ms` }} // Stagger animation
                  data-aos="fade-up" // Re-apply AOS to dynamically loaded content
                  data-aos-delay={index * 200 + 400}
                  data-aos-duration="500"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center mr-5">
                    {getServiceIcon(service.name)} {/* Use the helper function */}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-foreground/70 dark:text-gray-300 text-sm">
                      {service.description}
                    </p>
                    {/* Optional: Display price and duration if relevant here */}
                    {/* <p className="text-sm text-foreground/60 dark:text-gray-400 mt-1">
                      ${service.price.toFixed(2)} | {service.durationMinutes} min
                    </p> */}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No services found message */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-10">
              <p className="text-foreground/70 dark:text-gray-300">No services available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12 animate-fadeIn animation-delay-1000">
            <Link href="/service" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-dark dark:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-white font-bold py-3 px-7 rounded-lg text-lg transition duration-300 ease-in-out">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full transition-colors duration-300 bg-white dark:bg-gray-900 dark:text-white">
        <div data-aos="fade-top" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground dark:text-white animate-fadeIn">
            Meet Our Expert Team
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200 dark:text-gray-300">
            Dedicated professionals committed to your oral health journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Dentist 1 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-400 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20 dark:border-primary-dark/20">
              <Image
                src="/images/dentist-dr-smith.jpg" // Replace with your image
                alt="Dr. Emily Carter"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground dark:text-white mb-1">
              Dr. Emily Carter
            </h3>
            <p className="text-primary dark:text-primary-dark text-sm font-medium uppercase mb-3">
              Lead Dentist
            </p>
            <p className="text-foreground/70 dark:text-gray-300 text-sm">
              &apos;Dedicated to creating healthy, beautiful smiles with a gentle
              approach.&apos;
            </p>
            <Link href="/dentist" className="mt-4 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-secondary-dark dark:text-secondary-dark dark:hover:bg-secondary-dark dark:hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              View Profile
            </Link>
          </div>
          {/* Dentist 2 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-600 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20 dark:border-primary-dark/20">
              <Image
                src="/images/dentist-dr-jones.jpg" // Replace with your image
                alt="Dr. David Lee"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground dark:text-white mb-1">
              Dr. David Lee
            </h3>
            <p className="text-secondary dark:text-secondary-dark text-sm font-medium uppercase mb-3">
              Dental Hygienist
            </p>
            <p className="text-foreground/70 dark:text-gray-300 text-sm">
              &apos;Passionate about preventative care and patient education.&apos;
            </p>
            <Link href="/dentist" className="mt-4 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-secondary-dark dark:text-secondary-dark dark:hover:bg-secondary-dark dark:hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              View Profile
            </Link>
          </div>
          {/* Dentist 3 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-800 dark:bg-gray-700 dark:hover:shadow-xl">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20 dark:border-primary-dark/20">
              <Image
                src="/images/dentist-dr-chen.jpg" // Replace with your image
                alt="Dr. Aisha Khan"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground dark:text-white mb-1">
              Dr. Aisha Khan
            </h3>
            <p className="text-primary dark:text-primary-dark text-sm font-medium uppercase mb-3">
              Orthodontist
            </p>
            <p className="text-foreground/70 dark:text-gray-300 text-sm">
              &apos;Crafting perfect smiles with personalized orthodontic solutions.&apos;
            </p>
            <Link href="/dentist" className="mt-4 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-secondary-dark dark:text-secondary-dark dark:hover:bg-secondary-dark dark:hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              View Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 mx-auto w-full transition-colors duration-300 bg-primary/5 dark:bg-gray-900 dark:text-white">
        <div className="container">
          <div data-aos="fade-top" className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground dark:text-white animate-fadeIn">
              What Our Patients Say
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200 dark:text-gray-300">
              Hear from our happy patients about their positive experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-400 dark:bg-gray-700 dark:hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-semibold text-foreground dark:text-white">
                    &apos;Absolutely fantastic experience!&apos;
                  </p>
                  <p className="text-foreground/80 dark:text-gray-300">
                    The staff were incredibly friendly and made me feel very
                    comfortable.
                  </p>
                </div>
                
                <MessageSquare className="text-primary"></MessageSquare>
              </div>
              <p className="text-foreground/70 dark:text-gray-300 mb-3">
                &apos;The clinic is modern, clean, and the staff is very professional
                and caring. Dr. Carter explained everything clearly.&apos;
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-bold text-foreground dark:text-white">
                    Sarah J.
                  </p>
                  <p className="text-sm text-foreground/70 dark:text-gray-400">
                    Satisfied Patient
                  </p>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition duration-300 animate-fadeIn animation-delay-600 dark:bg-gray-700 dark:hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-semibold text-foreground dark:text-white">
                    &apos;Highly recommend this practice!&apos;
                  </p>
                  <p className="text-foreground/80 dark:text-gray-300">
                    My daughter felt so at ease during her first visit.
                  </p>
                </div>
                <MessageSquare className="text-primary"></MessageSquare>
              </div>
              <p className="text-foreground/70 dark:text-gray-300 mb-3">
                &apos;We recently switched to this clinic and are so pleased with the
                quality of care and the welcoming atmosphere. The hygienist was
                very gentle.&apos;
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-bold text-foreground dark:text-white">
                    Michael R.
                  </p>
                  <p className="text-sm text-foreground/70 dark:text-gray-400">
                    Parent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center w-full transition-colors duration-300 bg-white dark:bg-gray-900 dark:text-white">
        <h2 className="text-4xl font-bold mb-6 text-foreground dark:text-white animate-fadeIn">
          Ready for a Healthier Smile?
        </h2>
        <p className="text-lg text-foreground/70 mb-10 max-w-2xl mx-auto animate-fadeIn animation-delay-200 dark:text-gray-300">
          Don&apos;t wait to achieve the smile you deserve. Schedule your
          consultation today.
        </p>
        <div className="animate-fadeIn animation-delay-400">
          <Link href="/appointment" className="cursor-pointer bg-primary hover:bg-secondary text-white font-bold py-4 px-9 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            Book Your Appointment Now
          </Link>
        </div>
      </section>
    </main>
  );
}