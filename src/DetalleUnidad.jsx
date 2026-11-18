import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import logoImg from './assets/logo_s.png';
import wallMapa from './assets/wall_mapa.jpeg';
import LeccionModal from './LeccionModal';
import { sfx } from './soundEffects';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';
const PASO_Y = 125;
const PATRON_X = [30, 50, 70, 50];
const getXPercentage = (index) => PATRON_X[index % PATRON_X.length];

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
        <linearGradient id="cyberCableHTB" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9fef00" />
          <stop offset="50%" stopColor="#ffb800" />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>

        <filter id="cableGlowHTB" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="glow" />
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
              stroke="#04070d"
              strokeWidth="5"
              strokeLinecap="round"
              className="opacity-85"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#9fef00"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#cableGlowHTB)"
              className="opacity-45"
            />
            <path
              d={pathData}
              fill="none"
              stroke="url(#cyberCableHTB)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="opacity-95"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.9"
              strokeDasharray="2, 6"
              strokeLinecap="round"
              className="opacity-90 animate-[pulse_1.2s_infinite]"
            />
          </g>
        );
      })}
    </svg>
  );
});

const NodoRuta = memo(({ leccion, idx, completado, activo, isHovered, onHover, onSelect }) => {
  const xPos = getXPercentage(idx);
  const yPos = 55 + idx * PASO_Y;
  const numCodigo = String(leccion.numero_leccion || leccion.orden || idx + 1).padStart(2, '0');

  return (
    <div
      style={{
        left: `${xPos}%`,
        top: `${yPos}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute z-10 flex flex-col items-center group cursor-pointer"
      onMouseEnter={() => {
        sfx.playHover();
        onHover(leccion);
      }}
      onMouseLeave={() => onHover(null)}
      onClick={() => {
        sfx.playOpenNode();
        onSelect(leccion);
      }}
    >
      {activo && (
        <div className="absolute -top-12 flex flex-col items-center animate-bounce z-20">
          <div className="bg-gradient-to-r from-[#ffb800] to-[#9fef00] text-slate-950 font-black text-[9px] tracking-wider px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(255,184,0,0.85)] border border-yellow-200 uppercase flex items-center gap-1">
            <span>⚡ EXPLORAR</span>
          </div>
          <div className="w-2 h-2 bg-[#ffb800] rotate-45 -mt-1 shadow-sm" />
        </div>
      )}

      <div className="relative">
        {activo && (
          <div 
            className="absolute -inset-3 rounded-full border-2 border-dashed border-[#ffb800] animate-spin opacity-85" 
            style={{ animationDuration: '7s' }} 
          />
        )}

        <div
          className={`absolute -inset-1.5 rounded-full blur-md transition-opacity duration-300 ${
            activo
              ? 'bg-[#ffb800]/50 opacity-100 animate-pulse'
              : completado
              ? 'bg-[#9fef00]/40 opacity-80'
              : isHovered
              ? 'bg-[#00f0ff]/40 opacity-100'
              : 'opacity-0'
          }`}
        />

        <div
          className={`relative w-18 h-18 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:translate-y-1.5 border-[3px] ${
            completado
              ? 'bg-gradient-to-b from-[#9fef00] to-[#5ea300] border-[#112614] shadow-[0_6px_0_#264908,0_10px_20px_rgba(159,239,0,0.35)] text-slate-950'
              : activo
              ? 'bg-gradient-to-b from-[#ffb800] to-[#d97706] border-[#451a03] shadow-[0_6px_0_#78350f,0_12px_25px_rgba(255,184,0,0.55)] text-slate-950 scale-105'
              : 'bg-gradient-to-b from-[#162033] to-[#0a1120] border-[#22304a] shadow-[0_5px_0_#050914] text-slate-400 hover:border-[#9fef00]/50'
          }`}
        >
          <div className="absolute top-1.5 inset-x-3 h-2.5 bg-white/30 rounded-full blur-[0.5px]" />
          <span className="text-xl filter drop-shadow">
            {completado ? '✓' : activo ? '⚡' : '🔒'}
          </span>
          <span className={`text-[9px] font-black tracking-wider ${completado || activo ? 'text-slate-950' : 'text-slate-300'}`}>
            M-{numCodigo}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center max-w-[165px]">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all shadow-md ${
          isHovered
            ? 'bg-[#112614] text-[#9fef00] border border-[#9fef00] scale-105 shadow-[0_0_15px_rgba(159,239,0,0.25)]'
            : activo
            ? 'bg-[#261f0c]/95 text-[#ffb800] border border-[#ffb800]/60'
            : 'bg-[#0a1120]/90 text-slate-200 border border-slate-700/80'
        }`}>
          {leccion.nombre}
        </span>
      </div>
    </div>
  );
});

export default function DetalleUnidad({
  user,
  nombreUsuario,
  unidad,
  usuarioId,
  onVolver,
  onIrCalculadora,
  onLogout,
  onSelectLeccion
}) {
  const [lecciones, setLecciones] = useState([]);
  const [leccionesCompletadasIds, setLeccionesCompletadasIds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredLeccion, setHoveredLeccion] = useState(null);
  const [leccionActivaModal, setLeccionActivaModal] = useState(null);
  const [sonidoMuteado, setSonidoMuteado] = useState(sfx.isMuted());

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: 'grab' } },
      modes: { grab: { distance: 130, links: { opacity: 0.45, color: '#9fef00' } } },
    },
    particles: {
      color: { value: ['#9fef00', '#ffb800', '#00f0ff'] },
      links: { color: '#9fef00', distance: 110, enable: true, opacity: 0.14, width: 1 },
      move: { enable: true, speed: 0.5, outModes: { default: 'bounce' } },
      number: { density: { enable: true, area: 800 }, value: 38 },
      opacity: { value: { min: 0.25, max: 0.65 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 2.8 } },
    },
    detectRetina: true,
  }), []);

  useEffect(() => {
    if (!unidad) return;
    setCargando(true);
    
    fetch(`${API_BASE_URL}/lecciones/?unidad=${unidad.id}`)
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.results || []);
        const filtradas = lista
          .filter(l => {
            const unidadIdLeccion = typeof l.unidad === 'object' && l.unidad !== null 
              ? l.unidad.id 
              : (l.unidad ?? l.unidad_id);
            return Number(unidadIdLeccion) === Number(unidad.id);
          })
          .sort((a, b) => (a.numero_leccion || a.orden || 0) - (b.numero_leccion || b.orden || 0));

        const finales = filtradas.length > 0 ? filtradas : [
          { id: 1001, numero_leccion: 1, nombre: 'Fundamentos de Acometidas', descripcion: 'Análisis técnico y exigencias de empalmes domiciliarios SEC.' },
          { id: 1002, numero_leccion: 2, nombre: 'Empalmes Monofásicos', descripcion: 'Configuración de protecciones y medidores de energía.' },
          { id: 1003, numero_leccion: 3, nombre: 'Protecciones y Cortes', descripcion: 'Protocolos normativos sobre tableros generales.' }
        ];
        setLecciones(finales);
        if (finales.length > 0) {
          setLeccionesCompletadasIds([finales[0].id]);
        }
        setCargando(false);
      })
      .catch(() => {
        const respaldo = [
          { id: 1001, numero_leccion: 1, nombre: 'Fundamentos de Acometidas', descripcion: 'Análisis técnico y exigencias de empalmes domiciliarios SEC.' },
          { id: 1002, numero_leccion: 2, nombre: 'Empalmes Monofásicos', descripcion: 'Configuración de protecciones y medidores de energía.' },
          { id: 1003, numero_leccion: 3, nombre: 'Protecciones y Cortes', descripcion: 'Protocolos normativos sobre tableros generales.' }
        ];
        setLecciones(respaldo);
        setLeccionesCompletadasIds([1001]);
        setCargando(false);
      });
  }, [unidad]);

  const handleToggleMute = () => {
    const nuevo = sfx.toggleMute();
    setSonidoMuteado(nuevo);
  };

  const handleMarcarCompletada = (leccionCompletada) => {
    setLeccionesCompletadasIds(prev =>
      prev.includes(leccionCompletada.id) ? prev : [...prev, leccionCompletada.id]
    );
    if (onSelectLeccion) onSelectLeccion(leccionCompletada);
  };

  const alturaTotal = Math.max(560, lecciones.length * PASO_Y + 120);
  const retosCompletados = leccionesCompletadasIds.length;
  const porcentajeProgreso = lecciones.length > 0 ? Math.round((retosCompletados / lecciones.length) * 100) : 0;
  const displayUser = nombreUsuario || user?.username || 'Operador SEC';

  return (
    <div className="relative min-h-screen bg-[#050914] text-white font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950 overflow-x-hidden">
      
      {/* Fondo con Textura wall_mapa.jpeg + Partículas + Grilla Técnica */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 filter brightness-50 contrast-125"
        style={{ backgroundImage: `url(${wallMapa})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050914]/90 via-[#080d1a]/80 to-[#050914]/95 pointer-events-none z-0" />
      <Particles id="tsparticles-mapa-htb" init={particlesInit} options={particlesOptions} className="absolute inset-0 pointer-events-none z-1" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-1" />

      {/* Menú Global Unificado */}
      <header className="sticky top-0 z-40 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 px-6 py-3.5 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <div onClick={onVolver} className="flex items-center space-x-3 cursor-pointer group">
              <img src={logoImg} alt="AreaElectrica Logo" className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition border border-[#9fef00]/40" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-white uppercase">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span> <span className="text-[#ffb800] text-[10px]">MAPA</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest">RUTA DE ENTRENAMIENTO SEC</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-2 text-xs">
              <button
                onMouseEnter={() => sfx.playHover()}
                onClick={onVolver}
                className="px-3.5 py-1.5 rounded-xl font-bold text-slate-300 hover:text-[#9fef00] bg-[#0d1527]/70 hover:bg-[#0d1527] border border-slate-800 hover:border-[#9fef00]/40 transition cursor-pointer"
              >
                ⚡ PANEL DE ESTUDIO
              </button>
              <span className="px-3.5 py-1.5 rounded-xl font-bold bg-[#261f0c] text-[#ffb800] border border-[#ffb800]/50 shadow-[0_0_12px_rgba(255,184,0,0.15)]">
                🗺️ {unidad?.nombre || 'MAPA DE UNIDAD'}
              </span>
              {onIrCalculadora && (
                <button
                  onMouseEnter={() => sfx.playHover()}
                  onClick={onIrCalculadora}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-slate-300 hover:text-[#ffb800] bg-[#0d1527]/70 hover:bg-[#0d1527] border border-slate-800 hover:border-[#ffb800]/40 transition cursor-pointer"
                >
                  📊 CALCULADORA RIC
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleToggleMute}
              title={sonidoMuteado ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido'}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                sonidoMuteado
                  ? 'bg-[#0d1527] border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-[#112614] border-[#9fef00]/40 text-[#9fef00]'
              }`}
            >
              <span>{sonidoMuteado ? '🔇' : '🔊'}</span>
              <span className="hidden sm:inline text-[10px]">{sonidoMuteado ? 'MUTE' : 'SFX'}</span>
            </button>

            <div className="hidden sm:flex items-center space-x-2 bg-[#0d1527] border border-[#ffb800]/40 px-3 py-1 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-[#9fef00]" />
              <span className="font-bold text-[#ffb800]">{displayUser}</span>
            </div>
            <button
              onMouseEnter={() => sfx.playHover()}
              onClick={onVolver}
              className="bg-[#112614] hover:bg-[#9fef00] text-[#9fef00] hover:text-slate-950 border border-[#9fef00]/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              ◀ VOLVER AL PANEL
            </button>
            {onLogout && (
              <button
                onMouseEnter={() => sfx.playHover()}
                onClick={() => {
                  sfx.playClick();
                  onLogout();
                }}
                className="px-3 h-8 rounded-xl bg-[#0d1527] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-400 text-xs font-bold transition cursor-pointer"
              >
                SALIR ⌁
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HUD de Progreso de la Unidad */}
      <div className="relative z-20 mx-auto w-[94%] max-w-3xl mt-5 bg-[#0a1120]/95 border border-[#ffb800]/40 rounded-2xl px-5 py-3.5 shadow-[0_0_30px_rgba(255,184,0,0.15)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-black text-[#ffb800] uppercase tracking-wider block">
              {unidad?.nombre || 'UNIDAD NORMATIVA SEC'}
            </span>
            <span className="text-[10px] text-slate-400">
              ESTADO: <span className="text-[#9fef00] font-bold">ACCESO HABILITADO</span> • {lecciones.length} MÓDULOS TÉCNICOS
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {unidad?.pdf_url && (
              <a
                href={unidad.pdf_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => sfx.playClick()}
                className="text-[#9fef00] bg-[#112614] border border-[#9fef00]/40 px-3 py-1 rounded-lg hover:bg-[#9fef00] hover:text-slate-950 transition font-bold"
              >
                📄 PLIEGO PDF
              </a>
            )}
            <div className="flex items-center gap-1.5 text-[#ffb800] bg-[#261f0c] border border-[#ffb800]/40 px-3 py-1 rounded-lg shadow-inner font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb800] animate-ping" />
              <span>ALTA TENSIÓN</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#050914] border border-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
          <div 
            className="bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#9fef00]"
            style={{ width: `${porcentajeProgreso}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-bold">
          <span>PROGRESO DE LA UNIDAD: {porcentajeProgreso}%</span>
          <span className="text-[#9fef00]">{retosCompletados} / {lecciones.length} COMPLETADOS</span>
        </div>
      </div>

      {/* Panel Flotante de Inspección de Nodo */}
      {hoveredLeccion && (
        <aside className="fixed right-6 top-40 z-40 w-80 bg-[#0a1120]/95 border-2 border-[#ffb800] rounded-2xl p-4 shadow-[0_0_35px_rgba(255,184,0,0.3)] backdrop-blur-md pointer-events-none transition-all hidden lg:block">
          <div className="flex items-center justify-between border-b border-[#ffb800]/30 pb-2 mb-2 text-[10px] text-[#ffb800]">
            <span className="font-bold uppercase tracking-widest flex items-center gap-1">
              <span>⚡</span> MÓDULO TÉCNICO
            </span>
            <span className="bg-[#ffb800]/20 px-2 py-0.5 rounded text-[9px] text-[#ffb800] font-bold">
              220V / 380V
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1 font-sans">
            {hoveredLeccion.nombre}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {hoveredLeccion.descripcion || 'Análisis técnico y cumplimiento de normativas eléctricas vigentes.'}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-bold">
            <span className="text-[#ffb800]">RECOMPENSA: +100 XP</span>
            <span className="text-[#9fef00]">HAZ CLIC PARA INICIAR</span>
          </div>
        </aside>
      )}

      {/* Mapa de Desafíos / Lecciones */}
      <main className="relative w-full flex-1 overflow-y-auto py-14 px-4 z-10 flex justify-center custom-scrollbar">
        {cargando ? (
          <div className="text-[#9fef00] font-mono text-xs animate-pulse my-auto flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#9fef00] border-t-transparent rounded-full animate-spin" />
            <span>CARGANDO MAPA ELÉCTRICO...</span>
          </div>
        ) : (
          <div className="relative w-full max-w-lg" style={{ height: `${alturaTotal}px` }}>
            <ConexionesSVG totalElementos={lecciones.length} alturaTotal={alturaTotal} />

            {lecciones.map((leccion, idx) => {
              const completado = leccionesCompletadasIds.includes(leccion.id);
              const activo = !completado && (idx === 0 || leccionesCompletadasIds.includes(lecciones[idx - 1]?.id));
              const isHovered = hoveredLeccion?.id === leccion.id;

              return (
                <NodoRuta
                  key={leccion.id || idx}
                  leccion={leccion}
                  idx={idx}
                  completado={completado}
                  activo={activo}
                  isHovered={isHovered}
                  onHover={setHoveredLeccion}
                  onSelect={(item) => setLeccionActivaModal(item)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Lección */}
      {leccionActivaModal && (
        <LeccionModal
          unidad={unidad}
          leccion={leccionActivaModal}
          usuarioId={usuarioId}
          onClose={() => {
            sfx.playClick();
            setLeccionActivaModal(null);
          }}
          onCompletar={handleMarcarCompletada}
        />
      )}

      {/* Footer con Asistente Tiuque-Tec en Vivo */}
      <footer className="sticky bottom-0 w-full bg-[#060913]/95 border-t border-[#9fef00]/30 px-6 py-2.5 z-30 flex items-center justify-between backdrop-blur-md text-[11px]">
        <div className="flex items-center gap-3 truncate">
          <div className="w-7 h-7 rounded-lg bg-[#112614] border border-[#9fef00] flex items-center justify-center text-sm shadow-[0_0_10px_rgba(159,239,0,0.3)] shrink-0">
            🦉
          </div>
          <p className="text-slate-300 truncate">
            <span className="font-bold text-[#ffb800]">TIUQUE-TEC:</span>{' '}
            {hoveredLeccion
              ? `Inspeccionando "${hoveredLeccion.nombre}". ¡Haz clic en el nodo para iniciar!`
              : `Explorando el mapa de ${unidad?.nombre || 'la unidad'}. Selecciona un nodo iluminado.`}
          </p>
        </div>
        <span className="text-[#9fef00] font-bold flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#9fef00] animate-ping" />
          RED ACTIVA
        </span>
      </footer>

    </div>
  );
}