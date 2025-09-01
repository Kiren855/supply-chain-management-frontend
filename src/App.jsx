// src/App.jsx
import React, { useState, useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import "./App.css";
import { initAuth } from "@/core/services/authInit";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await initAuth();
      setIsAuthenticated(auth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="App">
      <AppRouter isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default App;
