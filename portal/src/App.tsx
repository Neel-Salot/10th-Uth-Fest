import { lazy, Suspense, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import logoImage from './assets/images/logo.png';
import { supabase } from './lib/supabase';
import { fetchManagersByUserId, fetchTeamLeaderByUserId } from './lib/supabaseApi';

// Auth Context
type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  defaultRoleRoute: string | null;
};

const AuthContext = createContext<AuthContextType>({ isLoggedIn: false, isLoading: true, defaultRoleRoute: null });

export const useAuth = () => useContext(AuthContext);

// Pages
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Scoreboard = lazy(() => import('./pages/Scoreboard'));
const Admin = lazy(() => import('./pages/Admin'));
const LiveStatus = lazy(() => import('./pages/LiveStatus'));
const EventHelper = lazy(() => import('./pages/EventHelper'));
const TeamLeader = lazy(() => import('./pages/TeamLeader'));

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 5000, fallbackValue: T): Promise<T> => {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

/* ═══ BRIGHT MODE PAGE LOADER ═══ */
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
    style={{ background: 'linear-gradient(135deg, #FEFCF8 0%, #FDF8F0 50%, #FAF3E8 100%)' }}
  >
    <div className="relative w-32 h-32 md:w-48 md:h-48">
      {/* Warm glow */}
      <div className="absolute inset-0 rounded-full blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)' }}
      />
      {/* Spinning Wheel */}
      <div className="absolute inset-0 animate-spin-slow">
        <img
          src={logoImage}
          alt="Loading..."
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.3))' }}
        />
      </div>
    </div>
    <div className="mt-8 font-bold tracking-[0.2em] animate-pulse"
      style={{ color: '#FF6B35' }}
    >
      LOADING UTH FEST 2026
    </div>
  </div>
);

function AppRoutes() {
  const location = useLocation();
  const { isLoggedIn, isLoading, defaultRoleRoute } = useAuth();

  const hasHelperSession = typeof window !== 'undefined' && localStorage.getItem('uth-helper-auth') === '1';
  const fallbackRoleRoute = defaultRoleRoute || (hasHelperSession ? '/helper' : null);
  const isPublicPath = ['/', '/events', '/schedule', '/scoreboard', '/live', '/gallery'].includes(location.pathname);

  if (!isLoading && fallbackRoleRoute && isPublicPath) {
    return <Navigate to={fallbackRoleRoute} replace />;
  }

  if (!isLoading && !isLoggedIn && !hasHelperSession && (location.pathname === '/admin' || location.pathname === '/team-leader' || location.pathname === '/manager')) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/team-leader" element={<TeamLeader />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/manager" element={<Admin mode="manager" />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/live" element={<LiveStatus />} />
        <Route path="/gallery" element={<Home />} />
        <Route path="/helper" element={<EventHelper />} />
        <Route path="/team-leader" element={<TeamLeader />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/manager" element={<Admin mode="manager" />} />
        <Route path="*" element={<Navigate to={fallbackRoleRoute || '/'} replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultRoleRoute, setDefaultRoleRoute] = useState<string | null>(null);

  const resolveRoleRoute = async (userId: string, metadataRole?: string) => {
    if (metadataRole === 'admin') return '/admin';

    const [teamLeader, managers] = await Promise.all([
      fetchTeamLeaderByUserId(userId).catch(() => null),
      fetchManagersByUserId(userId).catch(() => []),
    ]);

    if (teamLeader) return '/team-leader';
    if (managers.length) return '/manager';
    return '/admin';
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResult = await withTimeout(supabase.auth.getSession(), 5000, { data: { session: null } } as any);
        const { data: { session } } = sessionResult;
        if (session) {
          setIsLoggedIn(true);
          const route = await withTimeout(resolveRoleRoute(session.user.id, session.user.user_metadata?.role), 4000, '/admin');
          setDefaultRoleRoute(route);
        } else {
          setDefaultRoleRoute(null);
        }
      } catch (error) {
        // Session check failed
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user?.id) {
        const route = await withTimeout(resolveRoleRoute(session.user.id, session.user.user_metadata?.role), 4000, '/admin');
        setDefaultRoleRoute(route);
      } else {
        setDefaultRoleRoute(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, defaultRoleRoute }}>
      <Router>
        {/* Subtle warm grain overlay */}
        <div className="grain-overlay" />
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
