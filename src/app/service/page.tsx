// app/services/page.tsx
"use client";

import React, { useState, useEffect } from "react";
// IMPORTANT: Adjust the import path to where your IService model is defined.
// For example, if it's in 'src/models/Service.ts', use:
// import { IService } from '@/models/Service';
// If it's directly in 'models/Service.ts' at the root, use:
// import { IService } from '../models/Service';
// Or if you have a lib folder:
// import { IService } from '@/lib/models/Service';
import { IService } from "@/app/models/services-model"; // <-- Adjust this path as needed
import { Clock, DollarSign, Heart, Shield, Sparkles, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a type for the API response to ensure type safety
interface ApiResponse {
  count: number; // Total number of services
  data: IService[];
  success?: string; // Optional message from the API
}

/**
 * ServicesPage Component
 *
 * This component fetches and displays a list of services offered by the clinic.
 * It handles loading states, errors, and renders each service with its details.
 */
const ServicesPage: React.FC = () => {
  const router = useRouter();

  const goToPage = () => {
    router.push('/appointment'); // e.g., '/about' or '/products?id=1'
  };
  // State to store the list of services
  const [services, setServices] = useState<IService[]>([]);
  // State to indicate if data is currently being fetched
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any error message encountered during fetching
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect Hook for data fetching
   *
   * This effect runs once when the component mounts. It fetches the services
   * from the '/api/services' endpoint.
   */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Make the GET request to the API endpoint
        const response = await fetch("/api/services");

        // Check if the response status is ok (2xx)
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          // Attempt to parse error message from response JSON
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage; // Use API's message if available
          } catch (jsonError) {
            // If response is not JSON, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // Parse the JSON response
        const data: ApiResponse = await response.json();
        // Update the services state with the fetched data
        setServices(data.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        // Set the error state with the error message
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching services.");
        }
      } finally {
        // Always set loading to false, whether successful or not
        setLoading(false);
      }
    };

    // Call the fetchServices function
    fetchServices();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // --- Render Logic ---

  // Display loading indicator if data is still being fetched
  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Our Services</h1>
        <p className="text-lg text-gray-700">Loading services...</p>
      </div>
    );
  }

  // Display error message if an error occurred
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Our Services</h1>
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  const getServiceIcon = (index: number) => {
    const icons = [Heart, Shield, Star, Sparkles, Heart, Shield];
    const Icon = icons[index % icons.length];
    return <Icon className="w-8 h-8" />;
  };

  // Display the list of services or a message if no services are found
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center text-white/80 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Our Medical Services
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 leading-relaxed">
              Comprehensive healthcare solutions tailored to your needs with
              compassionate, professional care from our experienced medical
              team.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-6 py-20">
        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-secondary" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Services Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We're preparing our comprehensive medical services for you.
                Please check back soon or contact us for more information.
              </p>
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                Contact Us
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* All Services */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  All Services
                </h2>
                <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <div
                    key={String(service._id)}
                    className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary/20 transition-colors duration-300">
                        {getServiceIcon(index)}
                      </div>
                      {services.some((fs) => fs._id === service._id) && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          Popular
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </h3>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between py-2 px-3 bg-secondary/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-secondary" />
                          Duration
                        </div>
                        <span className="font-medium text-foreground">
                          {service.durationMinutes} min
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Price
                        </div>
                        <span className="text-lg font-bold text-primary">
                          ${service.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button onClick={goToPage} className="cursor-pointer w-full bg-secondary/10 text-secondary py-2.5 rounded-lg font-medium hover:bg-secondary hover:text-primary transition-all duration-300 transform hover:scale-105 border border-secondary/20 hover:border-secondary">
                      Set An Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
