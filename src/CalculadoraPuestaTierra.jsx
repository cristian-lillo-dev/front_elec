import React, { useState, useMemo } from 'react';
import logoImg from './assets/logo_s.png';
import { sfx } from './soundEffects';

/**
 * Matriz de Casos de Prueba QA según Especificación Técnica RICChile
 */
const QA_TEST_CASES = [
  {
    id: 'TC-01',
    label: 'TC-01: TS 14Ω',
    desc: 'TS (Servicio) • 14.0 Ω • CUMPLE (Estándar SEC)',
    tipoTierra: 'TS',
    resistencia: '14.0',
    sensibilidad: 0.03,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  },
  {
    id: 'TC-02',
    label: 'TC-02: TS 45Ω',
    desc: 'TS (Servicio) • 45.0 Ω • NO CUMPLE (Exige <= 20 Ω)',
    tipoTierra: 'TS',
    resistencia: '45.0',
    sensibilidad: 0.03,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  },
  {
    id: 'TC-03',
    label: 'TC-03: TP 15Ω / 30mA',
    desc: 'TP (Protección) • 15.0 Ω • 30 mA • Vf = 0.45 V • CUMPLE (Óptimo)',
    tipoTierra: 'TP',
    resistencia: '15.0',
    sensibilidad: 0.03,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  },
  {
    id: 'TC-04',
    label: 'TC-04: TP 45Ω / 30mA',
    desc: 'TP (Protección) • 45.0 Ω • 30 mA • Vf = 1.35 V • CUMPLE (Normativo RIC N°06)',
    tipoTierra: 'TP',
    resistencia: '45.0',
    sensibilidad: 0.03,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  },
  {
    id: 'TC-05',
    label: 'TC-05: TP 850Ω / 30mA',
    desc: 'TP (Protección) • 850.0 Ω • 30 mA • Vf = 25.50 V • NO CUMPLE',
    tipoTierra: 'TP',
    resistencia: '850.0',
    sensibilidad: 0.03,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  },
  {
    id: 'TC-06',
    label: 'TC-06: TP 100Ω / 300mA',
    desc: 'TP (Protección) • 100.0 Ω • 300 mA • Vf = 30.00 V • NO CUMPLE',
    tipoTierra: 'TP',
    resistencia: '100.0',
    sensibilidad: 0.30,
    instrumento: 'Telurímetro Calibrado (Válido TE1)'
  }
];

const formatNumberCL = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return num.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

function validarPuestaATierra(tipoTierra, resistenciaOhms, sensibilidadDiferencialAmp = 0.03) {
  const LIMITE_TS_OHMS = 20.0;
  const LIMITE_TENSION_CONTACTO_VOLTS = 24.0;

  if (tipoTierra === 'TS') {
    const cumple = resistenciaOhms <= LIMITE_TS_OHMS;
    return {
      cumple,
      categoria: cumple ? 'ESTANDAR' : 'RECHAZO',
      etiquetaVeredicto: cumple ? 'CUMPLE (Estándar SEC)' : 'NO CUMPLE (Exige <= 20 Ω)',
      tituloCorto: cumple ? 'CUMPLE' : 'NO CUMPLE',
      detalle: cumple
        ? `La resistencia medida de Tierra de Servicio (${formatNumberCL(resistenciaOhms)} Ω) cumple estrictamente con el umbral máximo de ${formatNumberCL(LIMITE_TS_OHMS, 1)} Ω exigido por los Pliegos RIC N°01 y N°06 para el aterrizaje del Neutro en el empalme.`
        : `Rechazo SEC: La resistencia medida de Tierra de Servicio (${formatNumberCL(resistenciaOhms)} Ω) supera el límite máximo obligatorio de ${formatNumberCL(LIMITE_TS_OHMS, 1)} Ω para el sistema TN-C-S en el punto de acometida.`,
      recomendacion: cumple
        ? 'Sistema apto para aterrizaje de conductor Neutro en caja de empalme. Verificar continuidad y apriete mecánico de prensas certificadas.'
        : 'Mejorar malla o electrodo de puesta a tierra de servicio mediante electrodos adicionales en paralelo, aumento de profundidad o tratamiento con aditivos químicos reductores de resistividad antes de declarar trámite TE1.',
      tensionContacto: null,
      limiteAplicado: LIMITE_TS_OHMS,
      unidadLimite: 'Ω',
      porcentajeBarra: Math.min((resistenciaOhms / LIMITE_TS_OHMS) * 100, 100)
    };
  }

  const tensionContacto = Number((resistenciaOhms * sensibilidadDiferencialAmp).toFixed(2));
  const cumple = tensionContacto <= LIMITE_TENSION_CONTACTO_VOLTS;
  const esOptimo = cumple && resistenciaOhms <= LIMITE_TS_OHMS;

  let etiquetaVeredicto = 'NO CUMPLE (RECHAZO TE1)';
  let categoria = 'RECHAZO';

  if (esOptimo) {
    etiquetaVeredicto = 'CUMPLE (ÓPTIMO)';
    categoria = 'OPTIMO';
  } else if (cumple) {
    etiquetaVeredicto = 'CUMPLE (NORMATIVO RIC N°06)';
    categoria = 'NORMATIVO';
  }

  const mA = Math.round(sensibilidadDiferencialAmp * 1000);

  return {
    cumple,
    categoria,
    etiquetaVeredicto,
    tituloCorto: cumple ? 'CUMPLE' : 'NO CUMPLE',
    detalle: cumple
      ? esOptimo
        ? `Excelente desempeño: Tensión de contacto calculada de ${formatNumberCL(tensionContacto)} V (<= 24,0 V) y resistencia óhmica <= 20,0 Ω coordinada con interruptor diferencial de ${mA} mA.`
        : `Cumplimiento normativo Pliego RIC N°06: Aunque la resistencia supera los 20 Ω (${formatNumberCL(resistenciaOhms)} Ω), la protección diferencial de ${mA} mA limita la tensión de contacto ante falla a masa a ${formatNumberCL(tensionContacto)} V (<= 24,0 V seguro para recintos húmedos y generales).`
      : `Rechazo TE1: La tensión de contacto resultante (${formatNumberCL(tensionContacto)} V) supera el límite máximo de seguridad de 24,0 V establecido en el Pliego RIC N°06 para una protección diferencial de ${mA} mA.`,
    recomendacion: cumple
      ? 'Sistema de Tierra de Protección coordinado correctamente con el interruptor diferencial del TDA. Asegurar etiquetado verde/amarillo y barra TP independiente.'
      : `Mejorar malla de puesta a tierra mediante electrodos adicionales o aditivos químicos antes de declarar TE1, o bien reducir la sensibilidad del interruptor diferencial (ej. emplear 30 mA / 10 mA según corresponda al circuito) para asegurar Vf <= 24,0 V.`,
    tensionContacto,
    limiteAplicado: LIMITE_TENSION_CONTACTO_VOLTS,
    unidadLimite: 'V',
    porcentajeBarra: Math.min((tensionContacto / LIMITE_TENSION_CONTACTO_VOLTS) * 100, 100)
  };
}

