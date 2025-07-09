import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function Layout() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="nav-link">Game Share</Link>
        </div>
        <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
          {isAuthenticated && (
        <Link to="/upload" className="nav-link">Upload</Link>
          )}
        </div>
        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </div>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "upload",
        element: (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        )
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      }
    ]
  }
]);

function AppWithAuth() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default AppWithAuth;
