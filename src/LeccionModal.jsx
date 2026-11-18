import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo_s.png';
import wallMapa from './assets/wall_mapa.jpeg';
import { sfx } from './soundEffects';

const API_BASE_URL = 'https://backelec1-production.up.railway.app/api';

// Extrae el ID de una llave foránea sin importar cómo la serialice Django
const extraerId = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'object') return valor.id ?? valor.pk ?? null;
  return valor;
};

export default function LeccionModal({ unidad, leccion, usuarioId, onClose, onCompletar }) {
  const [pasos, setPasos] = useState([]);
  const [pasoActualIdx, setPasoActualIdx] = useState(0);
  const [totalPaginasCount, setTotalPaginasCount] = useState(0);
  const [totalPreguntasCount, setTotalPreguntasCount] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  const [finalizado, setFinalizado] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [esCorrecta, setEsCorrecta] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [vidas, setVidas] = useState(5);

  useEffect(() => {
    if (!leccion) return;
    setCargando(true);

    const cargarDatosReales = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [resPaginas, resContenidos, resImgPaginas, resPreguntas, resOpciones, resImgPreguntas] = await Promise.all([
          fetch(`${API_BASE_URL}/paginas/?leccion=${leccion.id}`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/contenidos/`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/imagenes-pagina/`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/preguntas/`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/opciones/`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE_URL}/imagenes-pregunta/`, { cache: 'no-store', headers }).then(r => r.json()).catch(() => [])
        ]);

        const rawPaginas = Array.isArray(resPaginas) ? resPaginas : (resPaginas.results || []);
        const rawContenidos = Array.isArray(resContenidos) ? resContenidos : (resContenidos.results || []);
        const rawImgPaginas = Array.isArray(resImgPaginas) ? resImgPaginas : (resImgPaginas.results || []);
        const rawPreguntas = Array.isArray(resPreguntas) ? resPreguntas : (resPreguntas.results || []);
        const rawOpciones = Array.isArray(resOpciones) ? resOpciones : (resOpciones.results || []);
        const rawImgPreguntas = Array.isArray(resImgPreguntas) ? resImgPreguntas : (resImgPreguntas.results || []);

        // 1. Filtrar SOLO las páginas reales de esta lección desde la BD
        const paginasBase = Array.isArray(leccion.paginas) && leccion.paginas.length > 0
          ? leccion.paginas
          : rawPaginas.filter(p => {
              const fkLeccion = extraerId(p.leccion ?? p.leccion_id ?? p.id_leccion ?? p.lecciones);
              return Number(fkLeccion) === Number(leccion.id);
            });

        const paginasLeccion = paginasBase
          .sort((a, b) => (a.numero_pagina || a.orden || a.id || 0) - (b.numero_pagina || b.orden || b.id || 0))
          .map(p => {
            const contenidosDePagina = Array.isArray(p.contenidos) && p.contenidos.length > 0
              ? p.contenidos
              : rawContenidos.filter(c => {
                  const fkPag = extraerId(c.pagina_leccion ?? c.pagina_leccion_id ?? c.pagina ?? c.pagina_id ?? c.id_pagina);
                  return Number(fkPag) === Number(p.id);
                });

            const imagenesDePagina = Array.isArray(p.imagenes) && p.imagenes.length > 0
              ? p.imagenes
              : rawImgPaginas.filter(img => {
                  const fkPag = extraerId(img.pagina_leccion ?? img.pagina_leccion_id ?? img.pagina ?? img.pagina_id);
                  return Number(fkPag) === Number(p.id);
                });

            return {
              ...p,
              contenidos: contenidosDePagina.sort(
                (a, b) => (a.numero_contenido_pagina || a.orden || a.id || 0) - (b.numero_contenido_pagina || b.orden || b.id || 0)
              ),
              imagenes: imagenesDePagina.sort(
                (a, b) => (a.numero_imagen_pagina || a.orden || a.id || 0) - (b.numero_imagen_pagina || b.orden || b.id || 0)
              )
            };
          });

        const idsPaginas = paginasLeccion.map(p => Number(p.id));

        // 2. Filtrar SOLO las preguntas reales de esta lección/páginas desde la BD
        const preguntasLeccion = rawPreguntas
          .filter(q => {
            const fkPag = extraerId(q.pagina_leccion ?? q.pagina_leccion_id ?? q.pagina ?? q.pagina_id);
            const fkLec = extraerId(q.leccion ?? q.leccion_id ?? q.id_leccion);
            return (fkPag !== null && idsPaginas.includes(Number(fkPag))) ||
                   (fkLec !== null && Number(fkLec) === Number(leccion.id));
          })
          .sort((a, b) => (a.numero_pregunta || a.orden || a.id || 0) - (b.numero_pregunta || b.orden || b.id || 0))
          .map(q => {
            const opcionesDePregunta = Array.isArray(q.opciones) && q.opciones.length > 0
              ? q.opciones
              : rawOpciones.filter(op => {
                  const fkPreg = extraerId(op.pregunta ?? op.pregunta_id ?? op.id_pregunta);
                  return Number(fkPreg) === Number(q.id);
                });

            const imagenesDePregunta = Array.isArray(q.imagenes) && q.imagenes.length > 0
              ? q.imagenes
              : rawImgPreguntas.filter(img => {
                  const fkPreg = extraerId(img.pregunta ?? img.pregunta_id ?? img.id_pregunta);
                  return Number(fkPreg) === Number(q.id);
                });

            return {
              ...q,
              opciones: opcionesDePregunta,
              imagenes: imagenesDePregunta.sort(
                (a, b) => (a.numero_imagen_pregunta || a.orden || a.id || 0) - (b.numero_imagen_pregunta || b.orden || b.id || 0)
              )
            };
          });

        // Guardar resumen técnico por si la lección aún no tiene páginas vinculadas
        setDebugInfo({
          leccionIdBuscada: leccion.id,
          totalPaginasEnAPI: rawPaginas.length,
          ejemploPaginaAPI: rawPaginas[0] || null
        });

        // 3. Construir la secuencia intercalada SOLO con datos reales: [Página 1, Pregunta(s) Pág 1, Página 2, Pregunta(s) Pág 2]
        const secuenciaIntercalada = [];
        const preguntasUsadasIds = new Set();
        let contadorPag = 0;
        let contadorPreg = 0;

        paginasLeccion.forEach((pagina, idx) => {
          contadorPag += 1;
          secuenciaIntercalada.push({
            tipo: 'teoria',
            ordenPagina: contadorPag,
            data: pagina
          });

          const preguntasDeEstaPagina = Array.isArray(pagina.preguntas) && pagina.preguntas.length > 0
            ? pagina.preguntas
            : preguntasLeccion.filter(q => {
                const fkPag = extraerId(q.pagina_leccion ?? q.pagina_leccion_id ?? q.pagina ?? q.pagina_id);
                return Number(fkPag) === Number(pagina.id);
              });

          if (preguntasDeEstaPagina.length > 0) {
            preguntasDeEstaPagina.forEach(preg => {
              if (!preguntasUsadasIds.has(preg.id)) {
                preguntasUsadasIds.add(preg.id);
                contadorPreg += 1;
                secuenciaIntercalada.push({
                  tipo: 'pregunta',
                  ordenPregunta: contadorPreg,
                  ordenPaginaAsociada: contadorPag,
                  data: preg
                });
              }
            });
          } else {
            const preguntaPorIndice = preguntasLeccion[idx];
            if (preguntaPorIndice && !preguntasUsadasIds.has(preguntaPorIndice.id)) {
              preguntasUsadasIds.add(preguntaPorIndice.id);
              contadorPreg += 1;
              secuenciaIntercalada.push({
                tipo: 'pregunta',
                ordenPregunta: contadorPreg,
                ordenPaginaAsociada: contadorPag,
                data: preguntaPorIndice
              });
            }
          }
        });

        preguntasLeccion.forEach(preg => {
          if (!preguntasUsadasIds.has(preg.id)) {
            preguntasUsadasIds.add(preg.id);
            contadorPreg += 1;
            secuenciaIntercalada.push({
              tipo: 'pregunta',
              ordenPregunta: contadorPreg,
              ordenPaginaAsociada: contadorPag || 1,
              data: preg
            });
          }
        });

        setTotalPaginasCount(paginasLeccion.length);
        setTotalPreguntasCount(contadorPreg);
        setPasos(secuenciaIntercalada);
      } catch (error) {
        console.error('Error cargando datos de la BD:', error);
        setPasos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosReales();
  }, [leccion]);

  const avanzarAlSiguientePaso = () => {
    setOpcionSeleccionada(null);
    setEsCorrecta(null);

    if (pasoActualIdx < pasos.length - 1) {
      const siguientePaso = pasos[pasoActualIdx + 1];
      if (siguientePaso?.tipo === 'pregunta') {
        sfx.playOpenNode();
      } else {
        sfx.playClick();
      }
      setPasoActualIdx(prev => prev + 1);
    } else {
      sfx.playComplete();
      registrarProgreso();
      setFinalizado(true);
    }
  };

  const handleSeleccionarOpcion = (opcion) => {
    if (opcionSeleccionada !== null) return;
    setOpcionSeleccionada(opcion.id);
    const correcta = Boolean(opcion.es_correcta);
    setEsCorrecta(correcta);

    if (correcta) {
      sfx.playSuccess();
      setAciertos(prev => prev + 1);
    } else {
      sfx.playError();
      setVidas(prev => Math.max(0, prev - 1));
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
      <div className="fixed inset-0 z-50 bg-[#050914] flex flex-col items-center justify-center font-mono text-[#ffb800] gap-3">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-60 contrast-110"
          style={{ backgroundImage: `url(${wallMapa})` }}
        />
        <div className="fixed inset-0 bg-[#050914]/70 pointer-events-none z-0" />
        <div className="w-9 h-9 border-2 border-[#ffb800] border-t-transparent rounded-full animate-spin relative z-10" />
        <span className="text-xs tracking-widest animate-pulse relative z-10 uppercase">
          Cargando desde Railway...
        </span>
      </div>
    );
  }

  const pasoActual = pasos[pasoActualIdx];
  const siguientePaso = pasos[pasoActualIdx + 1];
  const progresoPorcentaje = pasos.length === 0
    ? 0
    : finalizado
    ? 100
    : ((pasoActualIdx + 1) / pasos.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#050914] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-mono">
      
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-75 contrast-110"
        style={{ backgroundImage: `url(${wallMapa})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#050914]/70 via-[#050914]/55 to-[#050914]/80 pointer-events-none z-0" />

      <div className="w-full max-w-2xl my-auto flex flex-col gap-4 relative z-10">
        
        {/* HUD Superior */}
        <div className="w-full bg-[#0a1120]/95 backdrop-blur-md border border-[#ffb800]/40 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="AreaElectrica" className="w-8 h-8 object-contain rounded-lg border border-[#9fef00]/40" />
            <span className="text-xs font-black tracking-wider text-white uppercase hidden sm:inline">
              AREA<span className="text-[#9fef00]">ELECTRICA</span>
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-bold">
              <span>
                {pasos.length === 0
                  ? 'SIN REGISTROS EN BD'
                  : finalizado
                  ? 'MÓDULO COMPLETADO'
                  : pasoActual?.tipo === 'teoria'
                  ? `TEORÍA • PÁGINA ${pasoActual.ordenPagina} DE ${totalPaginasCount}`
                  : `EVALUACIÓN • PREGUNTA ${pasoActual?.ordenPregunta} DE ${totalPreguntasCount}`}
              </span>
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
            <div className="flex items-center gap-1 text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-lg">
              <span>❤️</span>
              <span className="font-bold">{vidas}</span>
            </div>
            <button
              onMouseEnter={() => sfx.playHover()}
              onClick={() => {
                sfx.playClick();
                onClose();
              }}
              className="text-slate-300 hover:text-[#ffb800] bg-[#050914] border border-slate-700 hover:border-[#ffb800] px-3 py-1 rounded-lg transition text-xs cursor-pointer font-bold"
            >
              ✕ SALIR
            </button>
          </div>
        </div>

        {/* Ventana Principal */}
        <div className="w-full bg-[#0a1120]/95 backdrop-blur-md border-2 border-[#ffb800]/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_45px_rgba(255,184,0,0.15)] flex flex-col relative max-h-[78vh] overflow-y-auto">
          
          {/* SI NO HAY PÁGINAS EN LA BD PARA ESTA LECCIÓN */}
          {pasos.length === 0 && (
            <div className="flex flex-col items-center text-center py-6">
              <span className="text-3xl mb-3">📭</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
                "{leccion?.nombre}" no tiene páginas vinculadas en la BD
              </h3>
              <p className="text-xs text-slate-400 font-sans max-w-md mb-4">
                Se buscó en <code className="text-[#9fef00]">/api/paginas/</code> para la lección con ID <strong className="text-[#ffb800]">{leccion?.id}</strong> y no se encontraron páginas asociadas.
              </p>

              {debugInfo && (
                <div className="w-full bg-[#050914] border border-slate-800 rounded-xl p-3 mb-5 text-left text-[11px] text-slate-400">
                  <p>Total páginas recibidas de <code className="text-[#9fef00]">/api/paginas/</code>: <strong className="text-white">{debugInfo.totalPaginasEnAPI}</strong></p>
                  {debugInfo.ejemploPaginaAPI && (
                    <p className="mt-1 truncate">
                      Campos en BD de página: <code className="text-[#ffb800]">{Object.keys(debugInfo.ejemploPaginaAPI).join(', ')}</code>
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                VOLVER AL MAPA
              </button>
            </div>
          )}

          {/* PASO TIPO TEORÍA */}
          {!finalizado && pasos.length > 0 && pasoActual?.tipo === 'teoria' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="text-[10px] text-[#9fef00] bg-[#112614] border border-[#9fef00]/40 px-3 py-1 rounded-md uppercase font-bold">
                  📖 PÁGINA {pasoActual.data.numero_pagina || pasoActual.ordenPagina} DE {totalPaginasCount}
                </span>
                <span className="text-[10px] text-[#ffb800] font-bold uppercase">
                  PASO {pasoActualIdx + 1} DE {pasos.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 leading-snug font-sans">
                {pasoActual.data.titulo || pasoActual.data.nombre || leccion.nombre}
              </h2>

              <div className="space-y-4 bg-[#050914] border border-[#9fef00]/30 rounded-xl p-5 text-slate-200 text-sm leading-relaxed mb-6 font-sans shadow-inner">
                {pasoActual.data.contenidos && pasoActual.data.contenidos.length > 0 ? (
                  pasoActual.data.contenidos.map((c, i) => (
                    <p key={c.id || i} className="border-l-2 border-[#ffb800] pl-3 whitespace-pre-line">
                      {c.texto || c.contenido || c.descripcion}
                    </p>
                  ))
                ) : (pasoActual.data.texto || pasoActual.data.contenido || pasoActual.data.descripcion) ? (
                  <p className="border-l-2 border-[#ffb800] pl-3 whitespace-pre-line">
                    {pasoActual.data.texto || pasoActual.data.contenido || pasoActual.data.descripcion}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    Esta página (ID: {pasoActual.data.id}) aún no tiene contenidos asociados en <code className="text-[#9fef00]">/api/contenidos/</code>.
                  </p>
                )}

                {pasoActual.data.imagenes && pasoActual.data.imagenes.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-3">
                    {pasoActual.data.imagenes.map((img, i) => (
                      <img
                        key={img.id || i}
                        src={img.imagen || img.url}
                        alt={img.nombre || `Imagen página ${pasoActual.ordenPagina}`}
                        className="w-full max-h-64 object-contain rounded-lg border border-slate-800 bg-[#0a1120] p-2"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                onMouseEnter={() => sfx.playHover()}
                onClick={avanzarAlSiguientePaso}
                className="w-full py-3.5 bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.35)] transition text-xs uppercase cursor-pointer tracking-wider"
              >
                {siguientePaso?.tipo === 'pregunta'
                  ? `RESPONDER PREGUNTA DE PÁGINA ${pasoActual.ordenPagina} ⚡`
                  : siguientePaso?.tipo === 'teoria'
                  ? 'SIGUIENTE PÁGINA ➔'
                  : 'COMPLETAR MÓDULO ✔'}
              </button>
            </div>
          )}

          {/* PASO TIPO PREGUNTA */}
          {!finalizado && pasos.length > 0 && pasoActual?.tipo === 'pregunta' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="text-[10px] text-[#ffb800] bg-[#261f0c] border border-[#ffb800]/40 px-3 py-1 rounded-md uppercase font-bold">
                  🎯 PREGUNTA {pasoActual.ordenPregunta} DE {totalPreguntasCount} (PÁGINA {pasoActual.ordenPaginaAsociada})
                </span>
                <span className="text-[10px] text-[#9fef00] font-bold">+100 XP</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug font-sans">
                {pasoActual.data.texto || pasoActual.data.enunciado || pasoActual.data.pregunta}
              </h3>

              {pasoActual.data.imagenes && pasoActual.data.imagenes.length > 0 && (
                <div className="grid grid-cols-1 gap-3 mb-5">
                  {pasoActual.data.imagenes.map((img, i) => (
                    <img
                      key={img.id || i}
                      src={img.imagen || img.url}
                      alt={img.nombre || `Diagrama pregunta ${pasoActual.ordenPregunta}`}
                      className="w-full max-h-56 object-contain rounded-lg border border-slate-800 bg-[#050914] p-2"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {pasoActual.data.opciones?.map((opcion, idx) => {
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
                      onMouseEnter={() => opcionSeleccionada === null && sfx.playHover()}
                      onClick={() => handleSeleccionarOpcion(opcion)}
                      disabled={opcionSeleccionada !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${estilosOpcion}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#050914] border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-sans font-medium">{opcion.texto || opcion.opcion}</span>
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
                <div className="flex flex-col gap-3">
                  <div
                    className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                      esCorrecta
                        ? 'bg-[#112614] text-[#9fef00] border border-[#9fef00]/50'
                        : 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                    }`}
                  >
                    <span>
                      {esCorrecta
                        ? '⚡ ¡Respuesta correcta!'
                        : '⚠️ Respuesta incorrecta. Revisa el contenido técnico.'}
                    </span>
                    <span>{esCorrecta ? '+25 NC' : '-1 HP'}</span>
                  </div>

                  <button
                    onMouseEnter={() => sfx.playHover()}
                    onClick={avanzarAlSiguientePaso}
                    className="w-full py-3.5 bg-[#9fef00] hover:bg-[#86cb00] text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(159,239,0,0.35)] transition text-xs uppercase cursor-pointer tracking-wider"
                  >
                    {siguientePaso?.tipo === 'teoria'
                      ? `CONTINUAR A PÁGINA ${siguientePaso.ordenPagina} ➔`
                      : siguientePaso?.tipo === 'pregunta'
                      ? 'SIGUIENTE PREGUNTA ➔'
                      : 'VER REPORTE FINAL ⚡'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PANTALLA FINAL: RESULTADO */}
          {finalizado && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-[#112614] border-2 border-[#9fef00] mb-4 shadow-[0_0_30px_rgba(159,239,0,0.4)] flex items-center justify-center text-4xl">
                ⚡
              </div>
              <span className="text-[10px] text-[#9fef00] bg-[#112614] border border-[#9fef00]/40 px-3 py-0.5 rounded-full uppercase font-bold mb-2">
                CERTIFICACIÓN DE MÓDULO ACTUALIZADA
              </span>
              <h2 className="text-2xl font-black text-white mb-2">¡MÓDULO DOMINADO!</h2>
              <p className="text-xs text-slate-300 mb-6 font-sans max-w-md">
                Has completado todas las páginas y verificaciones técnicas de{' '}
                <strong className="text-[#ffb800]">{leccion.nombre}</strong>.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-md">
                <div className="bg-[#050914] border border-[#9fef00]/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-[#9fef00]">PÁGINAS LEÍDAS</span>
                  <span className="text-lg font-bold text-white mt-1">{totalPaginasCount}</span>
                </div>
                <div className="bg-[#050914] border border-[#ffb800]/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-[#ffb800]">ACIERTOS</span>
                  <span className="text-lg font-bold text-white mt-1">
                    {aciertos} / {totalPreguntasCount}
                  </span>
                </div>
                <div className="bg-[#050914] border border-rose-500/40 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-rose-400">ENERGÍA</span>
                  <span className="text-lg font-bold text-white mt-1">{vidas} ❤️</span>
                </div>
              </div>

              <button
                onMouseEnter={() => sfx.playHover()}
                onClick={() => {
                  sfx.playClick();
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