import React from 'react';

interface PrintLayoutSecundariaProps {
  formData: any;
  formType?: 'CON_BASE' | 'CURRICULAR';
  subjectName: string;
  sequenceTitle?: string;
  blockTitle?: string | number;
  orientation?: 'portrait' | 'landscape';
  planningType?: string;
}

const renderListOrText = (data: any, isSpecific: boolean = false, className: string = "text-xs") => {
  if (!data) return <p className="text-neutral-500 italic">No registrado.</p>;
  
  let items: string[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'string') {
    items = data.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (items.length === 0) return <p className="text-neutral-500 italic">No registrado.</p>;

  return (
    <ul className="list-disc list-inside space-y-1.5 text-left leading-relaxed">
      {items.map((item, index) => {
        const colonIndex = item.indexOf(':');
        if (colonIndex !== -1 && isSpecific) {
          const boldPart = item.substring(0, colonIndex + 1);
          const restPart = item.substring(colonIndex + 1);
          const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
          const cleanBoldPart = boldPart.replace(cleanRegex, '').trim();
          return (
            <li key={index} className={className}>
              <span className="font-bold text-neutral-900">{cleanBoldPart}</span>{restPart}
            </li>
          );
        }
        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanItem = item.replace(cleanRegex, '').trim();
        const formattedItem = cleanItem.split(/(\*\*.*?\*\*)/).map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i} className="font-bold text-neutral-900">{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        );
        return <li key={index} className={`${className} text-neutral-750`}>{formattedItem}</li>;
      })}
    </ul>
  );
};

