
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-canteen text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-lg mb-8 md:mb-0">
            <span className="text-yellow-300 font-medium">Eat Tasty Dish Everyday</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-4">
              Quick, Affordable, and Always Delicious
            </h1>
            <p className="text-gray-100 mb-8">
              From morning coffee to evening snacks, we've got your cravings covered.
            </p>
            <div className="flex gap-4">
              <Link to="/order">
                <Button className="bg-white text-canteen hover:bg-yellow-100 py-3 px-6 transition-all">
                  Order Online
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg">
            <img 
              src="/lovable-uploads/b473a8e5-561d-4b9d-9eb2-02ced13df440.png" 
              alt="Delicious food collection" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
