import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

export default function LeccionModal({ leccion, onClose, onCompletar }) {
  const [paginas, setPaginas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [fase, setFase] = useState('teoria');
  const [paginaIdx, setPaginaIdx] = useState(0);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [opcionSel, setOpcionSel] = useState(null);
  const [esCorrecta, setEsCorrecta] = useState(null);
  const [aciertos, setAciertos] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/paginas/?leccion_id=${leccion.id}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/preguntas/?leccion_id=${leccion.id}`).then(res => res.json())
    ])
    .then(([pData, qData]) => {
      setPaginas(pData.length > 0 ? pData : [{ numero_pagina: 1, contenidos: [{ texto: `Teoría fundamental de ${leccion.nombre}.` }] }]);
      setPreguntas(qData.length > 0 ? qData : [{ texto: `¿Cuál es el objetivo principal en ${leccion.nombre}?`, opciones: [{ id: 1, texto: 'Garantizar seguridad según normativa SEC.', es_correcta: true }, { id: 2, texto: 'Instalar sin revisar.', es_correcta: false }] }]);
      setCargando(false);
    })
    .catch(() => {
      setPaginas([{ numero_pagina: 1, contenidos: [{ texto: `Teoría fundamental de ${leccion.nombre}.` }] }]);
      setPreguntas([{ texto: `¿Cuál es el objetivo principal en ${leccion.nombre}?`, opciones: [{ id: 1, texto: 'Garantizar seguridad según normativa SEC.', es_correcta: true }, { id: 2, texto: 'Instalar sin revisar.', es_correcta: false }] }]);
      setCargando(false);
    });
  }, [leccion]);

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center font-mono text-cyan-400">
        [CARGANDO LECCIÓN...]
      </div>
    );
  }

  const paginaActual = paginas[paginaIdx];
  const preguntaActual = preguntas[preguntaIdx];

  const handleSiguientePagina = () => {
    if (paginaIdx < paginas.length - 1) {
      setPaginaIdx(prev => prev + 1);
    } else {
      setFase(preguntas.length > 0 ? 'preguntas' : 'resultado');
    }
  };

  const handleSeleccionarOpcion = (op) => {
    if (opcionSel !== null) return;
    setOpcionSel(op.id);
    setEsCorrecta(op.es_correcta);
    if (op.es_correcta) setAciertos(prev => prev + 1);
  };

  const handleSiguientePregunta = () => {
    setOpcionSel(null);
    setEsCorrecta(null);
    if (preguntaIdx < preguntas.length - 1) {
      setPreguntaIdx(prev => prev + 1);
    } else {
      setFase('resultado');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#161E2E] border border-[#22304A] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-mono bg-[#0B0F19] border border-[#22304A] px-3 py-1.5 rounded-xl">
            ✕ SALIR
          </button>
          <div className="flex-1 mx-4 h-3 bg-[#0B0F19] rounded-full border border-[#22304A] overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-[#FFB800] rounded-full transition-all duration-300" style={{ width: fase === 'teoria' ? `${((paginaIdx + 1) / paginas.length) * 100}%` : '100%' }} />
          </div>
          <span className="text-xs font-mono text-[#FFB800]">⚡ XP</span>
        </div>

        {fase === 'teoria' && paginaActual && (
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">{leccion.nombre}</h2>
            <div className="bg-[#0B0F19] border border-[#22304A] rounded-2xl p-5 text-slate-200 text-sm leading-relaxed mb-6">
              {paginaActual.contenidos?.map((c, i) => <p key={i}>{c.texto}</p>)}
            </div>
            <button onClick={handleSiguientePagina} className="w-full py-3.5 bg-[#FFB800] hover:bg-amber-400 text-[#0B0F19] font-bold rounded-2xl transition uppercase text-sm">
              {paginaIdx < paginas.length - 1 ? 'SIGUIENTE PÁGINA ➔' : 'IR A EVALUACIÓN ⚡'}
            </button>
          </div>
        )}

        {fase === 'preguntas' && preguntaActual && (
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#FFB800] bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full uppercase self-start mb-4">
              🎯 EVALUACIÓN FORMATIVA
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-6">{preguntaActual.texto}</h3>
            <div className="flex flex-col gap-3 mb-6">
              {preguntaActual.opciones?.map((op) => {
                let estilo = "bg-[#0B0F19] border-[#22304A] text-slate-200 hover:border-cyan-400";
                if (opcionSel !== null) {
                  if (op.es_correcta) estilo = "bg-emerald-950 border-emerald-500 text-emerald-200";
                  else if (op.id === opcionSel) estilo = "bg-rose-950 border-rose-500 text-rose-200";
                  else estilo = "opacity-50 border-[#22304A]";
                }
                return (
                  <button key={op.id} onClick={() => handleSeleccionarOpcion(op)} disabled={opcionSel !== null} className={`w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition flex justify-between ${estilo}`}>
                    <span>{op.texto}</span>
                  </button>
                );
              })}
            </div>
            {opcionSel !== null && (
              <button onClick={handleSiguientePregunta} className="w-full py-3.5 bg-[#FFB800] hover:bg-amber-400 text-[#0B0F19] font-bold rounded-2xl transition uppercase text-sm">
                CONTINUAR ➔
              </button>
            )}
          </div>
        )}

        {fase === 'resultado' && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 rounded-full bg-[#FFB800]/20 border border-[#FFB800] flex items-center justify-center text-3xl mb-4">
              🏆
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡MÓDULO COMPLETADO!</h2>
            <p className="text-xs text-slate-400 font-mono mb-6">Has asimilado con éxito los conceptos de esta lección.</p>
            <button onClick={() => { onCompletar(leccion); onClose(); }} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition uppercase text-sm">
              RECLAMAR RECOMPENSA Y VOLVER ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}