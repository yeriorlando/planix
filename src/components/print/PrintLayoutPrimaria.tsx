import React from 'react';

interface PrintLayoutPrimariaProps {
  formData: any;
  formType?: 'CON_BASE' | 'CURRICULAR';
  subjectName: string;
  sequenceTitle?: string;
  blockTitle?: string | number;
  orientation?: 'portrait' | 'landscape';
  planningType?: string;
}

const formatTimeText = (time: any) => {
  if (!time) return '---';
  const cleaned = time.toString().trim();
  if (/^\d+$/.test(cleaned)) {
    return `${cleaned} Minutos`;
  }
  return cleaned.replace(/\bmin\b/i, 'Minutos').replace(/minutos/i, 'Minutos');
};

const renderInclusionActivities = (text: string) => {
  if (!text) return <p className="text-neutral-500 italic">No se describen actividades complementarias.</p>;

  if (/<(ul|li|p|div|br)/i.test(text)) {
    return (
      <div 
        className="leading-relaxed text-neutral-750 text-xs space-y-1 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_strong]:font-bold [&_strong]:text-neutral-900"
        dangerouslySetInnerHTML={{ __html: text }} 
      />
    );
  }

  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return <p className="text-neutral-500 italic">No se describen actividades complementarias.</p>;

  return (
    <ul className="list-disc pl-4 space-y-1.5 text-xs text-neutral-750 text-left">
      {lines.map((line, idx) => {
        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanLine = line.replace(cleanRegex, '').trim();
        const colonIndex = cleanLine.indexOf(':');
        
        if (colonIndex !== -1) {
          const boldPart = cleanLine.substring(0, colonIndex + 1);
          const restPart = cleanLine.substring(colonIndex + 1);
          return (
            <li key={idx} className="leading-relaxed">
              <span className="font-bold text-neutral-900">{boldPart}</span>{restPart}
            </li>
          );
        }
        
        return (
          <li key={idx} className="leading-relaxed">
            {cleanLine}
          </li>
        );
      })}
    </ul>
  );
};

const renderResourcesList = (recursos: any) => {
  if (!recursos) return <p className="text-neutral-500 italic">---</p>;
  const rawRec = recursos.toString().trim();
  if (!rawRec || rawRec === '---') {
    return <p className="text-neutral-500 italic">---</p>;
  }
  if (rawRec === 'Recursos diversos') {
    return <p className="text-neutral-750 font-normal">Recursos diversos.</p>;
  }

  const items = rawRec.split(/[,.]\s+|\r?\n/).map((s: string) => s.trim()).filter(Boolean);
  if (items.length === 0) return <p className="text-neutral-500 italic">---</p>;

  return (
    <ul className="list-disc pl-4 text-left space-y-0.5 text-neutral-750">
      {items.map((item: string, idx: number) => {
        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let clean = item.replace(cleanRegex, '').trim();
        if (!clean) return null;
        return <li key={idx} className="leading-relaxed">{clean.replace(/[.]$/, '')}.</li>;
      })}
    </ul>
  );
};

