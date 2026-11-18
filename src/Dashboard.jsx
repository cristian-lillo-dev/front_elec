import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo_s.png';
import DetalleUnidad from './DetalleUnidad';
import CalculadoraAlimentadores from './CalculadoraAlimentadores';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

export default function Dashboard({ user, onLogout }) {
  const [temas, setTemas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredTema, setHoveredTema] = useState(null);
  const [temaExpandido, setTemaExpandido] = useState(null);
  const [unidadesMap, setUnidadesMap] = useState({});
  const [cargandoUnidadesId, setCargandoUnidadesId] = useState(null);
  const [calculadoraActiva, setCalculadoraActiva] = useState(null);
  
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [leccionActiva, setLeccionActiva] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/temas/?ordering=orden`)
      .then(res => res.json())
      .then(data => {
        const listaTemas = Array.isArray(data) ? data : (data.results || []);
        setTemas(listaTemas);
        setCargando(false);
      })
      .catch(err => {
        console.warn('Usando temas de respaldo:', err);
        setTemas([
          { id: 1, orden: 1, nombre: 'Pliegos RIC: Normativa y Aplicación', descripcion: 'Estudio de los pliegos técnicos normativos de la Superintendencia de Electricidad y Combustibles (SEC).' },
          { id: 2, orden: 2, nombre: 'Seguridad Eléctrica en el Trabajo', descripcion: 'Protocolos de prevención de riesgos, uso de EPP y normativa de bloqueo.' },
          { id: 3, orden: 3, nombre: 'Electricidad Básica y Circuitos', descripcion: 'Fundamentos de corriente alterna, continua, ley de Ohm y cálculo básico.' }
        ]);
        setCargando(false);
      });
  }, []);

  const handleToggleTema = async (tema) => {
    if (temaExpandido === tema.id) {
      setTemaExpandido(null);
      return;
    }
    setTemaExpandido(tema.id);

    if (!unidadesMap[tema.id]) {
      setCargandoUnidadesId(tema.id);
      try {
        const res = await fetch(`${API_BASE_URL}/unidades/?tema=${tema.id}`);
        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.results || []);

        // Filtrado estricto en frontend para mostrar SOLO las unidades que pertenecen a este tema
        const unidadesFiltradas = lista
          .filter(u => {
            const temaIdUnidad = typeof u.tema === 'object' && u.tema !== null 
              ? u.tema.id 
              : (u.tema ?? u.tema_id);
            return Number(temaIdUnidad) === Number(tema.id);
          })
          .sort((a, b) => (a.numero_unidad || a.orden || 0) - (b.numero_unidad || b.orden || 0));

        setUnidadesMap(prev => ({ ...prev, [tema.id]: unidadesFiltradas }));
      } catch (err) {
        console.warn('Usando unidades de respaldo:', err);
        setUnidadesMap(prev => ({
          ...prev,
          [tema.id]: [
            { id: 101, tema: tema.id, numero_unidad: 1, nombre: 'Unidad 1: Empalmes y Acometidas', descripcion: 'Normativa RIC N° 01 sobre acometidas.' },
            { id: 102, tema: tema.id, numero_unidad: 2, nombre: 'Unidad 2: Tableros de Distribución', descripcion: 'Exigencias reglamentarias para gabinetes.' }
          ]
        }));
      } finally {
        setCargandoUnidadesId(null);
      }
    }
  };

  // Nombre visible del usuario autenticado
  const nombreUsuario =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    user?.username ||
    'Operador SEC';

  const handleIrPanel = () => {
    setCalculadoraActiva(null);
    setUnidadSeleccionada(null);
  };

  const handleIrCalculadora = () => {
    setUnidadSeleccionada(null);
    setCalculadoraActiva('alimentadores');
  };

  if (calculadoraActiva === 'alimentadores') {
    return (
      <CalculadoraAlimentadores 
        user={user}
        nombreUsuario={nombreUsuario}
        onVolver={handleIrPanel} 
        onLogout={onLogout}
      />
    );
  }

  if (unidadSeleccionada) {
    return (
      <DetalleUnidad 
        user={user}
        nombreUsuario={nombreUsuario}
        unidad={unidadSeleccionada} 
        usuarioId={user?.id}
        onVolver={handleIrPanel} 
        onIrCalculadora={handleIrCalculadora}
        onLogout={onLogout}
        onSelectLeccion={(leccion) => setLeccionActiva(leccion)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Grid Técnico de Fondo Verde Hacker / Oscuro */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Estilo HUD con Menú Global y Nombre del Usuario */}
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 px-6 py-3.5 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <div onClick={handleIrPanel} className="flex items-center space-x-3 cursor-pointer group">
              <img src={logoImg} alt="AreaElectrica Logo" className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition border border-[#9fef00]/40 shadow-[0_0_12px_rgba(159,239,0,0.2)]" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-white uppercase">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span> <span className="text-[#ffb800] text-[10px]">HUD</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest">SISTEMA NORMATIVO SEC RIC</span>
              </div>
            </div>

            {/* Menú Global Persistente */}
            <nav className="hidden md:flex items-center space-x-2 text-xs">
              <button
                onClick={handleIrPanel}
                className="px-3.5 py-1.5 rounded-xl font-bold bg-[#112614] text-[#9fef00] border border-[#9fef00]/50 shadow-[0_0_12px_rgba(159,239,0,0.15)] cursor-pointer"
              >
                ⚡ PANEL DE ESTUDIO
              </button>
              <button
                onClick={handleIrCalculadora}
                className="px-3.5 py-1.5 rounded-xl font-bold text-slate-300 hover:text-[#ffb800] bg-[#0d1527]/70 hover:bg-[#0d1527] border border-slate-800 hover:border-[#ffb800]/40 transition cursor-pointer"
              >
                📊 CALCULADORA RIC
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Badge del Usuario Conectado */}
            <div className="flex items-center space-x-2 bg-[#0d1527] border border-[#ffb800]/40 px-3 py-1 rounded-lg text-xs text-white shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#9fef00]" />
              <span className="text-slate-400 hidden sm:inline">OPERADOR:</span>
              <span className="font-bold text-[#ffb800]">{nombreUsuario}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 bg-[#0d1527] border border-[#9fef00]/40 px-3 py-1 rounded-lg text-xs text-[#9fef00] shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9fef00] animate-ping" />
              <span>RACHA: 5D</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 bg-[#0d1527] border border-amber-500/40 px-3 py-1 rounded-lg text-xs text-amber-400 shadow-inner">
              <span>🪙</span>
              <span>150 NC</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 bg-[#0d1527] border border-rose-500/40 px-3 py-1 rounded-lg text-xs text-rose-400 shadow-inner">
              <span>❤️</span>
              <span>5 HP</span>
            </div>
            <button 
              onClick={onLogout}
              className="px-3 h-8 rounded-xl bg-[#0d1527] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 flex items-center justify-center text-slate-300 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              SALIR ⌁
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8 flex-1 relative z-10">
        
        {/* Banner de Bienvenida con Nombre del Usuario */}
        <div className="bg-gradient-to-r from-[#0a1424] to-[#050a14] border border-[#9fef00]/40 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(159,239,0,0.1)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9fef00]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#112614] text-[#9fef00] border border-[#9fef00]/50 uppercase tracking-widest">
                ACCESO AUTORIZADO • {user?.categoria || "ESTUDIANTE SEC"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              BIENVENIDO, <span className="text-[#ffb800]">{nombreUsuario.toUpperCase()}</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-sans max-w-lg">
              Selecciona un vector de estudio normativo y haz clic en una unidad para desplegar su mapa de lecciones interactivo o utiliza las herramientas de taller.
            </p>
          </div>

          <div className="bg-[#050914] border border-[#ffb800]/40 px-6 py-4 rounded-xl text-center z-10 shadow-inner shrink-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">EXPERIENCIA TOTAL</p>
            <p className="text-xl md:text-2xl font-black text-[#ffb800]">2,450 XP</p>
          </div>
        </div>

        {/* Sección de Vectores de Estudio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
              <span className="text-[#9fef00]">⚡</span> Vectores de Estudio (Normativa SEC RIC)
            </h2>
            <span className="text-[10px] text-[#9fef00] uppercase tracking-wider">
              Selecciona una unidad para abrir el mapa
            </span>
          </div>

          {cargando ? (
            <div className="text-center py-16 text-[#9fef00] text-xs animate-pulse">
              SINCRONIZANDO MÓDULOS NORMATIVOS...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
              {temas.map((tema, idx) => {
                const estaExpandido = temaExpandido === tema.id;
                const unidadesDelTema = unidadesMap[tema.id] || [];

                return (
                  <div key={tema.id || idx} className="flex flex-col">
                    <div 
                      onMouseEnter={() => setHoveredTema(tema)}
                      onMouseLeave={() => setHoveredTema(null)}
                      onClick={() => handleToggleTema(tema)}
                      className={`bg-[#0a1120] border rounded-2xl p-6 shadow-xl transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden ${
                        estaExpandido ? 'border-[#ffb800] shadow-[0_0_20px_rgba(255,184,0,0.2)]' : 'border-[#9fef00]/30 hover:border-[#9fef00]'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#9fef00]/5 rounded-full blur-xl group-hover:bg-[#9fef00]/10 transition" />
                      
                      <div className="z-10">
                        <span className="text-[10px] text-[#9fef00] font-bold tracking-widest uppercase">
                          VECTOR 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-[#ffb800] transition-colors font-sans">
                          {tema.nombre}
                        </h3>
                      </div>

                      <div className="mt-6 flex items-center justify-between z-10">
                        <span className="text-[11px] text-slate-400">
                          {estaExpandido ? '▲ OCULTAR UNIDADES' : '▼ DESPLEGAR UNIDADES'}
                        </span>
                        <span className="text-[#ffb800] font-bold text-xs">⚡</span>
                      </div>
                    </div>

                    {estaExpandido && (
                      <div className="mt-3 bg-[#050914] border border-[#ffb800]/40 rounded-2xl p-4 space-y-2.5 shadow-inner">
                        <div className="text-[10px] text-[#ffb800] uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between font-bold">
                          <span>UNIDADES DISPONIBLES</span>
                          <span>{unidadesDelTema.length} {unidadesDelTema.length === 1 ? 'NODO' : 'NODOS'}</span>
                        </div>

                        {cargandoUnidadesId === tema.id ? (
                          <div className="text-center py-4 text-[#9fef00] text-xs animate-pulse">
                            CARGANDO UNIDADES...
                          </div>
                        ) : unidadesDelTema.length === 0 ? (
                          <div className="text-center py-3 text-slate-500 text-xs">
                            No hay unidades registradas en este vector.
                          </div>
                        ) : (
                          unidadesDelTema.map((unidad, uIdx) => (
                            <div
                              key={unidad.id || uIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setUnidadSeleccionada(unidad);
                              }}
                              className="bg-[#0a1120] hover:bg-[#101c33] border border-[#9fef00]/30 hover:border-[#9fef00] p-3 rounded-xl flex items-center justify-between cursor-pointer transition group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-[#112614] border border-[#9fef00]/50 flex items-center justify-center text-[10px] text-[#9fef00] font-bold shrink-0">
                                  {unidad.numero_unidad || uIdx + 1}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white group-hover:text-[#9fef00] transition-colors truncate">
                                    {unidad.nombre}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[220px] font-sans">
                                    {unidad.descripcion}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#ffb800] shrink-0 ml-2">MAPA ➔</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Utilidades de Taller */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
              <span className="text-[#ffb800]">⚡</span> Utilidades de Taller (Cálculo Eléctrico)
            </h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">4 MÓDULOS DISPONIBLES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a1120] border-2 border-[#ffb800] hover:border-[#9fef00] p-5 rounded-2xl flex flex-col justify-between transition group shadow-[0_0_15px_rgba(255,184,0,0.15)]">
              <div>
                <span className="text-[9px] bg-[#261f0c] text-[#ffb800] px-2 py-0.5 rounded border border-[#ffb800]/40 uppercase font-bold">
                  RIC N°03 / 04
                </span>
                <h4 className="font-bold text-xs text-white group-hover:text-[#ffb800] uppercase tracking-wide mt-2 mb-1">
                  Dimensionamiento Alimentadores
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Cálculo de sección y caída de tensión reglamentaria.
                </p>
              </div>
              <button 
                onClick={handleIrCalculadora} 
                className="mt-5 w-full py-2 bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 text-[11px] font-bold rounded-lg transition uppercase tracking-wider cursor-pointer shadow-md"
              >
                ABRIR HERRAMIENTA ⚡
              </button>
            </div>

            {[
              { id: 'awg', title: 'Convertidor AWG', desc: 'Calibre AWG a mm² y corriente admisible.' },
              { id: 'corrientes', title: 'Tabla de Corrientes', desc: 'Capacidad de transporte según canalización.' },
              { id: 'ruptura', title: 'Capacidad de Ruptura', desc: 'Interruptores termomagnéticos y curvas.' }
            ].map((tool) => (
              <div key={tool.id} className="bg-[#0a1120] border border-[#9fef00]/30 hover:border-[#ffb800]/60 p-5 rounded-2xl flex flex-col justify-between transition group">
                <div>
                  <h4 className="font-bold text-xs text-[#9fef00] group-hover:text-[#ffb800] uppercase tracking-wide mb-1">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">{tool.desc}</p>
                </div>
                <button 
                  onClick={() => alert(`Módulo ${tool.title} en desarrollo.`)} 
                  className="mt-5 w-full py-2 bg-[#0d162c] hover:bg-[#ffb800] text-[#ffb800] hover:text-slate-950 text-[11px] font-bold rounded-lg border border-[#ffb800]/40 transition uppercase tracking-wider cursor-pointer"
                >
                  ABRIR UTILIDAD ⚡
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-[#050914] border-t border-[#9fef00]/30 py-4 px-6 text-center text-[10px] text-slate-400 z-10 flex justify-between items-center max-w-7xl mx-auto w-full">
        <span className="text-[#9fef00] font-bold">NORMATIVA SEC VIGENTE</span>
        <span>AreaElectrica & Tiuque-Tec • Formación que ilumina</span>
        <span>SISTEMA EN LÍNEA</span>
      </footer>
    </div>
  );
}