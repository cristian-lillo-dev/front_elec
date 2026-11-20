import React, { useState, useRef, useEffect } from 'react';
import { sfx } from './soundEffects';

const RIC_API_URL = 'https://dbragelec-production.up.railway.app/api/ric/ask';

const SUGERENCIAS_INICIALES = [
  {
    label: 'Tópicos del RIC 1',
    query: '¿Qué tópicos se encuentran en el pliego RIC 1?',
  },
  {
    label: 'Componentes de empalme',
    query: '¿Cuáles son los componentes y requisitos de ubicación de un empalme?',
  },
  {
    label: 'Protección diferencial',
    query: '¿Qué exigencia tiene la protección diferencial en circuitos de enchufes?',
  },
];

export default function AsistenteRIC() {
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: 'welcome',
      tipo: 'bot',
      html: '<p><strong>Terminal Normativa SEC RIC en línea.</strong></p><p>Consulta cualquier exigencia de los Pliegos Técnicos Normativos (RIC 01 al 19). Entregaré respuestas estructuradas con citas exactas por documento y página.</p>',
      sources: [],
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, cargando, abierto]);

  const consultarRIC = async (textoConsulta) => {
    const limpia = textoConsulta.trim();
    if (!limpia || cargando) return;

    sfx.playClick();
    setPregunta('');

    const userMsg = {
      id: `u-${Date.now()}`,
      tipo: 'user',
      texto: limpia,
    };

    setMensajes((prev) => [...prev, userMsg]);
    setCargando(true);

    try {
      const response = await fetch(RIC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: limpia }),
      });

      if (!response.ok) {
        let detail = '';
        try {
          const errJson = await response.json();
          detail = errJson.detail || JSON.stringify(errJson);
        } catch {
          detail = await response.text().catch(() => '');
        }
        throw new Error(`Error HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
      }

      const data = await response.json();
      sfx.playOpenNode();

      setMensajes((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          tipo: 'bot',
          html: data.answer ?? '<p>Sin respuesta del servidor.</p>',
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          tipo: 'error',
          texto: `No se pudo obtener respuesta: ${err.message}`,
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    consultarRIC(pregunta);
  };

  const toggleChat = () => {
    if (abierto) {
      sfx.playClick();
    } else {
      sfx.playOpenNode();
    }
    setAbierto(!abierto);
  };

  return (
    <>
      {/* Botón Flotante HUD (Trigger) */}
      <button
        onMouseEnter={() => sfx.playHover()}
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-mono text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_25px_rgba(159,239,0,0.25)] ${
          abierto
            ? 'bg-[#0d1527] border-[#ffb800] text-[#ffb800]'
            : 'bg-[#0a1424] border-[#9fef00] text-[#9fef00] hover:bg-[#112614]'
        }`}
        title="Asistente Normativo SEC RIC"
      >
        <span className="text-base">{abierto ? '✕' : '⚡'}</span>
        <span>{abierto ? 'CERRAR TERMINAL RIC' : 'ASISTENTE SEC RIC'}</span>
      </button>

      {/* Ventana de Chat Flotante */}
      {abierto && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[580px] max-h-[78vh] bg-[#080d1a]/95 backdrop-blur-xl border border-[#9fef00]/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden font-mono">
          
          {/* Cabecera del Chat */}
          <div className="bg-[#0a1424] border-b border-[#9fef00]/30 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9fef00] animate-pulse" />
              <div>
                <h3 className="text-xs font-black text-white tracking-wider uppercase">
                  CONSULTA PLIEGOS <span className="text-[#9fef00]">SEC RIC</span>
                </h3>
                <p className="text-[10px] text-slate-400">Búsqueda semántica normativa Chile</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-400 hover:text-rose-400 text-xs font-bold px-2 py-1 rounded border border-transparent hover:border-rose-500/40 transition cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {mensajes.map((msg) => {
              if (msg.tipo === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-[#112614] border border-[#9fef00]/40 text-slate-100 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%] text-xs font-sans shadow-md">
                      {msg.texto}
                    </div>
                  </div>
                );
              }

              if (msg.tipo === 'error') {
                return (
                  <div
                    key={msg.id}
                    className="bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl p-3 text-xs font-sans"
                  >
                    {msg.texto}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className="bg-[#0d1527] border border-slate-800 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200 shadow-inner"
                >
                  {/* Contenido HTML estructurado proveniente de la API */}
                  <div
                    className="font-sans leading-relaxed space-y-2
                      [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#9fef00] [&_h3]:border-b [&_h3]:border-slate-800 [&_h3]:pb-1.5 [&_h3]:mb-2
                      [&_p]:mb-2 [&_p:last-child]:mb-0
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-2
                      [&_strong]:text-white [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: msg.html }}
                  />

                  {/* Badges de Fuentes Normativas */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                        Fuentes normativas recuperadas
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-[#112614] border border-[#9fef00]/40 text-slate-200"
                          >
                            <span>{src.archivo ?? 'RIC'}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-[#ffb800] font-bold">
                              Pág. {src.pagina ?? '?'}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {cargando && (
              <div className="bg-[#0d1527] border border-[#9fef00]/30 rounded-xl p-3 flex items-center gap-3 text-xs text-[#9fef00]">
                <div className="w-4 h-4 border-2 border-slate-700 border-t-[#9fef00] rounded-full animate-spin shrink-0" />
                <span className="animate-pulse">Consultando pliegos técnicos RIC...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chips de Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-[#050914]/80 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto shrink-0">
            {SUGERENCIAS_INICIALES.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={cargando}
                onMouseEnter={() => sfx.playHover()}
                onClick={() => consultarRIC(chip.query)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-[#0d1527] hover:bg-[#112614] border border-slate-700 hover:border-[#9fef00]/60 text-[10px] text-slate-300 hover:text-[#9fef00] transition cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#0a1424] border-t border-[#9fef00]/30 flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ej.: ¿Requisitos de protección diferencial?"
              disabled={cargando}
              className="flex-1 bg-[#050914] border border-slate-700 focus:border-[#9fef00] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-sans transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={cargando || !pregunta.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#9fef00] hover:bg-[#8cd600] text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {cargando ? '...' : 'ENVIAR'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}