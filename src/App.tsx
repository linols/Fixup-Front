import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogIn, CircleUser, Users, HelpCircle, MessageCircle, ChevronDown, Camera, LogOut } from 'lucide-react';
import { Logo } from './components/Logo';
import { uploadProfilePhoto, getProfilePhotoUrl, fetchConversations } from './services/api';
import { useMessageStream } from './hooks/useMessageStream';
import avatar1 from './assets/pp-anonymes_Fixaly-01.png';
import avatar2 from './assets/pp-anonymes_Fixaly-02.png';
import avatar3 from './assets/pp-anonymes_Fixaly-03.png';
import avatar4 from './assets/pp-anonymes_Fixaly-04.png';
import { BackgroundShapes } from './components/BackgroundShapes';
import { WhyChooseUs } from './pages/WhyChooseUs';
import { HowItWorks } from './pages/HowItWorks';
import { LatestRequests } from './pages/LatestRequests';
import { ClientReviews } from './pages/ClientReviews';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ParticulierDashboard } from './pages/ParticulierDashboard';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { TrouverArtisan } from './pages/TrouverArtisan';
import { ProfilArtisan } from './pages/ProfilArtisan';
import { EditProfilArtisan } from './pages/EditProfilArtisan';
import { Messagerie } from './pages/Messagerie';
import { LegalPage } from './pages/LegalPage';
import { RepairerTelephone } from './pages/RepairerTelephone';
import { RepairerOrdinateur } from './pages/RepairerOrdinateur';

const avatars: Record<string, string> = { '1': avatar1, '2': avatar2, '3': avatar3, '4': avatar4 };