const formatMarkdownBold = (text: string) => {
  if (!text) return '---';
  // Strip starting headers like ###, ##, # from lines and format them as bold
  const cleanedText = text
    .split('\n')
    .map(line => {
      if (/^(?:###|##|#)\s+/.test(line)) {
        const title = line.replace(/^(?:###|##|#)\s+/, '').replace(/\*\*/g, '').trim();
        return `**${title}**`;
      }
      return line;
    })
    .join('\n');

  return cleanedText.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-extrabold text-neutral-900">{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
};

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

const renderThreeColumnList = (data: any, className: string = "text-xs") => {
  if (!data) return <p className="text-neutral-500 italic">No registrado.</p>;
  
  let items: string[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'string') {
    items = data.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (items.length === 0) return <p className="text-neutral-500 italic">No registrado.</p>;

  return (
    <div className="space-y-1.5 text-left leading-relaxed">
      {items.map((item, index) => {
        const isUnitTitle = /^\s*[-•+*–—\s]*\s*UNIDAD\s*:/i.test(item);
        if (isUnitTitle) {
          const cleanTitle = item.replace(/^\s*[-•+*–—\s]+/, '').replace(/[*#\s]+$/, '').trim();
          return (
            <div key={index} className={`w-full ${index > 0 ? 'mt-4 pt-1.5' : ''} text-neutral-900 font-extrabold text-[11px] uppercase`}>
              {cleanTitle}
            </div>
          );
        }

        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanItem = item.replace(cleanRegex, '').trim();
        const formatted = cleanItem.split(/(\*\*.*?\*\*)/).map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i} className="font-extrabold text-neutral-900">{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        );

        return (
          <div key={index} className={`${className} text-neutral-750 flex items-start gap-1`}>
            <span className="shrink-0 text-neutral-900 font-bold">-</span>
            <span>{formatted}</span>
          </div>
        );
      })}
    </div>
  );
};

const renderBulletPointList = (data: any, className: string = "text-xs") => {
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
        cleanItem = cleanItem.replace(/[.]$/, '');
        return <li key={index} className={`${className} text-neutral-750`}>{cleanItem}.</li>;
      })}
    </ul>
  );
};

const parseRichText = (text: string) => {
  if (!text) return text;
  const parts = text.split(/(\*\*(?:[\s\S]*?)\*\*|"(?:[^"]+?)"|#(?:[^#]+?)#|\((?:[^)]+?)\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('"') && part.endsWith('"')) {
      return <strong key={i} className="font-bold text-neutral-900">{part}</strong>;
    }
    if (part.startsWith('#') && part.endsWith('#')) {
      return <strong key={i} className="font-bold text-neutral-900">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('(') && part.endsWith(')')) {
      return <strong key={i} className="font-bold text-neutral-900">{part}</strong>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-neutral-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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

const renderFormattedActivityText = (text: string) => {
  if (!text) return null;
  
  // Normalize literal '\n' sequences (e.g. string "\\n" or "\n") to actual newlines
  let processed = text.replace(/\\n/g, '\n');
  
  const lines = processed.split('\n');
  
  const parseInlineFormatting = (str: string) => {
    if (!str) return '';
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-neutral-955">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1 text-neutral-850 mt-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;
        
        // Check for list item pattern, e.g. "1. Preparación: Description"
        const listItemMatch = trimmed.match(/^(\d+\.\s*)([^:]+:)?(.*)$/);
        if (listItemMatch) {
          const [, num, header, body] = listItemMatch;
          return (
            <div key={idx} className="pl-4 -indent-4 leading-relaxed">
              <strong className="font-extrabold text-neutral-955">{num}</strong>
              {header && <strong className="font-extrabold text-neutral-955">{header}</strong>}
              <span>{parseInlineFormatting(body)}</span>
            </div>
          );
        }
        
        // Check for sub-bullets pattern, e.g. "- Paso 1: Description"
        const bulletMatch = trimmed.match(/^([-\*•]\s*)([^:]+:)?(.*)$/);
        if (bulletMatch) {
          const [, bullet, header, body] = bulletMatch;
          return (
            <div key={idx} className="pl-6 -indent-4 leading-relaxed">
              <span className="font-bold text-neutral-955 mr-1">•</span>
              {header && <strong className="font-extrabold text-neutral-955">{header}</strong>}
              <span>{parseInlineFormatting(body)}</span>
            </div>
          );
        }

        // Check for general label pattern, e.g. "Actividad Adaptada: Description" or "Nota: Description"
        const labelMatch = trimmed.match(/^([^:]+:)(.*)$/);
        if (labelMatch) {
          const [, label, body] = labelMatch;
          return (
            <p key={idx} className="leading-relaxed">
              <strong className="font-extrabold text-neutral-955">{label}</strong>
              <span>{parseInlineFormatting(body)}</span>
            </p>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const cleanMomentTitle = (title: string) => {
  if (!title) return '';
  return title.replace(/^(momento\s+\d+[\.:\s]*)/i, '').trim();
};

const renderMomentDescription = (m: any) => {
  const rawTitle = m.titulo || m.title || m.moment || '';
  let cleanTitle = cleanMomentTitle(rawTitle);
  const isGenericPhase = /^(inicio|desarrollo|cierre)$/i.test(cleanTitle);
  
  if (cleanTitle && !cleanTitle.endsWith('.') && !isGenericPhase) {
    cleanTitle += '.';
  }
  
  if (m.hideDescription) {
    if (cleanTitle && !isGenericPhase) {
      return (
        <strong className="font-extrabold text-neutral-900">{cleanTitle}</strong>
      );
    }
    return isGenericPhase ? <strong className="font-extrabold text-neutral-900">{cleanTitle}</strong> : null;
  }
  
  const descText = m.descripcion || m.description || '';
  
  if (cleanTitle && !isGenericPhase) {
    return (
      <>
        <strong className="font-extrabold text-neutral-900 mr-1.5">{cleanTitle}</strong>
        <span>{parseRichText(descText)}</span>
      </>
    );
  }
  return formatActivityText(descText);
};

const getMomentosArray = (formData: any) => {
  if (Array.isArray(formData.momentos)) {
    return formData.momentos;
  }
  if (formData.momentos && typeof formData.momentos === 'object') {
    return [
      { moment: 'Inicio', descripcion: formData.momentos.inicio || formData.momentos.Inicio || '', tiempo: '15 minutos', recursos: formData.recursos?.join(', ') || '' },
      { moment: 'Desarrollo', descripcion: formData.momentos.desarrollo || formData.momentos.Desarrollo || '', tiempo: '45 minutos', recursos: formData.recursos?.join(', ') || '' },
      { moment: 'Cierre', descripcion: formData.momentos.cierre || formData.momentos.Cierre || '', tiempo: '10 minutos', recursos: formData.recursos?.join(', ') || '' },
    ];
  }
  return [];
};

export default function PrintLayoutPrimaria({
  formData,
  formType,
  subjectName,
  sequenceTitle,
  blockTitle,
  orientation = 'landscape',
  planningType = 'DIARIA'
}: PrintLayoutPrimariaProps) {
  const grade = (formData.grado || '').toLowerCase();
  
  // Si es 4to, 5to, 6to de primaria y es Lengua o Matemática (que llevan secuencias didácticas) y no es unidad
  const isUpperPrimary = (grade.includes('4') || grade.includes('5') || grade.includes('6') || 
                          grade.includes('cuarto') || grade.includes('quinto') || grade.includes('sexto')) &&
                         !grade.includes('secundaria');

  const momentos = getMomentosArray(formData);
  const isUnit = planningType === 'UNIDAD' || formData.planningType === 'UNIDAD';
  const isMatOrLengua = subjectName?.toLowerCase().includes('matemática') || 
                        subjectName?.toLowerCase().includes('matematica') || 
                        subjectName?.toLowerCase().includes('lengua') ||
                        (formData.area || formData.asignatura || '').toLowerCase().includes('matem') ||
                        (formData.area || formData.asignatura || '').toLowerCase().includes('lengua');

  const isSequencePlanning = isUpperPrimary && isMatOrLengua && !isUnit;

  const getMomentLabel = (index: number, m?: any) => {
    if (!grade.includes('secundaria')) {
      const isPrimary1to3 = (grade.includes('1') || grade.includes('2') || grade.includes('3') ||
                             grade.includes('primer') || grade.includes('segund') || grade.includes('tercer') ||
                             grade.includes('1ro') || grade.includes('2do') || grade.includes('3ro'));
      
      const isMatOrLenguaName = subjectName?.toLowerCase().includes('matemática') || 
                            subjectName?.toLowerCase().includes('matematica') || 
                            subjectName?.toLowerCase().includes('lengua') ||
                            (formData.area || formData.asignatura || '').toLowerCase().includes('matem') ||
                            (formData.area || formData.asignatura || '').toLowerCase().includes('lengua');

      if (isMatOrLenguaName && isPrimary1to3 && !isUnit) {
        return `MOMENTO ${index + 1}`;
      }

      if (index === 0) return 'INICIO';
      if (index === 1) return 'DESARROLLO';
      if (index === 2) return 'CIERRE';
    }

    const rawTitle = m?.moment || m?.titulo || m?.title || '';
    if (rawTitle) return rawTitle.toUpperCase();
    if (index === 0) return 'INICIO';
    if (index === 1) return 'DESARROLLO';
    if (index === 2) return 'CIERRE';
    return `MOMENTO ${index + 1}`;
  };

  if (isUnit) {
    return (
      <div className="text-xs font-sans">
        {/* Competencias Fundamentales */}
        {formData.competencias && formData.competencias.length > 0 && (
          <div className="border-b border-neutral-800 p-3">
            <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Competencias Fundamentales:</h3>
            <div className="space-y-0.5">
              {formData.competencias.map((comp: string, index: number) => (
                <p key={index} className="leading-tight text-xs">• {comp}</p>
              ))}
            </div>
          </div>
        )}

        {/* Competencias Específicas */}
        {formData.competencias_especificas && formData.competencias_especificas.length > 0 && !formData.hideSpecificCompetencies && (
          <div className="border-b border-neutral-800 p-3 bg-neutral-50/50">
            <h3 className="text-xs font-bold uppercase text-neutral-800 mb-2">
              {isUpperPrimary && (subjectName?.toLowerCase().includes('lengua') || (formData.area || formData.asignatura || '').toLowerCase().includes('lengua'))
                ? 'Competencias Específicas de la Secuencia:'
                : 'Competencias Específicas:'}
            </h3>
            <div className="space-y-1.5">
              {formData.competencias_especificas.map((comp: string, index: number) => {
                const separatorIndex = comp.indexOf(':') !== -1 ? comp.indexOf(':') : comp.indexOf(',');
                if (separatorIndex !== -1) {
                  const title = comp.substring(0, separatorIndex);
                  const rest = comp.substring(separatorIndex + 1);
                  const separator = comp[separatorIndex];
                  return (
                    <p key={index} className="leading-tight text-xs">
                      • <span className="font-bold text-neutral-900">{title}{separator}</span>{rest}
                    </p>
                  );
                }
                return <p key={index} className="leading-tight text-xs">• {comp}</p>;
              })}
            </div>
          </div>
        )}

        {/* Ejes Transversales y Áreas Articuladas */}
        {(formData.ejes_transversales || formData.areas_articuladas) && (
          <div className="border-b border-neutral-800 text-xs">
            <div className="grid grid-cols-2 divide-x divide-neutral-800 bg-white">
              <div className="p-3">
                <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1.5 font-sans">Ejes Transversales:</h3>
                {renderListOrText(formData.ejes_transversales, false, "text-xs")}
              </div>
              <div className="p-3">
                <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1.5 font-sans">Áreas Articuladas:</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-neutral-750">
                  {formData.areas_articuladas || '---'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Situación de Aprendizaje y Estrategias */}
        {(formData.intencion_pedagogica || formData.estrategia) && (
          <div className="border-b border-neutral-800 text-xs bg-neutral-50/20">
            <div className="grid grid-cols-2 divide-x divide-neutral-800">
              <div className="p-3">
                <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1.5 font-sans">Situación de Aprendizaje:</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-neutral-750">
                  {formData.intencion_pedagogica || '---'}
                </p>
              </div>
              <div className="p-3">
                <h3 className="text-[10px] font-black uppercase text-neutral-600 mb-1.5 font-sans">Estrategias de Enseñanza y Aprendizaje:</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-neutral-750">
                  {formData.estrategia || '---'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Indicadores de logro */}
        {(formData.indicadores_logro || formData.indicador_logro) && (
          <div className="border-b border-neutral-800 p-3 bg-white">
            <span className="block text-xs font-bold uppercase text-neutral-600 mb-1 font-sans">Indicadores de logro:</span>
            <div className="text-xs leading-relaxed">
              {renderListOrText(formData.indicadores_logro || formData.indicador_logro?.split('\n'), false, "text-xs")}
            </div>
          </div>
        )}

        {/* CONTENIDOS CURRICULARES (3 Columnas) */}
        <div className="border-b border-neutral-800">
          <div className="bg-[#f2f2f2] border-b border-neutral-800 text-center font-bold p-2 text-xs uppercase text-neutral-800 tracking-wider">
            CONTENIDOS CURRICULARES
          </div>
          <div className="grid grid-cols-3 bg-[#f2f2f2]/60 border-b border-neutral-800 text-center font-bold text-[10px] uppercase divide-x divide-neutral-800 text-neutral-850">
            <div className="p-1.5">CONCEPTOS</div>
            <div className="p-1.5">PROCEDIMIENTOS</div>
            <div className="p-1.5">ACTITUDES Y VALORES</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-neutral-800 bg-white">
            <div className="p-3 min-h-[150px]">
              {renderThreeColumnList(formData.conceptual || formData.contenidos_conceptuales || formData.unidades_temas)}
            </div>
            <div className="p-3">
              {renderThreeColumnList(formData.procedural || formData.contenidos_procedimentales || formData.actividades_principales)}
            </div>
            <div className="p-3">
              {renderThreeColumnList(formData.attitudinal || formData.contenidos_actitudinales || formData.evaluaciones)}
            </div>
          </div>
        </div>

        {/* Actividades (3 Columnas) */}
        <div className="border-b border-neutral-800">
          <div className="bg-[#f2f2f2] border-b border-neutral-800 text-center font-bold p-2 text-xs uppercase text-neutral-800 tracking-wider">
            Actividades
          </div>
          <div className="grid grid-cols-3 bg-[#f2f2f2]/60 border-b border-neutral-800 text-center font-bold text-[10px] uppercase divide-x divide-neutral-800 text-neutral-850">
            <div className="p-1.5">DE ENSEÑANZA</div>
            <div className="p-1.5">DE APRENDIZAJE</div>
            <div className="p-1.5">DE EVALUACIÓN</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-neutral-800 bg-white">
            <div className="p-3 min-h-[150px]">
              {renderThreeColumnList(formData.actividades_ensenanza || formData.actividadesEnsenanza)}
            </div>
            <div className="p-3">
              {renderThreeColumnList(formData.actividades_aprendizaje || formData.actividadesAprendizaje)}
            </div>
            <div className="p-3">
              {renderThreeColumnList(formData.actividades_evaluacion || formData.actividadesEvaluacion)}
            </div>
          </div>
        </div>

        {/* EVALUACIÓN Y RECURSOS (3 Columnas) */}
        <div className="border-b border-neutral-800">
          <div className="bg-[#f2f2f2] border-b border-neutral-800 text-center font-bold p-2 text-xs uppercase text-neutral-800 tracking-wider">
            EVALUACIÓN Y RECURSOS
          </div>
          <div className="grid grid-cols-3 bg-[#f2f2f2]/60 border-b border-neutral-800 text-center font-bold text-[10px] uppercase divide-x divide-neutral-800 text-neutral-850">
            <div className="p-1.5">TÉCNICAS</div>
            <div className="p-1.5">INSTRUMENTOS</div>
            <div className="p-1.5">RECURSOS</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-neutral-800 bg-white">
            <div className="p-3 min-h-[120px]">
              {renderBulletPointList(formData.tecnicas)}
            </div>
            <div className="p-3">
              {renderBulletPointList(formData.instrumentos || formData.evaluacion)}
            </div>
            <div className="p-3 bg-neutral-50/10">
              {renderBulletPointList(formData.recursos)}
            </div>
          </div>
        </div>

        {/* Actividades Complementarias de Inclusión */}
        {formData.actividad_complementaria && (
          <div className="p-3.5 bg-indigo-50/30 text-xs border-t border-neutral-800 text-neutral-900">
            <h3 className="text-xs font-bold uppercase text-indigo-900 mb-1.5 font-sans">Actividades Complementarias de Inclusión:</h3>
            {renderInclusionActivities(formData.actividad_complementaria)}
          </div>
        )}
      </div>
    );
  }

  if (isSequencePlanning) {
    // ----------------------------------------------------
    // VISTA DE IMPRESIÓN PRIMARIA (4TO, 5TO, 6TO)
    // ----------------------------------------------------
    return (
      <div className="text-sm font-sans">
        {/* Competencias Fundamentales */}
        {((Array.isArray(formData.competencias) && formData.competencias.length > 0) ||
          (Array.isArray(formData.competenciasFundamentales) && formData.competenciasFundamentales.length > 0) ||
          (typeof formData.competencias === 'string' && formData.competencias.trim().length > 0)) && (
          <div className="border-b border-neutral-800 p-3">
            <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Competencias Fundamentales:</h3>
            <div className="space-y-0.5">
              {(() => {
                const comps = formData.competencias || formData.competenciasFundamentales || [];
                const list = Array.isArray(comps) ? comps : comps.split(/\r?\n/).filter(Boolean);
                return list.map((comp: string, index: number) => (
                  <p key={index} className="leading-tight text-xs">• {comp}</p>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Competencias Específicas */}
        {((Array.isArray(formData.competencias_especificas) && formData.competencias_especificas.length > 0) ||
          (Array.isArray(formData.competenciasEspecificas) && formData.competenciasEspecificas.length > 0) ||
          (typeof formData.competencias_especificas === 'string' && formData.competencias_especificas.trim().length > 0)) &&
          !formData.hideSpecificCompetencies && (
          <div className="border-b border-neutral-800 p-3 bg-neutral-50/50">
            <h3 className="text-xs font-bold uppercase text-neutral-800 mb-2">Competencias Específicas:</h3>
            <div className="space-y-1.5">
              {(() => {
                const comps = formData.competencias_especificas || formData.competenciasEspecificas || [];
                const list = Array.isArray(comps) ? comps : comps.split(/\r?\n/).filter(Boolean);
                return list.map((comp: string, index: number) => {
                  const separatorIndex = comp.indexOf(':') !== -1 ? comp.indexOf(':') : comp.indexOf(',');
                  if (separatorIndex !== -1) {
                    const title = comp.substring(0, separatorIndex);
                    const rest = comp.substring(separatorIndex + 1);
                    const separator = comp[separatorIndex];
                    return (
                      <p key={index} className="leading-tight text-xs">
                        • <span className="font-bold text-neutral-900">{title}{separator}</span>{rest}
                      </p>
                    );
                  }
                  return <p key={index} className="leading-tight text-xs">• {comp}</p>;
                });
              })()}
            </div>
          </div>
        )}

        {/* Estrategias, Aprendizaje Significativo e Intención */}
        <div className="border-b border-neutral-800">
          {formData.estrategia && (
            <div className="border-b border-neutral-800 p-3">
              <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1.5">Estrategias y técnicas de enseñanza-aprendizaje:</h3>
              {renderInclusionActivities(formData.estrategia)}
            </div>
          )}

          {formData.aprendizaje_significativo && (
            <div className="border-b border-neutral-800 p-3 bg-neutral-50/30">
              <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Aprendizaje significativo:</h3>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{formData.aprendizaje_significativo}</p>
            </div>
          )}

          <div className="border-b border-neutral-800 p-3">
            <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Intención pedagógica del día:</h3>
            <p className="text-xs leading-relaxed">{formData.intencion_pedagogica || '---'}</p>
          </div>

          {formData.saberes_previos && (
            <div className="border-b border-neutral-800 p-3 bg-neutral-50/20">
              <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Saberes previos:</h3>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{formatMarkdownBold(formData.saberes_previos)}</p>
            </div>
          )}

          {formData.retroalimentacion && (
            <div className="border-b border-neutral-800 p-3 bg-neutral-50/20">
              <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Retroalimentación:</h3>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{formatMarkdownBold(formData.retroalimentacion)}</p>
            </div>
          )}

          {formData.indicador_logro && (
            <div className="p-3">
              <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Indicadores de logro:</h3>
              <div className="text-xs leading-relaxed">{renderListOrText(formData.indicador_logro)}</div>
            </div>
          )}
        </div>

        {/* Tabla Principal de Actividades */}
        <div className="border-b border-neutral-800">
          <div className="grid grid-cols-12 bg-blue-50/80 border-b border-neutral-800 font-bold text-xs uppercase text-center divide-x divide-neutral-800">
            <div className="col-span-2 p-2 flex items-center justify-center">Momento de la clase/duración</div>
            <div className="col-span-6 p-2 flex items-center justify-center">Actividades</div>
            <div className="col-span-2 p-2 flex items-center justify-center text-[10px]">Número/letra de la actividad de la secuencia</div>
            <div className="col-span-2 p-2 flex items-center justify-center">Recursos</div>
          </div>

          {momentos.map((m: any, idx: number) => {
            return (
              <div key={idx} className="grid grid-cols-12 border-b border-neutral-800 last:border-b-0 divide-x divide-neutral-800">
                <div className="col-span-2 p-3 flex flex-col justify-center items-center text-center bg-neutral-50/50">
                  <div className="font-extrabold text-neutral-900 text-xs mb-0.5">{getMomentLabel(idx, m)}</div>
                  <div className="text-[11px] font-normal text-neutral-500 mt-0.5">{formatTimeText(m.tiempo)}</div>
                </div>
                <div className={`col-span-6 p-3 text-xs leading-relaxed ${m.hideDescription && (!m.actividadesDiferenciadas || m.actividadesDiferenciadas.length === 0) ? 'flex items-center justify-center text-center' : ''}`}>
                  <p className="whitespace-pre-wrap">{renderMomentDescription(m)}</p>
                  {m.actividadesDiferenciadas && m.actividadesDiferenciadas.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-dashed border-neutral-300">
                      <h5 className="font-bold text-[11px] text-neutral-900 uppercase tracking-wide mb-1.5">ACTIVIDADES DIFERENCIADAS:</h5>
                      <div className="space-y-3">
                        {m.actividadesDiferenciadas.map((ad: any, adIdx: number) => (
                          <div key={ad.id || adIdx} className="text-xs">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap font-bold">
                              <span className="uppercase text-neutral-955 font-black">
                                {ad.nivel === 'E' ? 'ELEMENTAL (E)' : ad.nivel === 'A' ? 'ACEPTABLE (A)' : 'SATISFACTORIO (S)'}
                              </span>
                              {ad.estudiantesNames && ad.estudiantesNames.length > 0 && (
                                <span className="text-neutral-700 normal-case font-medium">
                                  - <strong className="font-extrabold text-neutral-900">Alumnos:</strong> {ad.estudiantesNames.join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="text-neutral-900 leading-relaxed">
                              {renderFormattedActivityText(ad.descripcion)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-2 p-3 flex flex-col items-center justify-center gap-1.5 bg-neutral-50/20">
                  {!m.orden_actividad && !m.numero_actividad && (
                    <span className="text-neutral-500 italic text-[10px]">No registrado</span>
                  )}
                  {m.orden_actividad && (() => {
                    const val = m.orden_actividad.toString().trim();
                    if (!val) return null;
                    if (/^\d+$/.test(val)) {
                      return (
                        <span className="border border-neutral-800 text-neutral-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white whitespace-nowrap shadow-xs text-center">
                          Actividad #{val}
                        </span>
                      );
                    }
                    return (
                      <span className="text-[10px] text-neutral-755 font-normal text-center block w-full leading-normal whitespace-pre-wrap">
                        {val}
                      </span>
                    );
                  })()}
                  {m.numero_actividad && (() => {
                    const val = m.numero_actividad.toString().trim();
                    if (!val) return null;
                    const cleanParts = val.split(/[, ]+/).filter(Boolean);
                    const isShortIndicator = /^[A-Za-z0-9,\s\-]+$/.test(val) && 
                                             cleanParts.every((part: string) => part.trim().length <= 3);

                    if (isShortIndicator) {
                      return (
                        <div className="flex flex-wrap justify-center gap-1">
                          {cleanParts.map((part: string, pIdx: number) => {
                            const cleanPart = part.replace(/[^A-Za-z0-9]/g, '');
                            if (!cleanPart) return null;
                            
                            if (cleanPart.length === 1 && /[A-Za-z]/.test(cleanPart)) {
                              return (
                                <span key={pIdx} className="w-6 h-6 rounded-full border border-amber-400 text-blue-700 font-extrabold flex items-center justify-center text-xs bg-white shadow-xs">
                                  {cleanPart.toUpperCase()}
                                </span>
                              );
                            }
                            return (
                              <span key={pIdx} className="border border-neutral-400 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white shadow-xs">
                                {cleanPart}
                              </span>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                      <span className="text-[10px] text-neutral-755 font-normal text-center block w-full leading-normal whitespace-pre-wrap">
                        {val}
                      </span>
                    );
                  })()}
                </div>
                <div className="col-span-2 p-3 text-xs leading-relaxed">
                  {renderResourcesList(m.recursos || formData.recursos?.join(', '))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fila de Cierre / Complementarias */}
        <div className="grid grid-cols-2 border-b border-neutral-800 text-xs">
          <div className="p-3 border-r border-neutral-800">
            <h4 className="font-bold text-xs mb-1 uppercase text-neutral-800">Actividades complementarias para la diversidad:</h4>
            <div className="leading-relaxed">
              {renderInclusionActivities(formData.actividad_complementaria)}
            </div>
          </div>
          <div className="p-3 bg-neutral-50/20">
            <h4 className="font-bold text-xs mb-1 uppercase text-neutral-800">Actividad recomendada para el Cuaderno:</h4>
            <p className="whitespace-pre-wrap leading-relaxed">{formData.actividad_cuaderno || 'No descrita.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA DE IMPRESIÓN PRIMARIA (1RO, 2DO, 3RO - CON BASE)
  // ----------------------------------------------------
  return (
    <div className="text-sm font-sans">
      {/* Competencias Fundamentales */}
      {((Array.isArray(formData.competencias) && formData.competencias.length > 0) ||
        (Array.isArray(formData.competenciasFundamentales) && formData.competenciasFundamentales.length > 0) ||
        (typeof formData.competencias === 'string' && formData.competencias.trim().length > 0)) && (
        <div className="border-b border-neutral-800 p-3">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1">Competencias Fundamentales:</h3>
          <div className="space-y-0.5">
            {(() => {
              const comps = formData.competencias || formData.competenciasFundamentales || [];
              const list = Array.isArray(comps) ? comps : comps.split(/\r?\n/).filter(Boolean);
              return list.map((comp: string, index: number) => (
                <p key={index} className="leading-tight text-xs">• {comp}</p>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Competencias Específicas */}
      {((Array.isArray(formData.competencias_especificas) && formData.competencias_especificas.length > 0) ||
        (Array.isArray(formData.competenciasEspecificas) && formData.competenciasEspecificas.length > 0) ||
        (typeof formData.competencias_especificas === 'string' && formData.competencias_especificas.trim().length > 0)) &&
        !formData.hideSpecificCompetencies && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/50">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-2">Competencias Específicas:</h3>
          <div className="space-y-1.5">
            {(() => {
              const comps = formData.competencias_especificas || formData.competenciasEspecificas || [];
              const list = Array.isArray(comps) ? comps : comps.split(/\r?\n/).filter(Boolean);
              return list.map((comp: string, index: number) => {
                const separatorIndex = comp.indexOf(':') !== -1 ? comp.indexOf(':') : comp.indexOf(',');
                if (separatorIndex !== -1) {
                  const title = comp.substring(0, separatorIndex);
                  const rest = comp.substring(separatorIndex + 1);
                  const separator = comp[separatorIndex];
                  return (
                    <p key={index} className="leading-tight text-xs">
                      • <span className="font-bold text-neutral-900">{title}{separator}</span>{rest}
                    </p>
                  );
                }
                return <p key={index} className="leading-tight text-xs">• {comp}</p>;
              });
            })()}
          </div>
        </div>
      )}

      {/* Bloque y Actividad */}
      {isMatOrLengua && !grade.includes('secundaria') && !grade.includes('sec') && (
        <div className="grid grid-cols-2 text-xs border-b border-neutral-800">
          <div className="p-3 border-r border-neutral-800">
            <span className="block text-xs font-bold uppercase text-neutral-600 mb-0.5">Bloque:</span>
            <p className="font-bold text-neutral-800">{blockTitle || formData.bloque || 'Bloque 1'}</p>
          </div>
          <div className="p-3">
            <span className="block text-xs font-bold uppercase text-neutral-600 mb-0.5">Actividad:</span>
            <p className="font-bold text-neutral-800">{formData.actividad_titulo || 'Actividad #1'}</p>
          </div>
        </div>
      )}

      {/* Intención Pedagógica */}
      {(formData.intencion_pedagogica || formData.intencionPedagogica || formData.situacion_aprendizaje) && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/30">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1">
            {formData.situacion_aprendizaje && !formData.intencion_pedagogica ? 'Situación de Aprendizaje:' : 'Intención Pedagógica del Día:'}
          </span>
          <p className="text-xs leading-relaxed">{formData.intencion_pedagogica || formData.intencionPedagogica || formData.situacion_aprendizaje}</p>
        </div>
      )}

      {/* Estrategias de Enseñanza */}
      {formData.estrategia && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/20">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">Estrategias de Enseñanza y Aprendizaje:</span>
          {renderInclusionActivities(formData.estrategia)}
        </div>
      )}

      {/* Indicadores de logro */}
      {(formData.indicador_logro || formData.indicadores_logro || formData.indicadoresLogro) && (
        <div className="border-b border-neutral-800 p-3 bg-white">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1">Indicadores de logro:</span>
          <div className="text-xs leading-relaxed">{renderListOrText(formData.indicador_logro || formData.indicadores_logro || formData.indicadoresLogro)}</div>
        </div>
      )}

      {/* Ejes Transversales */}
      {(formData.ejes_transversales || formData.ejesTransversales) && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/10">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1">Ejes Transversales:</span>
          <ul className="text-xs leading-relaxed list-disc pl-5 space-y-0.5">
            {(() => {
              const ejes = formData.ejes_transversales || formData.ejesTransversales || '';
              const list = Array.isArray(ejes) ? ejes : ejes.split('\n');
              return list
                .filter((e: string) => e && e.trim())
                .map((eje: string, i: number) => (
                  <li key={i}>{eje.trim()}</li>
                ));
            })()}
          </ul>
        </div>
      )}

      {/* Saberes previos (si existen) */}
      {formData.saberes_previos && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/20">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1">Saberes previos:</span>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{formatMarkdownBold(formData.saberes_previos)}</p>
        </div>
      )}

      {/* Retroalimentación (si existen) */}
      {formData.retroalimentacion && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/20">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1">Retroalimentación:</span>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{formatMarkdownBold(formData.retroalimentacion)}</p>
        </div>
      )}

      {/* Momentos - Tabla */}
      {momentos.length > 0 && (
        <div className="border-b border-neutral-800">
          <div className="grid grid-cols-12 bg-neutral-100 border-b border-neutral-800 font-bold text-xs uppercase text-center divide-x divide-neutral-800">
            <div className="col-span-2 p-2 flex items-center justify-center">Momentos</div>
            <div className="col-span-5 p-2 flex items-center justify-center">Actividades</div>
            <div className="col-span-2 p-2 flex items-center justify-center">Tiempo</div>
            <div className="col-span-3 p-2 flex items-center justify-center">Recursos</div>
          </div>
          {momentos.map((m: any, index: number) => (
            <div key={index} className="grid grid-cols-12 border-b border-neutral-800 last:border-b-0 divide-x divide-neutral-800">
              <div className="col-span-2 p-2.5 bg-neutral-50/50 font-bold flex items-center justify-center text-center text-xs uppercase text-neutral-800">
                {getMomentLabel(index, m)}
              </div>
              <div className={`col-span-5 p-3 text-xs leading-relaxed ${m.hideDescription && (!m.actividadesDiferenciadas || m.actividadesDiferenciadas.length === 0) ? 'flex items-center justify-center text-center' : ''}`}>
                <p className="whitespace-pre-wrap">{renderMomentDescription(m)}</p>
                {m.actividadesDiferenciadas && m.actividadesDiferenciadas.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-neutral-300">
                    <h5 className="font-bold text-[11px] text-neutral-900 uppercase tracking-wide mb-1.5">ACTIVIDADES DIFERENCIADAS:</h5>
                    <div className="space-y-3">
                      {m.actividadesDiferenciadas.map((ad: any, adIdx: number) => (
                        <div key={ad.id || adIdx} className="text-xs">
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap font-bold">
                            <span className="uppercase text-neutral-955 font-black">
                              {ad.nivel === 'E' ? 'ELEMENTAL (E)' : ad.nivel === 'A' ? 'ACEPTABLE (A)' : 'SATISFACTORIO (S)'}
                            </span>
                            {ad.estudiantesNames && ad.estudiantesNames.length > 0 && (
                              <span className="text-neutral-700 normal-case font-medium">
                                - <strong className="font-extrabold text-neutral-900">Alumnos:</strong> {ad.estudiantesNames.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-900 leading-relaxed">
                            {renderFormattedActivityText(ad.descripcion)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-2 p-2.5 text-center flex items-center justify-center font-bold text-neutral-750">
                {/^\d+\s*$/.test(m.tiempo || '') ? `${m.tiempo} minutos` : m.tiempo}
              </div>
              <div className="col-span-3 p-3 text-xs leading-relaxed">
                {renderResourcesList(m.recursos)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid del Footer: Metacognición, Evaluación, Tarea */}
      <div className="grid grid-cols-3 border-b border-neutral-800 text-xs divide-x divide-neutral-800">
        <div className="p-3">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1.5">Metacognición {formData.metacognicion_tiempo ? `(${formData.metacognicion_tiempo} min)` : ''}:</h3>
          <p className="whitespace-pre-wrap min-h-[60px] leading-relaxed text-neutral-750">
            {formData.recursos_adicionales || formData.metacognicion || '---'}
          </p>
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1.5">Evaluación formativa {formData.evaluacion_tiempo ? `(${formData.evaluacion_tiempo} min)` : ''}:</h3>
          <p className="whitespace-pre-wrap min-h-[60px] leading-relaxed text-neutral-750">
            {formData.evaluacion || '---'}
          </p>
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1.5">Tarea para el Hogar:</h3>
          <p className="whitespace-pre-wrap min-h-[60px] leading-relaxed text-neutral-755">
            {formData.tarea_hogar || formData.tarea || '---'}
          </p>
        </div>
      </div>

      {/* Actividades Complementarias - Ancho completo */}
      {formData.actividad_complementaria && (
        <div className="p-3.5 bg-indigo-50/30 text-xs border-t border-neutral-800">
          <h3 className="text-xs font-bold uppercase text-indigo-900 mb-1.5">Actividades Complementarias de Inclusión:</h3>
          {renderInclusionActivities(formData.actividad_complementaria)}
        </div>
      )}
    </div>
  );
}