/**
 * Diagrama Esquemático TDA (TN-C-S) adaptado a paleta HUD AreaElectrica
 */
const DiagramaUnilinealTDA = ({ tipoTierra, cumple }) => {
  return (
    <div className="bg-[#050914] border border-[#9fef00]/30 rounded-2xl p-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#ffb800] text-sm">⚡</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Esquema Unilineal de Separación TS / TP en TDA (TN-C-S)
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#261f0c] text-[#ffb800] border border-[#ffb800]/40 font-bold">
          SEC RIC N°01 & N°06
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 720 230"
          className="w-full h-auto min-w-[560px] select-none"
          role="img"
          aria-label="Diagrama esquemático de separación entre Tierra de Servicio (TS) y Tierra de Protección (TP) en el Tablero de Distribución de Alumbrado"
        >
          <defs>
            <pattern id="hudGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9fef00" strokeOpacity="0.08" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="720" height="230" rx="8" fill="#050914" />
          <rect width="720" height="230" rx="8" fill="url(#hudGrid)" />

          {/* Zona 1: Empalme / Acometida */}
          <rect
            x="16"
            y="22"
            width="205"
            height="186"
            rx="8"
            fill="#0a1120"
            stroke={tipoTierra === 'TS' ? '#ffb800' : '#1e293b'}
            strokeWidth={tipoTierra === 'TS' ? '2' : '1.2'}
            strokeDasharray={tipoTierra === 'TS' ? 'none' : '4 2'}
          />
          <text x="28" y="42" fill="#9fef00" fontSize="10" fontWeight="bold" fontFamily="monospace">
            1. CAJA EMPALME / ACOMETIDA
          </text>

          {/* Línea Fase L */}
          <line x1="30" y1="70" x2="221" y2="70" stroke="#ef4444" strokeWidth="2.5" />
          <text x="32" y="63" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace">
            Fase (L)
          </text>

          {/* Línea Neutro N en Empalme */}
          <line x1="30" y1="115" x2="221" y2="115" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="32" y="108" fill="#7dd3fc" fontSize="10" fontWeight="bold" fontFamily="monospace">
            Neutro (N)
          </text>

          {/* Bajada a Tierra de Servicio (TS) */}
          <circle cx="120" cy="115" r="4.5" fill="#38bdf8" />
          <line x1="120" y1="115" x2="120" y2="165" stroke="#38bdf8" strokeWidth="2" />
          <line x1="104" y1="165" x2="136" y2="165" stroke="#38bdf8" strokeWidth="2.5" />
          <line x1="109" y1="171" x2="131" y2="171" stroke="#38bdf8" strokeWidth="2" />
          <line x1="114" y1="177" x2="126" y2="177" stroke="#38bdf8" strokeWidth="2" />

          <rect
            x="40"
            y="183"
            width="160"
            height="19"
            rx="4"
            fill={tipoTierra === 'TS' ? (cumple ? '#112614' : '#450a0a') : '#0d1527'}
            stroke={tipoTierra === 'TS' ? (cumple ? '#9fef00' : '#ef4444') : '#334155'}
            strokeWidth="1"
          />
          <text
            x="120"
            y="196"
            textAnchor="middle"
            fill={tipoTierra === 'TS' ? (cumple ? '#9fef00' : '#fca5a5') : '#cbd5e1'}
            fontSize="9.5"
            fontWeight="bold"
            fontFamily="monospace"
          >
            TS: Tierra Servicio (≤20Ω)
          </text>

          {/* Zona 2: TDA */}
          <rect
            x="255"
            y="16"
            width="448"
            height="198"
            rx="10"
            fill="#0a1120"
            stroke={tipoTierra === 'TP' ? '#ffb800' : '#1e293b'}
            strokeWidth={tipoTierra === 'TP' ? '2' : '1.5'}
          />
          <text x="272" y="36" fill="#f8fafc" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
            2. INTERIOR TABLERO DE DISTRIBUCIÓN (TDA) - AISLADOS
          </text>

          <line x1="221" y1="70" x2="310" y2="70" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="221" y1="115" x2="310" y2="115" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Bloque Interruptor Diferencial */}
          <rect x="310" y="52" width="108" height="80" rx="6" fill="#0d1527" stroke="#ffb800" strokeWidth="1.8" />
          <text x="364" y="75" textAnchor="middle" fill="#ffb800" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
            INTERRUPTOR
          </text>
          <text x="364" y="88" textAnchor="middle" fill="#ffb800" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
            DIFERENCIAL
          </text>
          <text x="364" y="105" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            IΔn (10/30/300mA)
          </text>
          <text x="364" y="121" textAnchor="middle" fill="#9fef00" fontSize="9" fontWeight="bold" fontFamily="monospace">
            Vf ≤ 24,0 V
          </text>

          {/* Salida Diferencial */}
          <line x1="418" y1="70" x2="540" y2="70" stroke="#ef4444" strokeWidth="2.5" />
          <text x="480" y="62" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">
            A Circuitos / Cargas
          </text>

          <line x1="418" y1="115" x2="485" y2="115" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="485" y="103" width="96" height="24" rx="4" fill="#0284c7" />
          <text x="533" y="119" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
            BARRA NEUTRO (N)
          </text>

          {/* Prohibición Puente N - TP */}
          <line x1="533" y1="127" x2="533" y2="165" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="533" cy="146" r="11" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
          <line x1="527" y1="140" x2="539" y2="152" stroke="#ffffff" strokeWidth="2.2" />
          <line x1="539" y1="140" x2="527" y2="152" stroke="#ffffff" strokeWidth="2.2" />
          <rect x="550" y="136" width="142" height="20" rx="4" fill="#450a0a" stroke="#ef4444" strokeWidth="1" />
          <text x="621" y="149" textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
            PROHIBIDO PUENTE N-TP
          </text>

          {/* Barra Tierra de Protección (TP) */}
          <rect x="485" y="165" width="96" height="24" rx="4" fill="#15803d" />
          <text x="533" y="181" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
            BARRA TIERRA (TP)
          </text>

          <line x1="581" y1="177" x2="685" y2="177" stroke="#9fef00" strokeWidth="2.5" />
          <text x="634" y="170" textAnchor="middle" fill="#9fef00" fontSize="8.5" fontFamily="monospace">
            Carcasas / Enchufes
          </text>

          <line x1="485" y1="177" x2="345" y2="177" stroke="#9fef00" strokeWidth="2.5" />
          <line x1="345" y1="177" x2="345" y2="191" stroke="#9fef00" strokeWidth="2.5" />
          <line x1="331" y1="191" x2="359" y2="191" stroke="#9fef00" strokeWidth="2.5" />
          <line x1="336" y1="196" x2="354" y2="196" stroke="#9fef00" strokeWidth="2" />
          <line x1="341" y1="201" x2="349" y2="201" stroke="#9fef00" strokeWidth="2" />

          <rect
            x="368"
            y="187"
            width="112"
            height="19"
            rx="4"
            fill={tipoTierra === 'TP' ? (cumple ? '#112614' : '#450a0a') : '#0d1527'}
            stroke={tipoTierra === 'TP' ? (cumple ? '#9fef00' : '#ef4444') : '#334155'}
            strokeWidth="1"
          />
          <text
            x="424"
            y="200"
            textAnchor="middle"
            fill={tipoTierra === 'TP' ? (cumple ? '#9fef00' : '#fca5a5') : '#9fef00'}
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            Malla TP (Vf≤24V)
          </text>
        </svg>
      </div>
    </div>
  );
};

