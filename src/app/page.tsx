// pages/index.js

"use client";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-16 bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 text-center md:text-left z-10">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 text-foreground animate-fadeIn">
            Experience Your Healthiest Smile.
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fadeIn animation-delay-200">
            Discover compassionate, advanced dental care tailored to your unique
            needs.
          </p>
          <div className="flex justify-center md:justify-start animate-fadeIn animation-delay-400">
            {/* Placeholder for your Appointment component or a button */}
            <a href="/appointment" className="bg-primary hover:bg-secondary text-white hover:text-primary cursor-pointer font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
              Book Your Appointment
            </a>
            {/* If you have a specific Appointment component:
            <Appointment />
            */}
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center z-10">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/banner.jpg" // Replace with your actual image path
              alt="Smiling patient with dentist"
              layout="fill"
              objectFit="cover"
              className="opacity-90" // Slightly dim image for text contrast
            />
            {/* Optional overlay for better text contrast */}
            <div className="absolute inset-0 bg-foreground/5"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-background text-foreground">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground animate-fadeIn">
            Why Choose Our Clinic?
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200">
            We are dedicated to providing exceptional dental care with a
            personal touch. Discover the difference our commitment makes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-2xl transition duration-300 animate-fadeIn animation-delay-400">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-12 h-12 text-primary"
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
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              Advanced Technology
            </h3>
            <p className="text-foreground/70">
              Utilizing the latest dental equipment for precise diagnostics and
              comfortable treatments.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-2xl transition duration-300 animate-fadeIn animation-delay-600">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-12 h-12 text-primary"
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
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              Gentle & Compassionate Care
            </h3>
            <p className="text-foreground/70">
              Our friendly team ensures a relaxing and stress-free experience
              for every patient.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm bg-white hover:shadow-2xl transition duration-300 animate-fadeIn animation-delay-800">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-12 h-12 text-primary"
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
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              Expert Dental Team
            </h3>
            <p className="text-foreground/70">
              Highly skilled dentists and hygienists dedicated to your oral
              health and well-being.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 w-full mx-auto bg-primary/5 text-foreground">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground animate-fadeIn">
              Our Comprehensive Services
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200">
              From routine check-ups to specialized treatments, we offer a full
              spectrum of dental solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="flex items-center bg-white p-5 rounded-lg shadow-sm hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-400">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-5">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 12h14M5 12a2 2 0 012-2h11a2 2 0 012 2v6a2 2 0 01-2 2h-11a2 2 0 01-2-2v-6z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  General Dentistry
                </h3>
                <p className="text-foreground/70 text-sm">
                  Check-ups, cleanings, fillings.
                </p>
              </div>
            </div>
            {/* Service 2 */}
            <div className="flex items-center bg-white p-5 rounded-lg shadow-sm hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-600">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mr-5">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.345 15.848l1.207 1.207A2 2 0 0013.75 17.75v.007c0 .906-.784 1.694-1.694 1.694H4.75c-.753 0-1.46.445-1.761 1.148l-.253.632a1 1 0 001.408 1.164l.253-.632A3.374 3.374 0 017.25 19.77v-.007c0-.906.784-1.694 1.694-1.694h.007m6.312-12.742a3.375 3.375 0 00-4.675-0.433l-.373.152A1 1 0 009.75 10.437V10.5a3.375 3.375 0 002.25 3.176V15a2.625 2.625 0 002.625 2.625h.007c.906 0 1.694-.784 1.694-1.694v-.007A3.375 3.375 0 0016.338 13h.007A3.375 3.375 0 0019 10.5a3.375 3.375 0 00-2.662-3.261l-.373-.152z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Cosmetic Dentistry
                </h3>
                <p className="text-foreground/70 text-sm">
                  Whitening, veneers, bonding.
                </p>
              </div>
            </div>
            {/* Service 3 */}
            <div className="flex items-center bg-white p-5 rounded-lg shadow-sm hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-800">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center mr-5">
                <svg
                  className="w-8 h-8 text-accent-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c5.523 0 10-4.477 10-10S17.523 0 12 0 2 4.477 2 10s4.477 10 10 10zM12 7a3 3 0 100-6 3 3 0 000 6zM9 12h3v7M9 15h6"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Specialty Treatments
                </h3>
                <p className="text-foreground/70 text-sm">
                  Implants, orthodontics.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 animate-fadeIn animation-delay-1000">
            <button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-7 rounded-lg text-lg transition duration-300 ease-in-out">
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-background text-foreground">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground animate-fadeIn">
            Meet Our Expert Team
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200">
            Dedicated professionals committed to your oral health journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Dentist 1 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-400">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20">
              <Image
                src="/images/dentist-dr-smith.jpg" // Replace with your image
                alt="Dr. Jane Smith"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              Dr. Emily Carter
            </h3>
            <p className="text-primary text-sm font-medium uppercase mb-3">
              Lead Dentist
            </p>
            <p className="text-foreground/70 text-sm">
              "Dedicated to creating healthy, beautiful smiles with a gentle
              approach."
            </p>
            <button className="mt-4 px-4 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              Learn More
            </button>
          </div>
          {/* Dentist 2 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-600">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20">
              <Image
                src="/images/dentist-dr-jones.jpg" // Replace with your image
                alt="Dr. John Doe"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              Dr. David Lee
            </h3>
            <p className="text-secondary text-sm font-medium uppercase mb-3">
              Dental Hygienist
            </p>
            <p className="text-foreground/70 text-sm">
              "Passionate about preventative care and patient education."
            </p>
            <button className="mt-4 px-4 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              Learn More
            </button>
          </div>
          {/* Dentist 3 */}
          <div className="flex flex-col items-center text-center rounded-lg shadow-sm bg-white p-6 hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-800">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-5 border-4 border-primary/20">
              <Image
                src="/images/dentist-dr-chen.jpg" // Replace with your image
                alt="Dr. Sarah Chen"
                width={144}
                height={144}
                objectFit="cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              Dr. Aisha Khan
            </h3>
            <p className="text-primary text-sm font-medium uppercase mb-3">
              Orthodontist
            </p>
            <p className="text-foreground/70 text-sm">
              "Crafting perfect smiles with personalized orthodontic solutions."
            </p>
            <button className="mt-4 px-4 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg text-sm font-semibold transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-primary/5 text-foreground">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground animate-fadeIn">
            What Our Patients Say
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto animate-fadeIn animation-delay-200">
            Hear from our happy patients about their positive experiences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Testimonial 1 */}
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-400">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xl font-semibold text-foreground">
                  "Absolutely fantastic experience!"
                </p>
                <p className="text-foreground/80">
                  The staff were incredibly friendly and made me feel very
                  comfortable.
                </p>
              </div>
              <svg
                className="w-10 h-10 text-yellow-400 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 8.912l-3.177-1.265a.992.992 0 00-.545.072l-2.232 1.044a.992.992 0 00-.363.708v3.118a.992.992 0 00.363.708l2.232 1.044a.992.992 0 00.545.072l3.177-1.265c.413-.165.861.056 1.007.431l.872 1.745a.992.992 0 00.872 0l.872-1.745c.146-.375.594-.596 1.007-.431l3.177 1.265a.992.992 0 00.545-.072l2.232-1.044a.992.992 0 00.363-.708V11.5a.992.992 0 00-.363-.708l-2.232-1.044a.992.992 0 00-.545-.072l-3.177 1.265c-.413.165-.861-.056-1.007-.431l-.872-1.745a.992.992 0 00-.872 0l-.872 1.745a.992.992 0 00-1.007.431z"></path>
              </svg>
            </div>
            <p className="text-foreground/70 mb-3">
              "The clinic is modern, clean, and the staff is very professional
              and caring. Dr. Carter explained everything clearly."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-primary/30">
                <Image
                  src="/images/patient-avatar-1.jpg"
                  alt="Patient Avatar"
                  width={48}
                  height={48}
                  objectFit="cover"
                />
              </div>
              <div>
                <p className="font-bold text-foreground">Sarah J.</p>
                <p className="text-sm text-foreground/70">Satisfied Patient</p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-card-hover transition duration-300 animate-fadeIn animation-delay-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xl font-semibold text-foreground">
                  "Highly recommend this practice!"
                </p>
                <p className="text-foreground/80">
                  My daughter felt so at ease during her first visit.
                </p>
              </div>
              <svg
                className="w-10 h-10 text-yellow-400 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 8.912l-3.177-1.265a.992.992 0 00-.545.072l-2.232 1.044a.992.992 0 00-.363.708v3.118a.992.992 0 00.363.708l2.232 1.044a.992.992 0 00.545.072l3.177-1.265c.413-.165.861.056 1.007.431l.872 1.745a.992.992 0 00.872 0l.872-1.745c.146-.375.594-.596 1.007-.431l3.177 1.265a.992.992 0 00.545-.072l2.232-1.044a.992.992 0 00.363-.708V11.5a.992.992 0 00-.363-.708l-2.232-1.044a.992.992 0 00-.545-.072l-3.177 1.265c-.413.165-.861-.056-1.007-.431l-.872-1.745a.992.992 0 00-.872 0l-.872 1.745a.992.992 0 00-1.007.431z"></path>
              </svg>
            </div>
            <p className="text-foreground/70 mb-3">
              "We recently switched to this clinic and are so pleased with the
              quality of care and the welcoming atmosphere. The hygienist was
              very gentle."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-secondary/30">
                <Image
                  src="/images/patient-avatar-2.jpg"
                  alt="Patient Avatar"
                  width={48}
                  height={48}
                  objectFit="cover"
                />
              </div>
              <div>
                <p className="font-bold text-foreground">Michael R.</p>
                <p className="text-sm text-foreground/70">Parent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center bg-background text-foreground">
        <h2 className="text-4xl font-bold mb-6 text-foreground animate-fadeIn">
          Ready for a Healthier Smile?
        </h2>
        <p className="text-lg text-foreground/70 mb-10 max-w-2xl mx-auto animate-fadeIn animation-delay-200">
          Don't wait to achieve the smile you deserve. Schedule your
          consultation today.
        </p>
        <div className="animate-fadeIn animation-delay-400">
          <button className="bg-primary hover:bg-secondary text-white font-bold py-4 px-9 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            Book Your Appointment Now
          </button>
          {/* If you have a specific Appointment component:
            <Appointment />
          */}
        </div>
      </section>
    </main>
  );
}
