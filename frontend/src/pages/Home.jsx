// ==========================================
// HOME/LANDING PAGE
// ==========================================
// Author: Samson Fabiyi
// Description: Public landing page
// ==========================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Shield, Zap, Users } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="container-custom">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-4xl">
            {/* Logo & Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-primary-600 mb-6">
              Hustleflow
            </h1>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Book Trusted Local Services Instantly
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with verified service providers in your area. From plumbers to electricians, 
              find and book the services you need with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register" className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Easy Booking</h3>
                <p className="text-sm text-gray-600">
                  Book services in minutes with our simple interface
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Verified Providers</h3>
                <p className="text-sm text-gray-600">
                  All service providers are verified and rated
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Confirmation</h3>
                <p className="text-sm text-gray-600">
                  Get booking confirmations immediately via email
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI Matching</h3>
                <p className="text-sm text-gray-600">
                  Smart recommendations based on your needs
                </p>
              </div>
            </div>

            {/* Alpha Testing Badge */}
            <div className="mt-16 inline-block bg-primary-600 text-white px-6 py-3 rounded-full">
              <p className="text-sm font-semibold">
                🧪 Alpha Testing Phase - Your Feedback Matters!
              </p>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Husleflow
                <br />
                University of Hertfordshire 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;