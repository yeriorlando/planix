import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import { Unit, ContentBlock } from '../../lib/data/unitCurriculum';

interface UnitContentEditorProps {
  unit: Unit;
  onSave: (blocks: ContentBlock[]) => Promise<void>;
}

export default function UnitContentEditor({ unit, onSave }: UnitContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (unit) {
      let initialBlocks: ContentBlock[] = [];

      if (Array.isArray(unit.conceptual_content) && unit.conceptual_content.length > 0) {
        if (typeof unit.conceptual_content[0] === 'object') {
          initialBlocks = unit.conceptual_content as unknown as ContentBlock[];
        } else if (typeof unit.conceptual_content[0] === 'string') {
          const firstItem = unit.conceptual_content[0] as string;
          const isLegacyStr = !firstItem.trim().startsWith('{');

          if (isLegacyStr) {
            initialBlocks = [{
              id: crypto.randomUUID(),
              themes: [],
              conceptual: (unit.conceptual_content as string[]).join('\n'),
              procedural: (unit.procedural_content || []).join('\n'),
              attitudinal: (unit.attitudinal_content || []).join('\n')
            }];
          } else {
            try {
              initialBlocks = (unit.conceptual_content as unknown as string[]).map(s => JSON.parse(s));
            } catch (e) {
              console.error("Failed to parse blocks", e);
            }
          }
        }
      }

      setBlocks(initialBlocks);

      // Expand all by default
      const initialExpanded: Record<string, boolean> = {};
      initialBlocks.forEach(b => {
        initialExpanded[b.id] = true;
      });
      setExpandedBlocks(initialExpanded);
    }
  }, [unit]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(blocks);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = () => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      themes: [],
      conceptual: '',
      procedural: '',
      attitudinal: ''
    };
    setBlocks([...blocks, newBlock]);
    setExpandedBlocks(prev => ({ ...prev, [newBlock.id]: true }));
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlockValue = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const toggleThemeSelection = (blockId: string, themeName: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const newThemes = b.themes.includes(themeName)
          ? b.themes.filter(t => t !== themeName)
          : [...b.themes, themeName];
        return { ...b, themes: newThemes };
      }
      return b;
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const availableThemeOptions: string[] = [];
  unit.themes?.forEach(theme => {
    availableThemeOptions.push(theme.name);
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-zinc-950">
      {/* Editor Header */}
      <div className="p-6 border-b border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md flex justify-between items-center sticky top-0 z-10 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-zinc-100">{unit.name}</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400">Contenidos Curriculares de la Unidad</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddBlock}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all focus:outline-none rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-700 dark:text-zinc-300 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Bloque
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl bg-[#0046ab] hover:bg-[#00388a] text-white shadow-md shadow-[#0046ab]/20 cursor-pointer"
          >
            {isSaving ? (
              <span className="flex items-center gap-1">⏳ Guardando...</span>
            ) : (
              <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Guardar Bloques</span>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-6 overflow-y-auto flex-1">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Instructions Alert */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 shadow-xs">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Organización de Bloques</h4>
                <p className="text-blue-700 dark:text-blue-450 text-xs mt-1 leading-relaxed">
                  Crea bloques con contenidos conceptuales, procedimentales y actitudinales, y asócialos a los temas correspondientes.
                  Planix utilizará estos contenidos para pre-llenar los formularios de planificación diaria automáticamente.
                </p>
              </div>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-neutral-200 dark:border-zinc-800 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-zinc-150 mb-1">No hay contenidos en esta unidad</h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">Empieza a estructurar el currículo separándolo en bloques para diferentes temas de la unidad.</p>
              <button
                onClick={handleAddBlock}
                className="px-5 py-2.5 bg-[#0046ab] hover:bg-[#00388a] text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-all"
              >
                Añadir Primer Bloque
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => {
                const isExpanded = expandedBlocks[block.id];
                return (
                  <div key={block.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-100 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
                    {/* Header Acordeón */}
                    <div
                      className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-800/40"
                      onClick={() => toggleExpand(block.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-neutral-450">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        <h3 className="font-bold text-sm text-neutral-800 dark:text-zinc-200">
                          Bloque de Contenido {index + 1}
                        </h3>
                        {block.themes.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/30">
                            {block.themes.length} {block.themes.length === 1 ? 'tema vinculado' : 'temas vinculados'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-550 border border-amber-100/30 dark:border-amber-900/30">
                            Sin vincular
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveBlock(block.id); }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body Acordeón */}
                    {isExpanded && (
                      <div className="p-5 border-t border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
                        {/* Selector de Temas */}
                        <div className="mb-6 bg-neutral-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-zinc-800">
                          <h4 className="text-xs font-bold text-neutral-600 dark:text-zinc-400 mb-3 uppercase tracking-wider">Vincular a Temas de la Unidad</h4>
                          {availableThemeOptions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {availableThemeOptions.map(themeOption => {
                                const isSelected = block.themes.includes(themeOption);
                                return (
                                  <button
                                    key={themeOption}
                                    type="button"
                                    onClick={() => toggleThemeSelection(block.id, themeOption)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/60 dark:text-blue-400'
                                        : 'bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:border-neutral-300 dark:hover:border-zinc-700'
                                    }`}
                                  >
                                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <Square className="w-3.5 h-3.5" />}
                                    {themeOption}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 dark:text-zinc-400 italic">No hay temas configurados en esta unidad.</p>
                          )}
                        </div>

                        {/* Textareas */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Contenidos Conceptuales</label>
                            <textarea
                              value={block.conceptual}
                              onChange={(e) => updateBlockValue(block.id, { conceptual: e.target.value })}
                              placeholder="Ej: Los puntos cardinales&#10;Orientación y planos..."
                              rows={3}
                              className="w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-bold text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Contenidos Procedimentales</label>
                            <textarea
                              value={block.procedural}
                              onChange={(e) => updateBlockValue(block.id, { procedural: e.target.value })}
                              placeholder="Ej: Ubicación de los puntos cardinales...&#10;Trazado de mapas sencillos..."
                              rows={3}
                              className="w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-bold text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Contenidos Actitudinales</label>
                            <textarea
                              value={block.attitudinal}
                              onChange={(e) => updateBlockValue(block.id, { attitudinal: e.target.value })}
                              placeholder="Ej: Valoración de la importancia de ubicarse...&#10;Respeto hacia el espacio común..."
                              rows={3}
                              className="w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-bold text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
