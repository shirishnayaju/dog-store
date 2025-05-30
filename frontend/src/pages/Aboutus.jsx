import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import Dog6 from "../Image/2f3ca15c897f9fac8a2ea0718a09bcd7-removebg-preview-removebg-preview.png";
import { 
  ShieldCheck, 
  HeartHandshake, 
  Syringe, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  MessageCircle,
  BadgePercent,
  PawPrint
} from 'lucide-react';
import { motion } from 'framer-motion';

function Aboutus() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (

    <div className="max-w-full mx-auto px-4 py-12 bg-gray-50">
      {/* "We Are Gharpaluwa" Banner */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">
          We Are Gharpaluwa
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 mx-auto rounded-full"></div>
        <p className="text-xl text-gray-700 mt-4 max-w-3xl mx-auto">
          Your trusted partner for all your pet care needs
        </p>
      </motion.div>
      
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 mb-12 shadow-xl overflow-hidden relative"
      >
        <div className="flex flex-col md:flex-row-reverse items-center justify-between max-w-6xl mx-auto gap-8">
          <div className="md:w-1/2 z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight"
            >
              Why Choose <span className="text-yellow-300 inline-block relative">
                GHARPALUWA?
                <span className="absolute bottom-1 left-0 w-full h-1 bg-yellow-300 rounded-full transform scale-x-0 origin-left animate-expandWidth"></span>
              </span>
            </motion.h1>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4"
            >
              {[
                "Wide selection of premium dog food, toys, and accessories",
                "Expert-curated products for dogs of all sizes and breeds",
                "Fast and reliable shipping to your doorstep",
                "Excellent customer service and support",
                "Regular discounts and special offers for loyal customers",
                "Professional vaccination services for your pets"
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="flex items-start gap-3 text-white hover:bg-blue-700/50 p-2 rounded-lg transition-all duration-300"
                >
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-yellow-300 mt-0.5" />
                  <p className="text-lg">{item}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6"
            >
            </motion.div>
          </div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative group">
              <div className="absolute -inset-1  group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative  p-2 rounded-2xl">
                <img 
                  src={Dog6} 
                  alt="Happy dog" 
                  className="w-96 h-96 object-cover rounded-xl transform hover:scale-105 transition-transform duration-300" 
                  style={{  objectPosition: 'center' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400 rounded-full opacity-10 animate-bounce duration-5000"></div>
        <motion.div 
          className="absolute bottom-10 right-10"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 5
          }}
        >
          <PawPrint className="w-16 h-16 text-yellow-300 opacity-20" />
        </motion.div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <p className="text-xl text-gray-700 leading-relaxed">
          At Gharpaluwa, we understand that your furry friend is more than just a pet - they're family. 
          That's why we're committed to providing the highest quality products and services to keep your dog happy, 
          healthy, and tail-waggingly excited. From nutritious foods to durable toys, cozy beds, and vaccinations, 
          we've got everything your canine companion needs to thrive.
        </p>
      </motion.div>

      {/* Services Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="mb-16"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">Our Comprehensive Services</h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <ServiceCard 
            icon={<ShieldCheck className="w-12 h-12 text-blue-500" />}
            title="Quality Products"
            description="We offer a curated selection of premium dog food, toys, and accessories."
            bgColor="bg-blue-50"
            iconBg="bg-blue-100"
          />
          <ServiceCard 
            icon={<ShoppingBag className="w-12 h-12 text-indigo-500" />}
            title="E-commerce Platform"
            description="Shop for a wide range of dog products anytime, anywhere."
            bgColor="bg-indigo-50"
            iconBg="bg-indigo-100"
          />
          <ServiceCard 
            icon={<HeartHandshake className="w-12 h-12 text-purple-500" />}
            title="Customer Care"
            description="Our dedicated team is always ready to assist you with any queries."
            bgColor="bg-purple-50"
            iconBg="bg-purple-100"
          />
          <ServiceCard 
            icon={<Syringe className="w-12 h-12 text-green-500" />}
            title="Vaccination Services"
            description="Professional in-house vaccination services to keep your pet healthy."
            bgColor="bg-green-50"
            iconBg="bg-green-100"
          />
        </motion.div>
      </motion.div>

      {/* Vaccination Services */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="bg-white p-10 rounded-2xl shadow-md mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="text-blue-100">
            <path fill="currentColor" d="M42.7,-72.1C54.9,-64.1,64.2,-51.7,72.7,-37.9C81.2,-24.2,89,-9,87.5,5.1C86,19.1,75.3,32.8,63.3,43.2C51.3,53.5,38,60.5,23.7,67.2C9.4,73.9,-5.8,80.3,-19.9,77.8C-34,75.3,-46.9,64,-56.4,51C-65.9,38,-71.9,23.3,-75.7,7.2C-79.5,-8.9,-81.1,-26.3,-73.9,-39.4C-66.7,-52.5,-50.7,-61.3,-35.7,-68.2C-20.7,-75.1,-6.7,-79.9,7.4,-77.7C21.4,-75.4,30.5,-80.1,42.7,-72.1Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Syringe className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800">Our Vaccination Services</h2>
          </div>
          
          <p className="text-lg text-gray-700 mb-6 max-w-4xl mx-auto text-center">
            At Gharpaluwa, we don't just sell products - we care for your pet's health too. Our professional 
            vaccination services ensure that your furry friend stays protected against common canine diseases. 
            Our team of experienced veterinarians provides:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {[
              "Core vaccinations (Distemper, Parvovirus, Hepatitis)",
              "Rabies vaccinations",
              "Bordetella (Kennel Cough) vaccinations",
              "Leptospirosis vaccinations",
              "Personalized vaccination schedules for puppies and adult dogs"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild className="px-8 py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform transition hover:scale-105">
              <Link to="/vaccination">
                <span className="flex items-center gap-2">
                  <Syringe className="w-5 h-5" />
                  <span className="text-base">Learn More About Our Vaccination Services</span>
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-2 gap-8 mb-16"
      >
        <motion.div variants={fadeIn} className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 opacity-10">
            <PawPrint className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-300 rounded-full mr-4">
                <BadgePercent className="w-6 h-6 text-yellow-800" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-800">New Customer?</h3>
            </div>
            <p className="mb-6 text-lg text-yellow-900">Sign up today and get 10% off your first order!</p>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md transform transition hover:scale-105">
              <Link to="/signup">
                <span className="flex items-center gap-2">
                  <span>Sign Up Now</span>
                </span>
              </Link>
            </Button>
          </div>
        </motion.div>
        
        <motion.div variants={fadeIn} className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 opacity-10">
            <ShoppingBag className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-300 rounded-full mr-4">
                <Truck className="w-6 h-6 text-blue-800" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800">Returning Customer?</h3>
            </div>
            <p className="mb-6 text-lg text-blue-900">Check out our latest arrivals and special offers!</p>
            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transform transition hover:scale-105">
              <Link to="/products">
                <span className="flex items-center gap-2">
                  <span>Shop Now</span>
                </span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Customer Testimonials */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="mb-16"
      >
        <div className="text-center mb-4">
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Join thousands of satisfied pet parents who trust Gharpaluwa for their canine needs. 
            We offer a seamless shopping experience, professional advice, and a wide range of products and services 
            to ensure your dog's well-being. Your dog deserves the best, and we're here to deliver it!
          </p>
        </div>
      </motion.div>

      {/* Mission Statement Box */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="bg-gradient-to-r from-blue-50 to-blue-100 p-10 rounded-2xl shadow-md relative overflow-hidden"
      >
        <div className="absolute -left-20 -top-20 opacity-5">
          <PawPrint className="w-64 h-64" />
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-5">
          <PawPrint className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-200 rounded-full">
              <HeartHandshake className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">Our Mission</h2>
          <p className="text-lg text-blue-900 leading-relaxed">
            At Gharpaluwa, our mission is to enhance the lives of dogs and their owners by providing top-quality 
            products, expert advice, and essential health services. We strive to be your one-stop shop for all 
            your dog's needs, from nutrition to healthcare, always putting the well-being of your furry family 
            members first.
          </p>
        </div>
      </motion.div>

      {/* Partnership Banner */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="bg-blue-700 text-white p-8 rounded-2xl text-center mt-16"
      >
        <h3 className="text-2xl font-bold mb-3">Become a Partner</h3>
        <p className="mb-4">Are you a veterinarian or pet service provider? Partner with us to reach more customers.</p>
        <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
          <Link to="/contact">Contact Us</Link>
        </Button>
      </motion.div>
    </div>
  );
}

function ServiceCard({ icon, title, description, bgColor = "bg-white", iconBg = "bg-blue-50" }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      className={`${bgColor} p-8 rounded-2xl shadow-md flex flex-col items-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className={`p-4 rounded-full ${iconBg} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </motion.div>
  );
}

export default Aboutus;