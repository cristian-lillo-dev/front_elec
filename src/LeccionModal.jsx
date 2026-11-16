import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

export default function LeccionModal({ unidad, leccion, usuarioId, onClose, onCompletar }) {
  const [paginas, setPaginas] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [fase, setFase] = useState('teoria'); // 'teoria' | 'preguntas' | 'resultado'
  const [paginaActualIdx, setPaginaActualIdx] = useState(0);
  const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);

  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [esCorrecta, setEsCorrecta] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [vidas, setVidas] = useState(5);

  useEffect(() => {
    if (!leccion) return;
    setCargando(true);

    const cargarDatosLeccion = async () => {
      try {
        // 1. Obtener páginas, contenidos, imágenes y preguntas desde los ViewSets de Django
        const [resPaginas, resContenidos, resImgPaginas, resPreguntas, resOpciones, resImgPreguntas] = await Promise.all([
          fetch(`${API_BASE_URL}/paginas/?leccion=${leccion.id}`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/contenidos/`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/imagenes-pagina/`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/preguntas/`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/opciones/`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/imagenes-pregunta/`).then(r => r.json()).catch(() => [])
        ]);

        const rawPaginas = Array.isArray(resPaginas) ? resPaginas : (resPaginas.results || []);
        const rawContenidos = Array.isArray(resContenidos) ? resContenidos : (resContenidos.results || []);
        const rawImgPaginas = Array.isArray(resImgPaginas) ? resImgPaginas : (resImgPaginas.results || []);
        const rawPreguntas = Array.isArray(resPreguntas) ? resPreguntas : (resPreguntas.results || []);
        const rawOpciones = Array.isArray(resOpciones) ? resOpciones : (resOpciones.results || []);
        const rawImgPreguntas = Array.isArray(resImgPreguntas) ? resImgPreguntas : (resImgPreguntas.results || []);

        // Filtrar páginas que pertenecen a esta lección y ordenarlas por numero_pagina
        const paginasLeccion = rawPaginas
          .filter(p => p.leccion === leccion.id || !p.leccion)
          .sort((a, b) => (a.numero_pagina || 0) - (b.numero_pagina || 0))
          .map(p => ({
            ...p,
            contenidos: p.contenidos || rawContenidos
              .filter(c => c.pagina_leccion === p.id)
              .sort((a, b) => (a.numero_contenido_pagina || 0) - (b.numero_contenido_pagina || 0)),
            imagenes: p.imagenes || rawImgPaginas
              .filter(img => img.pagina_leccion === p.id)
              .sort((a, b) => (a.numero_imagen_pagina || 0) - (b.numero_imagen_pagina || 0))
          }));

        const idsPaginas = paginasLeccion.map(p => p.id);

        // Filtrar preguntas asociadas a las páginas de la lección
        const preguntasLeccion = rawPreguntas
          .filter(q => idsPaginas.includes(q.pagina_leccion) || q.leccion === leccion.id)
          .sort((a, b) => (a.numero_pregunta || 0) - (b.numero_pregunta || 0))
          .map(q => ({
            ...q,
            opciones: q.opciones || rawOpciones.filter(op => op.pregunta === q.id),
            imagenes: q.imagenes || rawImgPreguntas
              .filter(img => img.pregunta === q.id)
              .sort((a, b) => (a.numero_imagen_pregunta || 0) - (b.numero_imagen_pregunta || 0))
          }));

        // Respaldo demostrativo si la base de datos aún no tiene registros para esta lección
        setPaginas(paginasLeccion.length > 0 ? paginasLeccion : [
          {
            id: 1,
            numero_pagina: 1,
            contenidos: [
              { id: 1, numero_contenido_pagina: 1, texto: `Protocolo técnico del módulo "${leccion.nombre}". Todo empalme y tablero eléctrico debe dimensionarse verificando capacidad térmica y caída de tensión según los Pliegos Técnicos Normativos RIC vigentes.` },
              { id: 2, numero_contenido_pagina: 2, texto: 'Inspecciona siempre la selectividad de las protecciones termomagnéticas y diferenciales antes de energizar el circuito.' }
            ],
            imagenes: []
          }
        ]);

        setPreguntas(preguntasLeccion.length > 0 ? preguntasLeccion : [
          {
            id: 1,
            numero_pregunta: 1,
            texto: `¿Cuál es la exigencia prioritaria al ejecutar e inspeccionar "${leccion.nombre}" bajo normativa SEC?`,
            opciones: [
              { id: 1, texto: 'Cumplir los parámetros del Pliego Técnico RIC correspondiente y verificar protecciones.', es_correcta: true },
              { id: 2, texto: 'Energizar directamente sin medir aislamiento ni continuidad.', es_correcta: false },
              { id: 3, texto: 'Utilizar conductores de sección inferior a la mínima reglamentaria.', es_correcta: false }
            ],
            imagenes: []
          }
        ]);
      } catch (error) {
        console.warn('Error cargando datos de la lección, usando respaldo:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosLeccion();
  }, [leccion]);

  const handleSiguientePagina = () => {
    if (paginaActualIdx < paginas.length - 1) {
      setPaginaActualIdx(prev => prev + 1);
    } else if (preguntas.length > 0) {
      setFase('preguntas');
    } else {
      registrarProgreso();
      setFase('resultado');
    }
  };

  const handleSeleccionarOpcion = (opcion) => {
    if (opcionSeleccionada !== null) return;
    setOpcionSeleccionada(opcion.id);
    const correcta = Boolean(opcion.es_correcta);
    setEsCorrecta(correcta);

    if (correcta) {
      setAciertos(prev => prev + 1);
    } else {
      setVidas(prev => Math.max(0, prev - 1));
    }
  };

  const handleSiguientePregunta = () => {
    setOpcionSeleccionada(null);
    setEsCorrecta(null);
    if (preguntaActualIdx < preguntas.length - 1) {
      setPreguntaActualIdx(prev => prev + 1);
    } else {
      registrarProgreso();
      setFase('resultado');
    }
  };

  const registrarProgreso = async () => {
    if (!usuarioId || !leccion?.id) return;
    try {
      await fetch(`${API_BASE_URL}/progresos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioId, leccion: leccion.id })
      });
    } catch (err) {
      console.warn('No se pudo sincronizar el progreso remoto:', err);
    }
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050914]/95 backdrop-blur-md flex flex-col items-center justify-center font-mono text-[#ffb800] gap-3">
        <div className="w-9 h-9 border-2 border-[#ffb800] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest animate-pulse">[SPAWNING_NODE // DESCARGANDO PAQUETES SEC...]</span>
      </div>
    );
  }

  const paginaActual = paginas[paginaActualIdx];
  const preguntaActual = preguntas[preguntaActualIdx];
  const totalPasosTeoria = paginas.length;
  const totalPreguntas = preguntas.length;

  const progresoPorcentaje =
    fase === 'teoria'
      ? ((paginaActualIdx + 1) / Math.max(1, totalPasosTeoria)) * 100
      : fase === 'preguntas'
      ? ((preguntaActualIdx + 1) / Math.max(1, totalPreguntas)) * 100
      : 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#050914]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-mono">
      <div className="w-full max-w-2xl my-auto flex flex-col gap-4">
        
        {/* HUD Superior del Modal */}
        <div className="w-full bg-[#0a1120] border border-[#ffb800]/40 rounded-xl p-3 flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-[#ffb800] bg-[#050914] border border-slate-700 hover:border-[#ffb800] px-3 py-1.5 rounded-lg transition text-xs cursor-pointer font-bold"
          >
            ✕ EXIT_BOX
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>{fase === 'teoria' ? 'MODO: LECTURA_TEÓRICA' : fase === 'preguntas' ? 'MODO: CAPTURA_DE_FLAG' : 'MODO: COMPLETADO'}</span>
              <span className="text-[#9fef00]">{Math.round(progresoPorcentaje)}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#050914] rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#ffb800] via-[#9fef00] to-[#00f0ff] rounded-full transition-all duration-300 shadow-[0_0_10px_#ffb800]"
                style={{ width: `${progresoPorcentaje}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-rose-400 bg-rose-950/50 border border-rose-500/40 px-2.5 py-1 rounded-lg">
              <span>❤️</span>
              <span className="font-bold">{vidas}</span>
            </div>
            <div className="flex items-center gap-1 text-[#ffb800] bg-[#261f0c] border border-[#ffb800]/40 px-2.5 py-1 rounded-lg">
              <span>⚡</span>
              <span>
                {fase === 'teoria'
                  ? `Pág ${paginaActualIdx + 1}/${totalPasosTeoria}`
                  : `Q ${preguntaActualIdx + 1}/${totalPreguntas}`}
              </span>
            </div>
          </div>
        </div>

        {/* Ventana Principal Estilo Terminal HTB */}
        <div className="w-full bg-[#0a1120] border-2 border-[#ffb800]/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_45px_rgba(255,184,0,0.15)] flex flex-col relative max-h-[78vh] overflow-y-auto">
          
          {/* FASE 1: PÁGINAS DE TEORÍA */}
          {fase === 'teoria' && paginaActual && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="text-[10px] text-[#9fef00] bg-[#112614] border border-[#9fef00]/40 px-3 py-1 rounded-md uppercase font-bold">
                  root@sec-ric:~# cat pagina_{paginaActual.numero_pagina || paginaActualIdx + 1}.md
                </span>
                <span className="text-[10px] text-[#ffb800]">
                  [CHALLENGE // {leccion.numero_leccion || leccion.orden || 1}]
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 leading-snug">
                {leccion.nombre}
              </h2>

              <div className="space-y-4 bg-[#050914] border border-[#9fef00]/30 rounded-xl p-5 text-slate-200 text-sm leading-relaxed mb-6 font-sans shadow-inner">
                {paginaActual.contenidos && paginaActual.contenidos.length > 0 ? (
                  paginaActual.contenidos.map((c, i) => (
                    <p key={c.id || i} className="border-l-2 border-[#ffb800] pl-3">
                      {c.texto}
                    </p>
                  ))
                ) : (
                  <p className="border-l-2 border-[#ffb800] pl-3">
                    Especificación técnica normativa para {leccion.nombre}.
                  </p>
                )}

                {paginaActual.imagenes && paginaActual.imagenes.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-3">
                    {paginaActual.imagenes.map((img, i) => (
                      <img
                        key={img.id || i}
                        src={img.imagen}
                        alt={`Esquema página ${paginaActual.numero_pagina}`}
                        className="w-full max-h-64 object-contain rounded-lg border border-slate-800 bg-[#0a1120] p-2"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSiguientePagina}
                className="w-full py-3.5 bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.35)] transition text-xs uppercase cursor-pointer tracking-wider"
              >
                {paginaActualIdx < totalPasosTeoria - 1
                  ? 'SIGUIENTE PÁGINA ➔'
                  : preguntas.length > 0
                  ? 'EJECUTAR EVALUACIÓN DE CAMPO ⚡'
                  : 'COMPLETAR MÓDULO ✔'}
              </button>
            </div>
          )}

          {/* FASE 2: PREGUNTAS / CAPTURA DE FLAG */}
          {fase === 'preguntas' && preguntaActual && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="text-[10px] text-[#ffb800] bg-[#261f0c] border border-[#ffb800]/40 px-3 py-1 rounded-md uppercase font-bold">
                  🎯 FLAG_VERIFICATION // PREGUNTA #{preguntaActual.numero_pregunta || preguntaActualIdx + 1}
                </span>
                <span className="text-[10px] text-[#9fef00]">[+100 XP]</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug font-sans">
                {preguntaActual.texto}
              </h3>

              {preguntaActual.imagenes && preguntaActual.imagenes.length > 0 && (
                <div className="mb-5">
                  {preguntaActual.imagenes.map((img, i) => (
                    <div key={img.id || i} className="bg-[#050914] border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-400">
                      Diagrama adjunto: <span className="text-[#9fef00]">{img.nombre}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {preguntaActual.opciones?.map((opcion, idx) => {
                  let estilosOpcion =
                    'bg-[#07130b] border-[#9fef00]/40 text-slate-200 hover:border-[#ffb800] hover:bg-[#0d1f14]';

                  if (opcionSeleccionada !== null) {
                    if (opcion.es_correcta) {
                      estilosOpcion =
                        'bg-[#112614] border-[#9fef00] text-[#9fef00] shadow-[0_0_20px_rgba(159,239,0,0.3)]';
                    } else if (opcion.id === opcionSeleccionada) {
                      estilosOpcion =
                        'bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                    } else {
                      estilosOpcion = 'bg-[#050914]/50 border-slate-800 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opcion.id || idx}
                      onClick={() => handleSeleccionarOpcion(opcion)}
                      disabled={opcionSeleccionada !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${estilosOpcion}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#050914] border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-sans font-medium">{opcion.texto}</span>
                      </div>
                      {opcionSeleccionada !== null && opcion.es_correcta && (
                        <span className="text-[#9fef00] font-bold text-base">✔</span>
                      )}
                      {opcionSeleccionada !== null &&
                        opcion.id === opcionSeleccionada &&
                        !opcion.es_correcta && <span className="text-rose-400 font-bold text-base">✕</span>}
                    </button>
                  );
                })}
              </div>

              {opcionSeleccionada !== null && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                      esCorrecta
                        ? 'bg-[#112614] text-[#9fef00] border border-[#9fef00]/50'
                        : 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                    }`}
                  >
                    <span>
                      {esCorrecta
                        ? '⚡ [ROOT_FLAG_CAPTURED] ¡Respuesta correcta conforme a la normativa SEC!'
                        : '⚠️ [SHORT_CIRCUIT] Respuesta incorrecta. Revisa el pliego normativo RIC.'}
                    </span>
                    <span>{esCorrecta ? '+25 NC' : '-1 HP'}</span>
                  </div>

                  <button
                    onClick={handleSiguientePregunta}
                    className="w-full py-3.5 bg-[#9fef00] hover:bg-[#86cb00] text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(159,239,0,0.35)] transition text-xs uppercase cursor-pointer tracking-wider"
                  >
                    {preguntaActualIdx < totalPreguntas - 1 ? 'SIGUIENTE RETO ➔' : 'VER REPORTE FINAL ⚡'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FASE 3: RESULTADO / PWNED BOX */}
          {fase === 'resultado' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-[#112614] border-2 border-[#9fef00] mb-4 shadow-[0_0_30px_rgba(159,239,0,0.4)] flex items-center justify-center text-4xl">
                ⚡
              </div>
              <span className="text-[10px] text-[#9fef00] bg-[#112614] border border-[#9fef00]/40 px-3 py-0.5 rounded-full uppercase mb-2">
                NODE_PWNED // CERTIFICACIÓN ACTUALIZADA
              </span>
              <h2 className="text-2xl font-black text-white mb-2">¡MÓDULO DOMINADO!</h2>
              <p className="text-xs text-slate-300 mb-6 font-sans max-w-md">
                Has completado la revisión técnica y evaluación de{' '}
                <strong className="text-[#ffb800]">{leccion.nombre}</strong>.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-md">
                <div className="bg-[#050914] border border-[#9fef00]/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-[#9fef00]">PÁGINAS LEÍDAS</span>
                  <span className="text-lg font-bold text-white mt-1">{totalPasosTeoria}</span>
                </div>
                <div className="bg-[#050914] border border-[#ffb800]/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-[#ffb800]">FLAGS / ACIERTOS</span>
                  <span className="text-lg font-bold text-white mt-1">
                    {aciertos} / {totalPreguntas}
                  </span>
                </div>
                <div className="bg-[#050914] border border-rose-500/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-rose-400">VIDAS RESTANTES</span>
                  <span className="text-lg font-bold text-white mt-1">{vidas} ❤️</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onCompletar) onCompletar(leccion);
                  onClose();
                }}
                className="w-full py-4 bg-gradient-to-r from-[#ffb800] to-[#9fef00] hover:opacity-95 text-slate-950 font-black rounded-xl shadow-[0_0_25px_rgba(255,184,0,0.4)] transition text-xs uppercase cursor-pointer tracking-wider"
              >
                GUARDAR PROGRESO Y VOLVER AL MAPA ⚡
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 