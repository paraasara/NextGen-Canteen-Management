
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FoodItemCard from "@/components/FoodItemCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { menuItems } from "@/data/menuUpdated";

const Index = () => {
  // Get only popular items
  const popularItems = menuItems.filter(item => item.popular).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Popular Items</h2>
              <Link to="/menu" className="text-canteen flex items-center hover:underline">
                See All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.map((item) => (
                <FoodItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-canteen text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Menu</h3>
                <p className="text-gray-600">
                  Explore our wide variety of delicious food options
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-canteen text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Add to Cart</h3>
                <p className="text-gray-600">
                  Select your favorite items and add them to your cart
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-canteen text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Pickup & Enjoy</h3>
                <p className="text-gray-600">
                  Pay at the canteen counter and enjoy your meal!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