export default function CalculadoraPuestaTierra({ user, nombreUsuario, onVolver, onLogout }) {
  const [tipoTierra, setTipoTierra] = useState('TP');
  const [resistenciaInput, setResistenciaInput] = useState('45.0');
  const [sensibilidadDiferencial, setSensibilidadDiferencial] = useState(0.03);
  const [instrumentoMedicion, setInstrumentoMedicion] = useState('Telurímetro Calibrado (Válido TE1)');
  const [activeTestId, setActiveTestId] = useState('TC-04');
  const [copiado, setCopiado] = useState(false);
  const [sonidoMuteado, setSonidoMuteado] = useState(sfx.isMuted());

  const handleToggleMute = () => {
    const nuevoEstado = sfx.toggleMute();
    setSonidoMuteado(nuevoEstado);
  };

  const validacionInput = useMemo(() => {
    const normalized = String(resistenciaInput).replace(',', '.').trim();
    if (normalized === '') {
      return {
        valido: false,
        valor: null,
        error: 'Ingrese el valor de resistencia medida en terreno (Ω).'
      };
    }
    const num = Number(normalized);
    if (isNaN(num)) {
      return {
        valido: false,
        valor: null,
        error: 'El valor ingresado debe ser un número decimal válido.'
      };
    }
    if (num <= 0.01 || num > 5000.0) {
      return {
        valido: false,
        valor: num,
        error: 'Rango normativo permitido: mayor a 0,01 Ω y hasta 5.000,00 Ω.'
      };
    }
    return {
      valido: true,
      valor: num,
      error: null
    };
  }, [resistenciaInput]);

  const resultado = useMemo(() => {
    if (!validacionInput.valido) return null;
    return validarPuestaATierra(tipoTierra, validacionInput.valor, sensibilidadDiferencial);
  }, [tipoTierra, validacionInput, sensibilidadDiferencial]);

  const handleLoadTestCase = (tc) => {
    sfx.playClick();
    setTipoTierra(tc.tipoTierra);
    setResistenciaInput(tc.resistencia);
    setSensibilidadDiferencial(tc.sensibilidad);
    setInstrumentoMedicion(tc.instrumento);
    setActiveTestId(tc.id);
  };

  const handleTipoTierraChange = (nuevoTipo) => {
    sfx.playClick();
    setTipoTierra(nuevoTipo);
    setActiveTestId(null);
  };

  const handleResistenciaChange = (e) => {
    setResistenciaInput(e.target.value);
    setActiveTestId(null);
  };

  const handleSensibilidadChange = (e) => {
    sfx.playClick();
    setSensibilidadDiferencial(Number(e.target.value));
    setActiveTestId(null);
  };

  const esInstrumentoOficial = instrumentoMedicion === 'Telurímetro Calibrado (Válido TE1)';

  const generarTextoReporteTE1 = () => {
    if (!resultado || !validacionInput.valido) return '';
    const fecha = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const lineas = [
      '====================================================================',
      'REPORTE TÉCNICO DE VERIFICACIÓN DE PUESTA A TIERRA - TRÁMITE TE1',
      'AreaElectrica HUD • Módulo Diseñador de TDA • SEC Chile (RIC N°01 y N°06)',
      '====================================================================',
      `Instalador / Operador      : ${nombreUsuario || 'Operador SEC'}`,
      `Fecha y Hora de Evaluación : ${fecha}`,
      `Sistema Evaluado           : ${
        tipoTierra === 'TS'
          ? 'Tierra de Servicio (TS) - Aterrizaje Neutro en Empalme (TN-C-S)'
          : 'Tierra de Protección (TP) - Carcasas y Enchufes en TDA'
      }`,
      `Resistencia Medida (R)     : ${formatNumberCL(validacionInput.valor)} Ω`,
      tipoTierra === 'TP'
        ? `Sensibilidad Diferencial   : ${sensibilidadDiferencial.toFixed(2)} A (${Math.round(
            sensibilidadDiferencial * 1000
          )} mA)`
        : 'Umbral Normativo Fijo      : <= 20,00 Ω (SEC RIC N°01 / N°06)',
      tipoTierra === 'TP'
        ? `Tensión de Contacto (Vf)   : ${formatNumberCL(resultado.tensionContacto)} V (Límite Máximo Seguro: 24,0 V)`
        : null,
      `Instrumento de Medición    : ${instrumentoMedicion}`,
      `Validez Documental TE1     : ${
        esInstrumentoOficial
          ? 'APTO PARA DECLARACIÓN OFICIAL SEC (Certificado de calibración vigente requerido)'
          : 'SOLO REFERENCIAL / DIAGNÓSTICO INTERNO (Requiere medición con Telurímetro Calibrado para TE1)'
      }`,
      '--------------------------------------------------------------------',
      `VEREDICTO NORMATIVO        : ${resultado.etiquetaVeredicto}`,
      `ANÁLISIS TÉCNICO           : ${resultado.detalle}`,
      `ACCIÓN / RECOMENDACIÓN     : ${resultado.recomendacion}`,
      '--------------------------------------------------------------------',
      'ADVERTENCIA DE SEGURIDAD NORMATIVA (SEC RIC N°01 / N°06):',
      'El conductor Neutro (aterrizado en la Tierra de Servicio TS del empalme) y el conductor de Tierra de Protección (TP) deben viajar estrictamente aislados y separados entre sí hacia el interior del TDA. Queda PROHIBIDO realizar puentes o uniones físicas entre la barra de Neutro (N) y la barra de Tierra de Protección (TP) dentro del tablero de distribución, ya que anula la operación de los interruptores diferenciales y energiza las carcasas metálicas ante fallas de neutro.',
      '===================================================================='
    ].filter(Boolean);

    return lineas.join('\n');
  };

  const handleCopiarReporte = async () => {
    const texto = generarTextoReporteTE1();
    if (!texto) return;
    sfx.playClick();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleImprimirReporte = () => {
    sfx.playClick();
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-mono flex flex-col justify-between selection:bg-[#9fef00] selection:text-slate-950 relative overflow-x-hidden">
      {/* Grid Técnico de Fondo Verde Hacker / Oscuro */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#9fef0008_1px,transparent_1px),linear-gradient(to_bottom,#9fef0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none no-print" />

      {/* Estilos específicos para impresión limpia del Reporte TE1 */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Header Estilo HUD coherente con Dashboard.jsx */}
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-b border-[#9fef00]/30 shadow-[0_0_20px_rgba(159,239,0,0.1)] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onMouseEnter={() => sfx.playHover()}
              onClick={() => {
                sfx.playClick();
                onVolver();
              }}
              className="px-3 py-2 rounded-xl bg-[#0d1527] hover:bg-[#112614] border border-[#9fef00]/40 text-[#9fef00] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <span>⬅</span>
              <span>PANEL HUD</span>
            </button>

            <div className="hidden sm:flex items-center space-x-3 min-w-0 pl-2 border-l border-slate-800">
              <img
                src={logoImg}
                alt="AreaElectrica Logo"
                className="w-9 h-9 object-contain rounded-xl border border-[#9fef00]/40 shadow-[0_0_12px_rgba(159,239,0,0.2)] shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-wider text-white uppercase truncate">
                  AREA<span className="text-[#9fef00]">ELECTRICA</span>{' '}
                  <span className="text-[#ffb800] text-[10px]">RIC N°01 / N°06</span>
                </span>
                <span className="text-[9px] text-slate-400 tracking-widest">
                  VALIDADOR PUESTA A TIERRA (TS / TP)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleToggleMute}
              title={sonidoMuteado ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido'}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                sonidoMuteado
                  ? 'bg-[#0d1527] border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-[#112614] border-[#9fef00]/40 text-[#9fef00]'
              }`}
            >
              <span>{sonidoMuteado ? '🔇' : '🔊'}</span>
              <span className="text-[10px] hidden sm:inline">{sonidoMuteado ? 'MUTE' : 'SFX'}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onMouseEnter={() => sfx.playHover()}
                onClick={() => {
                  sfx.playClick();
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                SALIR
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-6 flex-1 relative z-10">
        {/* Banner Superior Estilo HUD */}
        <div className="bg-gradient-to-r from-[#0a1424] to-[#050a14] border border-[#9fef00]/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(159,239,0,0.08)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden print-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9fef00]/5 rounded-full blur-3xl pointer-events-none no-print" />

          <div className="space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#112614] text-[#9fef00] border border-[#9fef00]/50 uppercase tracking-widest">
                MÓDULO TDA • PLIEGOS SEC RIC N°01 & N°06
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#261f0c] text-[#ffb800] border border-[#ffb800]/40 uppercase tracking-widest">
                REPORTE TE1
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight print-text-dark">
              VALIDADOR DE <span className="text-[#9fef00]">PUESTA A TIERRA</span> (TS / TP)
            </h1>
            <p className="text-slate-300 text-xs font-sans max-w-2xl print-text-dark">
              Evaluación normativa de resistencia óhmica para Tierra de Servicio (≤ 20 Ω) y cálculo de Tensión de Contacto Vf para Tierra de Protección (≤ 24 V) en tableros TDA.
            </p>
          </div>

          <div className="bg-[#050914] border border-[#ffb800]/40 px-4 py-3 rounded-xl text-left md:text-right z-10 shrink-0 w-full md:w-auto no-print">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest">OPERADOR ACTIVO</p>
            <p className="text-xs font-black text-[#ffb800] uppercase">
              {nombreUsuario || user?.username || 'OPERADOR SEC'}
            </p>
          </div>
        </div>

        {/* Barra Rápida de Casos de Prueba QA (TC-01 a TC-06) */}
        <section className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-4 shadow-xl no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[#ffb800] text-xs">▶</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                MATRIZ DE SIMULACIÓN QA (CASOS NORMATIVOS SEC)
              </h2>
            </div>
            <span className="text-[10px] text-[#9fef00] uppercase tracking-wider">
              CLIC PARA CARGAR ESCENARIO DE PRUEBA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {QA_TEST_CASES.map((tc) => {
              const isSelected = activeTestId === tc.id;
              const isPassCase = tc.id === 'TC-01' || tc.id === 'TC-03' || tc.id === 'TC-04';
              return (
                <button
                  key={tc.id}
                  type="button"
                  onMouseEnter={() => sfx.playHover()}
                  onClick={() => handleLoadTestCase(tc)}
                  title={tc.desc}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#112614] border-[#9fef00] text-white shadow-[0_0_15px_rgba(159,239,0,0.15)]'
                      : 'bg-[#050914] border-slate-800 text-slate-300 hover:border-[#ffb800]/60 hover:bg-[#0d162c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-black text-[#ffb800]">{tc.id}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPassCase
                          ? 'bg-[#9fef00] shadow-[0_0_6px_#9fef00]'
                          : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold leading-tight block">
                    {tc.label.replace(`${tc.id}: `, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Contenedor Principal: Parámetros (Izquierda) + Resultados (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: Parámetros de Entrada en Terreno */}
          <section className="lg:col-span-5 bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 no-print">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <span className="text-[#9fef00] text-lg">⚙</span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  PARÁMETROS DE MEDICIÓN
                </h2>
                <p className="text-[11px] text-slate-400 font-sans">
                  Ingrese los valores obtenidos en terreno para validación
                </p>
              </div>
            </div>

            {/* 1. Selector Tipo de Tierra (TS vs TP) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Sistema de Puesta a Tierra <span className="text-[#ffb800]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TS */}
                <button
                  type="button"
                  onMouseEnter={() => sfx.playHover()}
                  onClick={() => handleTipoTierraChange('TS')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    tipoTierra === 'TS'
                      ? 'bg-[#0b1d2e] border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                      : 'bg-[#050914] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded bg-sky-500/20 text-sky-300 border border-sky-400/40">
                      TS • SERVICIO
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tipoTierra === 'TS' ? 'border-sky-400' : 'border-slate-600'
                      }`}
                    >
                      {tipoTierra === 'TS' && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                  </div>
                  <div className="font-bold text-xs text-white uppercase">Tierra de Servicio</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">
                    Neutro en empalme (TN-C-S). Umbral fijo ≤ 20,0 Ω.
                  </p>
                </button>

                {/* TP */}
                <button
                  type="button"
                  onMouseEnter={() => sfx.playHover()}
                  onClick={() => handleTipoTierraChange('TP')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    tipoTierra === 'TP'
                      ? 'bg-[#112614] border-[#9fef00] shadow-[0_0_15px_rgba(159,239,0,0.15)]'
                      : 'bg-[#050914] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded bg-[#9fef00]/15 text-[#9fef00] border border-[#9fef00]/40">
                      TP • PROTECCIÓN
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tipoTierra === 'TP' ? 'border-[#9fef00]' : 'border-slate-600'
                      }`}
                    >
                      {tipoTierra === 'TP' && (
                        <div className="w-2 h-2 rounded-full bg-[#9fef00]" />
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-xs text-white uppercase">Tierra de Protección</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug font-sans">
                    Carcasas y enchufes TDA. Evalúa Vf ≤ 24,0 V.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Input Resistencia Medida */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="resistencia_medida"
                  className="block text-xs font-bold text-slate-200 uppercase tracking-wider"
                >
                  2. Resistencia Medida <span className="text-[#ffb800]">*</span>
                </label>
                <span className="text-[10px] text-slate-400">0,02 – 5.000,00 Ω</span>
              </div>

              <div className="relative">
                <input
                  id="resistencia_medida"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.02"
                  max="5000"
                  value={resistenciaInput}
                  onChange={handleResistenciaChange}
                  placeholder="Ej: 45.0"
                  className={`w-full bg-[#050914] border-2 rounded-xl px-4 py-3 pr-14 text-lg font-black text-white placeholder-slate-600 focus:outline-none transition-colors ${
                    validacionInput.valido
                      ? 'border-slate-700 focus:border-[#9fef00]'
                      : 'border-rose-500 focus:border-rose-400'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-sm font-black text-[#ffb800] bg-[#0d1527] px-2.5 py-1 rounded-lg border border-[#ffb800]/40">
                    Ω
                  </span>
                </div>
              </div>

              {!validacionInput.valido ? (
                <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mt-1 font-sans">
                  <span>⚠️</span>
                  <span>{validacionInput.error}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                  <span className="text-[#9fef00]">⚡</span>
                  <span>
                    {tipoTierra === 'TS'
                      ? 'Comparación directa contra límite máximo SEC de 20,0 Ω.'
                      : 'Multiplicación por sensibilidad diferencial para obtener Vf.'}
                  </span>
                </p>
              )}
            </div>

            {/* 3. Sensibilidad Diferencial (Solo TP) */}
            {tipoTierra === 'TP' && (
              <div className="space-y-2 p-4 rounded-xl bg-[#050914] border border-[#9fef00]/30">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="sensibilidad_diferencial"
                    className="block text-xs font-bold text-[#9fef00] uppercase tracking-wider"
                  >
                    3. Sensibilidad Diferencial (IΔn) <span className="text-[#ffb800]">*</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#112614] text-[#9fef00] border border-[#9fef00]/40 font-bold">
                    OBLIGATORIO TP
                  </span>
                </div>

                <select
                  id="sensibilidad_diferencial"
                  value={sensibilidadDiferencial}
                  onChange={handleSensibilidadChange}
                  className="w-full bg-[#0a1120] border border-slate-700 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#9fef00] cursor-pointer"
                >
                  <option value={0.01}>0.01 A (10 mA) — Alta sensibilidad / Recintos especiales</option>
                  <option value={0.03}>0.03 A (30 mA) — Estándar domiciliario y enchufes [Default]</option>
                  <option value={0.30}>0.30 A (300 mA) — Protección general / Cabecera</option>
                </select>

                <p className="text-[11px] text-slate-400 font-sans">
                  Fórmula RIC N°06:{' '}
                  <span className="font-mono text-[#ffb800] font-bold">
                    Vf = R (Ω) × {sensibilidadDiferencial.toFixed(2)} A ≤ 24,0 V
                  </span>
                </p>
              </div>
            )}

            {/* 4. Instrumento de Medición */}
            <div className="space-y-2">
              <label
                htmlFor="instrumento_medicion"
                className="block text-xs font-bold text-slate-200 uppercase tracking-wider"
              >
                {tipoTierra === 'TP' ? '4.' : '3.'} Instrumento de Medición
              </label>

              <select
                id="instrumento_medicion"
                value={instrumentoMedicion}
                onChange={(e) => {
                  sfx.playClick();
                  setInstrumentoMedicion(e.target.value);
                }}
                className="w-full bg-[#050914] border border-slate-700 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#ffb800] cursor-pointer"
              >
                <option value="Telurímetro Calibrado (Válido TE1)">
                  Telurímetro Calibrado (Válido TE1)
                </option>
                <option value="Medidor de Bucle / Referencial">
                  Medidor de Bucle / Referencial
                </option>
              </select>

              <div
                className={`text-[11px] p-3 rounded-xl border flex items-start gap-2 font-sans ${
                  esInstrumentoOficial
                    ? 'bg-[#112614]/70 border-[#9fef00]/40 text-[#9fef00]'
                    : 'bg-[#261f0c]/70 border-[#ffb800]/40 text-[#ffb800]'
                }`}
              >
                <span className="shrink-0">{esInstrumentoOficial ? '✔' : 'ℹ'}</span>
                <span>
                  {esInstrumentoOficial
                    ? 'Apto para respaldo documental en declaración oficial SEC (Trámite TE1). Adjuntar certificado de calibración vigente.'
                    : 'Medición referencial de diagnóstico. Para declaración oficial TE1 ante la SEC se exige medición con Telurímetro calibrado.'}
                </span>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA: Tarjeta de Resultados Normativos + Diagrama */}
          <section className="lg:col-span-7 space-y-6">
            {!validacionInput.valido || !resultado ? (
              <div className="bg-[#0a1120] border border-[#ffb800]/40 rounded-2xl p-8 text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#261f0c] border border-[#ffb800]/40 text-[#ffb800] flex items-center justify-center mx-auto text-2xl">
                  ⚠️
                </div>
                <h3 className="text-base font-black text-white uppercase">
                  ESPERANDO VALOR DE RESISTENCIA VÁLIDO
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                  Ingrese un valor óhmico mayor a 0,01 Ω y hasta 5.000,00 Ω para ejecutar el motor de validación normativa SEC (Pliegos RIC N°01 y N°06).
                </p>
              </div>
            ) : (
              <div className="bg-[#0a1120] border border-[#9fef00]/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 print-card">
                {/* Cabecera de Resultados + Acciones TE1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#ffb800] text-lg">📋</span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-white uppercase print-text-dark">
                        DICTAMEN NORMATIVO TDA
                      </h2>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Evaluación automática Pliegos SEC RIC N°01 y N°06
                      </p>
                    </div>
                  </div>

                  {/* Botones de Exportación / Impresión TE1 */}
                  <div className="flex items-center gap-2 no-print">
                    <button
                      type="button"
                      onMouseEnter={() => sfx.playHover()}
                      onClick={handleCopiarReporte}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-[#0d162c] hover:bg-[#112614] text-[#9fef00] border border-[#9fef00]/40 transition-colors cursor-pointer uppercase"
                    >
                      <span>{copiado ? '✔' : '📄'}</span>
                      <span>{copiado ? 'COPIADO TE1' : 'COPIAR TE1'}</span>
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => sfx.playHover()}
                      onClick={handleImprimirReporte}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black bg-[#ffb800] hover:bg-[#e0a100] text-slate-950 transition-colors cursor-pointer shadow-md uppercase"
                    >
                      <span>🖨</span>
                      <span>IMPRIMIR / PDF</span>
                    </button>
                  </div>
                </div>

                {/* 1. SELLO DE VEREDICTO DINÁMICO DE ALTO CONTRASTE */}
                <div
                  className={`rounded-2xl p-5 border-2 transition-all ${
                    resultado.cumple
                      ? 'bg-[#112614]/80 border-[#9fef00] shadow-[0_0_25px_rgba(159,239,0,0.12)]'
                      : 'bg-rose-950/60 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl font-black ${
                        resultado.cumple
                          ? 'bg-[#9fef00] text-slate-950'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {resultado.cumple ? '✔' : '✖'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            resultado.cumple
                              ? 'bg-[#9fef00] text-slate-950'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {resultado.etiquetaVeredicto}
                        </span>
                        {resultado.categoria === 'OPTIMO' && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#261f0c] text-[#ffb800] border border-[#ffb800]/50">
                            ★ RESISTENCIA ≤ 20 Ω + Vf ≤ 24 V
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-100 mt-2.5 leading-relaxed font-sans print-text-dark">
                        {resultado.detalle}
                      </p>
                    </div>
                  </div>

                  {/* Recomendación Accionable */}
                  <div
                    className={`mt-4 pt-3.5 border-t flex items-start gap-2.5 text-xs font-sans ${
                      resultado.cumple
                        ? 'border-[#9fef00]/30 text-slate-200'
                        : 'border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <span className="shrink-0 text-[#ffb800]">🔧</span>
                    <div>
                      <strong className="font-mono uppercase tracking-wide text-[#ffb800]">
                        {resultado.cumple ? 'DIRECTRIZ TÉCNICA: ' : 'ACCIÓN CORRECTIVA: '}
                      </strong>
                      <span>{resultado.recomendacion}</span>
                    </div>
                  </div>
                </div>

                {/* 2. INDICADOR VISUAL DE TENSIÓN DE CONTACTO (TP) O RESISTENCIA LÍMITE (TS) */}
                {tipoTierra === 'TP' ? (
                  <div className="bg-[#050914] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          TENSIÓN DE CONTACTO RESULTANTE (RIC N°06)
                        </span>
                        <div className="text-sm sm:text-base font-black text-white mt-0.5">
                          Vf Calculada:{' '}
                          <span
                            className={
                              resultado.cumple ? 'text-[#9fef00]' : 'text-rose-400'
                            }
                          >
                            {formatNumberCL(resultado.tensionContacto)} V
                          </span>{' '}
                          <span className="text-slate-400 font-normal text-xs">
                            / Límite Máximo Seguro: 24,0 V
                          </span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-[#0a1120] border border-[#ffb800]/30 text-xs text-slate-300 self-start">
                        Vf = {formatNumberCL(validacionInput.valor)} Ω ×{' '}
                        {sensibilidadDiferencial.toFixed(2)} A ={' '}
                        <strong className="text-[#ffb800]">
                          {formatNumberCL(resultado.tensionContacto)} V
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-3.5 bg-[#0a1120] rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            resultado.cumple
                              ? resultado.tensionContacto > 18
                                ? 'bg-[#ffb800]'
                                : 'bg-[#9fef00]'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${resultado.porcentajeBarra}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0,0 V</span>
                        <span className="text-[#ffb800] font-bold">
                          LÍMITE RECINTOS HÚMEDOS: 24,0 V
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#050914] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          UMBRAL ÓHMICO TIERRA DE SERVICIO (RIC N°01 / N°06)
                        </span>
                        <div className="text-sm sm:text-base font-black text-white mt-0.5">
                          Resistencia Medida:{' '}
                          <span
                            className={
                              resultado.cumple ? 'text-[#9fef00]' : 'text-rose-400'
                            }
                          >
                            {formatNumberCL(validacionInput.valor)} Ω
                          </span>{' '}
                          <span className="text-slate-400 font-normal text-xs">
                            / Límite Máximo SEC: 20,0 Ω
                          </span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-[#0a1120] border border-sky-400/30 text-xs text-slate-300 self-start">
                        {formatNumberCL(validacionInput.valor)} Ω{' '}
                        {resultado.cumple ? '≤' : '>'} 20,00 Ω
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-3.5 bg-[#0a1120] rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            resultado.cumple ? 'bg-[#9fef00]' : 'bg-rose-500'
                          }`}
                          style={{ width: `${resultado.porcentajeBarra}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0,0 Ω</span>
                        <span className="text-sky-400 font-bold">
                          UMBRAL ATERRIZAJE NEUTRO (TS): 20,0 Ω
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. RESUMEN DE PARÁMETROS EVALUADOS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#050914] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      SISTEMA EVALUADO
                    </span>
                    <span className="text-xs font-black text-white mt-1 block">
                      {tipoTierra === 'TS' ? 'TS — Tierra de Servicio' : 'TP — Tierra de Protección'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
                      {tipoTierra === 'TS' ? 'Esquema TN-C-S Empalme' : 'Carcasas y Circuitos TDA'}
                    </span>
                  </div>

                  <div className="bg-[#050914] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      RESISTENCIA MEDIDA
                    </span>
                    <span className="text-sm font-black text-[#ffb800] mt-1 block">
                      {formatNumberCL(validacionInput.valor)} Ω
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
                      Valor ingresado en terreno
                    </span>
                  </div>

                  <div className="bg-[#050914] border border-slate-800 rounded-xl p-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      {tipoTierra === 'TP' ? 'DIFERENCIAL TDA' : 'CRITERIO APLICADO'}
                    </span>
                    <span className="text-xs font-black text-[#9fef00] mt-1 block">
                      {tipoTierra === 'TP'
                        ? `${Math.round(sensibilidadDiferencial * 1000)} mA (${sensibilidadDiferencial.toFixed(2)} A)`
                        : 'Umbral Fijo ≤ 20,0 Ω'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">
                      {tipoTierra === 'TP' ? 'Protección falla a masa' : 'Pliego RIC N°01 / N°06'}
                    </span>
                  </div>
                </div>

                {/* Nota al pie de Instrumento */}
                <div className="bg-[#050914] border border-slate-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-sans">
                    <span className={esInstrumentoOficial ? 'text-[#9fef00]' : 'text-[#ffb800]'}>
                      {esInstrumentoOficial ? '✔' : '⚠'}
                    </span>
                    <span>
                      <strong className="font-mono text-white">Instrumento:</strong> {instrumentoMedicion}
                    </span>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded uppercase self-start sm:self-center ${
                      esInstrumentoOficial
                        ? 'bg-[#112614] text-[#9fef00] border border-[#9fef00]/40'
                        : 'bg-[#261f0c] text-[#ffb800] border border-[#ffb800]/40'
                    }`}
                  >
                    {esInstrumentoOficial ? 'VÁLIDO TRÁMITE TE1' : 'SOLO REFERENCIAL'}
                  </span>
                </div>

                {/* 4. DIAGRAMA UNILINEAL ESQUEMÁTICO TDA */}
                <DiagramaUnilinealTDA tipoTierra={tipoTierra} cumple={resultado.cumple} />
              </div>
            )}
          </section>
        </div>

        {/* 5. ALERTA TÉCNICA DE ARQUITECTURA DEL TABLERO (TEXTO FIJO OBLIGATORIO PERMANENTE) */}
        <section
          aria-label="Advertencia de Seguridad Normativa SEC RIC N°01 y N°06"
          className="bg-[#261f0c]/70 border-2 border-[#ffb800] rounded-2xl p-5 shadow-[0_0_20px_rgba(255,184,0,0.12)] print-card"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffb800] text-slate-950 shrink-0 flex items-center justify-center text-lg font-black">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#ffb800] print-text-dark">
                ⚠️ ADVERTENCIA DE SEGURIDAD NORMATIVA (SEC RIC N°01 / N°06)
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans print-text-dark">
                El conductor Neutro (aterrizado en la Tierra de Servicio TS del empalme) y el
                conductor de Tierra de Protección (TP) deben viajar estrictamente aislados y
                separados entre sí hacia el interior del TDA. Queda{' '}
                <strong className="underline decoration-[#ffb800] font-extrabold text-white print-text-dark">
                  PROHIBIDO realizar puentes o uniones físicas entre la barra de Neutro (N) y la
                  barra de Tierra de Protección (TP)
                </strong>{' '}
                dentro del tablero de distribución, ya que anula la operación de los interruptores
                diferenciales y energiza las carcasas metálicas ante fallas de neutro.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#050914] border-t border-[#9fef00]/30 py-4 px-4 sm:px-6 text-center text-[10px] text-slate-400 z-10 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-7xl mx-auto w-full no-print">
        <span className="text-[#9fef00] font-bold">NORMATIVA SEC VIGENTE • RIC N°01 / N°06</span>
        <span>AreaElectrica & Tiuque-Tec • Formación que ilumina</span>
        <span>MÓDULO TDA EN LÍNEA</span>
      </footer>
    </div>
  );
}