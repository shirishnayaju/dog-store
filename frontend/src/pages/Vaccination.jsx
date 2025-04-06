import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Shield, Calendar, Syringe } from 'lucide-react';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import VaccinationCard from '../components/vaccinationCard'; 
import { motion } from 'framer-motion';

export default function Vaccination() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Vaccination');

  useEffect(() => {
    axios.get('http://localhost:4001/products') // Change endpoint if needed
      .then(response => {
        setVaccinations(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vaccinations:", err);
        setError("Failed to load vaccinations.");
        setLoading(false);
      });
  }, []);

  const categories = ['Vaccination', 'Core Vaccine', 'Non-Core Vaccine', 'Seasonal Vaccines'];

  const categoryIcons = {
    'Vaccination': <FaSyringe className="text-green-500" />,
    'Core Vaccine': <FaShieldAlt className="text-blue-500" />,
    'Non-Core Vaccine': <FaSyringe className="text-purple-500" />,
    'Seasonal Vaccines': <FaCalendarAlt className="text-orange-500" />
  };

  const categoryColors = {
    'Vaccination': 'bg-green-600 hover:bg-green-700',
    'Core Vaccine': 'bg-blue-600 hover:bg-blue-700',
    'Non-Core Vaccine': 'bg-purple-600 hover:bg-purple-700',
    'Seasonal Vaccines': 'bg-orange-600 hover:bg-orange-700'
  };

  const filteredVaccinations = activeCategory === 'Vaccinationn'
    ? vaccinations
    : vaccinations.filter(vaccine => vaccine.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading vaccinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Vaccination Information Section */}
      <motion.div
        className="bg-green-100 p-6 rounded-lg shadow-md mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold mb-4 text-blue-600">
          Dog Vaccination Information
        </h2>
        <p className="text-gray-700 mb-6">
          Keeping your dog up-to-date on vaccinations is crucial for their
          health and well-being. Here's what you need to know about dog
          vaccinations:
        </p>

        <motion.div
          className="grid md:grid-cols-3 gap-6 text-left"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          <InfoCard
            icon={<Shield className="w-10 h-10 text-blue-500 mb-2" />}
            title="Core Vaccines"
            content={
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Rabies</li>
                <li>Distemper</li>
                <li>Parvovirus</li>
                <li>Adenovirus</li>
              </ul>
            }
            titleClass="text-blue-600"
          />
          <InfoCard
            icon={<Calendar className="w-10 h-10 text-green-500 mb-2" />}
            title="Vaccination Schedule"
            content={
              <p className="text-gray-600">
                Puppies start vaccines at <strong>6-8 weeks</strong>, with
                boosters every <strong>3-4 weeks</strong> until{" "}
                <strong>16 weeks old</strong>. Adults need{" "}
                <strong>annual or triennial boosters</strong>.
              </p>
            }
            titleClass="text-green-600"
          />
          <InfoCard
            icon={<Syringe className="w-10 h-10 text-purple-500 mb-2" />}
            title="Additional Vaccines"
            content={
              <>
                <p className="text-gray-600">
                  Depending on lifestyle & location, your vet may recommend:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                  <li>Bordetella</li>
                  <li>Leptospirosis</li>
                  <li>Lyme Disease</li>
                </ul>
              </>
            }
            titleClass="text-purple-600"
          />
        </motion.div>

        <p className="mt-6 text-sm text-gray-500">
          Always consult with your veterinarian to determine the best
          vaccination plan for your dog.
        </p>
      </motion.div>


      {/* Vaccination Products Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Our Vaccines</h1>
        <p className="text-lg text-gray-600 mb-8">Discover the best vaccines for your furry friends!</p>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
           
           <motion.div
           key={category}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
         >
           
           <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                activeCategory === category
                  ? `${categoryColors[category]} text-white shadow-md`
                  : 'bg-blue-800 text-white hover:bg-blue-900'
              }`}
            >
              <span>{categoryIcons[category]}</span>
              <span>{category}</span>
            </Button>
              </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredVaccinations.map(vaccine => (
          <VaccinationCard // Use VaccinationCard here
            key={vaccine._id}
            vaccine={vaccine} // Pass the vaccine data
            categoryIcons={categoryIcons}
          />
        ))}
      </div>

      {filteredVaccinations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-gray-600">No vaccines found in this category.</p>
        </div>
      )}
    </div>
  );
}

// Reusable Info Card Component
function InfoCard({ icon, title, content, titleClass }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {icon}
      <h3 className={`text-lg font-semibold mb-2 ${titleClass}`}>{title}</h3>
      <div>{content}</div>
    </div>
  );
}
