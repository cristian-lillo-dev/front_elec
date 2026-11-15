import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo_s.png';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

export default function Dashboard({ user, onSelectUnidad, onLogout }) {
  const [temas, setTemas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredTema, setHoveredTema] = useState(null);
  const [temaExpandido, setTemaExpandido] = useState(null);
  const [unidadesMap, setUnidadesMap] = useState({});
  const [cargandoUnidadesId, setCargandoUnidadesId] = useState(null);
  const [calculadoraActiva, setCalculadoraActiva] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/temas/?ordering=orden`)
      .then(res => res.json())
      .then(data => {
        setTemas(data);
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
        setUnidadesMap(prev => ({ ...prev, [tema.id]: data }));
      } catch (err) {
        console.warn('Usando unidades de respaldo:', err);
        setUnidadesMap(prev => ({
          ...prev,
          [tema.id]: [
            { id: 101, numero_unidad: 1, nombre: 'Unidad 1: Empalmes y Acometidas', descripcion: 'Normativa RIC N° 01 sobre acometidas.' },
            { id: 102, numero_unidad: 2, nombre: 'Unidad 2: Tableros de Distribución', descripcion: 'Exigencias reglamentarias para gabinetes.' }
          ]
        }));
      } finally {
        setCargandoUnidadesId(null);
      }
    }
  };

  const nombreUsuario = user?.username || user?.name || "Operador";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <img src={logoImg} alt="AreaElectrica Logo" className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition" />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white font-mono uppercase">
                AREA<span className="text-cyan-400">ELECTRICA</span> <span className="text-amber-400 text-[10px]">[HUD]</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest">SEC_RIC_SYS v4.2</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-[#0b1329] border border-cyan-500/30 px-3 py-1 rounded-lg text-xs font-mono text-cyan-300 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>STREAK: 5D</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-[#0b1329] border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-mono text-amber-400 shadow-inner">
              <span>🪙</span>
              <span>150 NC</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-[#0b1329] border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-mono text-rose-400 shadow-inner">
              <span>❤️</span>
              <span>5 HP</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-8 h-8 rounded-xl bg-[#0b1329] hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 flex items-center justify-center text-slate-400 hover:text-rose-400 text-xs transition-all cursor-pointer ml-2"
              title="Cerrar Sesión"
            >
              ⌁
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8 flex-1 relative z-10">
        
        <div className="bg-gradient-to-r from-[#091326] to-[#040914] border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                ACCESS_GRANTED // {user?.categoria || "ESTUDIANTE_SEC"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-mono">
              USER_ROOT: <span className="text-[#FFB800]">{nombreUsuario}</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-sans max-w-lg">
              Selecciona un vector de estudio normativo para desplegar sus unidades o utiliza las herramientas del taller.
            </p>
          </div>

          <div className="bg-[#030712] border border-amber-500/30 px-6 py-4 rounded-xl text-center z-10 shadow-inner">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">EXPERIENCIA TOTAL</p>
            <p className="text-xl md:text-2xl font-black text-amber-400 font-mono">2,450 XP</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
              <span className="text-cyan-400">#</span> Vectores de Estudio (Normativa SEC RIC)
            </h2>
            <span className="text-[10px] font-mono text-slate-500">[HAZ CLIC PARA DESPLEGAR UNIDADES]</span>
          </div>

          {cargando ? (
            <div className="text-center py-16 text-cyan-400 font-mono text-xs animate-pulse">
              [ANALIZANDO NODOS REMOTOS DESDE RAILWAY...]
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
                      className={`bg-[#071022] border rounded-2xl p-6 shadow-xl transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden ${
                        estaExpandido ? 'border-amber-400 shadow-[0_0_20px_rgba(255,184,0,0.2)]' : 'border-cyan-500/20 hover:border-cyan-400'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl group-hover:bg-cyan-400/10 transition" />
                      
                      <div className="z-10">
                        <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">
                          VECTOR // 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-amber-400 transition-colors font-sans">
                          {tema.nombre}
                        </h3>
                      </div>

                      <div className="mt-6 flex items-center justify-between z-10">
                        <span className="text-[11px] font-mono text-slate-400">
                          {estaExpandido ? '▲ OCULTAR UNIDADES' : '▼ DESPLEGAR UNIDADES'}
                        </span>
                        <span className="text-amber-400 font-mono font-bold text-xs">⚡</span>
                      </div>

                      {hoveredTema?.id === tema.id && !estaExpandido && (
                        <div className="absolute inset-x-0 -top-2 bg-[#040914] border-2 border-amber-400/80 p-4 rounded-2xl text-xs text-slate-200 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-amber-400/30 pb-1 mb-2 font-mono text-[10px] text-amber-400">
                            <span>SYS_INFO // DESCRIPCIÓN</span>
                            <span>SEC</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[11px] text-slate-300">
                            {tema.descripcion || 'Estudio y aplicación de exigencias normativas vigentes.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {estaExpandido && (
                      <div className="mt-3 bg-[#040914] border border-amber-500/40 rounded-2xl p-4 space-y-2.5 animate-fadeIn shadow-inner">
                        <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between">
                          <span>UNIDADES DISPONIBLES</span>
                          <span>[{unidadesDelTema.length}]</span>
                        </div>

                        {cargandoUnidadesId === tema.id ? (
                          <div className="text-center py-4 text-cyan-400 font-mono text-xs animate-pulse">
                            [CARGANDO UNIDADES...]
                          </div>
                        ) : unidadesDelTema.length === 0 ? (
                          <div className="text-center py-3 text-slate-500 font-mono text-xs">
                            No hay unidades registradas en este tema.
                          </div>
                        ) : (
                          unidadesDelTema.map((unidad, uIdx) => (
                            <div
                              key={unidad.id || uIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectUnidad) onSelectUnidad(unidad);
                              }}
                              className="bg-[#071022] hover:bg-[#0b1830] border border-cyan-500/20 hover:border-cyan-400 p-3 rounded-xl flex items-center justify-between cursor-pointer transition group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-[10px] text-cyan-300">
                                  {uIdx + 1}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                    {unidad.nombre}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                                    {unidad.descripcion}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-amber-400 font-mono">➔</span>
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

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-mono font-bold text-slate-200 tracking-wider flex items-center gap-2 uppercase">
              <span className="text-amber-400">#</span> Utilidades de Taller (Cálculo Eléctrico)
            </h2>
            <span className="text-[10px] font-mono text-slate-500">[MODULES: 4 AVAILABLE]</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'awg', title: 'Convertidor AWG', desc: 'Calibre AWG a mm² y corriente admisible.' },
              { id: 'corrientes', title: 'Tabla de Corrientes', desc: 'Capacidad de transporte según canalización.' },
              { id: 'ruptura', title: 'Capacidad de Ruptura', desc: 'Interruptores termomagnéticos y curvas.' },
              { id: 'colores', title: 'Código de Colores', desc: 'Identificación de fases y resistencias.' }
            ].map((tool) => (
              <div key={tool.id} className="bg-[#071022] border border-cyan-500/20 hover:border-amber-400/50 p-5 rounded-2xl flex flex-col justify-between transition group">
                <div>
                  <h4 className="font-mono font-bold text-xs text-cyan-300 group-hover:text-amber-400 uppercase tracking-wide mb-1">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{tool.desc}</p>
                </div>
                <button 
                  onClick={() => setCalculadoraActiva(tool.id)} 
                  className="mt-5 w-full py-2 bg-[#0b162c] hover:bg-amber-400 text-amber-400 hover:text-slate-950 font-mono text-[11px] font-bold rounded-lg border border-amber-500/30 transition uppercase tracking-wider"
                >
                  ABRIR UTILIDAD ⚡
                </button>
              </div>
            ))}
          </div>
        </div>

        {calculadoraActiva && (
          <div className="fixed inset-0 z-50 bg-[#030712]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#071022] border-2 border-cyan-400 rounded-3xl p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(0,240,255,0.2)]">
              <button 
                onClick={() => setCalculadoraActiva(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-xs bg-[#0b162c] border border-slate-700 px-2.5 py-1 rounded-lg"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                  UTILIDAD // {calculadoraActiva}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mb-4 font-sans">Módulo de cálculo activo conforme a especificaciones oficiales SEC.</p>
              <div className="p-4 bg-[#030712] rounded-xl text-center font-mono text-xs text-amber-400 border border-cyan-500/30 shadow-inner">
                [OUTPUT: 16A - SECCIÓN NOMINAL 2.5 mm²]
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#030712] border-t border-cyan-500/20 py-4 px-6 text-center font-mono text-[10px] text-slate-500 z-10 flex justify-between items-center max-w-7xl mx-auto w-full">
        <span>[SYSTEM: SEC_COMPLIANT]</span>
        <span>AreaElectrica & Tiuque-Tec • Formación que ilumina</span>
        <span>[LATENCY: 14ms]</span>
      </footer>

    </div>
  );
}