import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  const features = [
    {
      icon: '🐕',
      title: 'Stray Dog Management',
      description: 'Report and track stray dog issues in your neighborhood for better community safety.'
    },
    {
      icon: '🗑️',
      title: 'Waste Management',
      description: 'Report garbage collection issues and maintain cleanliness in your area.'
    },
    {
      icon: '💧',
      title: 'Water Supply',
      description: 'Report water supply problems and infrastructure issues quickly.'
    },
    {
      icon: '🛣️',
      title: 'Road Maintenance',
      description: 'Report potholes, street lighting, and road safety concerns.'
    },
    {
      icon: '⚡',
      title: 'Power Issues',
      description: 'Report electricity problems and power outages in your locality.'
    },
    {
      icon: '📱',
      title: 'Real-time Updates',
      description: 'Get instant notifications and track the progress of your complaints.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Issues Resolved' },
    { number: '500+', label: 'Happy Residents' },
    { number: '50+', label: 'Staff Members' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏠</span>
              </div>
              <span className="text-2xl font-bold text-primary">FixMyArea</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/role-selection" className="nav-link">
                How It Works
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={`/${user?.role}/dashboard`} className="nav-link">
                    📊 Dashboard
                  </Link>
                  <Link to="/profile" className="nav-link">
                    👤 Profile
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.reload();
                    }} 
                    className="btn btn-secondary"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    🔑 Login
                  </Link>
                  <Link to="/role-selection" className="btn btn-primary">
                    🚀 Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="grid-2 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  Transform Your
                  <span className="block text-secondary">Neighborhood</span>
                </h1>
                <p className="text-xl text-neutral leading-relaxed">
                  Join thousands of residents who are making their communities better by reporting and tracking local issues. 
                  From stray dogs to infrastructure problems, we've got you covered.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to={`/${user?.role}/dashboard`} className="btn btn-primary">
                      📊 Go to Dashboard
                    </Link>
                    <Link to="/profile" className="btn btn-secondary">
                      👤 View Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/role-selection" className="btn btn-primary">
                      🚀 Start Reporting Today
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      🔑 Already a Member?
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="card p-8">
                <div className="grid-2 gap-4">
                  <div className="stats-card">
                    <div className="icon icon-medium mb-2">🐕</div>
                    <div className="text-sm font-medium text-neutral-700">Stray Dog Issue</div>
                    <div className="text-xs text-neutral-500">Reported 2 hours ago</div>
                  </div>
                  <div className="stats-card">
                    <div className="icon icon-medium mb-2">🗑️</div>
                    <div className="text-sm font-medium text-neutral-700">Garbage Collection</div>
                    <div className="text-xs text-neutral-500">In Progress</div>
                  </div>
                  <div className="stats-card">
                    <div className="icon icon-medium mb-2">💧</div>
                    <div className="text-sm font-medium text-neutral-700">Water Supply</div>
                    <div className="text-xs text-neutral-500">Resolved</div>
                  </div>
                  <div className="stats-card">
                    <div className="icon icon-medium mb-2">⚡</div>
                    <div className="text-sm font-medium text-neutral-700">Power Issue</div>
                    <div className="text-xs text-neutral-500">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stats-number text-primary mb-2">{stat.number}</div>
                <div className="stats-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Everything You Need to Fix Your Area
            </h2>
            <p className="text-xl text-neutral max-w-3xl mx-auto">
              Our comprehensive platform covers all types of local issues with real-time tracking and updates
            </p>
          </div>
          
          <div className="grid-3">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="card-body text-center">
                  <div className="icon icon-large mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                  <p className="text-neutral leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral">
              Simple steps to make your community better
            </p>
          </div>
          
          <div className="grid-3">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="icon icon-medium text-white">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">1. Report Issue</h3>
              <p className="text-neutral">Describe the problem and mark the exact location on our interactive map</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="icon icon-medium text-white">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">2. Track Progress</h3>
              <p className="text-neutral">Get real-time updates as staff members work on resolving your issue</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="icon icon-medium text-white">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">3. Issue Resolved</h3>
              <p className="text-neutral">Receive confirmation when your problem has been successfully resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of residents who are already improving their communities. 
            Start reporting issues today and see the change happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/role-selection" className="btn btn-secondary">
              🚀 Get Started Free
            </Link>
            <Link to="/role-selection" className="btn btn-secondary">
              🔑 Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏠</span>
              </div>
              <span className="text-2xl font-bold">FixMyArea</span>
            </div>
            <p className="text-white/70 mb-6">
              Making communities better, one issue at a time.
            </p>
            <div className="text-white/50 text-sm">
              © 2024 FixMyArea. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;