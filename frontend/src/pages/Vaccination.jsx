import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Shield, Calendar, Syringe, Search, ArrowUpCircle, Info, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import VaccinationCard from '../components/vaccinationCard'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VaccinationImage from "../Image/download (2).png";

export default function Vaccination() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Vaccination');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showInfoSection, setShowInfoSection] = useState(true);
  const searchSectionRef = useRef(null);

  useEffect(() => {
    // Fetch vaccination data
    axios.get('http://localhost:4001/products')
      .then(response => {
        setVaccinations(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vaccinations:", err);
        setError("Failed to load vaccinations.");
        setLoading(false);
      });
      
    // Scroll to top button visibility
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['Vaccination', 'Core Vaccine', 'Non-Core Vaccine', 'Seasonal Vaccines'];

  // Modern icons with consistent styling
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

  const filteredVaccinations = vaccinations
    .filter(vaccine => activeCategory === 'All' || vaccine.category === activeCategory)
    .filter(vaccine => 
      searchTerm === '' || 
      vaccine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vaccine.description && vaccine.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-b-emerald-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading vaccination products...</p>
          <p className="text-gray-500 mt-2">Fetching the latest information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border-l-4 border-red-500">
          <div className="flex justify-center mb-6">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertCircle className="text-red-500 w-10 h-10" />
            </div>
          </div>
          <h2 className="text-red-600 text-2xl font-bold mb-3 text-center">Unable to Load Vaccinations</h2>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-teal-50 to-white min-h-screen">
      <div className="container mx-auto px-2 py-4 ">
        {/* Enhanced Hero Section with more beautiful gradient background */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-2xl overflow-hidden mb-12 "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="p-8 md:p-12 lg:p-16 flex-1 relative z-10">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Pet <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">Vaccination</span> Services
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-2xl"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Protect your furry companions with our comprehensive vaccination programs, expertly delivered by our veterinary professionals
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={() => {
                    searchSectionRef.current.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-blue-900 font-semibold flex items-center gap-3 px-8 py-6 text-lg rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Schedule Now <Calendar className="w-6 h-6" />
                </Button>
              </motion.div>
            </div>
            <motion.div 
              className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden p-6 md:p-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={VaccinationImage} 
                alt="Vaccination Services" 
                className="w-90 h-90 object-contain "
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Vaccination Information Section */}
        <AnimatePresence>
          {showInfoSection && (
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl overflow-hidden mb-12 border border-blue-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 border-b border-blue-200">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Info className="mr-3 w-7 h-7" />
                  Essential Vaccination Information
                </h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowInfoSection(false)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white hover:text-blue-600 rounded-full w-24 h-10 flex items-center justify-center transition-all duration-300 text-white"
                >
                  <span>Hide</span>
                </Button>
              </div>
              
              <div className="p-8 md:p-10">
                <motion.p 
                  className="text-gray-700 mb-8 text-lg leading-relaxed max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Keeping your dog up-to-date on vaccinations is crucial for their
                  health and well-being. Our comprehensive vaccination program follows the latest veterinary guidelines to ensure optimal protection.
                </motion.p>

                <motion.div
                  className="grid md:grid-cols-3 gap-6 lg:gap-8 text-left"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                  }}
                >
                  <InfoCard
                    icon={<Shield className="w-12 h-12 text-indigo-500" />}
                    title="Core Vaccines"
                    content={
                      <ul className="list-disc list-outside ml-5 text-gray-600 space-y-3">
                        <li className="transition-all duration-200 hover:text-indigo-700"><span className="font-medium">Rabies:</span> Required by law and protects against fatal viral disease</li>
                        <li className="transition-all duration-200 hover:text-indigo-700"><span className="font-medium">Distemper:</span> Prevents serious viral illness affecting multiple body systems</li>
                        <li className="transition-all duration-200 hover:text-indigo-700"><span className="font-medium">Parvovirus:</span> Guards against highly contagious intestinal disease</li>
                        <li className="transition-all duration-200 hover:text-indigo-700"><span className="font-medium">Adenovirus:</span> Protects against canine hepatitis</li>
                      </ul>
                    }
                    titleClass="text-indigo-600"
                  />
                  <InfoCard
                    icon={<Calendar className="w-12 h-12 text-emerald-500" />}
                    title="Vaccination Schedule"
                    content={
                      <div className="text-gray-600 space-y-4">
                        <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-400">
                          <h4 className="font-semibold text-emerald-700 mb-2 flex items-center">
                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            Puppies
                          </h4>
                          <p>
                            Start at <span className="font-medium">6-8 weeks</span>, with
                            boosters every <span className="font-medium">3-4 weeks</span> until{" "}
                            <span className="font-medium">16 weeks old</span>.
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Adult Dogs
                          </h4>
                          <p>
                            Need{" "}
                            <span className="font-medium">annual or triennial boosters</span> depending on the vaccine type and local requirements.
                          </p>
                        </div>
                      </div>
                    }
                    titleClass="text-emerald-600"
                  />
                  <InfoCard
                    icon={<Syringe className="w-12 h-12 text-violet-500" />}
                    title="Additional Vaccines"
                    content={
                      <>
                        <p className="text-gray-600 mb-4">
                          Based on your pet's lifestyle, environment & risk factors, additional vaccines may be recommended:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                            <div className="h-2 w-2 rounded-full bg-violet-400 mr-2"></div>
                            <span className="text-violet-700 font-medium">Bordetella</span>
                          </div>
                          <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                            <div className="h-2 w-2 rounded-full bg-violet-400 mr-2"></div>
                            <span className="text-violet-700 font-medium">Leptospirosis</span>
                          </div>
                          <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                            <div className="h-2 w-2 rounded-full bg-violet-400 mr-2"></div>
                            <span className="text-violet-700 font-medium">Lyme Disease</span>
                          </div>
                          <div className="bg-violet-50 p-3 rounded-lg flex items-center">
                            <div className="h-2 w-2 rounded-full bg-violet-400 mr-2"></div>
                            <span className="text-violet-700 font-medium">Canine Influenza</span>
                          </div>
                        </div>
                      </>
                    }
                    titleClass="text-violet-600"
                  />
                </motion.div>

                <motion.div 
                  className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 text-lg mb-2">Important Reminder</h4>
                      <p className="text-amber-700">
                        Always consult with your veterinarian to determine the best
                        vaccination plan for your dog based on age, health status, and lifestyle factors. Individual needs may vary.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showInfoSection && (
          <Button 
            onClick={() => setShowInfoSection(true)}
            className="mb-8 bg-blue-500 text-indigo-600 hover:bg-blue-700 flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm"
          >
            <Info className="w-5 h-5" />
            Show Vaccination Information
          </Button>
        )}

        {/* Enhanced Search and Category Section */}
        <div className="bg-blue-200 p-8 rounded-2xl shadow-md mb-8 text-center" ref={searchSectionRef}>
          <div className="max-w-lg mx-auto mb-8">
                <div className="relative z-10">
                       <motion.h1
                         className="text-2xl md:text-5xl font-bold text-blue-700 mb-3"
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.8 }}
                       >
                         Our Vaccines
                       </motion.h1>
                       <motion.p
                         className="text-lg md:text-xl text-black max-w-2xl mx-auto mb-8"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 0.8, delay: 0.3 }}
                       >
                         Discover premium products specially curated for the health and happiness of your furry companions.
                       </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all ${
                    activeCategory === category
               ? `${categoryColors[category]} text-white shadow-lg` 
                      : 'bg-blue-600 text-white hover:bg-blue-800'
                  }`}
                >
                  <span>{categoryIcons[category]}</span>
                  <span className="font-medium">{category}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-4 px-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0 flex items-center">
            <Syringe className="w-6 h-6 mr-2 text-emerald-500" />
            {activeCategory !== 'Vaccination' ? activeCategory : 'All Vaccinations'}
            {searchTerm && <span className="text-emerald-600 ml-2">• "{searchTerm}"</span>}
          </h2>
          <div className="flex items-center bg-emerald-50 px-4 py-2 rounded-full text-emerald-700">
            <span className="font-medium mr-2">{filteredVaccinations.length}</span>
            <span>{filteredVaccinations.length === 1 ? 'product' : 'products'} found</span>
          </div>
        </div>

        {/* Vaccination Products */}
        <AnimatePresence mode="wait">
          {filteredVaccinations.length > 0 ? (
            <motion.div
              key={activeCategory + searchTerm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredVaccinations.map((vaccine, index) => (
                <motion.div
                  key={vaccine._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index % 4 * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <VaccinationCard
                    vaccine={vaccine}
                    categoryIcons={categoryIcons}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-emerald-300 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No vaccines found</h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg">
                We couldn't find any vaccines matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                onClick={() => {
                  setActiveCategory('Vaccination');
                  setSearchTerm('');
                }}
                className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Improved scroll to top button */}
      <AnimatePresence>
            {showScrollTop && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed bottom-16 left-16 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors"
                        onClick={scrollToTop}
                      >
                        <ArrowUpCircle size={30} />
                      </motion.button>
                    )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Info Card Component
function InfoCard({ icon, title, content, titleClass }) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all h-full"
      whileHover={{ y: -5 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
    >
      <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className={`text-xl font-semibold mb-4 ${titleClass}`}>{title}</h3>
      <div className="space-y-3">{content}</div>
    </motion.div>
  );
}