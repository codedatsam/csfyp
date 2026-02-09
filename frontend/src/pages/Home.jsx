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
  Clock, 
  Shield, 
  Zap, 
  Star,
  Users,
  CheckCircle,
  TrendingUp,
  Search,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';
import api from '../services/api';

function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    fetchFeaturedServices();
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
    { name: 'Beauty & Wellness', icon: '💆', color: 'from-pink-500 to-rose-500' },
    { name: 'Home Services', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
    { name: 'Professional', icon: '💼', color: 'from-purple-500 to-indigo-500' },
    { name: 'Tech & Digital', icon: '💻', color: 'from-green-500 to-emerald-500' },
    { name: 'Education', icon: '📚', color: 'from-orange-500 to-amber-500' },
    { name: 'Creative', icon: '🎨', color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>The Future of Local Services</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find & Book
                <span className="text-primary-600"> Expert Services</span>
                <br />Near You
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with trusted local professionals. Book appointments instantly. 
                Get things done — hassle-free.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row gap-2 max-w-xl mx-auto lg:mx-0 mb-8">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="What service do you need?"
                    className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
                  />
                </div>
                <Link to="/services" className="btn btn-primary px-8 py-3 flex items-center justify-center gap-2">
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
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>5-Star Reviews</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
              
              {/* Floating Cards */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl">
                      💼
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Professional Services</h3>
                      <p className="text-sm text-gray-500">50+ providers available</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['Web Development', 'Graphic Design', 'Photography'].map((service, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-700">{service}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">500+ Bookings</span>
                  </div>
                </div>

                {/* Floating Review Card */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">"Excellent service!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover a wide range of services from talented professionals in your area
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/services?category=${encodeURIComponent(category.name)}`}
                className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Find Services',
                description: 'Browse through our wide selection of professional services and find exactly what you need.',
                color: 'bg-blue-500'
              },
              {
                step: '02',
                icon: Calendar,
                title: 'Book Instantly',
                description: 'Choose your preferred time slot and book appointments with just a few clicks.',
                color: 'bg-purple-500'
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Get It Done',
                description: 'Meet with your service provider and get your task completed professionally.',
                color: 'bg-green-500'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow h-full border border-gray-100">
                  <span className="text-6xl font-bold text-gray-100 absolute top-4 right-4">
                    {item.step}
                  </span>
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <item.icon className="h-7 w-7 text-white" />
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
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Services</h2>
                <p className="text-gray-600">Popular services from top-rated providers</p>
              </div>
              <Link to="/services" className="btn btn-secondary hidden md:flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.slice(0, 6).map((service) => (
                <Link 
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                    {service.image ? (
                      <img src={service.image} alt={service.serviceName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-50">
                          {service.category === 'Tutoring' ? '📚' :
                           service.category === 'Haircuts' ? '💇' :
                           service.category === 'Tech Support' ? '💻' :
                           service.category === 'Photography' ? '📸' :
                           service.category === 'Design Work' ? '🎨' : '⭐'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-600">
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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {service.description || 'Professional service ready to help you.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {service.provider?.user?.firstName?.charAt(0) || 'P'}
                        </div>
                        <span className="text-sm text-gray-600">
                          {service.provider?.user?.firstName || 'Provider'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span className="text-sm text-gray-600">5.0</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link to="/services" className="btn btn-primary">
                View All Services
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust Husleflow for their service needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Create Free Account
                </Link>
                <Link to="/services" className="btn bg-white/20 text-white hover:bg-white/30 px-8 py-3 text-lg border border-white/30">
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-400 mb-4">Husleflow</h3>
              <p className="text-gray-400 text-sm">
                Connecting you with trusted local service providers. Book with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Become a Provider</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/services?category=Beauty" className="hover:text-white transition-colors">Beauty & Wellness</Link></li>
                <li><Link to="/services?category=Tech" className="hover:text-white transition-colors">Tech & Digital</Link></li>
                <li><Link to="/services?category=Professional" className="hover:text-white transition-colors">Professional</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
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
