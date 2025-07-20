// pages/index.js (or your chosen file name like pages/dentistTeam.js)

"use client";
import Image from "next/image";
import Link from "next/link";

export default function DentistTeamPage() {
  const dentists = [
    {
      id: 1,
      name: "Dr. Emily Carter",
      title: "Lead Dentist & Founder",
      image: "/images/dentist-dr-carter.jpg",
      bio: "Dr. Carter brings over 15 years of experience in general and cosmetic dentistry. She is passionate about utilizing the latest advancements in dental technology to provide exceptional patient care.",
      achievements: [
        "Top Dentist Award, 2022 & 2023",
        "Certified Invisalign Provider",
        "Member of the American Dental Association (ADA)",
        "Published in 'Journal of Cosmetic Dentistry'",
        "Keynote speaker at the National Dental Convention, 2021",
      ],
      qualifications: ["DMD, Harvard School of Dental Medicine", "BSc in Biology, Stanford University"],
      specialties: ["Cosmetic Dentistry", "Restorative Dentistry", "Dental Implants"],
    },
    {
      id: 2,
      name: "Dr. David Lee",
      title: "Senior Dental Hygienist",
      image: "/images/dentist-dr-lee.jpg",
      bio: "With a focus on preventative care and patient education, David has been a trusted hygienist for over 10 years. He excels at making patients feel comfortable and informed.",
      achievements: [
        "Excellence in Patient Care Award, 2021",
        "Advanced Training in Periodontal Therapy",
        "Certified Laser Dental Hygienist",
        "Volunteer Dentist at Local Community Health Fairs",
      ],
      qualifications: ["RDH, University of Michigan School of Dentistry", "BS in Dental Hygiene"],
      specialties: ["Preventative Care", "Periodontal Therapy", "Patient Education"],
    },
    {
      id: 3,
      name: "Dr. Aisha Khan",
      title: "Orthodontic Specialist",
      image: "/images/dentist-dr-khan.jpg",
      bio: "Dr. Khan is a board-certified orthodontist with a keen eye for detail and a passion for creating beautiful, functional smiles.",
      achievements: [
        "Board Certified Orthodontist",
        "Advanced Training in Orthognathic Surgery",
        "Member of the American Association of Orthodontists (AAO)",
        "Recognized for innovative use of 3D imaging in orthodontics",
      ],
      qualifications: ["DDS, Columbia University College of Dental Medicine", "MS in Orthodontics, New York University"],
      specialties: ["Orthodontics", "Clear Aligners", "Pediatric Dentistry"],
    },
    {
      id: 4,
      name: "Dr. Benjamin Kim",
      title: "Pediatric Dentist",
      image: "/images/dentist-dr-kim.jpg",
      bio: "Dr. Kim is dedicated to providing a positive and fun dental experience for children. With a specialization in pediatric dentistry, he focuses on early childhood oral health.",
      achievements: [
        "Fellow of the American Academy of Pediatric Dentistry (FAAPD)",
        "Specialist in Sedation Dentistry for Children",
        "Recipient of the 'Caring Hands Award' for Pediatric Excellence",
        "Guest lecturer on Children's Oral Health",
      ],
      qualifications: ["DDS, University of Pennsylvania School of Dental Medicine", "Pediatric Dentistry Residency, Children's Hospital of Philadelphia"],
      specialties: ["Pediatric Dentistry", "Interceptive Orthodontics", "Dental Sealants"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-24 px-4">
        <div className="absolute inset-0 bg-primary opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-background mb-6 tracking-tight">
            Meet Our Team
          </h1>
          <p className="text-xl md:text-2xl text-background/90 max-w-3xl mx-auto leading-relaxed">
            Exceptional dental professionals dedicated to your perfect smile
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-background/10 rounded-full blur-3xl"></div>
      </section>

      {/* Team Grid Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {dentists.map((dentist) => (
              <div
                key={dentist.id}
                className={`group relative overflow-hidden rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all duration-500`}
              >
                {/* Card Content */}
                <div className="p-8 lg:p-10">
                  {/* Profile Image */}
                  <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative overflow-hidden rounded-full border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <Image
                        src={dentist.image}
                        alt={dentist.name}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {dentist.name}
                    </h3>
                    <p className="text-secondary font-semibold text-lg uppercase tracking-wide">
                      {dentist.title}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-foreground/80 text-center mb-8 leading-relaxed">
                    {dentist.bio}
                  </p>

                  {/* Specialties */}
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-foreground mb-4 text-center">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {dentist.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Achievements */}
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-foreground mb-4 text-center">
                      Key Achievements
                    </h4>
                    <div className="space-y-2">
                      {dentist.achievements.slice(0, 3).map((achievement, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-foreground/80 text-sm">{achievement}</span>
                        </div>
                      ))}
                      {dentist.achievements.length > 3 && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-secondary/50 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-foreground/60 text-sm italic">
                            +{dentist.achievements.length - 3} more achievements
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center">
                    <Link
                      href={`/dentists/${dentist.id}`}
                      className="inline-flex items-center px-8 py-3 bg-primary text-background font-semibold rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25"
                    >
                      View Full Profile
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 group-hover:bg-secondary/20 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
            Ready to Meet Your Perfect Dental Match?
          </h2>
          <p className="text-background/90 text-lg mb-8 leading-relaxed">
            Schedule a consultation with any of our specialists and discover personalized care tailored to your unique needs.
          </p>
          <Link
            href="/book-appointment"
            className="inline-flex items-center px-10 py-4 bg-background text-secondary font-bold rounded-full hover:bg-background/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Book Your Consultation
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}