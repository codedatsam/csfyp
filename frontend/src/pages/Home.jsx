// ==========================================
// HOME/LANDING PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Public landing page
// ==========================================

import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Zap, Heart, Coffee, Sparkles } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="container-custom">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-4xl">
            {/* Logo & Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-primary-600 mb-6">
              Husleflow
            </h1>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Your Campus. Your Services. Your Hustle.
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connecting uni students who need quick, affordable services with fellow students ready to help — 24/7, right on campus.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register" className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center">
                Join the Hustle
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">24/7 Availability</h3>
                <p className="text-sm text-gray-600">
                  Need help at 2am before a deadline? Students are always around.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Verified Students</h3>
                <p className="text-sm text-gray-600">
                  All users are verified uni students. Safe and trusted.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quick & Easy</h3>
                <p className="text-sm text-gray-600">
                  Book or offer services in seconds. No hassle, just hustle.
                </p>
              </div>
            </div>

            {/* What Students Offer Section */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">What's the Hustle?</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['Tutoring', 'Essay Proofreading', 'Haircuts', 'Food Delivery', 'Tech Help', 'Moving Help', 'Photography', 'Design Work', 'Laundry', 'Cleaning'].map((service) => (
                  <span key={service} className="bg-white px-4 py-2 rounded-full shadow-sm text-gray-700 hover:shadow-md transition-shadow">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Alpha Testing Badge */}
            <div className="mt-16 inline-block bg-primary-600 text-white px-6 py-3 rounded-full">
              <p className="text-sm font-semibold">
                🚀 Now Live on Campus — Start Hustling Today!
              </p>
            </div>

            {/* Creative Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  <span>&</span>
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <span>by students, for students</span>
                </div>
                <div className="flex items-center space-x-1 text-primary-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Husleflow</span>
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-400">
                  © 2026 Husleflow. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;