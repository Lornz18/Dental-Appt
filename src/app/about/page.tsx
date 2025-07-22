// app/about/page.tsx

import React from 'react';

/**
 * AboutPage Component
 *
 * A modern, professional about page for the clinic with improved UI/UX.
 * Features a cohesive color system, enhanced typography, and better visual hierarchy.
 */
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white/80 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              About Our Clinic
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Compassionate healthcare with a personal touch, serving our community since 2005
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Mission Section */}
          <section className="mb-20">
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="bg-secondary/10 p-8 md:p-12">
                <h2 className="text-4xl font-bold mb-6 text-foreground flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our mission is to provide comprehensive, compassionate, and high-quality healthcare services to our community. We are dedicated to fostering a patient-centered environment where individuals receive personalized care, expert medical advice, and the support they need to achieve optimal health and well-being. We strive to be a trusted partner in your healthcare journey, promoting preventive care and early intervention for a healthier future.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do in providing exceptional healthcare
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Compassion */}
              <div className="bg-card rounded-xl shadow-md border border-border p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Compassion</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Treating every patient with empathy, kindness, and respect, ensuring they feel heard and cared for throughout their healthcare journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* Excellence */}
              <div className="bg-card rounded-xl shadow-md border border-border p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors duration-300">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Excellence</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Committing to the highest standards of medical care and professional conduct, continuously improving our services and expertise.
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrity */}
              <div className="bg-card rounded-xl shadow-md border border-border p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-300">
                    <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Integrity</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Operating with honesty, transparency, and ethical principles in all our dealings, building trust through consistent actions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Community Focus */}
              <div className="bg-card rounded-xl shadow-md border border-border p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Community Focus</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Actively engaging with and contributing to the health and well-being of our local community through outreach and education.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* History Section */}
          <section className="mb-20">
            <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-2xl p-8 md:p-12 border border-border">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Our Journey
                </h2>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Founded in <span className="font-semibold text-foreground">2005</span> by <span className="font-semibold text-foreground">Dr. Evelyn Reed</span>, our clinic began with a vision to create a local healthcare hub that prioritized personalized patient care. Starting with a small team and an unwavering commitment to service, we have grown steadily over the years.
                  </p>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our growth has been guided by our founding principles - expanding our services, investing in advanced medical technology, and fostering a welcoming atmosphere that makes every patient feel at home. Today, we are proud to serve thousands of patients annually, continuing our legacy of providing trusted, accessible, and comprehensive healthcare to our community.
                  </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">19+</div>
                    <div className="text-muted-foreground">Years of Service</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-secondary mb-2">10K+</div>
                    <div className="text-muted-foreground">Patients Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent-foreground mb-2">25+</div>
                    <div className="text-muted-foreground">Healthcare Professionals</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Experience Exceptional Healthcare?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                We are committed to your health and look forward to serving you. Schedule your appointment today and discover the difference personalized care makes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href='/appointment' className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  Schedule Appointment
                </a>
                <a href='/contact' className="bg-transparent hover:bg-secondary/10 text-secondary border-2 border-secondary font-semibold py-4 px-8 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  Contact Us
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;