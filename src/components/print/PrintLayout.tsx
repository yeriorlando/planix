import React from 'react';
import PrintLayoutPrimaria from './PrintLayoutPrimaria';
import PrintLayoutSecundaria from './PrintLayoutSecundaria';
import PrintLayoutTaller from './PrintLayoutTaller';


interface PrintLayoutProps {
  formData: any;
  formType: 'CON_BASE' | 'CURRICULAR';
  subjectName: string;
  sequenceTitle?: string;
  blockTitle?: string | number;
  orientation?: 'portrait' | 'landscape';
  planningType?: 'DIARIA' | 'UNIDAD' | string;
  textScale?: 'small' | 'normal' | 'large' | 'xlarge';
}

export default function PrintLayout({
  formData,
  formType,
  subjectName,
  sequenceTitle,
  blockTitle,
  orientation = 'landscape',
  planningType = 'DIARIA',
  textScale = 'normal'
}: PrintLayoutProps) {
  const currentDate = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return currentDate;
    const cleaned = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      const [year, month, day] = cleaned.split('-');
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    }
    return cleaned;
  };

  const grade = (formData?.grado || '').toLowerCase();
  
  // Determinamos si es Primaria o Secundaria
  const isSecundaria = grade.includes('secundaria') || grade.includes('sec');
  const isConBase = formType === 'CON_BASE';
  const isUnit = planningType === 'UNIDAD' || formData?.planningType === 'UNIDAD';
  const isUpperPrimary = (grade.includes('4') || grade.includes('5') || grade.includes('6') || 
                         grade.includes('cuarto') || grade.includes('quinto') || grade.includes('sexto')) && !isSecundaria;
  const isMatOrLengua = (() => {
    const combined = `${subjectName || ''} ${formData?.area || ''} ${formData?.asignatura || ''}`.toLowerCase();
    if (combined.includes('extranjera') || combined.includes('inglés') || combined.includes('ingles') || combined.includes('francés') || combined.includes('frances')) {
      return false;
    }
    return combined.includes('matemática') || combined.includes('matematica') || combined.includes('lengua');
  })();

  let titleSuffix = isConBase ? 'PLANIFICACIÓN CON BASE' : 'PLANIFICACIÓN CURRICULAR';
  if (isUpperPrimary && isMatOrLengua) {
    titleSuffix = 'SECUENCIAS DIDÁCTICAS';
  }
  if (formData?.isTaller || planningType === 'TALLER') {
    titleSuffix = 'TALLER PEDAGÓGICO';
  }

  let displayGrade = formData?.grado || '---';
  const normGrade = (formData?.grado || '').toLowerCase();
  if (!isSecundaria) {
    if (normGrade.includes('1') || normGrade.includes('primer') || normGrade.includes('1er') || normGrade.includes('1ro')) {
      displayGrade = '1ro. (Primaria)';
    } else if (normGrade.includes('2') || normGrade.includes('segund') || normGrade.includes('2do')) {
      displayGrade = '2do. (Primaria)';
    } else if (normGrade.includes('3') || normGrade.includes('tercer') || normGrade.includes('3er') || normGrade.includes('3ro')) {
      displayGrade = '3ro. (Primaria)';
    } else if (normGrade.includes('4') || normGrade.includes('cuart') || normGrade.includes('4to')) {
      displayGrade = '4to. (Primaria)';
    } else if (normGrade.includes('5') || normGrade.includes('quint') || normGrade.includes('5to')) {
      displayGrade = '5to. (Primaria)';
    } else if (normGrade.includes('6') || normGrade.includes('sext') || normGrade.includes('6to')) {
      displayGrade = '6to. (Primaria)';
    }
  } else {
    if (normGrade.includes('1') || normGrade.includes('primer') || normGrade.includes('1er') || normGrade.includes('1ro')) {
      displayGrade = '1ro. (Secundaria)';
    } else if (normGrade.includes('2') || normGrade.includes('segund') || normGrade.includes('2do')) {
      displayGrade = '2do. (Secundaria)';
    } else if (normGrade.includes('3') || normGrade.includes('tercer') || normGrade.includes('3er') || normGrade.includes('3ro')) {
      displayGrade = '3ro. (Secundaria)';
    } else if (normGrade.includes('4') || normGrade.includes('cuart') || normGrade.includes('4to')) {
      displayGrade = '4to. (Secundaria)';
    } else if (normGrade.includes('5') || normGrade.includes('quint') || normGrade.includes('5to')) {
      displayGrade = '5to. (Secundaria)';
    } else if (normGrade.includes('6') || normGrade.includes('sext') || normGrade.includes('6to')) {
      displayGrade = '6to. (Secundaria)';
    }
  }

  const displaySubject = subjectName && subjectName.toLowerCase() !== 'asignatura' ? subjectName : (formData.area || formData.asignatura || 'Lengua Española');
  const formTitle = `${displaySubject.toUpperCase()} - ${titleSuffix}`;
  
  // Solo se muestra el campo "Periodo" para 1ro de Secundaria en asignaturas principales
  const isSecundaria1ro = grade.includes('1') && isSecundaria;
  const isMainSecSubject = /lengua|matem[aá]tica|sociales|naturales|ingl[eé]s/i.test(displaySubject || "");
  const showPeriodo = isSecundaria1ro && isMainSecSubject;
  const periodo = formData?.periodo || '---';

  // 1. Extraer tema y subtema de manera comprensiva
  let displayTema = formData?.tema || formData?.theme || formData?.customFields?.tema || formData?.customFields?.theme || '';
  let displaySubtema = formData?.subtema || formData?.subtheme || formData?.customFields?.subtema || formData?.customFields?.subtheme || '';

  // 2. Si no están explícitos, intentar extraer del título cuando tiene el formato "Tema - Subtema"
  if (!displayTema) {
    const rawTit = (formData?.titulo || formData?.actividad_titulo || '').trim();
    if (rawTit && !rawTit.toLowerCase().startsWith('unidad:') && !rawTit.toLowerCase().startsWith('secuencia:')) {
      if (rawTit.includes(' - ')) {
        const parts = rawTit.split(' - ');
        displayTema = parts[0]?.trim() || '';
        displaySubtema = displaySubtema || parts.slice(1).join(' - ').trim();
      } else if (rawTit.toLowerCase() !== 'clase' && rawTit !== '---') {
        displayTema = rawTit;
      }
    }
  }

  // Unidad o Secuencia para la fila 2
  const unidadOrSecuencia = sequenceTitle || formData?.secuencia || formData?.unidad || (formData?.titulo && formData.titulo.toLowerCase().startsWith('unidad:') ? formData.titulo : '') || (isUnit ? formData?.titulo : '') || '---';

  const maxWidthClass = orientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[215mm]';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 10mm;
            size: ${orientation};
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
        }

        .print-layout.text-scale-small .text-\\[10px\\] { font-size: 9px !important; }
        .print-layout.text-scale-small .text-\\[11px\\] { font-size: 10px !important; }
        .print-layout.text-scale-small .text-xs { font-size: 11px !important; line-height: 1.35 !important; }
        .print-layout.text-scale-small .text-sm { font-size: 12.5px !important; }
        .print-layout.text-scale-small .text-base { font-size: 14px !important; }
        .print-layout.text-scale-small p,
        .print-layout.text-scale-small li { font-size: 11px !important; }

        .print-layout.text-scale-large .text-\\[10px\\] { font-size: 11.5px !important; }
        .print-layout.text-scale-large .text-\\[11px\\] { font-size: 12.5px !important; }
        .print-layout.text-scale-large .text-xs { font-size: 13.5px !important; line-height: 1.5 !important; }
        .print-layout.text-scale-large .text-sm { font-size: 15.5px !important; }
        .print-layout.text-scale-large .text-base { font-size: 17.5px !important; }
        .print-layout.text-scale-large p,
        .print-layout.text-scale-large li { font-size: 13.5px !important; }

        .print-layout.text-scale-xlarge .text-\\[10px\\] { font-size: 13px !important; }
        .print-layout.text-scale-xlarge .text-\\[11px\\] { font-size: 14px !important; }
        .print-layout.text-scale-xlarge .text-xs { font-size: 15.5px !important; line-height: 1.55 !important; }
        .print-layout.text-scale-xlarge .text-sm { font-size: 17.5px !important; }
        .print-layout.text-scale-xlarge .text-base { font-size: 19.5px !important; }
        .print-layout.text-scale-xlarge p,
        .print-layout.text-scale-xlarge li { font-size: 15.5px !important; }
      `}} />
      <div className={`print-layout text-scale-${textScale} bg-white w-full ${maxWidthClass} mx-auto text-neutral-900 border border-neutral-400 print:max-w-none print:w-full print:border-[0.5px] transition-all duration-300 font-sans shadow-sm`}>
        {/* Header de Datos del Plan */}
        <div className="border-b border-neutral-400">
          <div className="p-3 text-center border-b border-neutral-400 bg-neutral-50/50">
            <h1 className="text-base font-extrabold uppercase tracking-wide text-neutral-800">
              {formTitle}
            </h1>
          </div>

          <div className="grid grid-cols-12 text-xs">
            <div className="col-span-4 p-2 border-r border-neutral-400">
              <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">CENTRO EDUCATIVO:</span>
              <div className="font-semibold text-neutral-800">{formData.centro_educativo || formData.colegio || '---'}</div>
            </div>
            <div className="col-span-4 p-2 border-r border-neutral-400">
              <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">DOCENTE:</span>
              <div className="font-semibold text-neutral-800">{formData.docente || formData.docente_nombre || '---'}</div>
            </div>
            <div className="col-span-2 p-2 border-r border-neutral-400">
              <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">GRADO:</span>
              <div className="font-semibold text-neutral-800">
                {displayGrade}
              </div>
            </div>
            <div className="col-span-2 p-2">
              <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">SECCIÓN:</span>
              <div className="font-semibold text-neutral-800">{formData.seccion || '---'}</div>
            </div>
          </div>

          {formData?.isTaller || planningType === 'TALLER' ? (
            <div className="grid grid-cols-12 text-xs border-t border-neutral-400">
              <div className="col-span-3 p-2 border-r border-neutral-400">
                <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">TEMA:</span>
                <div className="font-semibold text-neutral-800">{formData.tema || '---'}</div>
              </div>
              <div className="col-span-3 p-2 border-r border-neutral-400">
                <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">TÍTULO DE LA CLASE:</span>
                <div className="font-semibold text-neutral-800">{formData.titulo || '---'}</div>
              </div>
              <div className="col-span-3 p-2 border-r border-neutral-400">
                <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">DURACIÓN:</span>
                <div className="font-semibold text-neutral-800">{formData.duracion_minutos ? `${formData.duracion_minutos} minutos` : '---'}</div>
              </div>
              <div className="col-span-3 p-2">
                <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">FECHA:</span>
                <div className="font-semibold text-neutral-800">{formatDate(formData.fecha)}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 text-xs border-t border-neutral-400">
                <div className={`${showPeriodo ? 'col-span-3' : 'col-span-4'} p-2 border-r border-neutral-400`}>
                  <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">ÁREA:</span>
                  <div className="font-semibold text-neutral-800">{displaySubject}</div>
                </div>
                <div className={`${showPeriodo ? 'col-span-3' : 'col-span-4'} p-2 border-r border-neutral-400`}>
                  <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">{(!isUnit && !isSecundaria && isMatOrLengua) ? 'SECUENCIA:' : 'UNIDAD:'}</span>
                  <div className="font-semibold text-neutral-800">{unidadOrSecuencia}</div>
                </div>
                {showPeriodo && (
                  <div className="col-span-3 p-2 border-r border-neutral-400">
                    <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">PERIODO:</span>
                    <div className="font-semibold text-neutral-800">{periodo}</div>
                  </div>
                )}
                <div className={`${showPeriodo ? 'col-span-3' : 'col-span-4'} p-2`}>
                  <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">FECHA:</span>
                  <div className="font-semibold text-neutral-800">{formatDate(formData.fecha)}</div>
                </div>
              </div>

              {/* Fila para TEMA y SUBTEMA */}
              {(!isUnit || displayTema || displaySubtema) && (
                <div className="grid grid-cols-12 text-xs border-t border-neutral-400">
                  <div className="col-span-6 p-2 border-r border-neutral-400">
                    <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">TEMA:</span>
                    <div className="font-semibold text-neutral-800">{displayTema || '---'}</div>
                  </div>
                  <div className="col-span-6 p-2">
                    <span className="block text-[10px] font-black uppercase text-neutral-500 mb-0.5">SUBTEMA:</span>
                    <div className="font-semibold text-neutral-800">{displaySubtema || '---'}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delegar contenido según Nivel Educativo */}
        {formData?.isTaller || planningType === 'TALLER' ? (
          <PrintLayoutTaller
            formData={formData}
            formType={formType}
            subjectName={subjectName}
            sequenceTitle={sequenceTitle}
            blockTitle={blockTitle}
            orientation={orientation}
            planningType={planningType}
          />
        ) : (
          <PrintLayoutPrimaria
            formData={formData}
            formType={formType}
            subjectName={subjectName}
            sequenceTitle={sequenceTitle}
            blockTitle={blockTitle}
            orientation={orientation}
            planningType={planningType}
          />
        )}

        {/* Pie de Página */}
        <div className="border-t border-neutral-400 p-2.5 text-center bg-neutral-50/50">
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider select-text">
            Generado por Planix - Plataforma de Gestión Docente
          </p>
        </div>
      </div>
    </>
  );
}
