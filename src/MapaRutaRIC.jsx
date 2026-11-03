import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// =========================================================================
// CONSTANTES DE DISTRIBUCIÓN Y ESPACIADO
// =========================================================================
const PASO_Y = 120;
const PATRON_X = [30, 50, 70, 50];
const getXPercentage = (index) => PATRON_X[index % PATRON_X.length];

// 1. Conexiones Curvas Orgánicas con Pulso Eléctrico Animado
const ConexionesSVG = memo(({ totalElementos, alturaTotal }) => {
  const puntos = useMemo(() => {
    return Array.from({ length: totalElementos }).map((_, i) => ({
      x: getXPercentage(i),
      y: 45 + i * PASO_Y,
    }));
  }, [totalElementos]);

  return (
    <svg 
      className="absolute inset-0 w-full pointer-events-none z-0 overflow-visible"
      style={{ height: `${alturaTotal}px` }}
      viewBox={`0 0 100 ${alturaTotal}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="cyberCable" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00f29b" />
          <stop offset="50%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <filter id="cableGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {puntos.map((pt, i) => {
        if (i === puntos.length - 1) return null;
        const next = puntos[i + 1];
        const cyMid = (pt.y + next.y) / 2;
        const pathData = `M ${pt.x} ${pt.y} C ${pt.x} ${cyMid}, ${next.x} ${cyMid}, ${next.x} ${next.y}`;

        return (
          <g key={`curva-${i}`}>
            <path
              d={pathData}
              fill="none"
              stroke="#03121d"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#00f29b"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#cableGlow)"
              className="opacity-30"
            />
            <path
              d={pathData}
              fill="none"
              stroke="url(#cyberCable)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-80"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeDasharray="2, 6"
              strokeLinecap="round"
              className="opacity-90 animate-[pulse_1.5s_infinite]"
            />
          </g>
        );
      })}
    </svg>
  );
});

// 2. Nodo Gamificado de la Ruta
const NodoRuta = memo(({ item, idx, isHovered, onHover, onSelect, esModoLeccion }) => {
  const xPos = getXPercentage(idx);
  const yPos = 45 + idx * PASO_Y;
  const numCodigo = String(item.orden || idx + 1).padStart(2, '0');

  const completado = idx < 2;
  const activo = idx === 2;
  const bloqueado = idx > 2;

  return (
    <div
      style={{
        left: `${xPos}%`,
        top: `${yPos}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute z-10 flex flex-col items-center group cursor-pointer"
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(item)}
    >
      {activo && (
        <div className="absolute -top-11 flex flex-col items-center animate-bounce z-20">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-[9px] tracking-wider px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-yellow-200 uppercase flex items-center gap-1">
            <span>⚡ JUGAR</span>
          </div>
          <div className="w-2 h-2 bg-amber-500 rotate-45 -mt-1 shadow-sm" />
        </div>
      )}

      <div className="relative">
        {activo && (
          <div 
            className="absolute -inset-2.5 rounded-full border-2 border-dashed border-cyan-400 animate-spin opacity-80" 
            style={{ animationDuration: '6s' }} 
          />
        )}

        <div
          className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-300 ${
            activo
              ? 'bg-cyan-400/50 opacity-100 animate-pulse'
              : completado
              ? 'bg-emerald-500/30 opacity-70'
              : isHovered
              ? 'bg-amber-400/40 opacity-100'
              : 'opacity-0'
          }`}
        />

        <div
          className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1.5 border-[3px] ${
            completado
              ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-[#044a36] shadow-[0_6px_0_#064e3b,0_10px_20px_rgba(16,185,129,0.35)] text-white'
              : activo
              ? 'bg-gradient-to-b from-cyan-300 to-cyan-500 border-[#0a586d] shadow-[0_6px_0_#0e7490,0_12px_25px_rgba(6,182,212,0.5)] text-slate-950 scale-105'
              : 'bg-gradient-to-b from-slate-700 to-slate-800 border-[#1e293b] shadow-[0_5px_0_#0f172a] text-slate-400 opacity-80 group-hover:opacity-100'
          }`}
        >
          <div className="absolute top-1.5 inset-x-3 h-2.5 bg-white/25 rounded-full blur-[0.5px]" />
          <span className="text-lg filter drop-shadow">
            {completado ? '✓' : activo ? '⚡' : bloqueado ? '🔒' : '★'}
          </span>
          <span className={`text-[8px] font-semibold tracking-wider ${
            activo ? 'text-slate-900' : 'text-white/90'
          }`}>
            {esModoLeccion ? `M-${numCodigo}` : `RIC-${numCodigo}`}
          </span>
        </div>
      </div>

      <div className="mt-2.5 text-center max-w-[145px]">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide transition-all shadow-sm ${
          isHovered
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 scale-105'
            : 'bg-slate-900/80 text-slate-300 border border-slate-700/60'
        }`}>
          {item.nombre}
        </span>
      </div>
    </div>
  );
});

// =========================================================================
// INTERFAZ DE LECCIÓN Y EVALUACIÓN ESTILO DUOLINGO CYBERPUNK
// =========================================================================
function ModalLeccionDuolingo({ unidad, leccion, onClose, onCompletar }) {
  const [paginas, setPaginas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [fase, setFase] = useState('teoria'); // 'teoria' | 'preguntas' | 'resultado'
  const [paginaActualIdx, setPaginaActualIdx] = useState(0);
  const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);
  
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [esCorrecta, setEsCorrecta] = useState(null);
  const [aciertos, setAciertos] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/paginas/?leccion_id=${leccion.id}`).then(res => res.json()),
      fetch(`http://127.0.0.1:8000/api/preguntas/?leccion_id=${leccion.id}`).then(res => res.json())
    ])
      .then(([dataPaginas, dataPreguntas]) => {
        setPaginas(dataPaginas);
        setPreguntas(dataPreguntas);
        setCargando(false);
      })
      .catch(err => {
        console.warn('Usando datos de respaldo locales:', err);
        setPaginas([
          { id: 1, numero_pagina: 1, contenidos: [{ id: 1, texto: `Introducción técnica al módulo ${leccion.nombre}. Fundamentos normativos SEC.` }] },
          { id: 2, numero_pagina: 2, contenidos: [{ id: 2, texto: 'Criterios de seguridad, restricciones y montaje reglamentario.' }] }
        ]);
        setPreguntas([
          {
            id: 1,
            texto: `¿Cuál es el criterio fundamental en ${leccion.nombre}?`,
            opciones: [
              { id: 1, texto: 'Cumplir con las exigencias normativas y de seguridad.', es_correcta: true },
              { id: 2, texto: 'Ignorar los protocolos de revisión inicial.', es_correcta: false },
              { id: 3, texto: 'Instalar sin certificación previa.', es_correcta: false }
            ]
          }
        ]);
        setCargando(false);
      });
  }, [leccion]);

  const handleSiguientePagina = () => {
    if (paginaActualIdx < paginas.length - 1) {
      setPaginaActualIdx(prev => prev + 1);
    } else {
      if (preguntas.length > 0) {
        setFase('preguntas');
      } else {
        setFase('resultado');
      }
    }
  };

  const handleSeleccionarOpcion = (opcion) => {
    if (opcionSeleccionada !== null) return;
    setOpcionSeleccionada(opcion.id);
    const correcta = opcion.es_correcta;
    setEsCorrecta(correcta);
    if (correcta) setAciertos(prev => prev + 1);
  };

  const handleSiguientePregunta = () => {
    setOpcionSeleccionada(null);
    setEsCorrecta(null);
    if (preguntaActualIdx < preguntas.length - 1) {
      setPreguntaActualIdx(prev => prev + 1);
    } else {
      setFase('resultado');
    }
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 bg-[#040914]/90 backdrop-blur-md flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest animate-pulse">[CARGANDO MÓDULO...]</span>
      </div>
    );
  }

  const paginaActual = paginas[paginaActualIdx];
  const preguntaActual = preguntas[preguntaActualIdx];
  const totalPasosTeoria = paginas.length;
  const totalPreguntas = preguntas.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#040914]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      
      {/* Contenedor principal con centrado y scroll si excede el alto */}
      <div className="w-full max-w-xl my-auto flex flex-col gap-4">
        
        {/* Barra superior de progreso y salir */}
        <div className="w-full flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            ✕ SALIR
          </button>

          <div className="flex-1 h-3 bg-slate-900 rounded-full border border-cyan-500/30 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_#00f0ff]"
              style={{ 
                width: fase === 'teoria' 
                  ? `${((paginaActualIdx + 1) / totalPasosTeoria) * 100}%` 
                  : fase === 'preguntas'
                  ? `${((preguntaActualIdx + 1) / totalPreguntas) * 100}%`
                  : '100%' 
              }}
            />
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-mono text-xs bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-xl">
            <span>⚡</span> {fase === 'teoria' ? `Pág ${paginaActualIdx + 1}/${totalPasosTeoria}` : `Preg ${preguntaActualIdx + 1}/${totalPreguntas}`}
          </div>
        </div>

        {/* Tarjeta del Modal con soporte para scroll interno si las opciones son largas */}
        <div className="w-full bg-[#09152b] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col relative max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {fase === 'teoria' && paginaActual && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full uppercase">
                  📖 {unidad.nombre} // {leccion.nombre}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Página {paginaActual.numero_pagina} de {totalPasosTeoria}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-4 leading-snug">
                {leccion.nombre}
              </h2>

              <div className="bg-[#040914] border border-slate-800 rounded-2xl p-5 text-slate-200 text-sm sm:text-base leading-relaxed mb-8 shadow-inner font-sans">
                {paginaActual.contenidos && paginaActual.contenidos.length > 0 ? (
                  paginaActual.contenidos.map(c => <p key={c.id}>{c.texto}</p>)
                ) : (
                  <p>Contenido teórico en desarrollo para esta página.</p>
                )}
              </div>

              <button
                onClick={handleSiguientePagina}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold rounded-2xl shadow-[0_6px_0_#0e7490,0_10px_20px_rgba(6,182,212,0.4)] active:translate-y-1 transition text-sm tracking-wider uppercase"
              >
                {paginaActualIdx < totalPasosTeoria - 1 ? 'SIGUIENTE PÁGINA ➔' : (preguntas.length > 0 ? 'IR A EVALUACIÓN ⚡' : 'FINALIZAR LECCIÓN ✓')}
              </button>
            </div>
          )}

          {fase === 'preguntas' && preguntaActual && (
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase self-start mb-4">
                🎯 EVALUACIÓN FORMATIVA
              </span>

              <h3 className="text-base sm:text-lg font-bold text-white mb-6 leading-snug">
                {preguntaActual.texto}
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                {preguntaActual.opciones?.map((opcion) => {
                  let estilosOpcion = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80 hover:border-cyan-500/50";
                  
                  if (opcionSeleccionada !== null) {
                    if (opcion.es_correcta) {
                      estilosOpcion = "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                    } else if (opcion.id === opcionSeleccionada) {
                      estilosOpcion = "bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                    } else {
                      estilosOpcion = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={opcion.id}
                      onClick={() => handleSeleccionarOpcion(opcion)}
                      disabled={opcionSeleccionada !== null}
                      className={`w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all flex items-center justify-between ${estilosOpcion}`}
                    >
                      <span>{opcion.texto}</span>
                      {opcionSeleccionada !== null && opcion.es_correcta && <span className="text-emerald-400 font-bold">✓</span>}
                      {opcionSeleccionada !== null && opcion.id === opcionSeleccionada && !opcion.es_correcta && <span className="text-rose-400 font-bold">✕</span>}
                    </button>
                  );
                })}
              </div>

              {opcionSeleccionada !== null && (
                <div className="flex flex-col gap-3">
                  <div className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${esCorrecta ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'}`}>
                    <span>{esCorrecta ? '⚡ ¡EXCELENTE! RESPUESTA CORRECTA.' : '⚠️ INCORRECTO. REVISA EL PLIEGO NORMATIVO.'}</span>
                  </div>

                  <button
                    onClick={handleSiguientePregunta}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl shadow-[0_6px_0_#b45309,0_10px_20px_rgba(245,158,11,0.4)] active:translate-y-1 transition text-sm tracking-wider uppercase"
                  >
                    CONTINUAR ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {fase === 'resultado' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 p-1 mb-4 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center text-3xl">
                🏆
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡MÓDULO COMPLETADO!</h2>
              <p className="text-xs text-slate-300 font-mono mb-6">
                Has asimilado con éxito los conceptos de <span className="text-cyan-300">{leccion.nombre}</span>.
              </p>

              <div className="flex gap-4 mb-8 w-full justify-center font-mono">
                <div className="bg-cyan-950/70 border border-cyan-500/40 px-4 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-cyan-400">PÁGINAS</span>
                  <span className="text-lg font-bold text-white">{totalPasosTeoria}</span>
                </div>
                <div className="bg-amber-950/70 border border-amber-500/40 px-4 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] text-amber-400">ACIERTOS</span>
                  <span className="text-lg font-bold text-white">{aciertos} / {totalPreguntas}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onCompletar) onCompletar(leccion);
                  onClose();
                }}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 font-bold rounded-2xl shadow-[0_6px_0_#064e3b,0_10px_20px_rgba(16,185,129,0.4)] active:translate-y-1 transition text-sm tracking-wider uppercase"
              >
                RECLAMAR RECOMPENSA Y VOLVER ⚡
              </button>
            </div>
          )}

        </div>

        <footer className="w-full text-center text-[10px] text-slate-500 font-mono">
          [ELECTROLEARN // MOTOR DE APRENDIZAJE SEC RIC]
        </footer>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
export default function MapaRutaRIC() {
  const [unidades, setUnidades] = useState([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [leccionActiva, setLeccionActiva] = useState(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/unidades/?ordering=orden')
      .then((res) => res.json())
      .then((data) => {
        setUnidades(data);
        setCargando(false);
      })
      .catch((err) => {
        console.warn('Cargando pliegos demostrativos:', err);
        setUnidades([
          { id: 1, orden: 1, nombre: 'Empalmes', descripcion: 'Condiciones de conexión y cajas de derivación.', lecciones: [{ id: 101, orden: 1, nombre: 'Acometidas' }, { id: 102, orden: 2, nombre: 'Protecciones' }] },
          { id: 2, orden: 2, nombre: 'Tableros', descripcion: 'Especificaciones de gabinetes y rotulados.' },
          { id: 3, orden: 3, nombre: 'Alimentadores', descripcion: 'Cálculo de caídas de tensión y canalizaciones.' },
          { id: 4, orden: 4, nombre: 'Conductores', descripcion: 'Aislaciones EVA y libres de halógenos.' },
          { id: 5, orden: 5, nombre: 'Protecciones', descripcion: 'Disyuntores y coordinación diferencial.' },
        ]);
        setCargando(false);
      });
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: 'grab' } },
      modes: { grab: { distance: 130, links: { opacity: 0.5, color: '#00f0ff' } } },
    },
    particles: {
      color: { value: ['#00f0ff', '#00f29b', '#f59e0b'] },
      links: { color: '#00f0ff', distance: 120, enable: true, opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.6, outModes: { default: 'bounce' } },
      number: { density: { enable: true, area: 900 }, value: 40 },
      opacity: { value: { min: 0.2, max: 0.6 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  const listaNodos = useMemo(() => {
    if (unidadSeleccionada) {
      return unidadSeleccionada.lecciones || [];
    }
    return unidades;
  }, [unidadSeleccionada, unidades]);

  const esModoLeccion = Boolean(unidadSeleccionada);
  const alturaTotal = Math.max(580, listaNodos.length * PASO_Y + 110);

  const handleSelectNodo = useCallback((item) => {
    if (!unidadSeleccionada) {
      setUnidadSeleccionada(item);
      setHoveredItem(null);
    } else {
      setLeccionActiva(item);
    }
  }, [unidadSeleccionada]);

  if (cargando) {
    return (
      <div className="w-screen h-screen bg-[#050811] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest animate-pulse">[TIUQUE_SYS] CONECTANDO RED...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#040914] text-slate-100 font-sans select-none flex flex-col overflow-x-hidden">
      <Particles id="tsparticles-game" init={particlesInit} options={particlesOptions} />

      <header className="sticky top-3 z-30 mx-auto w-[94%] max-w-2xl bg-[#09152b]/90 border border-cyan-500/30 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {esModoLeccion ? (
            <button
              onClick={() => setUnidadSeleccionada(null)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow-[0_3px_0_#0e7490]"
            >
              ◀ MAPA
            </button>
          ) : (
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-sm shadow-[0_0_10px_#00f0ff]">
              ⚡
            </div>
          )}
          <div className="truncate">
            <span className="text-xs font-bold text-cyan-300 block truncate tracking-wide">
              {esModoLeccion ? unidadSeleccionada.nombre : 'ELECTROLEARN // RUTA RIC'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {esModoLeccion ? `${listaNodos.length} módulos prácticos` : 'NORMATIVA TÉCNICA SEC'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-cyan-300 font-semibold bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-lg shadow-inner">
            <span>⚡</span> 12.5K
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg shadow-inner">
            <span>🔥</span> 32d
          </div>
        </div>
      </header>

      <main className="relative w-full flex-1 overflow-y-auto py-14 px-4 z-10 custom-scrollbar flex justify-center">
        {hoveredItem && (
          <aside className="fixed right-6 top-24 z-40 w-72 bg-[#091830]/95 border-2 border-amber-400 rounded-3xl p-4 shadow-[0_10px_35px_rgba(245,158,11,0.3)] backdrop-blur-md pointer-events-none transition-all">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-1.5 mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>📑</span> {esModoLeccion ? 'MÓDULO TÉCNICO' : 'PLIEGO OFICIAL'}
              </span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-medium">
                SEC
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1 leading-snug">
              {hoveredItem.nombre}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {hoveredItem.descripcion || 'Estudio y aplicación de exigencias normativas vigentes.'}
            </p>
          </aside>
        )}

        <div className="relative w-full max-w-lg" style={{ height: `${alturaTotal}px` }}>
          <ConexionesSVG totalElementos={listaNodos.length} alturaTotal={alturaTotal} />

          {listaNodos.map((nodo, idx) => (
            <NodoRuta
              key={nodo.id || idx}
              item={nodo}
              idx={idx}
              isHovered={hoveredItem?.id === nodo.id}
              onHover={setHoveredItem}
              onSelect={handleSelectNodo}
              esModoLeccion={esModoLeccion}
            />
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 w-full bg-[#060e1d]/95 border-t border-cyan-500/20 px-4 py-2 z-30 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-900 border border-cyan-400 flex items-center justify-center text-sm shadow-[0_0_8px_#00f0ff]">
            🦉
          </div>
          <p className="text-[11px] text-cyan-200 font-mono truncate">
            <span className="font-bold text-white">TIUQUE_AI:</span>{' '}
            {hoveredItem
              ? `Inspeccionando ${hoveredItem.nombre}. ¡Avanza con seguridad!`
              : esModoLeccion
              ? `Lecciones de ${unidadSeleccionada.nombre}`
              : 'Elige un pliego para desplegar su ruta.'}
          </p>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ONLINE
        </span>
      </footer>

      {leccionActiva && (
        <ModalLeccionDuolingo
          unidad={unidadSeleccionada}
          leccion={leccionActiva}
          onClose={() => setLeccionActiva(null)}
          onCompletar={(leccionCompletada) => {
            console.log('Lección completada:', leccionCompletada);
          }}
        />
      )}
    </div>
  );
}