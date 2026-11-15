import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import DetalleUnidad from './DetalleUnidad';
import LeccionModal from './LeccionModal';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

  const handleLoginExitoso = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    setTemaSeleccionado(null);
    setLeccionSeleccionada(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-[#FFB800] selection:text-[#0B0F19]">
      {!usuario ? (
        <Auth onLoginExitoso={handleLoginExitoso} />
      ) : temaSeleccionado ? (
        <DetalleUnidad 
          tema={temaSeleccionado} 
          onVolver={() => setTemaSeleccionado(null)} 
          onSelectLeccion={(leccion) => setLeccionSeleccionada(leccion)} 
        />
      ) : (
        <Dashboard 
          user={usuario} 
          onSelectTema={(tema) => setTemaSeleccionado(tema)} 
          onLogout={handleLogout} 
        />
      )}

      {leccionSeleccionada && (
        <LeccionModal 
          leccion={leccionSeleccionada} 
          onClose={() => setLeccionSeleccionada(null)} 
          onCompletar={(leccionCompletada) => {
            console.log("Lección superada con éxito:", leccionCompletada);
          }} 
        />
      )}
    </div>
  );
}