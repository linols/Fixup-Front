import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogIn, CircleUser, Users, HelpCircle, MessageCircle } from 'lucide-react';
import { Logo } from './components/Logo';
import { BackgroundShapes } from './components/BackgroundShapes';
import { WhyChooseUs } from './pages/WhyChooseUs';
import { HowItWorks } from './pages/HowItWorks';
import { LatestRequests } from './pages/LatestRequests';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ParticulierDashboard } from './pages/ParticulierDashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';

// Composant pour l'accès refusé
function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-fixup-black mb-4">Accès refusé</h1>
          <p className="text-xl text-fixup-black/70 mb-8">Cette page est réservée aux professionnels</p>
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-fixup-blue hover:bg-fixup-blue/90 transition-colors duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant de protection des routes
function PrivateRoute({ children, requiresProfessional = false }: { children: React.ReactNode, requiresProfessional?: boolean }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiresProfessional && userRole !== 'professionnel') {
    return (
      <>
        <Navigation />
        <AccessDenied />
      </>
    );
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen relative bg-fixup-white">
        <BackgroundShapes />
        <div className="relative pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
            <div className="text-center relative z-10">
              <div className="max-w-2xl mx-auto mb-12">
                <Logo size="large" className="w-full" />
              </div>
              <p className="mt-8 max-w-md mx-auto text-xl text-fixup-black font-coolvetica">
                Connectez-vous avec les meilleurs artisans de votre région
              </p>
              
              <div className="mt-10 flex justify-center space-x-6">
                <button className="px-8 py-3 bg-fixup-green text-fixup-black font-medium rounded-lg shadow-lg hover:bg-fixup-orange transform hover:-translate-y-1 transition-all duration-200">
                  Trouver un artisan
                </button>
                <button className="px-8 py-3 bg-fixup-blue text-fixup-black font-medium rounded-lg shadow-lg hover:bg-fixup-orange transform hover:-translate-y-1 transition-all duration-200">
                  Devenir partenaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Latest Requests Section */}
      <LatestRequests />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </>
  );
}

function NavLink({ icon, text, colorIndex, onClick }: { icon: React.ReactNode; text: string; colorIndex: number; onClick?: () => void }) {
  const hoverColors = [
    'hover:text-fixup-orange',
    'hover:text-fixup-blue',
    'hover:text-fixup-green'
  ];

  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center text-fixup-black ${hoverColors[colorIndex]} transition-colors duration-200`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
}

function Navigation() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const handleParticulierClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleArtisanClick = () => {
    if (isAuthenticated) {
      navigate('/professional-dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo className="w-32" />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-between flex-1">
            {/* Liens centrés */}
            <div className="flex justify-center space-x-8 flex-1">
              <NavLink 
                icon={<CircleUser className="w-4 h-4" />} 
                text="Artisan" 
                colorIndex={0}
                onClick={handleArtisanClick}
              />
              <NavLink 
                icon={<Users className="w-4 h-4" />} 
                text="Particulier" 
                colorIndex={1} 
                onClick={handleParticulierClick}
              />
              <NavLink icon={<HelpCircle className="w-4 h-4" />} text="Comment ça marche ?" colorIndex={2} />
              <NavLink icon={<MessageCircle className="w-4 h-4" />} text="Avis" colorIndex={0} />
            </div>

            {/* Connexion/Déconnexion aligné à droite */}
            <div className="ml-8">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-fixup-black bg-fixup-green hover:bg-fixup-orange transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Déconnexion
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-fixup-black bg-fixup-green hover:bg-fixup-orange transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function App() {
  return (
    <Router>
      <div className="relative overflow-hidden font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <ParticulierDashboard />
            </PrivateRoute>
          } />
          <Route path="/professional-dashboard" element={
            <PrivateRoute requiresProfessional={true}>
              <ProfessionalDashboard />
            </PrivateRoute>
          } />
          <Route
            path="/*"
            element={
              <>
                <Navigation />
                <HomePage />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}