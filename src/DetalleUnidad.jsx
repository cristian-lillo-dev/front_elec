import React, { useState, useEffect, useMemo, memo } from 'react';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';
const PASO_Y = 120;
const PATRON_X = [30, 50, 70, 50];
const getXPercentage = (index) => PATRON_X[index % PATRON_X.length];

const ConexionesSVG = memo(({ totalElementos, alturaTotal }) => {
  const puntos = useMemo(() => {
    return Array.from({ length: totalElementos }).map((_, i) => ({
      x: getXPercentage(i),
      y: 45 + i * PASO_Y,
    }));
  }, [totalElementos]);

  return (
    <svg className="absolute inset-0 w-full pointer-events-none z-0 overflow-visible" style={{ height: `${alturaTotal}px` }} viewBox={`0 0 100 ${alturaTotal}`} preserveAspectRatio="none">
      {puntos.map((pt, i) => {
        if (i === puntos.length - 1) return null;
        const next = puntos[i + 1];
        const cyMid = (pt.y + next.y) / 2;
        const pathData = `M ${pt.x} ${pt.y} C ${pt.x} ${cyMid}, ${next.x} ${cyMid}, ${next.x} ${next.y}`;
        return (
          <g key={`curva-${i}`}>
            <path d={pathData} fill="none" stroke="#22304A" strokeWidth="4" strokeLinecap="round" />
            <path d={pathData} fill="none" stroke="#00D2FF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2, 6" className="animate-pulse" />
          </g>
        );
      })}
    </svg>
  );
});

export default function DetalleUnidad({ tema, onVolver, onSelectLeccion }) {
  const [unidades, setUnidades] = useState([]);
  const [unidadActual, setUnidadActual] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/unidades/?tema=${tema.id}`)
      .then(res => res.json())
      .then(data => {
        setUnidades(data);
        if (data.length > 0) {
          setUnidadActual(data[0]);
          setLecciones(data[0].lecciones || [
            { id: 101, orden: 1, nombre: 'Fundamentos de Acometidas' },
            { id: 102, orden: 2, nombre: 'Empalmes Monofásicos' },
            { id: 103, orden: 3, nombre: 'Protecciones y Cortes' }
          ]);
        }
        setCargando(false);
      })
      .catch(() => {
        setUnidades([{ id: 1, nombre: 'Unidad 1: Empalmes' }]);
        setLecciones([
          { id: 101, orden: 1, nombre: 'Fundamentos de Acometidas' },
          { id: 102, orden: 2, nombre: 'Empalmes Monofásicos' },
          { id: 103, orden: 3, nombre: 'Protecciones y Cortes' }
        ]);
        setCargando(false);
      });
  }, [tema]);

  const alturaTotal = Math.max(500, lecciones.length * PASO_Y + 100);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans flex flex-col justify-between">
      <header className="sticky top-0 z-30 bg-[#0B0F19]/90 border-b border-[#22304A] px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="bg-[#161E2E] hover:bg-[#22304A] text-cyan-300 px-3 py-1.5 rounded-xl text-xs font-bold transition">
            ◀ VOLVER A TEMAS
          </button>
          <span className="text-xs font-bold text-white uppercase">{tema.nombre}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <span>⚡ Módulos Interactivos</span>
        </div>
      </header>

      <main className="relative w-full flex-1 overflow-y-auto py-12 px-4 z-10 flex justify-center">
        {cargando ? (
          <div className="text-slate-400 animate-pulse my-auto">Cargando mapa de lecciones...</div>
        ) : (
          <div className="relative w-full max-w-lg" style={{ height: `${alturaTotal}px` }}>
            <ConexionesSVG totalElementos={lecciones.length} alturaTotal={alturaTotal} />

            {lecciones.map((leccion, idx) => {
              const xPos = getXPercentage(idx);
              const yPos = 45 + idx * PASO_Y;
              const completado = idx < 1;
              const activo = idx === 1;

              return (
                <div
                  key={leccion.id || idx}
                  style={{ left: `${xPos}%`, top: `${yPos}px`, transform: 'translate(-50%, -50%)' }}
                  className="absolute z-10 flex flex-col items-center group cursor-pointer"
                  onClick={() => onSelectLeccion(leccion)}
                >
                  {activo && (
                    <div className="absolute -top-10 flex flex-col items-center animate-bounce z-20">
                      <div className="bg-[#FFB800] text-[#0B0F19] font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-lg uppercase">
                        ⚡ JUGAR
                      </div>
                    </div>
                  )}

                  <div className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-transform hover:scale-110 ${
                    completado ? 'bg-emerald-500 border-emerald-700 text-white' : activo ? 'bg-[#00D2FF] border-cyan-600 text-slate-950 font-black' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <span className="text-lg">{completado ? '✓' : activo ? '⚡' : '🔒'}</span>
                  </div>

                  <span className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#161E2E] text-slate-300 border border-[#22304A] text-center max-w-[140px]">
                    {leccion.nombre}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-[#070A12] border-t border-[#22304A] py-4 px-6 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>🦉 Tiuque-Tec: ¡Completa los nodos para certificar tu avance!</span>
        </div>
        <span className="text-emerald-400 font-mono">ONLINE</span>
      </footer>
    </div>
  );
}