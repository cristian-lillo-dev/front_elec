import React, { useState } from 'react';
import tiuqueHeroImg from './assets/tiuque_hero.png';
import logoImg from './assets/logo_s.png';
import wallImg from './assets/wall_1.jpg';
import iconoContento from './assets/icono_contento.png';
import iconoAlerta from './assets/icono_alerta.png';
import iconoConcentrado from './assets/icono_concentrado.png';
import iconoInterrogante from './assets/icono_interrogante.png';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

export default function Auth({ onLoginExitoso }) {
  const [vista, setVista] = useState('landing'); 
  const [tipoAuth, setTipoAuth] = useState('login');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg(null);

    const endpoint = tipoAuth === 'login' ? '/auth/login/' : '/auth/registro/';
    const payload = tipoAuth === 'login' 
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
        const nombreCompleto = [rawUser.first_name || formData.first_name, rawUser.last_name || formData.last_name]
          .filter(Boolean)
          .join(' ');

        const usuarioVal = {
          id: rawUser.id || data.id || null,
          username: rawUser.username || formData.username,
          name: nombreCompleto || rawUser.name || rawUser.username || formData.username,
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

        {/* Header HUD */}
        <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setVista('landing')}>
              <img 
                src={logoImg} 
                alt="AreaElectrica Logo" 
                className="w-10 h-10 object-contain rounded-xl border border-[#9fef00]/40 group-hover:scale-105 transition shadow-[0_0_15px_rgba(159,239,0,0.2)]" 
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-white uppercase">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase">
                  PLATAFORMA NORMATIVA SEC RIC
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-wider text-slate-300 uppercase">
              <a href="#plataforma" className="hover:text-[#9fef00] transition-colors">Módulos</a>
              <a href="#tiuque-section" className="hover:text-[#ffb800] transition-colors">Tiuque-Tec</a>
              <a href="#escuadron" className="hover:text-[#9fef00] transition-colors">Asistentes</a>
            </nav>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => { setTipoAuth('login'); setVista('auth'); }}
                className="text-xs font-bold text-[#9fef00] hover:text-slate-950 hover:bg-[#9fef00] px-4 py-2.5 rounded-xl border border-[#9fef00]/40 bg-[#0a1120] transition-all cursor-pointer uppercase tracking-wider shadow-inner"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => { setTipoAuth('registro'); setVista('auth'); }}
                className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-105 transition-all text-xs cursor-pointer uppercase tracking-wider"
              >
                Registro Gratis ⚡
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 border-b border-[#9fef00]/20">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
            <img src={wallImg} alt="Background Wall" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#050914]/40 z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/60 z-0 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#112614] border border-[#9fef00]/50 text-[#9fef00] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(159,239,0,0.15)]">
                <span className="w-2 h-2 rounded-full bg-[#9fef00] animate-ping" />
                <span>ENTRENAMIENTO TÁCTICO • NORMATIVA ELÉCTRICA SEC</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md font-sans">
                Domina la electricidad y la normativa <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff]">RIC jugando</span>.
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-sans">
                La primera plataforma gamificada de Chile que combina teoría eléctrica práctica, mapas de retos interactivos y calculadoras normativas para profesionales y estudiantes.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <button 
                  onClick={() => { setTipoAuth('registro'); setVista('auth'); }}
                  className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black px-7 py-3.5 rounded-xl shadow-[0_0_25px_rgba(255,184,0,0.35)] hover:scale-105 transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>⚡ EMPEZAR A APRENDER</span>
                </button>
                <button 
                  onClick={() => { setTipoAuth('login'); setVista('auth'); }}
                  className="bg-[#0a1120]/90 hover:bg-[#112614] text-[#9fef00] border border-[#9fef00]/40 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer shadow-inner"
                >
                  <span>EXPLORAR HERRAMIENTAS</span>
                </button>
              </div>

              <p className="text-[11px] text-[#9fef00] pt-2 tracking-wide uppercase">
                ✔ Alineado estrictamente con los Pliegos Técnicos Normativos SEC (Chile).
              </p>
            </div>
          </div>
        </section>

        {/* Módulos Principales */}
        <section id="plataforma" className="py-20 bg-[#03060c] border-b border-[#9fef00]/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-xs text-[#9fef00] font-bold uppercase tracking-widest block mb-1">
                ARQUITECTURA DEL SISTEMA
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Aprende, calcula y cumple la norma sin fricción.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a1120] border border-[#ffb800]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-[#ffb800] transition shadow-xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb800]/5 rounded-full blur-xl group-hover:bg-[#ffb800]/10 transition" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-center mb-5 p-2.5 shadow-[0_0_15px_rgba(255,184,0,0.15)]">
                    <img src={iconoConcentrado} alt="Gamificación" className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Mapas de Retos Interactivos</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    Lecciones rápidas, rachas diarias y nodos desbloqueables. Domina cada pliego normativo paso a paso.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#ffb800] font-bold uppercase tracking-widest">
                  MOTOR GAMIFICADO ACTIVO
                </div>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-[#9fef00] transition shadow-xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#9fef00]/5 rounded-full blur-xl group-hover:bg-[#9fef00]/10 transition" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#9fef00]/10 border border-[#9fef00]/30 flex items-center justify-center mb-5 text-xl shadow-[0_0_15px_rgba(159,239,0,0.15)]">
                    📊
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Calculadoras de Taller</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    Herramientas integradas para caída de tensión, dimensionamiento de alimentadores y capacidad térmica.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">
                  CÁLCULO EN TIEMPO REAL
                </div>
              </div>

              <div className="bg-[#0a1120] border border-[#ffb800]/30 rounded-2xl p-6 flex flex-col justify-between hover:border-[#ffb800] transition shadow-xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb800]/5 rounded-full blur-xl group-hover:bg-[#ffb800]/10 transition" />
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-center mb-5 text-xl shadow-[0_0_15px_rgba(255,184,0,0.15)]">
                    📖
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Pliegos RIC Aplicados</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    Explicaciones visuales, casos prácticos y alertas de prevención de riesgos aplicadas a terreno.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#ffb800] font-bold uppercase tracking-widest">
                  VERIFICADO NORMATIVA SEC
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tiuque-Tec Section */}
        <section id="tiuque-section" className="py-20 bg-gradient-to-b from-[#03060c] to-[#050914] border-b border-[#9fef00]/20 relative overflow-hidden z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#9fef00]/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-[#0a1120] border-2 border-[#ffb800]/40 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_rgba(255,184,0,0.12)] backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 flex justify-center relative">
                <div className="absolute w-64 h-64 bg-[#ffb800]/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="p-4 bg-[#050914]/90 border border-[#ffb800]/30 rounded-2xl shadow-[0_0_25px_rgba(255,184,0,0.2)]">
                  <img 
                    src={tiuqueHeroImg} 
                    alt="Tiuque-Tec Hero" 
                    className="w-full max-w-[260px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
                  <span>UNIDAD ESPECIALISTA • TIUQUE-TEC</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
                  Tu copiloto experto en normativa SEC y seguridad
                </h3>
                
                <p className="text-slate-300 text-sm leading-relaxed font-sans">
                  Con Tiuque-Tec a tu lado, cada cálculo eléctrico, revisión de pliegos y procedimiento normativo en terreno cuenta con respaldo técnico estricto, alertas preventivas y un enfoque 100% interactivo.
                </p>

                <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-[#ffb800]/40 text-[#ffb800]">Pliegos RIC N°01-19</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-[#9fef00]/40 text-[#9fef00]">Seguridad Eléctrica</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-rose-500/40 text-rose-400">Prevención de Riesgos</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Escuadrón de Asistentes */}
        <section id="escuadron" className="py-20 bg-[#050914] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs text-[#9fef00] font-bold uppercase tracking-widest block mb-1">
              ESCUADRÓN DE SOPORTE
            </span>
            <h3 className="text-3xl font-extrabold mb-10 text-white font-sans">
              Tus asistentes virtuales en terreno
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0a1120] border border-[#ffb800]/30 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg hover:border-[#ffb800] transition">
                <img src={iconoContento} alt="Tiuque-Tec" className="w-16 h-16 rounded-xl object-cover mb-3 border border-[#ffb800]/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Tiuque-Tec</h4>
                <span className="text-[10px] text-[#ffb800] font-bold mb-2 uppercase tracking-wider">Guía Principal</span>
                <p className="text-[11px] text-slate-400 font-sans">Tu experto en seguridad y normativas. ¡Seguridad primero!</p>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg hover:border-[#9fef00] transition">
                <div className="w-16 h-16 rounded-xl bg-[#9fef00]/10 border border-[#9fef00]/40 flex items-center justify-center text-2xl mb-3 shadow-md">
                  🤖
                </div>
                <h4 className="font-bold text-white text-sm">Voltín</h4>
                <span className="text-[10px] text-[#9fef00] font-bold mb-2 uppercase tracking-wider">Dron Asistente</span>
                <p className="text-[11px] text-slate-400 font-sans">Te explica fórmulas y pasos complejos de forma visual.</p>
              </div>

              <div className="bg-[#0a1120] border border-rose-500/30 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg hover:border-rose-400 transition">
                <img src={iconoAlerta} alt="Chispa" className="w-16 h-16 rounded-xl object-cover mb-3 border border-rose-500/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Chispa</h4>
                <span className="text-[10px] text-rose-400 font-bold mb-2 uppercase tracking-wider">Alerta de Riesgo</span>
                <p className="text-[11px] text-slate-400 font-sans">Alertas en tiempo real de fallas y riesgos críticos.</p>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg hover:border-[#9fef00] transition">
                <img src={iconoInterrogante} alt="Ohmí" className="w-16 h-16 rounded-xl object-cover mb-3 border border-[#9fef00]/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Ohmí</h4>
                <span className="text-[10px] text-[#9fef00] font-bold mb-2 uppercase tracking-wider">Asistente IA</span>
                <p className="text-[11px] text-slate-400 font-sans">Consultas sobre tablas y bases de datos técnicas SEC.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#03060c] border-t border-[#9fef00]/30 py-6 px-6 text-xs relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
            <div className="flex items-center space-x-2">
              <img src={logoImg} alt="AreaElectrica" className="w-6 h-6 object-contain rounded-md border border-[#9fef00]/40" />
              <span className="font-black text-white uppercase">AREA<span className="text-[#9fef00]">ELECTRICA</span></span>
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
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 px-6 py-3.5 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div onClick={() => setVista('landing')} className="flex items-center space-x-3 cursor-pointer group">
            <img src={logoImg} alt="AreaElectrica Logo" className="w-9 h-9 object-contain rounded-xl border border-[#9fef00]/40 group-hover:scale-105 transition" />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white uppercase">
                AREA<span className="text-[#9fef00]">ELECTRICA</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-widest uppercase">PORTAL DE ACCESO TÉCNICO</span>
            </div>
          </div>

          <button
            onClick={() => setVista('landing')}
            className="bg-[#0d1527] hover:bg-[#9fef00] text-[#9fef00] hover:text-slate-950 border border-[#9fef00]/40 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ◀ VOLVER AL INICIO
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
                tipoAuth === 'login' ? 'bg-[#9fef00] text-slate-950 shadow-[0_0_15px_rgba(159,239,0,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setTipoAuth('registro')}
              className={`flex-1 py-2.5 font-bold rounded-lg transition-all cursor-pointer uppercase tracking-wider ${
                tipoAuth === 'registro' ? 'bg-[#ffb800] text-slate-950 shadow-[0_0_15px_rgba(255,184,0,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="mb-5">
            <h3 className="text-base font-black text-white uppercase tracking-wide">
              {tipoAuth === 'login' ? 'ACCESO DE OPERADOR' : 'REGISTRO DE NUEVO OPERADOR'}
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">Nombre</label>
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
                    <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">Apellido</label>
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
                  <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">Correo Electrónico</label>
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
              <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">Contraseña</label>
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
                <label className="text-[10px] text-[#9fef00] font-bold uppercase tracking-widest">Categoría / Perfil SEC</label>
                <select 
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                >
                  <option value="Estudiante SEC">Estudiante / Técnico en Formación</option>
                  <option value="Electricista Autorizado SEC">Electricista Autorizado SEC</option>
                  <option value="Ingeniero Proyectista">Ingeniero Proyectista</option>
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
              {cargando ? 'CONECTANDO...' : (tipoAuth === 'login' ? 'ENTRAR AL PANEL ⚡' : 'CREAR PERFIL TÉCNICO ⚡')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 font-sans">
            {tipoAuth === 'login' ? '¿Aún no tienes credenciales? ' : '¿Ya tienes una cuenta registrada? '}
            <button 
              onClick={() => setTipoAuth(tipoAuth === 'login' ? 'registro' : 'login')}
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