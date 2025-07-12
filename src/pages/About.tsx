
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">About MVJ Canteen</h1>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="mb-6">
                The MVJ College Canteen has been serving fresh and delicious meals to students and staff since 1995. 
                We take pride in offering nutritious food at affordable prices to keep our college community energized 
                throughout the day.
              </p>
              
              <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-6">
                To provide high-quality, nutritious meals that fuel academic excellence while offering a comfortable 
                space for students and staff to unwind and connect.
              </p>
              
              <h2 className="text-xl font-semibold mb-4">Our Team</h2>
              <p className="mb-6">
                Our dedicated team of chefs and service staff work tirelessly to ensure that every meal served 
                is prepared with care and attention to detail. Many of our staff members have been with us for 
                over a decade, bringing experience and passion to their work.
              </p>
              
              <h2 className="text-xl font-semibold mb-4">Facilities</h2>
              <p className="mb-6">
                Our canteen is equipped with modern kitchen facilities and a spacious dining area that can 
                accommodate up to 200 students at a time. We maintain strict hygiene standards and regularly 
                update our equipment to ensure food safety.
              </p>
              
              <h2 className="text-xl font-semibold mb-4">Special Diets</h2>
              <p>
                We understand the importance of catering to various dietary needs. Our menu includes vegetarian, 
                vegan, and gluten-free options. If you have specific dietary requirements, please feel free to 
                speak with our canteen manager.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
