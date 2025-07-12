
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Your email" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Subject of your message" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Your message"
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Address</h3>
                    <p className="text-gray-600">
                      MVJ College of Engineering<br />
                      Near ITPL, Whitefield<br />
                      Bangalore - 560067
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Phone</h3>
                    <p className="text-gray-600">080-1234-5678</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Email</h3>
                    <p className="text-gray-600">canteen@mvjce.edu.in</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Opening Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 8:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                
                {/* Map placeholder */}
                <div className="mt-6 bg-gray-200 h-48 rounded-md flex items-center justify-center">
                  <p className="text-gray-600">Map will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