// Composant pour l'accès refusé
function AccessDenied({ role }: { role: 'professionnel' | 'particulier' }) {
  const isForPro = role === 'professionnel';

  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-fixup-black mb-4">Accès refusé</h1>
          <p className="text-xl text-fixup-black/70 mb-8">
            {isForPro ? "Cette page est réservée aux professionnels" : "Cette page est réservée aux particuliers"}
          </p>
          <Link
            to={isForPro ? "/dashboard" : "/professional-dashboard"}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-fixup-blue hover:bg-fixup-blue/90 transition-colors duration-200"
          >
            Retour à mon espace
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant de protection des routes
function PrivateRoute({
  children,
  requiresProfessional = false,
  requiresParticulier = false
}: {
  children: React.ReactNode,
  requiresProfessional?: boolean,
  requiresParticulier?: boolean
}) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiresProfessional && userRole !== 'professionnel') {
    return (
      <>
        <Navigation />
        <AccessDenied role="professionnel" />
      </>
    );
  }

  if (requiresParticulier && userRole !== 'particulier') {
    return (
      <>
        <Navigation />
        <AccessDenied role="particulier" />
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
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen relative bg-fixup-white">
        <BackgroundShapes />
        <div className="relative pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
            <div className="text-center relative z-10">
              <div className="max-w-4xl mx-auto mb-12">
                <Logo size="large" variant="hero" className="w-full" />
                <p className="-mt-4 text-5xl font-normal text-fixup-black font-coolvetica">
                  La réparation accessible
                </p>
              </div>
              <p className="mt-8 max-w-md mx-auto text-xl text-fixup-black font-coolvetica">
                Connectez-vous avec les meilleurs artisans de votre région
              </p>

              <div className="mt-10 flex justify-center space-x-6">
                <button
                  onClick={() => navigate('/trouver-artisan')}
                  className="px-8 py-3 bg-fixup-green text-fixup-black font-medium rounded-lg shadow-lg hover:bg-fixup-orange transform hover:-translate-y-1 transition-all duration-200"
                >
                  Trouver un artisan
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-fixup-blue text-fixup-black font-medium rounded-lg shadow-lg hover:bg-fixup-orange transform hover:-translate-y-1 transition-all duration-200"
                >
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

      {/* Client Reviews Section */}
      <ClientReviews />

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
  const avatarIndex = localStorage.getItem('userAvatar') ?? '1';
  const userAvatarSrc = avatars[avatarIndex] ?? avatar1;

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On n'est pas sur la page d'accueil : on y navigue puis on scrolle
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');
  const [avatarTimestamp, setAvatarTimestamp] = React.useState(Date.now());
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Charger le total initial de messages non lus
  React.useEffect(() => {
    if (isAuthenticated && userId) {
      fetchConversations(userId)
        .then((convs) => {
          const total = convs.reduce((sum, c) => sum + (c.non_lus || 0), 0);
          setUnreadCount(total);
        })
        .catch((err) => console.error("Erreur chargement infos de messagerie:", err));
    }
  }, [isAuthenticated, userId]);

  // Maintenir le total en temps réel via SSE
  useMessageStream({
    userId: isAuthenticated ? userId : null,
    onNewMessage: (data) => {
      // Ignorer si on est l'expéditeur (le badge est pour les reçus)
      if (data.expediteur_id !== parseInt(userId || '0')) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    onMessageRead: () => {
      // Idéalement on met le compte à jour lors de la lecture, 
      // pour faire simple via stream on peut refetch si besoin :
      if (userId) {
        fetchConversations(userId).then(convs => {
          setUnreadCount(convs.reduce((sum, c) => sum + (c.non_lus || 0), 0));
        });
      }
    }
  });

  // Handle clicking outside the dropdown to close it
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      try {
        await uploadProfilePhoto(userId, file);
        // Force l'actualisation de l'image
        setAvatarTimestamp(Date.now());
      } catch (error) {
        console.error("Erreur lors de l'upload de la photo :", error);
        alert("Impossible de modifier la photo.");
      }
    }
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              <NavLink icon={<HelpCircle className="w-4 h-4" />} text="Comment ça marche ?" colorIndex={2} onClick={() => scrollToSection('comment-ca-marche')} />
              <NavLink icon={<MessageCircle className="w-4 h-4" />} text="Avis" colorIndex={0} onClick={() => scrollToSection('avis')} />
            </div>

            {/* Connexion/Déconnexion aligné à droite */}
            <div className="ml-8 flex items-center gap-3">
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => navigate('/messagerie')}
                    className="relative p-2 rounded-full hover:bg-fixup-blue/10 transition-colors"
                    title="Messages"
                  >
                    <MessageCircle className="w-5 h-5 text-fixup-black" />
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
              )}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-fixup-black bg-white hover:bg-gray-50 hover:border-fixup-orange transition-all duration-200 shadow-sm focus:outline-none"
                  >
                    <img
                      src={userId ? `${getProfilePhotoUrl(userId)}?t=${avatarTimestamp}` : userAvatarSrc}
                      alt="avatar"
                      onError={(e) => { (e.target as HTMLImageElement).src = userAvatarSrc; }}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Bouton de fichier caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                  />

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            fileInputRef.current?.click();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-fixup-black hover:bg-fixup-blue/10 flex items-center gap-2 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-fixup-blue" />
                          Modifier ma photo
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
            <PrivateRoute requiresParticulier={true}>
              <ParticulierDashboard />
            </PrivateRoute>
          } />
          <Route path="/professional-dashboard" element={
            <PrivateRoute requiresProfessional={true}>
              <ProfessionalDashboard />
            </PrivateRoute>
          } />
          <Route path="/edit-profil-artisan" element={
            <PrivateRoute requiresProfessional={true}>
              <EditProfilArtisan />
            </PrivateRoute>
          } />
          <Route path="/messagerie" element={
            <PrivateRoute>
              <Messagerie />
            </PrivateRoute>
          } />
          <Route
            path="/trouver-artisan"
            element={
              <PrivateRoute requiresParticulier={true}>
                <TrouverArtisan />
              </PrivateRoute>
            }
          />
          <Route
            path="/artisan/:id"
            element={
              <>
                <Navigation />
                <ProfilArtisan />
              </>
            }
          />
          <Route
            path="/cgu"
            element={
              <>
                <Navigation />
                <LegalPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/cgv"
            element={
              <>
                <Navigation />
                <LegalPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/politique-confidentialite"
            element={
              <>
                <Navigation />
                <LegalPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/mentions-legales"
            element={
              <>
                <Navigation />
                <LegalPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/cookies"
            element={
              <>
                <Navigation />
                <LegalPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/pourquoi-reparer-telephone"
            element={
              <>
                <Navigation />
                <RepairerTelephone />
                <Footer />
              </>
            }
          />
          <Route
            path="/comment-reparer-ordinateur"
            element={
              <>
                <Navigation />
                <RepairerOrdinateur />
                <Footer />
              </>
            }
          />
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