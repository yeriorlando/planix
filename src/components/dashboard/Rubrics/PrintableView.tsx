import React from 'react';

interface PrintableViewProps {
    rubric: any;
    classroomName?: string;
    studentName?: string;
    evaluation?: any;
    indicators?: string[];
    competencies?: string[];
}

export default function PrintableView({ rubric, classroomName, studentName, evaluation, indicators, competencies }: PrintableViewProps) {
    if (!rubric) return null;

    const title = rubric.title || rubric.titulo || '';
    const type = rubric.type || rubric.tipo || 'RUBRIC';
    const criteria = rubric.criteria || rubric.criterios || [];
    const hasIndicators = indicators && indicators.some(i => i.trim() !== '');
    const hasCompetencies = competencies && competencies.some(c => c.trim() !== '');

    // Adaptador para obtener puntuaciones y estados seleccionados de forma compatible
    const getSelectedScore = (criterion: any) => {
        const cId = criterion.id;
        const cName = criterion.name || criterion.nombre;
        
        if (evaluation?.scores) {
            if (cId && evaluation.scores[cId] !== undefined) {
                return typeof evaluation.scores[cId] === 'object' ? evaluation.scores[cId].score : evaluation.scores[cId];
            }
            if (cName && evaluation.scores[cName] !== undefined) {
                return typeof evaluation.scores[cName] === 'object' ? evaluation.scores[cName].score : evaluation.scores[cName];
            }
        }
        
        const evals = evaluation?.evaluaciones || evaluation;
        if (evals) {
            if (cId && evals[cId] !== undefined) return evals[cId];
            if (cName && evals[cName] !== undefined) return evals[cName];
        }
        
        return undefined;
    };

    // Obtener los niveles cualitativos de la rúbrica basándose en el primer criterio para estructurar las columnas de forma dinámica
    const rubricLevels = React.useMemo(() => {
        if (criteria.length === 0) return [];
        return criteria[0].niveles || [];
    }, [criteria]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white !important;
                    }
                    /* Eliminar fondos y bordes de los contenedores padres invisibles para evitar cuadros crema o bordes parásitos */
                    body, html, main, div:not(#printable-content):not(#printable-content *) {
                        background: transparent !important;
                        background-color: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #printable-content {
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        background: white !important;
                        z-index: 9999 !important;
                    }
                    #printable-content * {
                        visibility: visible !important;
                    }
                    /* Forzar colores de fondo de impresión específicos para mantener la estética premium */
                    #printable-content .bg-neutral-900 {
                        background-color: #1A1A1A !important;
                        color: white !important;
                    }
                    #printable-content .bg-neutral-200 {
                        background-color: #E5E5E5 !important;
                    }
                    #printable-content .bg-neutral-50 {
                        background-color: #F9F9F9 !important;
                    }
                    #printable-content .bg-neutral-100 {
                        background-color: #F3F4F6 !important;
                    }
                    @page {
                        size: portrait;
                        margin: 10mm;
                    }
                }
            `}} />
            <div id="printable-content" className="hidden print:block bg-white w-full">
                <div className="w-full flex flex-col items-stretch">
                    {/* Header */}
                    <div className="border-b-2 border-neutral-900 pb-8 mb-10 text-center w-full">
                        <div className="flex flex-col items-center mb-6">
                            <div className="text-[11px] uppercase font-black tracking-[0.2em] text-neutral-500 mb-2">
                                Instrumento de Evaluación
                            </div>
                            <h1 className="text-2xl font-black text-neutral-900 uppercase leading-tight mb-4 w-full">
                                {title}
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="bg-neutral-900 rounded-lg px-4 py-2 text-[11px] font-black text-white uppercase tracking-widest">
                                    {type === 'CHECKLIST' ? 'Lista de Cotejo' : 'Rúbrica'}
                                </div>
                                {classroomName && (
                                    <div className="text-base font-black text-neutral-900 border-l-4 border-neutral-900 pl-4 uppercase tracking-wider">
                                        {classroomName}
                                    </div>
                                )}
                            </div>
                            <div className="text-base font-bold text-neutral-800 uppercase tracking-widest mt-2">
                                FECHA: {new Date().toLocaleDateString('es-DO')}
                            </div>
                        </div>

                        <div className="bg-neutral-50 p-5 rounded-2xl border-2 border-neutral-200 print:bg-white text-left mx-auto w-full">
                            <span className="text-[11px] font-black uppercase text-neutral-500 tracking-widest">Estudiante Evaluado</span>
                            <div className="text-2xl font-black text-neutral-900 uppercase tracking-tight border-b-4 border-neutral-900 pb-2 mt-2">
                                {studentName || '____________________________________________________________________'}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full">
                        {type === 'CHECKLIST' ? (
                            <table className="w-full border-collapse border-[3px] border-neutral-900">
                                <thead>
                                    <tr className="bg-neutral-100">
                                        <th className="border-[3px] border-neutral-900 p-4 text-left w-[50%] font-black uppercase text-[12px] tracking-wider">Indicador de Verificación</th>
                                        <th className="border-[3px] border-neutral-900 p-4 text-center w-[12%] font-black uppercase text-[12px] tracking-wider">Sí</th>
                                        <th className="border-[3px] border-neutral-900 p-4 text-center w-[12%] font-black uppercase text-[12px] tracking-wider">No</th>
                                        <th className="border-[3px] border-neutral-900 p-4 text-center w-[26%] font-black uppercase text-[12px] tracking-wider">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {criteria.map((criterion: any, idx: number) => {
                                        const score = getSelectedScore(criterion);
                                        const hasScore = score !== undefined;

                                        const logradoLvl = criterion.niveles?.find((l: any) => l.nombre.toLowerCase().includes("logrado") && !l.nombre.toLowerCase().includes("no"));
                                        const noLogradoLvl = criterion.niveles?.find((l: any) => l.nombre.toLowerCase().includes("no logrado"));
                                        
                                        const targetLogrado = logradoLvl ? logradoLvl.puntos : 1;
                                        const targetNoLogrado = noLogradoLvl ? noLogradoLvl.puntos : 0;

                                        const isYes = hasScore && score === targetLogrado;
                                        const isNo = hasScore && score === targetNoLogrado;
                                        const cName = criterion.name || criterion.nombre || '';

                                        return (
                                            <tr key={criterion.id || idx}>
                                                <td className="border-[3px] border-neutral-900 p-5 text-sm font-bold leading-relaxed">
                                                    <div className="flex gap-4">
                                                        <span className="opacity-40">{idx + 1}.</span>
                                                        {cName}
                                                    </div>
                                                </td>
                                                <td className="border-[3px] border-neutral-900 p-3 text-center align-middle">
                                                    {isYes && (
                                                        <div className="w-8 h-8 mx-auto bg-neutral-900 rounded-full flex items-center justify-center text-white text-sm font-black">✓</div>
                                                    )}
                                                </td>
                                                <td className="border-[3px] border-neutral-900 p-3 text-center align-middle">
                                                    {isNo && (
                                                        <div className="w-8 h-8 mx-auto border-2 border-neutral-900 rounded-full flex items-center justify-center text-neutral-900 text-sm font-black">✗</div>
                                                    )}
                                                </td>
                                                <td className="border-[3px] border-neutral-900 p-3"></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full border-collapse border-[3px] border-neutral-900">
                                <thead>
                                    <tr className="bg-neutral-100">
                                        <th className="border-[3px] border-neutral-900 p-4 text-left w-[20%] font-black uppercase text-[12px] tracking-wider">Criterio / Aspecto</th>
                                        {rubricLevels.map((lvlHeader: any) => (
                                            <th key={lvlHeader.nombre} className="border-[3px] border-neutral-900 p-4 text-center font-black uppercase text-[11px] tracking-wider leading-tight">
                                                <div>{lvlHeader.nombre}</div>
                                                <div className="text-[9px] font-bold opacity-60 mt-1">({lvlHeader.puntos} PTS)</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {criteria.map((criterion: any, idx: number) => {
                                        const cName = criterion.name || criterion.nombre || '';
                                        const levels = criterion.levels || criterion.niveles || [];
                                        const score = getSelectedScore(criterion);

                                        return (
                                            <tr key={criterion.id || idx} className="break-inside-avoid">
                                                <td className="border-[3px] border-neutral-900 p-5 align-top bg-neutral-50 font-black text-[13px] leading-tight">
                                                    {cName}
                                                </td>
                                                {rubricLevels.map((lvlHeader: any) => {
                                                    const currentLvl = levels.find((l: any) => 
                                                        l.nombre.toLowerCase() === lvlHeader.nombre.toLowerCase() ||
                                                        l.name?.toLowerCase() === lvlHeader.nombre.toLowerCase()
                                                    ) || levels.find((l: any) => 
                                                        l.puntos === lvlHeader.puntos
                                                    );

                                                    const isSelected = score !== undefined && score === (currentLvl ? currentLvl.puntos : lvlHeader.puntos);

                                                    return (
                                                        <td 
                                                            key={lvlHeader.nombre} 
                                                            className={`border-[3px] border-neutral-900 p-5 align-top text-[11px] leading-relaxed ${
                                                                isSelected ? 'bg-neutral-200 font-bold' : ''
                                                            }`}
                                                        >
                                                            {currentLvl?.description || currentLvl?.descripcion || '-'}
                                                            {isSelected && (
                                                                <div className="mt-3 text-[10px] font-black px-2 py-1 bg-neutral-900 text-white text-center rounded uppercase tracking-tighter">
                                                                    Seleccionado
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Indicators and Competencies */}
                    {(hasIndicators || hasCompetencies) && (
                        <div className="mt-8 space-y-8 max-w-[95%] mx-auto w-full">
                            {hasCompetencies && (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase text-neutral-800 tracking-widest border-b-2 border-neutral-900 pb-1">Competencias</h4>
                                    <div className="space-y-2">
                                        {competencies.filter(c => c.trim() !== '').map((comp, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <span className="text-sm text-neutral-900 font-black">{idx + 1}.</span>
                                                <p className="text-sm text-neutral-900 font-medium leading-relaxed">
                                                    {comp}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {hasIndicators && (
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase text-neutral-800 tracking-widest border-b-2 border-neutral-900 pb-1">Indicadores de Logro</h4>
                                    <div className="space-y-2">
                                        {indicators.filter(i => i.trim() !== '').map((ind, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <span className="text-sm text-neutral-900 font-black">{idx + 1}.</span>
                                                <p className="text-sm text-neutral-900 font-medium leading-relaxed">
                                                    {ind}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subtle Attribution */}
                    <div className="mt-10 mb-6 text-center text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                        GENERADO POR PLANIX - SISTEMA DE PLANIFICACIÓN ESCOLAR
                    </div>
                </div>
            </div>
        </>
    );
}
