import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import SplashScreen from './components/SplashScreen';
import { parseLocalePath } from './lib/locale';
import { recordVisit } from './lib/visitors';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Suggest = lazy(() => import('./pages/Suggest'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Plan = lazy(() => import('./pages/Plan'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true" aria-label="Loading page">
      <div className="h-1 w-28 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-brand via-ember to-sun" />
      </div>
    </div>
  );
}

/**
 * Locale-prefixed branch: acetix.xyz/<location>/* renders the same pages
 * as the unprefixed URLs (canonical/SEO URLs stay unprefixed). Unknown
 * first segments or unknown sub-paths fall through to NotFound.
 */
function LocaleRoutes() {
  const { pathname } = useLocation();
  const { locale } = parseLocalePath(pathname);
  if (!locale) return <NotFound />;
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:id" element={<BlogDetail />} />
      <Route path="suggest" element={<Suggest />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="plan" element={<Plan />} />
      <Route path="profile" element={<Profile />} />
      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    recordVisit();
  }, []);

  return (
    <BrowserRouter>
      <SplashScreen />
      <PageLoader />
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-paper font-sans text-ink antialiased">
        <Navbar />
        <main className="min-w-0 flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/suggest" element={<Suggest />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="/:locale/*" element={<LocaleRoutes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </BrowserRouter>
  );
}
