import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/FeedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/Sidebar";
import useAuthStore from "./store/authStore";

function Layout({ children }) {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] lg:grid-cols-[240px_1fr_300px] gap-6">
            {/* Sidebar izquierdo — solo desktop grande */}
            <aside className="hidden lg:block">
              <Sidebar />
            </aside>

            {/* Contenido principal */}
            <main className="min-w-0">{children}</main>

            {/* Panel derecho — desktop */}
            <aside className="hidden md:block space-y-4">
              <TrendingPanel />
            </aside>
          </div>
        ) : (
          <main className="max-w-sm mx-auto">{children}</main>
        )}
      </div>
    </div>
  );
}

function TrendingPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
      <h2 className="font-semibold text-gray-800 text-sm mb-3">
        Acerca de Devlog
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed">
        Red social para developers. Comparte tus proyectos, ideas y aprendizajes
        con la comunidad.
      </p>
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Stack</span>
          <span className="text-gray-700 font-medium">MERN</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Deploy</span>
          <span className="text-gray-700 font-medium">Render + Vercel</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Versión</span>
          <span className="text-gray-700 font-medium">1.0.0</span>
        </div>
      </div>
      <a
        href="https://github.com/criveradev"
        target="_blank"
        rel="noreferrer"
        className="mt-4 block text-center text-xs text-blue-600 hover:underline"
      >
        GitHub →
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-sm mx-auto px-4 py-6">
                <LoginPage />
              </main>
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-sm mx-auto px-4 py-6">
                <RegisterPage />
              </main>
            </div>
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
    </BrowserRouter>
  );
}

export default App;
