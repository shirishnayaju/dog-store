import React from 'react';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl font-bold mb-2 ">GHARPALUWA</h2>
          <p className="text-white text-center max-w-md">Your one-stop shop for premium dog products and services</p>
        </div>
        
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About section */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 border-b-2 border-blue-500 pb-2">About Us</h3>
            <p className="text-gray-400 leading-relaxed">
              Gharpaluwa provides top-quality dog supplies, accessories, 
              and services to ensure your furry friends live their best lives. 
              We're passionate about pet care and committed to excellence.
            </p>
          </div>
          
          {/* Quick Links section */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 border-b-2 border-blue-500 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/products" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">→</span> Products
                </a>
              </li>
              <li>
                <a href="/vaccination" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">→</span> Vaccination
                </a>
              </li>
              <li>
                <a href="/aboutus" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                  <span className="mr-2">→</span> About Us
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact section with icons */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 border-b-2 border-blue-500 pb-2">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin size={18} className="text-blue-400 mr-3" />
                <p className="text-gray-400">Gharpaluwa, Bhaktapur, Radhe Radhe</p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-blue-400 mr-3" />
                <p className="text-gray-400">(977) 9841531760</p>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-blue-400 mr-3" />
                <p className="text-gray-400">Shirishnayaju@gmail.com</p>
              </div>
              <div className="mt-4 flex space-x-4">
                <a href="https://instagram.com/Gharpaluwa" className="text-gray-400 hover:text-pink-500 transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="https://facebook.com/Gharpaluwa" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Facebook size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Gharpaluwa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}