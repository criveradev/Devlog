/** Compone routing, restauración de sesión y layouts públicos y autenticados. */
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/FeedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Icon from "./components/Icon";
import useAuthStore from "./store/authStore";
import api from "./api/axios";

/** Restaura la sesión HttpOnly antes de decidir qué rutas puede renderizar la UI. */
function SessionBootstrap({ children }) {
  const { sessionChecked, restoreSession, finishSessionCheck } = useAuthStore();

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then((response) => {
        if (active) restoreSession(response.data);
      })
      .catch(() => {
        if (active) finishSessionCheck();
      });

    return () => {
      active = false;
    };
  }, [finishSessionCheck, restoreSession]);

  if (!sessionChecked) {
    return (
      <div className="app-background min-h-screen flex flex-col items-center justify-center gap-4 text-sm text-slate-500">
        <img src="/favicon.svg?v=4" alt="" className="brand-mark animate-pulse" aria-hidden="true" />
        <span>Preparando tu espacio...</span>
      </div>
    );
  }

  return children;
}

/** Impide mostrar autenticación a usuarios que ya poseen una sesión válida. */
function PublicOnlyRoute({ children }) {
  const { user } = useAuthStore();
  return user ? <Navigate to="/" replace /> : children;
}

/** Distribuye las pantallas privadas según el espacio disponible. */
function Layout({ children }) {
  const { user } = useAuthStore();

  return (
    <div className="app-background pb-24 sm:pb-0">
      <Navbar />
      <div className="max-w-[1460px] mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_292px] xl:grid-cols-[224px_minmax(0,700px)_292px] justify-center gap-5 xl:gap-7">
            <aside className="hidden xl:block">
              <Sidebar />
            </aside>

            <main className="min-w-0">{children}</main>

            <aside className="hidden lg:block space-y-4">
              <TrendingPanel />
            </aside>
          </div>
        ) : (
          <main className="max-w-sm mx-auto">{children}</main>
        )}
      </div>
      {user && <MobileNav />}
    </div>
  );
}

/** Panel contextual de escritorio; no contiene estado ni lógica de dominio. */
function TrendingPanel() {
  const topics = ["#buildinpublic", "#react", "#nodejs", "#career"];

  return (
    <div className="sticky top-24 space-y-4">
      <section className="overflow-hidden rounded-3xl border border-black/5 bg-[#111510] p-5 text-white shadow-xl shadow-black/10">
        <div className="mb-9 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#caff4a]">
            Dev pulse
          </span>
          <span className="h-2 w-2 rounded-full bg-[#caff4a] shadow-[0_0_0_5px_rgb(202_255_74_/_0.12)]" />
        </div>
        <h2 className="text-xl font-semibold leading-tight text-balance">
          Construye en público. Aprende en comunidad.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Comparte avances, decisiones y aprendizajes con otros developers.
        </p>
        <a
          href="https://github.com/criveradev"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#caff4a] hover:text-white"
        >
          Explorar GitHub <Icon name="external" size={14} />
        </a>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#111510]">Temas activos</p>
          <Icon name="sparkles" size={17} className="text-[#769c1a]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span key={topic} className="rounded-full border border-[#e0e4dc] bg-[#f7f8f4] px-3 py-1.5 text-xs font-medium text-[#60685d]">
              {topic}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-[#edf0e9] pt-4 text-xs text-[#7b8277]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Todos los sistemas operativos
        </div>
      </section>
    </div>
  );
}

/** Shell editorial compartido por autenticación, recuperación y verificación. */
function PublicLayout({ children, compact = false }) {
  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <main className={`mx-auto grid min-h-[calc(100vh-72px)] max-w-[1240px] items-center gap-7 px-4 py-7 sm:px-6 sm:py-10 ${compact ? "max-w-xl" : "lg:grid-cols-[minmax(0,1.15fr)_440px]"}`}>
        {!compact && (
          <section className="editorial-panel hidden min-h-[610px] lg:flex lg:flex-col lg:justify-between p-10 xl:p-12">
            <div className="relative z-10">
              <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#caff4a]" />
                La comunidad está construyendo
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#caff4a]">Build in public</p>
              <h1 className="mt-5 max-w-xl text-5xl font-bold leading-[1.03] tracking-[-0.055em] text-white text-balance xl:text-6xl">
                El mejor trabajo empieza compartiendo el proceso.
              </h1>
              <p className="mt-6 max-w-lg text-[17px] leading-7 text-white/55">
                Publica avances, recibe feedback honesto y conecta con personas que también convierten ideas en productos.
              </p>
            </div>

            <div className="code-preview relative z-10 mt-10 p-4 font-mono text-xs">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff6b6b]" /><span className="h-2 w-2 rounded-full bg-[#ffd166]" /><span className="h-2 w-2 rounded-full bg-[#caff4a]" /></div>
                <span className="text-white/30">community.log</span>
              </div>
              <p className="text-white/40"><span className="text-[#caff4a]">const</span> nextStep = <span className="text-[#83d9ff]">"compartir"</span>;</p>
              <p className="mt-2 text-white/40"><span className="text-[#caff4a]">await</span> community.learn(nextStep);</p>
              <div className="mt-4 flex items-center gap-2 text-white/65"><span className="text-[#caff4a]">✓</span> Progreso publicado. Feedback en camino.</div>
            </div>
          </section>
        )}
        <section className="w-full">{children}</section>
      </main>
    </div>
  );
}

/** Declara el árbol completo de navegación de Devlog. */
function App() {
  return (
    <BrowserRouter>
      <SessionBootstrap>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '14px', background: '#111510', color: '#fff', fontSize: '14px' },
          }}
        />
        <Routes>
        <Route path="/forgot-password" element={<PublicLayout compact><ForgotPasswordPage /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout compact><ResetPasswordPage /></PublicLayout>} />
        <Route path="/verify-email" element={<PublicLayout compact><VerifyEmailPage /></PublicLayout>} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <PublicLayout><LoginPage /></PublicLayout>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <PublicLayout><RegisterPage /></PublicLayout>
            </PublicOnlyRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout>
                <FeedPage />
              </Layout>
            }
          />
          <Route
            path="/create"
            element={
              <Layout>
                <CreatePostPage />
              </Layout>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <Layout>
                <ProfilePage />
              </Layout>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionBootstrap>
    </BrowserRouter>
  );
}

export default App;
