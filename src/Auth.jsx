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
          JSON.stringify(data) || 
          'Error en la autenticación.';
        throw new Error(serverError);
      }

      if (tipoAuth === 'login') {
        const tokenVal = data.token || data.access || data.key;
        if (tokenVal) localStorage.setItem('token', tokenVal);

        const usuarioVal = data.usuario || data.user || { 
          name: data.username || formData.username, 
          username: data.username || formData.username,
          categoria: data.categoria || formData.categoria 
        };

        onLoginExitoso(usuarioVal);
      } else {
        alert('¡Registro exitoso en Railway! Por favor inicia sesión con tus credenciales.');
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
      <div className="relative w-full min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#ffb800] selection:text-slate-950 overflow-x-hidden">
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffb80006_1px,transparent_1px),linear-gradient(to_bottom,#ffb80006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#ffb800]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setVista('landing')}>
              <img src={logoImg} alt="AreaElectrica Logo" className="w-10 h-10 object-contain rounded-xl border border-[#ffb800]/40 group-hover:scale-105 transition shadow-[0_0_15px_rgba(255,184,0,0.2)]" />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  AREA<span className="text-[#ffb800]">ELECTRICA</span>
                </span>
               
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-xs tracking-wider text-slate-400">
              <a href="#plataforma" className="hover:text-[#ffb800] transition-colors">./plataforma</a>
              <a href="#pliegos" className="hover:text-[#ffb800] transition-colors">./pliegos_ric</a>
              <a href="#herramientas" className="hover:text-[#ffb800] transition-colors">./taller_calc</a>
              <a href="#tiuque-section" className="hover:text-[#9fef00] transition-colors">./tiuque_core</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { setTipoAuth('login'); setVista('auth'); }}
                className="text-xs font-bold text-slate-300 hover:text-[#ffb800] px-4 py-2 rounded-lg border border-slate-800 hover:border-[#ffb800]/50 bg-[#0a1120]/80 transition-all cursor-pointer shadow-inner"
              >
                [LOGIN]
              </button>
              <button 
                onClick={() => { setTipoAuth('registro'); setVista('auth'); }}
                className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-bold px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-105 transition-all text-xs cursor-pointer uppercase tracking-wider"
              >
                REGISTRO_GRATIS
              </button>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-44 border-b border-[#ffb800]/20">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-normal">
            <img src={wallImg} alt="Background Wall" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#050914]/30 z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/60 z-0 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
            
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
                Domina la electricidad y la normativa <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff]">RIC jugando</span>.
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-sans drop-shadow">
                La primera plataforma gamificada de Chile que combina teoría eléctrica práctica, simulaciones tácticas y herramientas de cálculo para profesionales.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <button 
                  onClick={() => { setTipoAuth('registro'); setVista('auth'); }}
                  className="bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-[0_0_25px_rgba(255,184,0,0.35)] hover:scale-105 transition-all flex items-center justify-center space-x-2 text-xs uppercase cursor-pointer"
                >
                  <span>⚡ EMPEZAR A APRENDER</span>
                </button>
                <button 
                  onClick={() => { setTipoAuth('login'); setVista('auth'); }}
                  className="bg-[#0a1120]/90 hover:bg-[#101c33] text-[#9fef00] border border-[#9fef00]/40 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs uppercase cursor-pointer shadow-inner"
                >
                  <span>[VER HERRAMIENTAS]</span>
                </button>
              </div>

              <p className="text-[11px] text-[#ffb800] pt-2 tracking-wide">
                // COMPLIANT: Alineado estrictamente con los Pliegos Técnicos Normativos SEC (Chile).
              </p>
            </div>
          </div>
        </section>

        <section id="plataforma" className="py-20 bg-[#03060c] border-b border-[#ffb800]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-xs text-[#9fef00] uppercase tracking-widest block mb-1">MODULES // CORE_FEATURES</span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Aprende, calcula y cumple la norma sin fricción.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a1120] border border-[#ffb800]/30 rounded-xl p-6 flex flex-col justify-between hover:border-[#ffb800] transition shadow-xl group relative overflow-hidden">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-center mb-5 p-2.5 shadow-[0_0_15px_rgba(255,184,0,0.15)]">
                    <img src={iconoConcentrado} alt="Duolingo" className="w-full h-full object-contain" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Gamificación </h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">Lecciones rápidas, rachas diarias y duelos. Domina desde lo básico a lo complejo paso a paso.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#ffb800]">STATUS: ACTIVE_ENGINE</div>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-xl p-6 flex flex-col justify-between hover:border-[#9fef00] transition shadow-xl group relative overflow-hidden">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#9fef00]/10 border border-[#9fef00]/30 flex items-center justify-center mb-5 text-xl shadow-[0_0_15px_rgba(159,239,0,0.15)]">
                    📊
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Calculadoras en Vivo</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">Herramientas integradas para caída de tensión, dimensionamiento de conductores y cortocircuitos.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#9fef00]">STATUS: REAL_TIME</div>
              </div>

              <div className="bg-[#0a1120] border border-[#ffb800]/30 rounded-xl p-6 flex flex-col justify-between hover:border-[#ffb800] transition shadow-xl group relative overflow-hidden">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/30 flex items-center justify-center mb-5 text-xl shadow-[0_0_15px_rgba(255,184,0,0.15)]">
                    📖
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-white font-sans">Pliegos RIC Interactivos</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">Explicaciones visuales, casos prácticos y alertas de riesgo directo aplicadas a terreno.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-[#ffb800]">STATUS: VERIFIED_SEC</div>
              </div>
            </div>
          </div>
        </section>

        <section id="tiuque-section" className="py-20 bg-gradient-to-b from-[#03060c] to-[#050914] border-b border-[#ffb800]/20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ffb800]/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-[#0a1120] border-2 border-[#ffb800]/40 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_rgba(255,184,0,0.15)] backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 flex justify-center relative">
                <div className="absolute w-64 h-64 bg-[#ffb800]/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="p-4 bg-[#050914]/90 border border-[#ffb800]/30 rounded-2xl shadow-[0_0_25px_rgba(255,184,0,0.2)]">
                  <img 
                    src={tiuqueHeroImg} 
                    alt="Tiuque-Tec Hero" 
                    className="w-full max-w-[280px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
                  <span>[SPECIALIST_UNIT // TIUQUE_TEC]</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Tu copiloto experto en normativa SEC y seguridad</h3>
                
                <p className="text-slate-300 text-sm leading-relaxed font-sans">
                  Con Tiuque-Tec a tu lado, cada cálculo eléctrico, revisión de pliegos y procedimiento normativo en terreno cuenta con respaldo técnico estricto, alertas preventivas y un enfoque 100% gamificado.
                </p>

                <div className="pt-2 flex flex-wrap gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-[#ffb800]/30 text-[#ffb800]">#PliegosRIC</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-[#9fef00]/30 text-[#9fef00]">#SeguridadElectrica</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#050914] border border-rose-500/30 text-rose-400">#PrevencionRiesgos</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-20 bg-[#050914]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs text-[#9fef00] uppercase tracking-widest block mb-1">OPERATORS // SQUADRON</span>
            <h3 className="text-3xl font-extrabold mb-10 text-white font-sans">Tus asistentes virtuales en terreno</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0a1120] border border-[#ffb800]/30 p-5 rounded-xl flex flex-col items-center text-center shadow-lg hover:border-[#ffb800] transition">
                <img src={iconoContento} alt="Tiuque-Tec" className="w-16 h-16 rounded-xl object-cover mb-3 border border-[#ffb800]/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Tiuque-Tec</h4>
                <span className="text-[10px] text-[#ffb800] mb-2 uppercase">[GUÍA_PRINCIPAL]</span>
                <p className="text-[11px] text-slate-400 font-sans">Tu experto en seguridad y normativas. ¡Seguridad primero!</p>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 p-5 rounded-xl flex flex-col items-center text-center shadow-lg hover:border-[#9fef00] transition">
                <div className="w-16 h-16 rounded-xl bg-[#9fef00]/10 border border-[#9fef00]/40 flex items-center justify-center text-2xl mb-3 shadow-md">
                  🤖
                </div>
                <h4 className="font-bold text-white text-sm">Voltín</h4>
                <span className="text-[10px] text-[#9fef00] mb-2 uppercase">[DRÓN_ASISTENTE]</span>
                <p className="text-[11px] text-slate-400 font-sans">Te explica pasos complejos de forma visual y paso a paso.</p>
              </div>

              <div className="bg-[#0a1120] border border-rose-500/30 p-5 rounded-xl flex flex-col items-center text-center shadow-lg hover:border-rose-400 transition">
                <img src={iconoAlerta} alt="Chispa" className="w-16 h-16 rounded-xl object-cover mb-3 border border-rose-500/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Chispa</h4>
                <span className="text-[10px] text-rose-400 mb-2 uppercase">[ALERTA_RIESGO]</span>
                <p className="text-[11px] text-slate-400 font-sans">Alertas en tiempo real de fallas y riesgos críticos.</p>
              </div>

              <div className="bg-[#0a1120] border border-[#9fef00]/30 p-5 rounded-xl flex flex-col items-center text-center shadow-lg hover:border-[#9fef00] transition">
                <img src={iconoInterrogante} alt="Ohmí" className="w-16 h-16 rounded-xl object-cover mb-3 border border-[#9fef00]/40 shadow-md" />
                <h4 className="font-bold text-white text-sm">Ohmí</h4>
                <span className="text-[10px] text-[#9fef00] mb-2 uppercase">[ASISTENTE_IA]</span>
                <p className="text-[11px] text-slate-400 font-sans">Asistente IA con bases de datos técnicas especializadas.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#03060c] border-t border-[#ffb800]/20 py-8 px-6 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
            <span>[SYS_SECURE: OK]</span>
            <span>AreaElectrica & Tiuque-Tec • Formación que ilumina</span>
            <span>[BUILD: 2026.11]</span>
          </div>
        </footer>

      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col items-center justify-center p-4 select-none">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffb80006_1px,transparent_1px),linear-gradient(to_bottom,#ffb80006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a1120] border-2 border-[#ffb800]/40 rounded-xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,184,0,0.15)] relative z-10 backdrop-blur-xl">
        
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-[#ffb800]/80" />
            <div className="w-3 h-3 rounded-full bg-[#9fef00]/80" />
            <span className="text-[10px] text-slate-400 ml-2">root@areaelectrica:~# auth</span>
          </div>
          <button
            onClick={() => setVista('landing')}
            className="text-slate-400 hover:text-[#ffb800] text-xs bg-[#050914] border border-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            [X]
          </button>
        </div>

        <div className="flex bg-[#050914] p-1 rounded-lg mb-6 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setTipoAuth('login')}
            className={`flex-1 py-2 font-bold rounded-md transition-all cursor-pointer ${
              tipoAuth === 'login' ? 'bg-[#ffb800] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            $ login
          </button>
          <button
            type="button"
            onClick={() => setTipoAuth('registro')}
            className={`flex-1 py-2 font-bold rounded-md transition-all cursor-pointer ${
              tipoAuth === 'registro' ? 'bg-[#ffb800] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            $ register
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-bold text-white uppercase tracking-wide">
            {tipoAuth === 'login' ? 'ACCESO_SISTEMA' : 'NUEVO_REGISTRO'}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-6">
          {tipoAuth === 'login' ? '// Ingresa tus credenciales de operador.' : '// Completa los campos para crear tu perfil SEC.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-xs text-rose-300">
            [ERR] {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">username:</label>
            <input 
              type="text" 
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="cristian_dev" 
              className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          {tipoAuth === 'registro' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">nombre:</label>
                  <input 
                    type="text" 
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Cristián" 
                    className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">apellido:</label>
                  <input 
                    type="text" 
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Lillo" 
                    className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">correo:</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu.correo@tecnico.cl" 
                  className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">password:</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          {tipoAuth === 'registro' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#ffb800] uppercase tracking-widest">perfil_sec:</label>
              <select 
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="bg-[#050914] border border-slate-700 focus:border-[#ffb800] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
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
            className="w-full mt-3 py-3.5 bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-bold rounded-lg transition shadow-[0_0_20px_rgba(255,184,0,0.3)] text-xs tracking-wider uppercase cursor-pointer disabled:opacity-50"
          >
            {cargando ? 'PROCESSING...' : (tipoAuth === 'login' ? './exec_login.sh' : './exec_register.sh')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {tipoAuth === 'login' ? '¿Sin credenciales? ' : '¿Ya registrado? '}
          <button 
            onClick={() => setTipoAuth(tipoAuth === 'login' ? 'registro' : 'login')}
            className="text-[#ffb800] font-semibold hover:underline cursor-pointer"
          >
            {tipoAuth === 'login' ? 'create_account()' : 'login_instead()'}
          </button>
        </div>
      </div>
    </div>
  );
}
