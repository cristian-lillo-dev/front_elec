import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const PASO_Y = 120;
const PATRON_X = [30, 50, 70, 50];
const getXPercentage = (index) => PATRON_X[index % PATRON_X.length];

// =========================================================================
// CHISPAS CANVAS (PARTÍCULAS ELÉCTRICAS SOBRE EL NODO)
// =========================================================================
function ChispasEfecto({ activo }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particulas = [];
    const colores = ['#ffffff', '#00f0ff', '#facc15', '#fb923c'];

    const crearChispa = () => {
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = Math.random() * 3 + 1.5;
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad - 0.5,
        color: colores[Math.floor(Math.random() * colores.length)],
        size: Math.random() * 2.5 + 1.2,
        alpha: 1,
        vida: Math.random() * 0.035 + 0.02,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Si el mouse está encima, genera chispas continuas
      if (activo) {
        for (let i = 0; i < 4; i++) {
          particulas.push(crearChispa());
        }
      }

      // Actualizar y dibujar partículas vivas
      for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.vida;

        if (p.alpha <= 0) {
          particulas.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Mantener la animación mientras esté activo o queden chispas disolviéndose
      if (activo || particulas.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (activo) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [activo]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={180}
      style={{ pointerEvents: 'none' }}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 transition-opacity duration-200 ${
        activo ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

// =========================================================================
// 1. CABLES SVG (CONEXIONES CURVAS)
// =========================================================================
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

// =========================================================================
// 2. NODO CON EFECTO DE CHISPAS Y RELIEVE 3D
// =========================================================================
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
      {/* Canvas de Chispas Eléctricas en Capa Superior z-40 */}
      <ChispasEfecto activo={isHovered} />

      {/* Cartel flotante de inicio */}
      {activo && (
        <div className="absolute -top-11 flex flex-col items-center animate-bounce z-30 pointer-events-none">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-[9px] tracking-wider px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-yellow-200 uppercase flex items-center gap-1">
            <span>⚡ JUGAR</span>
          </div>
          <div className="w-2 h-2 bg-amber-500 rotate-45 -mt-1 shadow-sm" />
        </div>
      )}

      {/* Botón Circular 3D */}
      <div className="relative z-20">
        {activo && (
          <div 
            className="absolute -inset-2.5 rounded-full border-2 border-dashed border-cyan-400 animate-spin opacity-80 pointer-events-none" 
            style={{ animationDuration: '6s' }} 
          />
        )}

        <div
          className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
            activo
              ? 'bg-cyan-400/50 opacity-100 animate-pulse'
              : completado
              ? 'bg-emerald-500/30 opacity-70'
              : isHovered
              ? 'bg-cyan-400/50 opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Círculo con borde tonal más oscuro */}
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

      {/* Nombre del Pliego / Módulo */}
      <div className="mt-2.5 text-center max-w-[145px] z-20">
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
// 3. COMPONENTE PRINCIPAL (100% EN ESPAÑOL)
// =========================================================================
export default function MapaRutaRIC() {
  const [unidades, setUnidades] = useState([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cargando, setCargando] = useState(true);

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
          { id: 2, orden: 2, nombre: 'Tableros', descripcion: 'Especificaciones de gabinetes y rotulados técnicos.' },
          { id: 3, orden: 3, nombre: 'Alimentadores', descripcion: 'Cálculo de caídas de tensión y canalizaciones.' },
          { id: 4, orden: 4, nombre: 'Conductores', descripcion: 'Aislaciones incombustibles y libres de halógenos.' },
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
    }
  }, [unidadSeleccionada]);

  if (cargando) {
    return (
      <div className="w-screen h-screen bg-[#050811] flex flex-col items-center justify-center font-mono text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest animate-pulse">[TIUQUE_SYS] CONECTANDO A LA RED SEC...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#040914] text-slate-100 font-sans select-none flex flex-col overflow-x-hidden">
      <Particles id="tsparticles-game" init={particlesInit} options={particlesOptions} />

      {/* ENCABEZADO HUD */}
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
              {esModoLeccion ? `${listaNodos.length} módulos técnicos` : 'NORMATIVA TÉCNICA SEC'}
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

      {/* RUTA DE APRENDIZAJE */}
      <main className="relative w-full flex-1 overflow-y-auto py-14 px-4 z-10 custom-scrollbar flex justify-center">
        {/* PANEL LATERAL DE INFORMACIÓN */}
        {hoveredItem && (
          <aside className="fixed right-6 top-24 z-40 w-72 bg-[#091830]/95 border-2 border-amber-400 rounded-3xl p-4 shadow-[0_10px_35px_rgba(245,158,11,0.3)] backdrop-blur-md pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-150">
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
              {hoveredItem.descripcion || 'Estudio y aplicación de las exigencias técnicas reglamentarias.'}
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

      {/* PIE DE PÁGINA TIUQUE_AI */}
      <footer className="sticky bottom-0 w-full bg-[#060e1d]/95 border-t border-cyan-500/20 px-4 py-2 z-30 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-cyan-900 border border-cyan-400 flex items-center justify-center text-sm shadow-[0_0_8px_#00f0ff]">
            🦉
          </div>
          <p className="text-[11px] text-cyan-200 font-mono truncate">
            <span className="font-bold text-white">TIUQUE_AI:</span>{' '}
            {hoveredItem
              ? `Inspeccionando ${hoveredItem.nombre}. ¡Verifica tensión cero antes de intervenir!`
              : esModoLeccion
              ? `Lecciones de ${unidadSeleccionada.nombre}`
              : 'Selecciona un pliego para desplegar sus módulos.'}
          </p>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ONLINE
        </span>
      </footer>
    </div>
  );
}