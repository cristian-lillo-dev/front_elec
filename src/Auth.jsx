import React, { useState, useEffect } from 'react';
import tiuqueHeroImg from './assets/tiuque_hero.png';
import logoImg from './assets/logo_s.png';
import wallImg from './assets/wall_1.jpg';
import iconoConcentrado from './assets/icono_concentrado.png';
import iconoInterrogante from './assets/icono_interrogante.png';
import iconoContento from './assets/icono_contento.png';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

const PILLARS_DATA = [
  {
    id: 'asistente-normativa',
    tabLabel: 'Asistente de normativa',
    badge: 'CONSULTA NORMATIVA SEC RIC',
    title: 'Resuelve Pliegos RIC al Instante.',
    description:
      'Consulta exigencias normativas, tablas y criterios técnicos de los pliegos RIC de forma directa y respaldada para tus proyectos y evaluaciones.',
    ctaLabel: 'ABRIR ASISTENTE',
    targetAuthMode: 'login',
    visualTitle: 'ASISTENTE NORMATIVO ACTIVO',
    visualSubtitle: 'Búsqueda guiada en pliegos técnicos y criterios SEC',
    visualTag: 'PLIEGOS RIC • SEC',
    visualImg: iconoInterrogante,
    items: [
      {
        title: 'Consulta rápida por pliego y tema técnico',
        subtitle: 'Ubica requisitos normativos clave sin perder tiempo entre documentos.'
      },
      {
        title: 'Respaldo de criterio para obra y examen',
        subtitle: 'Verifica exigencias aplicables antes de ejecutar o responder.'
      }
    ]
  },
  {
    id: 'calculo-electrico',
    tabLabel: 'Herramientas de cálculo eléctrico',
    badge: 'CÁLCULO Y DIMENSIONAMIENTO',
    title: 'Calcula Con Precisión. Valida En Terreno.',
    description:
      'Realiza cálculos eléctricos esenciales —caída de tensión, secciones, protecciones y parámetros de taller— con apoyo normativo claro.',
    ctaLabel: 'PROBAR HERRAMIENTAS',
    targetAuthMode: 'registro',
    visualTitle: 'CALCULADORA DE TALLER ACTIVA',
    visualSubtitle: 'Verificación de caída de tensión, protecciones y pliegos RIC',
    visualTag: 'RIC N°02 • N°04 • N°06',
    visualImg: iconoConcentrado,
    items: [
      {
        title: 'Simulación de fallas y cálculo normativo',
        subtitle: 'Casos prácticos de dimensionamiento y protecciones en tiempo real.'
      },
      {
        title: 'Diagnóstico de criterio técnico SEC',
        subtitle: 'Identifica errores críticos antes de ejecutar en obra o rendir exámenes.'
      }
    ]
  },
  {
    id: 'aprende-jugando',
    tabLabel: 'Aprende jugando',
    badge: 'RETOS INTERACTIVOS Y RACHAS',
    title: 'Domina La Norma Jugando. Sube De Nivel.',
    description:
      'Avanza por mapas de retos, escenarios prácticos y rachas diarias para afianzar la electricidad y la normativa SEC de forma dinámica.',
    ctaLabel: 'EMPEZAR A JUGAR',
    targetAuthMode: 'registro',
    visualTitle: 'MODO DESAFÍO ACTIVO',
    visualSubtitle: 'Retos progresivos, puntos y práctica aplicada',
    visualTag: 'XP • RACHAS • NIVELES',
    visualImg: iconoContento,
    items: [
      {
        title: 'Retos prácticos por nivel de dificultad',
        subtitle: 'Refuerza conceptos clave mediante ejercicios interactivos.'
      },
      {
        title: 'Progreso continuo y constancia diaria',
        subtitle: 'Mantén tu racha y detecta qué temas necesitas repasar.'
      }
    ]
  }
];

