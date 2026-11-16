import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import wallMapa from './assets/wall_mapa.jpeg';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';
const PASO_Y = 130;
const PATRON_X = [30, 50, 70, 50];
const getXPercentage = (index) => PATRON_X[index % PATRON_X.length];

// 1. Conexiones SVG estilo circuito de alta tensión con gradiente eléctrico amarillo/verde/azul
const ConexionesSVG = memo(({ totalElementos, alturaTotal }) => {
  const puntos = useMemo(() => {
    return Array.from({ length: totalElementos }).map((_, i) => ({
      x: getXPercentage(i),
      y: 55 + i * PASO_Y,
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
        <linearGradient id="electricCircuit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb800" />    {/* Amarillo Eléctrico Alto Voltaje */}
          <stop offset="50%" stopColor="#9fef00" />   {/* Verde Hacker */}
          <stop offset="100%" stopColor="#00f0ff" />  {/* Neón Eléctrico */}
        </linearGradient>

        <filter id="electricGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
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
          <g key={`circuito-${i}`}>
            <path d={pathData} fill="none" stroke="#04070d" strokeWidth="6" strokeLinecap="round" />
            <path d={pathData} fill="none" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round" filter="url(#electricGlow)" className="opacity-50" />
            <path d={pathData} fill="none" stroke="url(#electricCircuit)" strokeWidth="1.5" strokeLinecap="round" className="opacity-95" />
            <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="0.9" strokeDasharray="3, 6" strokeLinecap="round" className="opacity-90 animate-[pulse_1s_infinite]" />
          </g>
        );
      })}
    </svg>
  );
});

export default function DetalleUnidad({ unidad, onVolver, onSelectLeccion }) {
  const [lecciones, setLecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredLeccion, setHoveredLeccion] = useState(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      color: { value: ['#ffb800', '#9fef00', '#00f0ff'] },
      links: { color: '#ffb800', distance: 90, enable: true, opacity: 0.1, width: 1 },
      move: { enable: true, speed: 0.45, outModes: { default: 'bounce' } },
      number: { density: { enable: true, area: 700 }, value: 35 },
      opacity: { value: { min: 0.25, max: 0.6 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), []);

  useEffect(() => {
    if (!unidad) return;
    setCargando(true);
    
    if (unidad.lecciones && Array.isArray(unidad.lecciones) && unidad.lecciones.length > 0) {
      setLecciones(unidad.lecciones);
      setCargando(false);
    } else {
      fetch(`${API_BASE_URL}/lecciones/?unidad=${unidad.id}`)
        .then(res => res.json())
        .then(data => {
          const lista = Array.isArray(data) ? data : (data.results || []);
          setLecciones(lista.length > 0 ? lista : [
            { id: 1001, orden: 1, nombre: 'Fundamentos de Acometidas', descripcion: 'Análisis de vulnerabilidades y empalmes domiciliarios SEC.' },
            { id: 1002, orden: 2, nombre: 'Empalmes Monofásicos', descripcion: 'Configuración de protecciones y medidores de energía.' },
            { id: 1003, orden: 3, nombre: 'Protecciones y Cortes', descripcion: 'Protocolos normativos sobre tableros generales.' }
          ]);
          setCargando(false);
        })
        .catch(() => {
          setLecciones([
            { id: 1001, orden: 1, nombre: 'Fundamentos de Acometidas', descripcion: 'Análisis de vulnerabilidades y empalmes domiciliarios SEC.' },
            { id: 1002, orden: 2, nombre: 'Empalmes Monofásicos', descripcion: 'Configuración de protecciones y medidores de energía.' },
            { id: 1003, orden: 3, nombre: 'Protecciones y Cortes', descripcion: 'Protocolos normativos sobre tableros generales.' }
          ]);
          setCargando(false);
        });
    }
  }, [unidad]);

  const alturaTotal = Math.max(540, lecciones.length * PASO_Y + 120);
  const retosCompletados = 1; // Progreso simulado o dinámico
  const porcentajeProgreso = lecciones.length > 0 ? Math.round((retosCompletados / lecciones.length) * 100) : 0;

  return (
    <div className="relative min-h-screen text-white font-mono flex flex-col justify-between selection:bg-[#ffb800] selection:text-slate-950 overflow-x-hidden">
      
      {/* Fondo con Textura wall_mapa.jpeg y overlay oscuro eléctrico */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 filter brightness-50 contrast-125"
        style={{ backgroundImage: `url(${wallMapa})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/90 via-[#0b0f19]/85 to-[#060913]/95 pointer-events-none z-0" />

      {/* Partículas Eléctricas */}
      <Particles id="tsparticles-htb" init={particlesInit} options={particlesOptions} className="absolute inset-0 pointer-events-none z-1" />

      {/* Grid estilo Terminal / HTB */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffb80008_1px,transparent_1px),linear-gradient(to_bottom,#ffb80008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-1" />

      {/* Header estilo Terminal Prompt con Barra de Progreso */}
      <header className="sticky top-3 z-30 mx-auto w-[95%] max-w-3xl bg-[#0d1322]/95 border border-[#ffb800]/40 rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(255,184,0,0.2)] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={onVolver} 
              className="bg-[#141d30] hover:bg-[#ffb800] text-[#ffb800] hover:text-slate-950 border border-[#ffb800]/50 px-3 py-1 rounded-lg text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,184,0,0.3)] cursor-pointer"
            >
              <span>◄</span> cd ..
            </button>
            <div className="truncate">
              <span className="text-[11px] font-bold text-[#ffb800] block truncate tracking-wider uppercase">
                root@sec-ric:~# ./{unidad?.nombre?.toLowerCase().replace(/\s+/g, '_') || 'unidad'}
              </span>
              <span className="text-[9px] text-slate-400">
                [STATUS: <span className="text-[#9fef00]">ACCESS_GRANTED</span>] // {lecciones.length} CHALLENGES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1 text-[#ffb800] bg-[#261f0c] border border-[#ffb800]/40 px-2.5 py-1 rounded-md shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb800] animate-ping" />
              <span>HIGH_VOLTAGE</span>
            </div>
          </div>
        </div>

        {/* Barra de Progreso de la Unidad */}
        <div className="w-full bg-[#080c14] border border-[#1f293d] rounded-full h-2.5 overflow-hidden p-0.5 relative">
          <div 
            className="bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#ffb800]"
            style={{ width: `${porcentajeProgreso}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-mono">
          <span>PROGRESO DE UNIDAD: {porcentajeProgreso}%</span>
          <span className="text-[#9fef00]">{retosCompletados}/{lecciones.length} COMPLETADOS</span>
        </div>
      </header>

      {/* Panel Flotante Estilo HTB Box Info */}
      {hoveredLeccion && (
        <aside className="fixed right-6 top-28 z-40 w-80 bg-[#0d1322]/95 border-2 border-[#ffb800] rounded-2xl p-4 shadow-[0_0_35px_rgba(255,184,0,0.3)] backdrop-blur-md pointer-events-none animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#ffb800]/30 pb-2 mb-2 text-[10px] text-[#ffb800]">
            <span className="font-bold uppercase tracking-widest flex items-center gap-1">
              <span>⚡</span> TARGET // {hoveredLeccion.nombre}
            </span>
            <span className="bg-[#ffb800]/20 px-2 py-0.5 rounded text-[9px] text-[#ffb800]">VOLTAGE: 220V</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {hoveredLeccion.descripcion || 'Análisis técnico y cumplimiento de normativas eléctricas vigentes.'}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[9px] text-slate-400">
            <span>REWARD: 100 XP</span>
            <span className="text-[#9fef00]">[FLAG READY]</span>
          </div>
        </aside>
      )}

      {/* Mapa de Desafíos / Lecciones */}
      <main className="relative w-full flex-1 overflow-y-auto py-16 px-4 z-10 flex justify-center custom-scrollbar">
        {cargando ? (
          <div className="text-[#ffb800] font-mono text-xs animate-pulse my-auto flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#ffb800] border-t-transparent rounded-full animate-spin" />
            [CARGANDO RETOS ELÉCTRICOS...]
          </div>
        ) : (
          <div className="relative w-full max-w-lg" style={{ height: `${alturaTotal}px` }}>
            <ConexionesSVG totalElementos={lecciones.length} alturaTotal={alturaTotal} />

            {lecciones.map((leccion, idx) => {
              const xPos = getXPercentage(idx);
              const yPos = 55 + idx * PASO_Y;
              const completado = idx < 1;
              const activo = idx === 1;
              const isHovered = hoveredLeccion?.id === leccion.id;

              return (
                <div
                  key={leccion.id || idx}
                  style={{ left: `${xPos}%`, top: `${yPos}px`, transform: 'translate(-50%, -50%)' }}
                  className="absolute z-10 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredLeccion(leccion)}
                  onMouseLeave={() => setHoveredLeccion(null)}
                  onClick={() => onSelectLeccion && onSelectLeccion(leccion)}
                >
                  {activo && (
                    <div className="absolute -top-11 flex flex-col items-center animate-bounce z-20">
                      <div className="bg-gradient-to-r from-[#ffb800] to-[#9fef00] text-slate-950 font-bold text-[9px] tracking-widest px-2.5 py-0.5 rounded shadow-[0_0_15px_rgba(255,184,0,0.8)] uppercase">
                        ⚡ SPAWN BOX
                      </div>
                      <div className="w-2 h-2 bg-[#ffb800] rotate-45 -mt-1 shadow-sm" />
                    </div>
                  )}

                  <div className="relative">
                    {activo && (
                      <div 
                        className="absolute -inset-3 rounded-xl border border-dashed border-[#ffb800] animate-spin opacity-80" 
                        style={{ animationDuration: '8s' }} 
                      />
                    )}

                    <div
                      className={`absolute -inset-1 rounded-xl blur-sm transition-opacity duration-300 ${
                        activo ? 'bg-[#ffb800]/40 opacity-100 animate-pulse' : completado ? 'bg-[#9fef00]/30 opacity-70' : isHovered ? 'bg-[#00f0ff]/30 opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Nodo Estilo Tarjeta / Box de CTF con acento amarillo eléctrico */}
                    <div className={`relative w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1 border-2 ${
                      completado 
                        ? 'bg-[#0e2216] border-[#9fef00] shadow-[0_5px_0_#3f6212,0_0_15px_rgba(159,239,0,0.3)] text-[#9fef00]' 
                        : activo 
                        ? 'bg-[#261f0c] border-[#ffb800] shadow-[0_5px_0_#b45309,0_0_20px_rgba(255,184,0,0.5)] text-[#ffb800] scale-105' 
                        : 'bg-[#0f1420] border-[#22304a] shadow-[0_4px_0_#090d16] text-slate-500'
                    }`}>
                      <span className="text-xl filter drop-shadow">
                        {completado ? '✔' : activo ? '⚡' : '🔒'}
                      </span>
                      <span className="text-[9px] font-bold tracking-wider mt-1 opacity-90">
                        CH-{String(leccion.orden || idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <span className={`mt-2.5 px-3 py-1 rounded-md text-[10px] font-mono tracking-wide transition-all shadow-sm ${
                    isHovered ? 'bg-[#1b263b] text-[#ffb800] border border-[#ffb800]/60 scale-105' : 'bg-[#0d1322]/90 text-slate-300 border border-[#1f293d]'
                  }`}>
                    {leccion.nombre}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Estilo CLI Status */}
      <footer className="sticky bottom-0 w-full bg-[#060913]/95 border-t border-[#1f293d] px-4 py-2.5 z-30 flex items-center justify-between backdrop-blur-md text-[10px] z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#ffb800]">root@tiuque-tec:~$</span>
          <span className="text-slate-400 animate-pulse">high_voltage_grid [SEC_RIC_ACTIVE]</span>
        </div>
        <span className="text-[#9fef00] font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#9fef00] animate-ping" />
          SYSTEM_ONLINE
        </span>
      </footer>

    </div>
  );
}