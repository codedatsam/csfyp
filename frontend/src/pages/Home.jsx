// ==========================================
// HOME/LANDING PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Modern professional landing page
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Star,
  CheckCircle,
  TrendingUp,
  Search,
  Calendar,
  Sparkles,
  ChevronRight,
  Heart,
  Coffee
} from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

// Service images for background
const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', // Hair salon
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', // Gym
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Fitness
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Makeup
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', // Barber
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', // Spa
];

function Home() {
  // SEO
  useSEO({
    title: 'Book Local Services | Hair, Beauty, Fitness & More',
    description: 'Find and book trusted local service providers instantly. Hair stylists, personal trainers, photographers, tutors and more. Fast, secure booking across the UK.',
  });
  const [featuredServices, setFeaturedServices] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchFeaturedServices();
    
    // Rotate background images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SERVICE_IMAGES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      const response = await api.get('/services?limit=6');
      if (response.success) {
        setFeaturedServices(response.data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const categories = [
    { name: 'Hair & Beauty', icon: '💇', color: 'from-pink-500 to-rose-500', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
    { name: 'Fitness & Gym', icon: '💪', color: 'from-blue-500 to-cyan-500', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
    { name: 'Professional', icon: '💼', color: 'from-purple-500 to-indigo-500', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { name: 'Tech & Digital', icon: '💻', color: 'from-green-500 to-emerald-500', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400' },
    { name: 'Education', icon: '📚', color: 'from-orange-500 to-amber-500', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400' },
    { name: 'Home Services', icon: '🏠', color: 'from-teal-500 to-cyan-500', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Husleflow
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/services" className="hidden md:block text-gray-600 hover:text-primary-600 transition-colors">
                Browse Services
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Images */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background Images */}
        <div className="absolute inset-0">
          {SERVICE_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
        </div>

        <div className="container-custom relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Book Local Services Instantly</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find & Book
                <span className="text-primary-600 block">Expert Services</span>
                Near You
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                From hair styling to fitness training, connect with trusted local professionals and book appointments instantly.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-xl mx-auto lg:mx-0 mb-8 border border-gray-100">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="What service do you need?"
                    className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
                  />
                </div>
                <Link to="/services" className="btn btn-primary px-8 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Verified Providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>5-Star Reviews</span>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative hidden lg:block">
              {/* Service Cards Stack */}
              <div className="relative h-[500px]">
                {/* Card 1 - Hair Stylist */}
                <div className="absolute top-0 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="h-40 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400')"}} />
                  <div className="p-4">
                    <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">Hair & Beauty</span>
                    <h3 className="font-bold text-gray-900 mt-2">Professional Hair Styling</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(128)</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Fitness */}
                <div className="absolute top-32 left-0 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="h-32 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400')"}} />
                  <div className="p-4">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Fitness</span>
                    <h3 className="font-bold text-gray-900 mt-2">Personal Training</h3>
                    <p className="text-sm text-primary-600 font-semibold mt-1">From £30/session</p>
                  </div>
                </div>

                {/* Card 3 - Stats */}
                <div className="absolute bottom-20 right-10 bg-white rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">500+</p>
                      <p className="text-sm text-gray-500">Happy Customers</p>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Review */}
                <div className="absolute bottom-0 left-10 bg-white rounded-xl shadow-xl p-4 max-w-xs">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 italic">"Amazing service! The stylist was professional and friendly."</p>
                  <p className="text-xs text-gray-400 mt-2">— Sarah M.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover services from talented professionals in your area
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/services?category=${encodeURIComponent(category.name)}`}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-square relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{backgroundImage: `url(${category.image})`}}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <span className="text-4xl mb-2">{category.icon}</span>
                    <h3 className="font-bold text-center text-sm">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your perfect service in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Search & Discover',
                description: 'Browse services by category or search for exactly what you need.',
                color: 'bg-blue-500'
              },
              {
                step: '02',
                icon: Calendar,
                title: 'Book Instantly',
                description: 'Choose your time and book with just a few clicks. No waiting.',
                color: 'bg-purple-500'
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Enjoy the Service',
                description: 'Meet your provider and enjoy professional service delivery.',
                color: 'bg-green-500'
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 group-hover:border-primary-200">
                  <span className="text-7xl font-bold text-gray-100 absolute top-4 right-4 group-hover:text-primary-100 transition-colors">
                    {item.step}
                  </span>
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Services</h2>
                <p className="text-gray-600">Popular services from top-rated providers</p>
              </div>
              <Link to="/services" className="btn btn-primary hidden md:flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.slice(0, 6).map((service) => (
                <Link 
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                    {service.image ? (
                      <img src={service.image} alt={service.serviceName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                        <span className="text-6xl opacity-50">
                          {service.category === 'Hair & Beauty' ? '💇' :
                           service.category === 'Fitness & Gym' ? '💪' :
                           service.category === 'Tech & Digital' ? '💻' :
                           service.category === 'Photography' ? '📸' :
                           service.category === 'Design Work' ? '🎨' : '⭐'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full text-sm font-bold text-primary-600 shadow-lg">
                      £{parseFloat(service.price).toFixed(0)}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.serviceName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {service.description || 'Professional service ready to help you.'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                          {service.provider?.user?.firstName?.charAt(0) || 'P'}
                        </div>
                        <span className="text-sm text-gray-600">
                          {service.provider?.user?.firstName || 'Provider'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">5.0</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link to="/services" className="btn btn-primary">
                View All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands who trust Husleflow for their service needs. Create your free account today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl">
                  Create Free Account
                </Link>
                <Link to="/services" className="btn bg-white/10 text-white hover:bg-white/20 px-10 py-4 text-lg border-2 border-white/30">
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-primary-400 mb-4">Husleflow</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted platform for booking local services. Connect with professionals instantly.
              </p>
              <div className="flex items-center gap-2 text-gray-400">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span>&</span>
                <Coffee className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Become a Provider</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/services?category=Hair" className="hover:text-white transition-colors">Hair & Beauty</Link></li>
                <li><Link to="/services?category=Fitness" className="hover:text-white transition-colors">Fitness & Gym</Link></li>
                <li><Link to="/services?category=Tech" className="hover:text-white transition-colors">Tech & Digital</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Husleflow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