export default function Auth({ onLoginExitoso }) {
  const [vista, setVista] = useState('landing');
  const [tipoAuth, setTipoAuth] = useState('login');
  const [pillarActivoId, setPillarActivoId] = useState('calculo-electrico');
  const [itemActivoIdx, setItemActivoIdx] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    categoria: 'Estudiante SEC'
  });
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setMenuAbierto(false);
  }, [vista]);

  const pillarActual =
    PILLARS_DATA.find((p) => p.id === pillarActivoId) || PILLARS_DATA[0];
  const itemActual =
    pillarActual.items[itemActivoIdx] || pillarActual.items[0];

  const handleSelectPillar = (id) => {
    setPillarActivoId(id);
    setItemActivoIdx(0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg(null);

    const endpoint = tipoAuth === 'login' ? '/auth/login/' : '/auth/registro/';
    const payload =
      tipoAuth === 'login'
        ? { username: formData.username, password: formData.password }
        : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const serverError =
          data.error ||
          data.detail ||
          data.non_field_errors?.[0] ||
          (typeof data === 'object' ? Object.values(data)[0]?.[0] : null) ||
          'Error en la autenticación.';
        throw new Error(serverError);
      }

      if (tipoAuth === 'login') {
        const tokenVal = data.token || data.access || data.key;
        if (tokenVal) localStorage.setItem('token', tokenVal);

        const rawUser = data.usuario || data.user || data;
        const nombreCompleto = [
          rawUser.first_name || formData.first_name,
          rawUser.last_name || formData.last_name
        ]
          .filter(Boolean)
          .join(' ');

        const usuarioVal = {
          id: rawUser.id || data.id || null,
          username: rawUser.username || formData.username,
          name:
            nombreCompleto ||
            rawUser.name ||
            rawUser.username ||
            formData.username,
          first_name: rawUser.first_name || formData.first_name,
          last_name: rawUser.last_name || formData.last_name,
          categoria: rawUser.categoria || formData.categoria || 'Estudiante SEC'
        };

        onLoginExitoso(usuarioVal);
      } else {
        alert('¡Registro completado con éxito! Inicia sesión con tus credenciales.');
        setTipoAuth('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  if (vista === 'landing') {
    return (
      <div className="relative w-full min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950 overflow-x-hidden">
        {/* Grid Técnico Estilo Hack The Box */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Header HUD con Menú Hamburguesa en Móvil */}
        <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer group min-w-0"
              onClick={() => {
                setVista('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img
                src={logoImg}
                alt="AreaElectrica Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl border border-[#9fef00]/40 group-hover:scale-105 transition shadow-[0_0_15px_rgba(159,239,0,0.2)] shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase truncate">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase hidden sm:block">
                  PLATAFORMA NORMATIVA SEC RIC
                </span>
              </div>
            </div>

            {/* Acciones Escritorio */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setTipoAuth('login');
                  setVista('auth');
                }}
                className="text-xs font-bold text-[#9fef00] hover:text-slate-950 hover:bg-[#9fef00] px-4 py-2.5 rounded-xl border border-[#9fef00]/40 bg-[#0a1120] transition-all cursor-pointer uppercase tracking-wider shadow-inner"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoAuth('registro');
                  setVista('auth');
                }}
                className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-105 transition-all text-xs cursor-pointer uppercase tracking-wider"
              >
                Registro Gratis ⚡
              </button>
            </div>

            {/* Botón Hamburguesa Móvil */}
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((prev) => !prev)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#0a1120] border border-[#9fef00]/40 text-[#9fef00] flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-[#112614] transition shrink-0"
            >
              {menuAbierto ? '✕' : '☰'}
            </button>
          </div>

          {/* Desplegable Móvil */}
          {menuAbierto && (
            <div className="md:hidden bg-[#080d1a] border-t border-[#9fef00]/20 px-4 py-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipoAuth('login');
                  setVista('auth');
                }}
                className="w-full text-center text-xs font-bold text-[#9fef00] hover:text-slate-950 hover:bg-[#9fef00] py-3 rounded-xl border border-[#9fef00]/40 bg-[#0a1120] transition-all cursor-pointer uppercase tracking-wider"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoAuth('registro');
                  setVista('auth');
                }}
                className="w-full bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black py-3 rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all text-xs cursor-pointer uppercase tracking-wider"
              >
                Registro Gratis ⚡
              </button>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 border-b border-[#9fef00]/20">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
            <img
              src={wallImg}
              alt="Background Wall"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#050914]/40 z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/60 z-0 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-5 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#112614] border border-[#9fef00]/50 text-[#9fef00] text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(159,239,0,0.15)]">
                <span className="w-2 h-2 rounded-full bg-[#9fef00] animate-ping shrink-0" />
                <span>ENTRENAMIENTO TÁCTICO • NORMATIVA ELÉCTRICA SEC</span>
              </div>

              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md font-sans">
                Domina la electricidad y la normativa{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff]">
                  RIC jugando
                </span>
                .
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-sans">
                La primera plataforma gamificada de Chile que combina teoría eléctrica práctica, mapas de retos interactivos y calculadoras normativas para profesionales y estudiantes.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setTipoAuth('registro');
                    setVista('auth');
                  }}
                  className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black px-7 py-3.5 rounded-xl shadow-[0_0_25px_rgba(255,184,0,0.35)] hover:scale-105 transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>⚡ EMPEZAR A APRENDER</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoAuth('login');
                    setVista('auth');
                  }}
                  className="bg-[#0a1120]/90 hover:bg-[#112614] text-[#9fef00] border border-[#9fef00]/40 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer shadow-inner"
                >
                  <span>EXPLORAR HERRAMIENTAS</span>
                </button>
              </div>

              <p className="text-[11px] text-[#9fef00] pt-1 sm:pt-2 tracking-wide uppercase">
                ✔ Alineado estrictamente con los Pliegos Técnicos Normativos SEC (Chile).
              </p>
            </div>
          </div>
        </section>

        {/* Sección Continua al Hero: Pestañas + Showcase Interactivo */}
        <section
          id="enfoque-operativo"
          className="py-12 sm:py-20 bg-[#040812] relative z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 3 Pestañas Superiores */}
            <div
              role="tablist"
              aria-label="Pilares de entrenamiento eléctrico"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6"
            >
              {PILLARS_DATA.map((pillar) => {
                const isActive = pillar.id === pillarActual.id;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectPillar(pillar.id)}
                    className={`py-3.5 sm:py-4 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer text-center border ${
                      isActive
                        ? 'bg-[#0b1324] text-white border-[#9fef00] shadow-[0_0_24px_rgba(159,239,0,0.16)]'
                        : 'bg-[#070d1a] text-slate-400 border-slate-800/90 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {pillar.tabLabel}
                  </button>
                );
              })}
            </div>

            {/* Contenedor Principal Dividido */}
            <div className="bg-[#070d1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.55)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Columna Izquierda: Copy, Sub-módulos Interactivos y CTA */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#9fef00]/10 border border-[#9fef00]/30 text-[#9fef00] text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9fef00]" />
                  <span>{pillarActual.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.12] font-sans">
                  {pillarActual.title}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
                  {pillarActual.description}
                </p>

                {/* Tarjetas de Sub-módulos */}
                <div className="space-y-3 pt-1">
                  {pillarActual.items.map((subItem, idx) => {
                    const selected = idx === itemActivoIdx;
                    return (
                      <button
                        key={subItem.title}
                        type="button"
                        onClick={() => setItemActivoIdx(idx)}
                        className={`w-full text-left rounded-xl p-3.5 sm:p-4 transition-all cursor-pointer border ${
                          selected
                            ? 'bg-[#0d182d] border-[#9fef00] shadow-[0_0_20px_rgba(159,239,0,0.12)]'
                            : 'bg-[#050914]/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white font-sans">
                            {subItem.title}
                          </span>
                          {selected && (
                            <span className="text-[10px] font-bold text-[#9fef00] uppercase tracking-wider shrink-0">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-1">
                          {subItem.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoAuth(pillarActual.targetAuthMode);
                      setVista('auth');
                    }}
                    className="w-full sm:w-auto bg-[#9fef00] hover:bg-[#8be000] text-slate-950 font-black px-6 py-3.5 sm:py-3 rounded-lg text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(159,239,0,0.25)] hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    {pillarActual.ctaLabel}
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Solo el Tiuque */}
              <div className="lg:col-span-6 flex items-center justify-center pt-2 lg:pt-0">
                <img
                  src={tiuqueHeroImg}
                  alt="Tiuque-Tec en operación"
                  className="w-52 sm:w-72 lg:w-80 h-auto object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.85)] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#03060c] border-t border-[#9fef00]/30 py-6 px-4 sm:px-6 text-xs relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-slate-400 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <img
                src={logoImg}
                alt="AreaElectrica"
                className="w-6 h-6 object-contain rounded-md border border-[#9fef00]/40"
              />
              <span className="font-black text-white uppercase">
                AREA<span className="text-[#9fef00]">ELECTRICA</span>
              </span>
            </div>
            <span>AreaElectrica & Tiuque-Tec • Formación que ilumina</span>
            <span className="text-[#9fef00] font-bold">NORMATIVA SEC ACTIVA</span>
          </div>
        </footer>
      </div>
    );
  }

  // Vista Card de Login / Registro Estilo HTB con Branding Oficial AreaElectrica
  return (
    <div className="relative w-full min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950">
      {/* Grid Técnico de Fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header Superior en Auth */}
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 px-4 sm:px-6 py-3.5 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div
            onClick={() => setVista('landing')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0"
          >
            <img
              src={logoImg}
              alt="AreaElectrica Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl border border-[#9fef00]/40 group-hover:scale-105 transition shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black tracking-wider text-white uppercase truncate">
                AREA<span className="text-[#9fef00]">ELECTRICA</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-widest uppercase hidden sm:block">
                PORTAL DE ACCESO TÉCNICO
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setVista('landing')}
            className="bg-[#0d1527] hover:bg-[#9fef00] text-[#9fef00] hover:text-slate-950 border border-[#9fef00]/40 px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer shrink-0"
          >
            ◀ INICIO
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#0a1120] border-2 border-[#9fef00]/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(159,239,0,0.12)] backdrop-blur-xl">
          {/* Logo y Marca AREAELECTRICA dentro de la Card */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src={logoImg}
                alt="AreaElectrica Logo"
                className="w-11 h-11 object-contain rounded-xl border border-[#9fef00]/50 shadow-[0_0_15px_rgba(159,239,0,0.2)]"
              />
              <div>
                <span className="text-lg font-black tracking-wider text-white uppercase block">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span>
                </span>
                <span className="text-[10px] text-[#ffb800] font-bold uppercase tracking-widest">
                  SISTEMA DE CAPACITACIÓN SEC
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="flex bg-[#050914] p-1 rounded-xl mb-6 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTipoAuth('login')}
              className={`flex-1 py-2.5 font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider ${
                tipoAuth === 'login'
                  ? 'bg-[#9fef00] text-slate-950 shadow-[0_0_15px_rgba(159,239,0,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setTipoAuth('registro')}
              className={`flex-1 py-2.5 font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider ${
                tipoAuth === 'registro'
                  ? 'bg-[#ffb800] text-slate-950 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="mb-5">
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              {tipoAuth === 'login'
                ? 'ACCESO DE OPERADOR'
                : 'REGISTRO DE NUEVO OPERADOR'}
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {tipoAuth === 'login'
                ? 'Ingresa tus credenciales para continuar con tus módulos y herramientas.'
                : 'Completa tus datos para crear tu perfil técnico SEC.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="cristian_lillo"
                className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            {tipoAuth === 'registro' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Cristián"
                      className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Lillo"
                      className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu.correo@tecnico.cl"
                    className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            {tipoAuth === 'registro' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                  Categoría / Perfil SEC
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                >
                  <option value="Estudiante SEC">
                    Estudiante / Técnico en Formación
                  </option>
                  <option value="Electricista Autorizado SEC">
                    Electricista Autorizado SEC
                  </option>
                  <option value="Ingeniero Proyectista">
                    Ingeniero Proyectista
                  </option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className={`w-full mt-3 py-3.5 font-black rounded-xl transition text-xs tracking-wider uppercase cursor-pointer disabled:opacity-50 ${
                tipoAuth === 'login'
                  ? 'bg-[#9fef00] hover:bg-[#88ce00] text-slate-950 shadow-[0_0_20px_rgba(159,239,0,0.3)]'
                  : 'bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 shadow-[0_0_20px_rgba(255,184,0,0.3)]'
              }`}
            >
              {cargando
                ? 'CONECTANDO...'
                : tipoAuth === 'login'
                ? 'ENTRAR AL PANEL ⚡'
                : 'CREAR PERFIL TÉCNICO ⚡'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 font-sans">
            {tipoAuth === 'login'
              ? '¿Aún no tienes credenciales? '
              : '¿Ya tienes una cuenta registrada? '}
            <button
              type="button"
              onClick={() =>
                setTipoAuth(tipoAuth === 'login' ? 'registro' : 'login')
              }
              className="text-[#ffb800] font-bold hover:underline cursor-pointer"
            >
              {tipoAuth === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-[#050914] border-t border-[#9fef00]/30 py-4 px-6 text-center text-[10px] text-slate-400 z-10">
        AreaElectrica & Tiuque-Tec • Plataforma de Capacitación Eléctrica SEC
      </footer>
    </div>
  );
}