const renderTextWithHeaders = (text: string, isUnit: boolean = false, className: string = "text-xs") => {
  if (!text) return <p className="text-center text-neutral-500 italic">---</p>;
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  if (lines.length === 0) return <p className="text-center text-neutral-500 italic">---</p>;

  return (
    <div className={`${className} space-y-1 leading-relaxed text-left`}>
      {lines.map((line, idx) => {
        const isUnitTitle = /^\s*[-•+*–—\s]*\s*UNIDAD\s*:/i.test(line);
        if (isUnitTitle) {
          const cleanTitle = line.replace(/^\s*[-•+*–—\s]+/, '').replace(/[*#\s]+$/, '').trim();
          return (
            <div key={idx} className={`w-full ${idx > 0 ? 'mt-4 pt-1.5' : ''} text-neutral-900 font-extrabold text-[11px] uppercase`}>
              {cleanTitle}
            </div>
          );
        }

        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanLine = line.replace(cleanRegex, '').trim();

        const colonIndex = cleanLine.indexOf(':');
        if (colonIndex !== -1) {
          const firstPart = cleanLine.substring(0, colonIndex + 1);
          const rest = cleanLine.substring(colonIndex + 1);
          return (
            <p key={idx}>
              <span className="font-bold text-neutral-900">{firstPart}</span>{rest}
            </p>
          );
        }
        return <p key={idx} className="text-neutral-750">{cleanLine}</p>;
      })}
    </div>
  );
};

const renderCommaSeparatedList = (data: any, className: string = "text-xs") => {
  if (!data) return <p className="text-neutral-500 italic">---</p>;
  
  let items: string[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'string') {
    items = data.split(/[,.]\s+|\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (items.length === 0) return <p className="text-neutral-500 italic">---</p>;

  return (
    <ul className="list-disc list-inside space-y-1 text-left leading-relaxed">
      {items.map((item, index) => {
        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanItem = item.replace(cleanRegex, '').trim();
        const clean = cleanItem.replace(/[.]$/, '');
        return <li key={index} className={className}>{clean}.</li>;
      })}
    </ul>
  );
};

const formatActivityText = (text: string) => {
  if (!text) return '';
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^(INICIO|DESARROLLO|CIERRE|CONCLUSIÓN|CONCLUSION|Inicio|Desarrollo|Cierre|Conclusión|Conclusion)\s*[:.\-]*\s*/i, '')
    .replace(/^[\s.:\-•·*]+/, '')
    .trim();

  const words = cleanText.split(/\s+/);
  if (words.length >= 2) {
    const boldCount = Math.min(words.length, 3);
    const start = words.slice(0, boldCount).join(' ');
    const end = words.slice(boldCount).join(' ');
    return (
      <>
        <span className="font-extrabold text-neutral-900">{start}</span> {end}
      </>
    );
  }
  return cleanText;
};

const getMomentosArray = (formData: any) => {
  if (Array.isArray(formData.momentos)) {
    return formData.momentos;
  }
  if (formData.momentos && typeof formData.momentos === 'object') {
    return [
      { moment: 'Inicio', descripcion: formData.momentos.inicio || formData.momentos.Inicio || '', tiempo: '15 minutos', recursos: formData.recursos?.join(', ') || 'Recursos diversos' },
      { moment: 'Desarrollo', descripcion: formData.momentos.desarrollo || formData.momentos.Desarrollo || '', tiempo: '45 minutos', recursos: formData.recursos?.join(', ') || 'Recursos diversos' },
      { moment: 'Cierre', descripcion: formData.momentos.cierre || formData.momentos.Cierre || '', tiempo: '10 minutos', recursos: formData.recursos?.join(', ') || 'Recursos diversos' },
    ];
  }
  return [];
};

export default function PrintLayoutSecundaria({
  formData,
  formType,
  subjectName,
  sequenceTitle,
  blockTitle,
  orientation = 'landscape',
  planningType = 'DIARIA'
}: PrintLayoutSecundariaProps) {
  
  // Determinamos si es una planificación de unidad
  const isUnit = planningType === 'UNIDAD' || !!(formData as any).duracion_estimada || !!(formData as any).tiempo_estimado;

  // Comprobar si se trata de una asignatura especial (Educación Física, Artística, Formación Humana, etc.)
  const isSpecialSubject = /f[ií]sica|formaci[oó]n|religi[oó]n|art[ií]stica|humana|arte|fisic/i.test(subjectName || "") ||
    ['educacion-artistica', 'educacion-fisica', 'formacion-humana'].includes(formData.subject_id || '');

  // Lógica de coincidencia para aplicar cabecera o pie diferente
  const isFormattedListSubject = !isUnit && (
    /f[ií]sica|formaci[oó]n|religi[oó]n|art[ií]stica|humana|arte|fisic/i.test(subjectName || "") ||
    formData.override_moment_labels === true
  );

  const getMomentLabel = (index: number, m?: any) => {
    if (formType === 'CURRICULAR') {
      const rawTitle = m?.moment || m?.titulo || m?.title || '';
      if (rawTitle) return rawTitle.toUpperCase();
      if (index === 0) return 'INICIO';
      if (index === 1) return 'DESARROLLO';
      if (index === 2) return 'CIERRE';
    }
    if (isFormattedListSubject) {
      if (index === 0) return 'INICIO';
      if (index === 1) return 'DESARROLLO';
      if (index === 2) return 'CIERRE';
    }
    return `MOMENTO ${index + 1}`;
  };

  const momentos = getMomentosArray(formData);

  return (
    <div className="text-xs font-sans">
      {/* Situación de Aprendizaje o Intención Pedagógica */}
      {formData.situacion_aprendizaje || formData.intencion_pedagogica ? (
        <div className="border-b border-neutral-400 p-3">
          <span className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5">
            {isUnit || formData.situacion_aprendizaje ? 'Situación de Aprendizaje:' : 'Intención Pedagógica del Día:'}
          </span>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">
            {formData.situacion_aprendizaje || formData.intencion_pedagogica}
          </p>
        </div>
      ) : null}

      {/* Estrategias de Enseñanza */}
      {formData.estrategia && (
        <div className="border-b border-neutral-400 p-3 bg-neutral-50/20">
          <span className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5">Estrategias de Enseñanza y Aprendizaje:</span>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{formData.estrategia}</p>
        </div>
      )}

      {/* Ejes Transversales */}
      {formData.ejes_transversales && (
        <div className="border-b border-neutral-400 p-3">
          <span className="block text-[10px] font-black uppercase text-neutral-600 mb-1">Ejes Transversales:</span>
          {renderListOrText(formData.ejes_transversales, false, "text-xs")}
        </div>
      )}

      {/* Competencias - Caso Asignaturas Especiales (Bloques Simples) */}
      {isSpecialSubject && (
        <div className="border-b border-neutral-400 p-3 bg-neutral-50/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-600 mb-1">Competencias Fundamentales:</span>
              {renderListOrText(formData.competencias, false, "text-xs")}
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-600 mb-1">Competencias Específicas:</span>
              {formData.hideSpecificCompetencies ? (
                <p className="text-neutral-400 italic text-xs">Ocultas por el docente.</p>
              ) : (
                renderListOrText(formData.competencias_especificas, true, "text-xs")
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grilla Curricular de MINERD de 6 Columnas (Para Asignaturas Regulares como Lengua, Matemática, Sociales, Naturales) */}
      {!isSpecialSubject && (
        <div className="border-b border-neutral-400">
          <div className="bg-[#bce0f0] border-b border-neutral-400 text-center font-bold p-1 text-xs uppercase text-neutral-800">
            Componente Curricular (Adecuación Curricular)
          </div>
          
          {/* Fila Cabeceras Nivel 2 */}
          <div className="grid grid-cols-6 bg-[#bce0f0] text-center font-black text-[10px] uppercase border-b border-neutral-400 divide-x divide-neutral-400 text-neutral-800">
            <div className="col-span-2 p-1.5 flex items-center justify-center">Competencias</div>
            <div className="col-span-3 p-1.5 flex items-center justify-center">Contenidos Curriculares</div>
            <div className="col-span-1 p-1.5 flex items-center justify-center">Indicadores</div>
          </div>
          
          {/* Fila Cabeceras Nivel 3 */}
          <div className="grid grid-cols-6 bg-[#f2f2f2] text-center font-black text-[9px] uppercase border-b border-neutral-400 divide-x divide-neutral-400 text-neutral-700">
            <div className="p-1">Fundamentales</div>
            <div className="p-1">Específicas</div>
            <div className="p-1">Conceptuales</div>
            <div className="p-1">Procedimentales</div>
            <div className="p-1">Actitudinales</div>
            <div className="p-1 bg-[#bce0f0]/30">Logro</div>
          </div>
          
          {/* Fila Contenidos */}
          <div className="grid grid-cols-6 divide-x divide-neutral-400 text-[11px] leading-relaxed bg-white">
            <div className="p-2 min-h-[120px]">
              {renderListOrText(formData.competencias, false, "text-[10.5px]")}
            </div>
            <div className="p-2">
              {formData.hideSpecificCompetencies ? (
                <p className="text-neutral-400 italic text-[10px]">Ocultas por el docente.</p>
              ) : (
                renderListOrText(formData.competencias_especificas, true, "text-[10.5px]")
              )}
            </div>
            <div className="p-2">
              {renderTextWithHeaders(formData.contenidos_conceptuales || formData.unidades_temas || formData.conceptual, isUnit, "text-[10.5px]")}
            </div>
            <div className="p-2">
              {renderTextWithHeaders(formData.contenidos_procedimentales || formData.actividades_principales || formData.procedimental, isUnit, "text-[10.5px]")}
            </div>
            <div className="p-2">
              {renderTextWithHeaders(formData.contenidos_actitudinales || formData.evaluaciones || formData.actitudinal, isUnit, "text-[10.5px]")}
            </div>
            <div className="p-2 bg-neutral-50/20">
              {renderListOrText(formData.indicador_logro?.split('\n') || formData.indicadores_logro || formData.evaluacion?.split('\n'), false, "text-[10.5px]")}
            </div>
          </div>
        </div>
      )}

      {/* Actividades de Enseñanza, Aprendizaje y Evaluación (Si existen en formato diario) */}
      {!isUnit && !isSpecialSubject && (formData.actividades_ensenanza || formData.actividades_aprendizaje) && (
        <div className="border-b border-neutral-400">
          <div className="bg-neutral-100 border-b border-neutral-400 p-1 text-center font-bold text-xs uppercase text-neutral-800">
            Actividades del Proceso de Clase
          </div>
          <div className="grid grid-cols-3 divide-x divide-neutral-400 bg-white">
            <div className="p-2">
              <h4 className="text-[10px] font-bold text-center mb-1.5 bg-neutral-50 border border-neutral-250 py-0.5 rounded uppercase">De Enseñanza</h4>
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{formData.actividades_ensenanza || '---'}</p>
            </div>
            <div className="p-2">
              <h4 className="text-[10px] font-bold text-center mb-1.5 bg-neutral-50 border border-neutral-250 py-0.5 rounded uppercase">De Aprendizaje</h4>
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{formData.actividades_aprendizaje || '---'}</p>
            </div>
            <div className="p-2">
              <h4 className="text-[10px] font-bold text-center mb-1.5 bg-neutral-50 border border-neutral-250 py-0.5 rounded uppercase">De Evaluación</h4>
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{formData.actividades_evaluacion || '---'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Secuencia Didáctica por Momentos o Fases (Fases y Tiempos) */}
      {momentos.length > 0 && (
        <div className="border-b border-neutral-400 bg-white">
          <div className="grid grid-cols-12 bg-neutral-100 font-bold text-[10px] uppercase text-center border-b border-neutral-400 divide-x divide-neutral-400 text-neutral-800">
            <div className="col-span-2 p-1.5 flex items-center justify-center">Fase / Tiempo</div>
            <div className="col-span-6 p-1.5 flex items-center justify-center">Actividades del Proceso de Enseñanza y Aprendizaje</div>
            <div className="col-span-2 p-1.5 flex items-center justify-center">Evidencias / Instrumentos</div>
            <div className="col-span-2 p-1.5 flex items-center justify-center">Recursos Escolares</div>
          </div>

          {momentos.map((m: any, index: number) => (
            <div key={index} className="grid grid-cols-12 border-b border-neutral-400 last:border-b-0 divide-x divide-neutral-400">
              <div className="col-span-2 p-2.5 bg-neutral-50/50 font-black flex flex-col items-center justify-center text-center text-[10px] uppercase">
                <span className="text-neutral-900">{getMomentLabel(index, m)}</span>
                <span className="text-[9px] font-bold text-neutral-500 bg-white border border-neutral-300 px-1.5 py-0.2 rounded-full mt-1.5 lowercase italic">{m.tiempo || '---'}</span>
              </div>
              <div className="col-span-6 p-3 text-xs leading-relaxed text-left whitespace-pre-wrap">
                {formatActivityText(m.descripcion || m.description || '')}
              </div>
              <div className="col-span-2 p-2.5 text-xs flex flex-col justify-center text-left gap-1 bg-neutral-50/10">
                {m.evidencias || m.instrumentos ? (
                  <>
                    {m.evidencias && <p><span className="font-bold text-[9px] uppercase block text-neutral-500">Evidencia:</span>{m.evidencias}</p>}
                    {m.instrumentos && <p><span className="font-bold text-[9px] uppercase block text-neutral-500">Instrumento:</span>{m.instrumentos}</p>}
                  </>
                ) : (
                  <p className="text-neutral-400 text-center italic">---</p>
                )}
              </div>
              <div className="col-span-2 p-2.5 text-xs leading-relaxed text-left">
                {(() => {
                  const recursos = m.recursos || 'Recursos diversos';
                  const items = recursos.split(/[,.]\s+|\r?\n/).map((s: string) => s.trim()).filter(Boolean);
                  if (items.length > 1) {
                    return (
                      <ul className="list-disc list-inside space-y-0.5">
                        {items.map((rec: string, rIdx: number) => (
                          <li key={rIdx}>{rec.replace(/[.]$/, '')}.</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p>{recursos}</p>;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid del Footer (Técnicas, Instrumentos y Recursos) */}
      {!isFormattedListSubject && (
        <div className="grid grid-cols-3 border-t border-neutral-400 text-xs bg-white divide-x divide-neutral-400">
          <div className="p-3">
            <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1">Técnicas de Evaluación:</h3>
            {isUnit ? (
              renderCommaSeparatedList(formData.tecnicas)
            ) : (
              <p className="min-h-[50px] leading-relaxed text-neutral-750">{formData.tecnicas || '---'}</p>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1">Instrumentos de Evaluación:</h3>
            <p className="min-h-[50px] leading-relaxed text-neutral-750">{formData.evaluacion || formData.instrumentos_evaluacion || '---'}</p>
          </div>
          <div className="p-3 bg-neutral-50/10">
            <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1">Recursos del Plan:</h3>
            {isUnit ? (
              renderCommaSeparatedList(formData.recursos)
            ) : (
              <p className="min-h-[50px] leading-relaxed text-neutral-750">{formData.recursos || '---'}</p>
            )}
          </div>
        </div>
      )}

      {/* Actividades Complementarias de Inclusión */}
      {formData.actividad_complementaria && (
        <div className="p-3 bg-indigo-50/40 text-xs border-t border-neutral-400 text-neutral-900">
          <h3 className="text-[10px] font-black uppercase text-indigo-900 mb-1">Actividades complementarias de inclusión para la diversidad:</h3>
          <div className="leading-relaxed text-indigo-950 [&_h3]:font-bold [&_h3]:text-indigo-900 [&_h3]:mt-1.5 [&_h3]:mb-0.5 [&_h3]:text-[11px] [&_h4]:font-bold [&_h4]:text-neutral-900 [&_h4]:mt-1 [&_h4]:mb-0.5 [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: formData.actividad_complementaria }} />
        </div>
      )}
    </div>
  );
}
