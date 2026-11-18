import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';

export default function App() {
  const [usuario, setUsuario] = useState(null);

  const handleLoginExitoso = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-mono selection:bg-[#9fef00] selection:text-slate-950">
      {!usuario ? (
        <Auth onLoginExitoso={handleLoginExitoso} />
      ) : (
        <Dashboard 
          user={usuario} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}