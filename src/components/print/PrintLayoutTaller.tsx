import React from 'react';

interface PrintLayoutTallerProps {
  formData: any;
  formType?: string;
  subjectName: string;
  sequenceTitle?: string;
  blockTitle?: string | number;
  orientation?: 'portrait' | 'landscape';
  planningType?: string;
}

const renderMarkdownInline = (text: string) => {
  if (!text) return "";
  let cleaned = text.replace(/\*(?!\*)(.*?)\*\*/g, '**$1**');
  cleaned = cleaned.replace(/\*\*(.*?)\*(?!\*)/g, '**$1**');
  
  const segments = cleaned.split("**");
  return segments.map((seg, i) => {
    if (i % 2 === 1) {
      const cleanSeg = seg.replace(/\*/g, '');
      return <strong key={i} className="font-extrabold text-neutral-900">{cleanSeg}</strong>;
    }
    const cleanSeg = seg.replace(/\*/g, '');
    return cleanSeg;
  });
};

const renderResourcesList = (recursos: any) => {
  if (!recursos) return <p className="text-neutral-500 italic">---</p>;
  const rawRec = recursos.toString().trim();
  if (!rawRec || rawRec === '---') {
    return <p className="text-neutral-500 italic">---</p>;
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

const renderListOrText = (data: any, className: string = "text-xs") => {
  if (!data) return <p className="text-neutral-500 italic">No registrado.</p>;
  
  let items: string[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'string') {
    items = data.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (items.length === 0) return <p className="text-neutral-500 italic">No registrado.</p>;

  return (
    <ul className="list-disc list-inside space-y-1 text-left leading-relaxed">
      {items.map((item, index) => {
        const cleanRegex = /^\s*(?:[-•+–—·]\s*|\*(?!\*)\s*)+/;
        let cleanItem = item.replace(cleanRegex, '').trim();
        return <li key={index} className={`${className} text-neutral-750`}>{cleanItem}</li>;
      })}
    </ul>
  );
};

export default function PrintLayoutTaller({
  formData,
}: PrintLayoutTallerProps) {
  const momentos = formData.momentos || [];

  const validSpecifics = (formData.competencias_especificas || []).filter((comp: any) => {
    if (typeof comp !== 'string') return false;
    const separatorIndex = comp.indexOf(':');
    if (separatorIndex === -1) return false;
    const rest = comp.substring(separatorIndex + 1).trim();
    if (!rest || rest.toLowerCase().includes("sin descripción") || rest.toLowerCase().includes("haz clic en")) return false;
    return true;
  });

  return (
    <div className="text-sm font-sans">

      {/* Objetivo Pedagógico */}
      {formData.objetivo_pedagogico && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/30">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1 font-sans">Objetivo Pedagógico:</span>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{formData.objetivo_pedagogico}</p>
        </div>
      )}

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
      {validSpecifics.length > 0 && (
        <div className="border-b border-neutral-800 p-3 bg-neutral-50/50">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-2">Competencias Específicas:</h3>
          <div className="space-y-1.5">
            {validSpecifics.map((comp: string, index: number) => {
              const separatorIndex = comp.indexOf(':');
              const title = comp.substring(0, separatorIndex);
              const rest = comp.substring(separatorIndex + 1);
              return (
                <p key={index} className="leading-tight text-xs">
                  • <span className="font-bold text-neutral-900">{title}:</span>{rest}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicadores de logro */}
      {formData.indicador_logro && (
        <div className="border-b border-neutral-800 p-3 bg-white">
          <span className="block text-xs font-bold uppercase text-neutral-600 mb-1 font-sans">Indicadores de logro:</span>
          <div className="text-xs leading-relaxed">
            {renderListOrText(formData.indicador_logro.split('\n'))}
          </div>
        </div>
      )}

      {/* Contenidos Curriculares (3 Columnas) */}
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
          <div className="p-3 min-h-[100px] text-xs text-neutral-755 whitespace-pre-wrap leading-relaxed">
            {formData.conceptual || '---'}
          </div>
          <div className="p-3 text-xs text-neutral-755 whitespace-pre-wrap leading-relaxed">
            {formData.procedimental || '---'}
          </div>
          <div className="p-3 text-xs text-neutral-755 whitespace-pre-wrap leading-relaxed">
            {formData.actitudinal || '---'}
          </div>
        </div>
      </div>

      {/* Secuencia Didáctica (Momentos) - Tabla */}
      {momentos.length > 0 && (
        <div className="border-b border-neutral-800">
          <div className="bg-[#f2f2f2] border-b border-neutral-800 text-center font-bold p-2 text-xs uppercase text-neutral-800 tracking-wider">
            SECUENCIA DIDÁCTICA (MOMENTOS DE LA CLASE)
          </div>
          <div className="grid grid-cols-12 bg-neutral-100 border-b border-neutral-800 font-bold text-xs uppercase text-center divide-x divide-neutral-800">
            <div className="col-span-2 p-2 flex items-center justify-center">Momentos</div>
            <div className="col-span-5 p-2 flex items-center justify-center">Actividades</div>
            <div className="col-span-2 p-2 flex items-center justify-center">Tiempo</div>
            <div className="col-span-3 p-2 flex items-center justify-center">Recursos</div>
          </div>
          {momentos.map((m: any, index: number) => (
            <div key={index} className="grid grid-cols-12 border-b border-neutral-800 last:border-b-0 divide-x divide-neutral-800">
              <div className="col-span-2 p-2.5 bg-neutral-50/50 font-bold flex items-center justify-center text-center text-xs uppercase text-neutral-800">
                {m.moment || `Momento ${index + 1}`}
              </div>
              <div className="col-span-5 p-3 text-xs leading-relaxed text-neutral-755 whitespace-pre-wrap text-left">
                {renderMarkdownInline(m.descripcion || '---')}
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

      {/* Footer: Evaluación */}
      {formData.evaluacion && (
        <div className="border-t border-neutral-800 text-xs p-3 text-left bg-neutral-50/20">
          <h3 className="text-xs font-bold uppercase text-neutral-800 mb-1.5 font-sans">
            Evaluación {formData.evaluacion_tiempo ? `(${formData.evaluacion_tiempo} min)` : ''}:
          </h3>
          <div className="whitespace-pre-wrap min-h-[60px] leading-relaxed text-neutral-755">
            {renderMarkdownInline(formData.evaluacion)}
          </div>
        </div>
      )}
    </div>
  );
}
