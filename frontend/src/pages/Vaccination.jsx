import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Shield, Calendar, Syringe, Search, ArrowUpCircle, Info, AlertCircle, User, Stethoscope, Clock } from 'lucide-react';
import axios from 'axios';
import { FaSyringe, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import VaccinationCard from '../components/vaccinationCard'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function Vaccination() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Vaccination');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showInfoSection, setShowInfoSection] = useState(true);
  const [showVaccinationGivers, setShowVaccinationGivers] = useState(false);

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

  // Sample vaccination givers data
  const vaccinationGivers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      title: "Senior Veterinarian",
      specialty: "Canine Immunology",
      experience: "15+ years",
      availability: "Mon-Fri, 9am-5pm",
      image: "/images/vet1.jpg",
      certification: "American Veterinary Medical Association",
      bio: "Dr. Johnson specializes in preventative care with expertise in vaccination protocols for dogs of all breeds and ages."
    }
  ];

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
      <div className="container mx-auto px-4 py-8">
        {/* Modern Hero Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 text-white py-12 px-8 md:px-12 relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Dog Vaccination Services</h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl">Protect your furry companions with our comprehensive vaccination programs, expertly delivered by our veterinary professionals</p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <Button 
                  onClick={() => setShowVaccinationGivers(!showVaccinationGivers)}
                  className="px-6 py-3 rounded-full flex items-center gap-2 bg-emerald-800 text-emerald-700 hover:bg-emerald-400 transition-all shadow-md"
                >
                  <User className="w-5 h-5" />
                  <span>{showVaccinationGivers ? 'Hide Vaccination Giver Info' : 'Show Vaccination Giver Info'}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Vaccination Givers Section */}
        <AnimatePresence>
          {showVaccinationGivers && (
            <motion.div
              className="bg-white rounded-2xl shadow-md overflow-hidden mb-12"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-emerald-50 px-8 py-5 border-b border-emerald-100">
                <h2 className="text-2xl font-semibold text-emerald-700 flex items-center">
                  <User className="mr-3 w-6 h-6" />
                  Our Veterinary Team
                </h2>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 mb-8 text-lg">
                  Our experienced team of veterinarians and technicians specialize in pet vaccinations. 
                  We're committed to providing safe, effective vaccination services with minimal stress for your beloved companions.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                  {vaccinationGivers.map((giver) => (
                    <motion.div
                      key={giver.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-100 text-emerald-500">
                          <User size={64} />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800">{giver.name}</h3>
                        <p className="text-emerald-600 font-medium text-sm mb-4">{giver.title}</p>
                        
                        <div className="space-y-3 text-sm text-gray-600 mt-4">
                          <div className="flex items-start">
                            <Stethoscope className="w-4 h-4 mr-2 mt-0.5 text-emerald-500 flex-shrink-0" />
                            <span><strong className="font-medium">Specialty:</strong> {giver.specialty}</span>
                          </div>
                          <div className="flex items-start">
                            <Clock className="w-4 h-4 mr-2 mt-0.5 text-emerald-500 flex-shrink-0" />
                            <span><strong className="font-medium">Available:</strong> {giver.availability}</span>
                          </div>
                          <div className="flex items-start">
                            <Shield className="w-4 h-4 mr-2 mt-0.5 text-emerald-500 flex-shrink-0" />
                            <span><strong className="font-medium">Experience:</strong> {giver.experience}</span>
                          </div>
                        </div>
                        
                        <p className="mt-4 text-gray-600 text-sm">{giver.bio}</p>
                        
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-indigo-800">
                      <strong className="font-medium">Pro Tip:</strong> Our vaccination providers work closely with your regular veterinarian to ensure your dog receives the most appropriate vaccines based on their lifestyle, age, and health status.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vaccination Information Section */}
        <AnimatePresence>
          {showInfoSection && (
            <motion.div
              className="bg-white rounded-2xl shadow-md overflow-hidden mb-12"
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center bg-blue-600 px-6 py-4 border-b border-indigo-100">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <Info className="mr-2 w-6 h-6" />
                  Essential Vaccination Information
                </h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowInfoSection(false)}
                  className=" hover:text-blue-600 hover:bg-white rounded-full w-20 h-10 p-0 flex items-center justify-center"
                >
                  Hide
                </Button>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 mb-8 text-lg">
                  Keeping your dog up-to-date on vaccinations is crucial for their
                  health and well-being. Our comprehensive vaccination program follows the latest veterinary guidelines.
                </p>

                <motion.div
                  className="grid md:grid-cols-3 gap-8 text-left"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                  }}
                >
                  <InfoCard
                    icon={<Shield className="w-10 h-10 text-indigo-500 mb-2" />}
                    title="Core Vaccines"
                    content={
                      <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Rabies (required by law)</li>
                        <li>Distemper</li>
                        <li>Parvovirus</li>
                        <li>Adenovirus (Canine Hepatitis)</li>
                      </ul>
                    }
                    titleClass="text-indigo-600"
                  />
                  <InfoCard
                    icon={<Calendar className="w-10 h-10 text-emerald-500 mb-2" />}
                    title="Vaccination Schedule"
                    content={
                      <div className="text-gray-600 space-y-2">
                        <p>
                          <span className="font-medium">Puppies:</span> Start at <span className="font-medium">6-8 weeks</span>, with
                          boosters every <span className="font-medium">3-4 weeks</span> until{" "}
                          <span className="font-medium">16 weeks old</span>.
                        </p>
                        <p>
                          <span className="font-medium">Adults:</span> Need{" "}
                          <span className="font-medium">annual or triennial boosters</span> depending on the vaccine type and local requirements.
                        </p>
                      </div>
                    }
                    titleClass="text-emerald-600"
                  />
                  <InfoCard
                    icon={<Syringe className="w-10 h-10 text-violet-500 mb-2" />}
                    title="Additional Vaccines"
                    content={
                      <>
                        <p className="text-gray-600">
                          Depending on lifestyle & location, your vet may recommend:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                          <li>Bordetella (Kennel Cough)</li>
                          <li>Leptospirosis</li>
                          <li>Lyme Disease</li>
                          <li>Canine Influenza</li>
                        </ul>
                      </>
                    }
                    titleClass="text-violet-600"
                  />
                </motion.div>

                <div className="mt-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800">
                      <strong className="font-medium">Important Note:</strong> Always consult with your veterinarian to determine the best
                      vaccination plan for your dog based on age, health status, and lifestyle factors.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showInfoSection && (
          <Button 
            onClick={() => setShowInfoSection(true)}
            className="mb-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm"
          >
            <Info className="w-5 h-5" />
            Show Vaccination Information
          </Button>
        )}

        {/* Enhanced Search and Category Section */}
        <div className="bg-blue-200 p-8 rounded-2xl shadow-md mb-8">
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
            className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-emerald-700 transition-all hover:shadow-xl"
            onClick={scrollToTop}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUpCircle size={24} />
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