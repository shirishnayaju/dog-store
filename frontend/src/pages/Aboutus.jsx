import React from 'react'
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import Dog5 from '../Image/Dog5.png'; 
import { ShieldCheck, HeartHandshake, Syringe, ShoppingBag } from 'lucide-react';

function Aboutus() {
  return (
    <div className="max-w-full mx-auto text-center px-4 py-8">
      
      <div className="bg-blue-600 rounded-lg p-8 flex flex-col md:flex-row items-center justify-evenly mb-8 w-full">
        <div className='flex-row'>
          <div className='mb-12'> 
            <h2 className="text-4xl font-bold mb-4 text-white">Why Choose GHARPALUWA?</h2>
          </div>
          <div className="mt-4">
            <ul className="text-left text-xl list-disc list-inside mb-4 text-white">
              <li>Wide selection of premium dog food, toys, and accessories</li>
              <li>Expert-curated products for dogs of all sizes and breeds</li>
              <li>Fast and reliable shipping to your doorstep</li>
              <li>Excellent customer service and support</li>
              <li>Regular discounts and special offers for our loyal customers</li>
              <li>Professional vaccination services for your pets</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 "> 
          <img src={Dog5} alt="Happy dog" className="rounded-lg" style={{ height: "250px", width: "420px" }} />
        </div>
      </div>

      <p className="text-lg mb-8 text-gray-600 w-full">
        At Gharpaluwa, we understand that your furry friend is more than just a pet - they're family. 
        That's why we're committed to providing the highest quality products and services to keep your dog happy, 
        healthy, and tail-waggingly excited. From nutritious foods to durable toys, cozy beds, and vaccinations, 
        we've got everything your canine companion needs to thrive.
      </p>

      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-blue-800">Our Comprehensive Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard 
            icon={<ShieldCheck className="w-12 h-12 text-blue-500" />}
            title="Quality Products"
            description="We offer a curated selection of premium dog food, toys, and accessories."
          />
          <ServiceCard 
            icon={<ShoppingBag className="w-12 h-12 text-blue-500" />}
            title="E-commerce Platform"
            description="Shop for a wide range of dog products anytime, anywhere."
          />
          <ServiceCard 
            icon={<HeartHandshake className="w-12 h-12 text-blue-500" />}
            title="Customer Care"
            description="Our dedicated team is always ready to assist you with any queries."
          />
          <ServiceCard 
            icon={<Syringe className="w-12 h-12 text-blue-500" />}
            title="Vaccination Services"
            description="Professional in-house vaccination services to keep your pet healthy."
          />
        </div>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-blue-800">Our Vaccination Services</h2>
        <p className="text-lg mb-4 text-gray-600">
          At Gharpaluwa, we don't just sell products - we care for your pet's health too. Our professional 
          vaccination services ensure that your furry friend stays protected against common canine diseases. 
          Our team of experienced veterinarians provides:
        </p>
        <ul className="text-left text-lg list-disc list-inside mb-4 text-gray-600">
          <li>Core vaccinations (Distemper, Parvovirus, Hepatitis)</li>
          <li>Rabies vaccinations</li>
          <li>Bordetella (Kennel Cough) vaccinations</li>
          <li>Leptospirosis vaccinations</li>
          <li>Personalized vaccination schedules for puppies and adult dogs</li>
        </ul>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
          <Link to="/vaccination">Learn More About Our Vaccination Services</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-yellow-800">New Customer?</h3>
          <p className="mb-4 text-gray-600">Sign up today and get 10% off your first order!</p>
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Link to="/signup">Sign Up Now</Link>
          </Button>
        </div>
        <div className="bg-blue-100 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-blue-800">Returning Customer?</h3>
          <p className="mb-4 text-gray-600">Check out our latest arrivals and special offers!</p>
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>
      </div>

      <p className="text-lg text-gray-600 w-full mb-8">
        Join thousands of satisfied pet parents who trust Gharpaluwa for their canine needs. 
        We offer a seamless shopping experience, professional advice, and a wide range of products and services 
        to ensure your dog's well-being. Your dog deserves the best, and we're here to deliver it!
      </p>

      <div className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-3xl font-semibold mb-6 text-blue-800">Our Mission</h2>
        <p className="text-lg text-gray-600">
          At Gharpaluwa, our mission is to enhance the lives of dogs and their owners by providing top-quality 
          products, expert advice, and essential health services. We strive to be your one-stop shop for all 
          your dog's needs, from nutrition to healthcare, always putting the well-being of your furry family 
          members first.
        </p>
      </div>
    </div>
  )
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      {icon}
      <h3 className="text-xl font-semibold my-4 text-blue-800">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  )
}

export default Aboutus

