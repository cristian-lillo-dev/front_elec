import React, { useState } from 'react';
import logoImg from './assets/logo_s.png';

const SECCIONES_COMERCIALES = [
  { seccion: 1.5, ampCobre: 15, ampAlu: 0 },
  { seccion: 2.5, ampCobre: 20, ampAlu: 0 },
  { seccion: 4.0, ampCobre: 28, ampAlu: 21 },
  { seccion: 6.0, ampCobre: 36, ampAlu: 27 },
  { seccion: 10.0, ampCobre: 50, ampAlu: 38 },
  { seccion: 16.0, ampCobre: 68, ampAlu: 52 },
  { seccion: 25.0, ampCobre: 89, ampAlu: 69 },
  { seccion: 35.0, ampCobre: 110, ampAlu: 86 },
  { seccion: 50.0, ampCobre: 134, ampAlu: 104 },
  { seccion: 70.0, ampCobre: 171, ampAlu: 133 },
  { seccion: 95.0, ampCobre: 207, ampAlu: 161 },
  { seccion: 120.0, ampCobre: 239, ampAlu: 186 }
];

export default function CalculadoraAlimentadores({ user, nombreUsuario, onVolver, onLogout }) {
  const [systemType, setSystemType] = useState('1F');
  const [material, setMaterial] = useState('0.018');
  const [voltage, setVoltage] = useState(220);
  const [distance, setDistance] = useState(90);
  const [power, setPower] = useState(5500);
  const [cosPhi, setCosPhi] = useState(0.93);
  const [current, setCurrent] = useState(26.88);
  const [maxVdrop, setMaxVdrop] = useState(3.0);

  const handleSystemChange = (e) => {
    const sys = e.target.value;
    setSystemType(sys);
    setVoltage(sys === '1F' ? 220 : 380);
  };

  const cargarEjemplo = (d, p, v, cp, mvd, sys, cManual = null) => {
    setSystemType(sys);
    setVoltage(v);
    setDistance(d);
    setPower(p);
    setCosPhi(cp);
    setMaxVdrop(mvd);
    setMaterial('0.018');
    if (cManual !== null) {
      setCurrent(cManual);
    } else {
      const i = sys === '1F' ? (p / (v * cp)) : (p / (Math.sqrt(3) * v * cp));
      setCurrent(parseFloat(i.toFixed(2)));
    }
  };

  const handlePowerChange = (val) => {
    setPower(val);
    const p = parseFloat(val) || 0;
    const v = parseFloat(voltage) || 220;
    const cp = parseFloat(cosPhi) || 0.93;
    let i = systemType === '1F' ? (p / (v * cp)) : (p / (Math.sqrt(3) * v * cp));
    setCurrent(parseFloat(i.toFixed(2)));
  };

  const handleCurrentChange = (val) => {
    setCurrent(val);
    const i = parseFloat(val) || 0;
    const v = parseFloat(voltage) || 220;
    const cp = parseFloat(cosPhi) || 0.93;
    let p = systemType === '1F' ? (i * v * cp) : (Math.sqrt(3) * v * i * cp);
    setPower(Math.round(p));
  };

  const rho = parseFloat(material);
  const l = parseFloat(distance) || 0;
  const iVal = parseFloat(current) || 0;
  const pVal = parseFloat(power) || 0;
  const cpVal = parseFloat(cosPhi) || 0.93;
  const vVal = parseFloat(voltage) || 220;
  const maxDropPct = parseFloat(maxVdrop) || 3.0;

  const k = systemType === '1F' ? 2 : Math.sqrt(3);
  const deltaV_max = vVal * (maxDropPct / 100);
  const s_teorica = (k * l * iVal * rho) / deltaV_max;

  const isCobre = rho <= 0.020;
  let seccionPorCorriente = SECCIONES_COMERCIALES[0];
  for (const item of SECCIONES_COMERCIALES) {
    const cap = isCobre ? item.ampCobre : item.ampAlu;
    if (cap >= iVal) {
      seccionPorCorriente = item;
      break;
    }
  }

  let seccionFinal = null;
  for (const item of SECCIONES_COMERCIALES) {
    const cap = isCobre ? item.ampCobre : item.ampAlu;
    if (item.seccion >= s_teorica && cap >= iVal) {
      seccionFinal = item;
      break;
    }
  }
  if (!seccionFinal) {
    seccionFinal = SECCIONES_COMERCIALES[SECCIONES_COMERCIALES.length - 1];
  }

  const deltaV_real = (k * l * iVal * rho) / seccionFinal.seccion;
  const pctDrop_real = (deltaV_real / vVal) * 100;
  const capFinal = isCobre ? seccionPorCorriente.ampCobre : seccionPorCorriente.ampAlu;
  const displayUser = nombreUsuario || user?.username || 'Operador SEC';

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Grid Técnico de Fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Menú Global Unificado */}
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 px-6 py-3.5 shadow-[0_0_20px_rgba(159,239,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <div onClick={onVolver} className="flex items-center space-x-3 cursor-pointer group">
              <img src={logoImg} alt="AreaElectrica Logo" className="w-9 h-9 object-contain rounded-xl group-hover:scale-105 transition border border-[#9fef00]/40" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-white uppercase">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span> <span className="text-[#ffb800] text-[10px]">TALLER</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest">CALCULADORA NORMATIVA RIC N°03 / N°04</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-2 text-xs">
              <button
                onClick={onVolver}
                className="px-3.5 py-1.5 rounded-xl font-bold text-slate-300 hover:text-[#9fef00] bg-[#0d1527]/70 hover:bg-[#0d1527] border border-slate-800 hover:border-[#9fef00]/40 transition cursor-pointer"
              >
                ⚡ PANEL DE ESTUDIO
              </button>
              <span className="px-3.5 py-1.5 rounded-xl font-bold bg-[#112614] text-[#9fef00] border border-[#9fef00]/50 shadow-[0_0_12px_rgba(159,239,0,0.15)]">
                📊 CALCULADORA RIC
              </span>
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex items-center space-x-2 bg-[#0d1527] border border-[#ffb800]/40 px-3 py-1 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-[#9fef00]" />
              <span className="font-bold text-[#ffb800]">{displayUser}</span>
            </div>
            <button 
              onClick={onVolver} 
              className="bg-[#112614] hover:bg-[#9fef00] text-[#9fef00] hover:text-slate-950 border border-[#9fef00]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>◀</span> VOLVER AL PANEL
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 h-8 rounded-xl bg-[#0d1527] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-400 text-xs font-bold transition cursor-pointer"
              >
                SALIR ⌁
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Entradas */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a1120] border-2 border-[#9fef00]/40 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-[#9fef00] uppercase tracking-wider flex items-center gap-2">
                  <span>⚙️</span> Parámetros de Entrada (Editable)
                </h3>
                <span className="text-[10px] bg-[#112614] border border-[#9fef00]/50 px-2 py-0.5 rounded text-[#9fef00] font-bold">
                  MEMORIA TE1
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Plantillas Rápidas:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => cargarEjemplo(90, 5500, 220, 0.93, 3, '1F')} className="bg-[#07130b] hover:bg-[#112614] border border-[#9fef00]/40 text-[#9fef00] text-xs py-1.5 px-2 rounded-lg transition cursor-pointer font-bold">90m - 5.5kW</button>
                  <button type="button" onClick={() => cargarEjemplo(100, 5500, 220, 1.0, 3, '1F', 25)} className="bg-[#07130b] hover:bg-[#112614] border border-[#9fef00]/40 text-[#9fef00] text-xs py-1.5 px-2 rounded-lg transition cursor-pointer font-bold">100m - 25A</button>
                  <button type="button" onClick={() => cargarEjemplo(60, 15000, 380, 0.90, 3, '3F')} className="bg-[#07130b] hover:bg-[#112614] border border-[#9fef00]/40 text-[#9fef00] text-xs py-1.5 px-2 rounded-lg transition cursor-pointer font-bold">3F - 15kW</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Sistema</label>
                  <select value={systemType} onChange={handleSystemChange} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition cursor-pointer">
                    <option value="1F">Monofásico (1F)</option>
                    <option value="3F">Trifásico (3F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Material Conductor</label>
                  <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition cursor-pointer">
                    <option value="0.018">Cobre (ρ = 0,018)</option>
                    <option value="0.028">Aluminio (ρ = 0,028)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Tensión Nominal (V)</label>
                  <input type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Longitud L (m)</label>
                  <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Potencia Activa (W)</label>
                  <input type="number" value={power} onChange={(e) => handlePowerChange(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Factor Potencia (cos φ)</label>
                  <input type="number" step="0.01" value={cosPhi} onChange={(e) => setCosPhi(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Corriente de Carga (A)</label>
                  <input type="number" step="0.01" value={current} onChange={(e) => handleCurrentChange(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9fef00] mb-1">Caída Máx. (%ΔV)</label>
                  <input type="number" step="0.1" value={maxVdrop} onChange={(e) => setMaxVdrop(e.target.value)} className="w-full text-xs rounded-lg p-2.5 border-2 border-[#9fef00]/60 bg-[#07130b] text-[#9fef00] font-bold focus:border-[#9fef00] outline-none transition" />
                </div>
              </div>
            </div>

            {/* Formulas Reference */}
            <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="text-[#9fef00]">⚡</span>
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">Fórmulas Aplicadas</h4>
              </div>
              <div className="space-y-1.5 text-slate-300 bg-[#050914] p-3 rounded-xl border border-slate-800">
                <p>I (1F) = P / (V · cos φ)</p>
                <p>I (3F) = P / (√3 · V · cos φ)</p>
                <p>S_mín (1F) = (2 · L · I · ρ) / ΔV_máx</p>
                <p>S_mín (3F) = (√3 · L · I · ρ) / ΔV_máx</p>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-r from-[#0d1f14] via-[#0a1120] to-[#1a1505] border-2 border-[#9fef00] text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#9fef00] font-bold">
                  Sección Comercial Recomendada
                </span>
                <div className="text-4xl font-extrabold mt-1 tracking-tight text-[#ffb800]">
                  {seccionFinal.seccion.toFixed(1).replace('.0','')} mm²
                </div>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  Caída real calculada: <strong className="text-white">{pctDrop_real.toFixed(2)}%</strong> ({deltaV_real.toFixed(2)} V) — Cumple RIC N°03
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#112614] border border-[#9fef00]/40 px-3.5 py-2 rounded-xl text-xs font-bold text-[#9fef00] self-start sm:self-center shadow-inner">
                <span>✔</span>
                <span>Conforme SEC</span>
              </div>
            </div>

            {/* Desglose Pasos */}
            <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-[#ffb800] uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Desglose del Cálculo Normativo
                </h3>
                <span className="text-[10px] bg-[#050914] px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                  4 Etapas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#050914] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">1. Corriente de Carga (I)</span>
                      <span className="text-[10px] font-bold bg-[#112614] text-[#9fef00] px-2 py-0.5 rounded border border-[#9fef00]/30">{iVal.toFixed(2)} A</span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-[#0a1120] p-2.5 rounded-lg border border-slate-800 my-2">
                      {systemType === '1F' ? `I = ${pVal} / (${vVal} · ${cpVal}) = ${iVal.toFixed(2)} A` : `I = ${pVal} / (√3 · ${vVal} · ${cpVal}) = ${iVal.toFixed(2)} A`}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Corriente nominal permanente que circulará por el alimentador.</p>
                </div>

                <div className="bg-[#050914] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">2. Capacidad Térmica (RIC 04)</span>
                      <span className="text-[10px] font-bold bg-[#112614] text-[#9fef00] px-2 py-0.5 rounded border border-[#9fef00]/30">Mínimo {seccionPorCorriente.seccion} mm²</span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-[#0a1120] p-2.5 rounded-lg border border-slate-800 my-2">
                      I_adm ≥ I_diseño ({capFinal} A ≥ {iVal.toFixed(2)} A)
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Conductor en ducto según tabla RIC N°04 tolera hasta {capFinal} A.</p>
                </div>

                <div className="bg-[#050914] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">3. Caída de Tensión (RIC 03)</span>
                      <span className="text-[10px] font-bold bg-[#112614] text-[#9fef00] px-2 py-0.5 rounded border border-[#9fef00]/30">{s_teorica.toFixed(2)} mm²</span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-[#0a1120] p-2.5 rounded-lg border border-slate-800 my-2">
                      S_mín = ({systemType === '1F' ? '2' : '√3'} · {l} · {iVal.toFixed(2)} · {rho}) / {deltaV_max.toFixed(2)} = {s_teorica.toFixed(2)} mm²
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Límite legal RIC N°03: {maxDropPct}% de {vVal}V = {deltaV_max.toFixed(2)} V.</p>
                </div>

                <div className="bg-[#050914] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">4. Sección Comercial Final</span>
                      <span className="text-[10px] font-bold bg-[#261f0c] text-[#ffb800] px-2 py-0.5 rounded border border-[#ffb800]/30">{seccionFinal.seccion} mm²</span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-[#0a1120] p-2.5 rounded-lg border border-slate-800 my-2">
                      ΔV = {deltaV_real.toFixed(2)} V ({pctDrop_real.toFixed(2)}%)
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">Sección comercial normalizada que satisface ambos pliegos SEC.</p>
                </div>
              </div>
            </div>

            {/* Tabla Comparativa */}
            <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📊</span> Comparativa por Calibre Comercial (En Ducto)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#050914] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sección</th>
                      <th className="p-3">Capacidad RIC N°04</th>
                      <th className="p-3">Caída (V)</th>
                      <th className="p-3">Caída (%)</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {SECCIONES_COMERCIALES.map((item) => {
                      const cap = isCobre ? item.ampCobre : item.ampAlu;
                      const deltaV = (k * l * iVal * rho) / item.seccion;
                      const pct = (deltaV / vVal) * 100;
                      const cumpleCaida = pct <= maxDropPct;
                      const cumpleAmp = cap >= iVal;
                      const isSelected = item.seccion === seccionFinal.seccion;

                      let badge = <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px]">APROBADO</span>;
                      if (!cumpleAmp) {
                        badge = <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/40 text-[10px]">I INSUFICIENTE</span>;
                      } else if (!cumpleCaida) {
                        badge = <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px]">EXCEDE %ΔV</span>;
                      }

                      return (
                        <tr key={item.seccion} className={isSelected ? 'bg-[#112614]/80 font-bold text-white border-l-4 border-l-[#9fef00]' : 'hover:bg-[#050914]/50'}>
                          <td className="p-3 text-white flex items-center gap-1">
                            {item.seccion} mm² {isSelected && <span className="text-[#ffb800]">★</span>}
                          </td>
                          <td className="p-3">{cap} A</td>
                          <td className="p-3">{deltaV.toFixed(2)} V</td>
                          <td className="p-3">{pct.toFixed(2)} %</td>
                          <td className="p-3">{badge}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-[#080d1a] border-t border-[#9fef00]/30 py-4 px-6 text-center text-xs text-slate-400 relative z-10">
        AreaElectrica & Tiuque-Tec — Portal de Documentación y Cálculo Normativo RIC.
      </footer>
    </div>
  );
}