import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">Gharpaluwa is your one-stop shop for premium dog products and services.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/products" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="/vaccination" className="text-gray-400 hover:text-white transition-colors">Vaccination</a></li>
              <li><a href="/aboutus" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>

              
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">Gharpaluwa, Bhaktapur, Rdhe Radhe</p>
            <p className="text-gray-400">Phone: (977) 9841531760</p>
            <p className="text-gray-400">Email: Shirishnayaju@gmail.com</p>
            <p className="text-gray-400">Instagram: @Gharpaluwa</p>
            <p className="text-gray-400">Facebook: Gharpaluwa</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 Gharpaluwa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}