import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Search, Building2, MapPin, Loader2, Plus, X, ChevronRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestD1 } from "../../lib/services/d1Client";

interface School {
  id: string;
  name: string;
  regional: string | null;
  district: string | null;
  municipality: string | null;
}

interface SchoolAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSchoolSelect?: (school: School) => void;
  placeholder?: string;
}

export default function SchoolAutocomplete({
  value,
  onChange,
  onSchoolSelect,
  placeholder = "Buscar centro educativo...",
}: SchoolAutocompleteProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [manualName, setManualName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSearchQuery(value || "");
      setManualName("");
      setHasSearched(false);
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 120);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isModalOpen]);

  const searchSchools = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await requestD1<School[]>(`/api/schools?search=${encodeURIComponent(query)}`);
      setSuggestions(data || []);
    } catch (err) {
      console.error("School search failed:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchSchools(val);
    }, 300);
  };

  const handleSelect = (school: School) => {
    onChange(school.name);
    setIsModalOpen(false);
    onSchoolSelect?.(school);
  };

  const handleManualAdd = () => {
    const name = manualName.trim() || searchQuery.trim();
    if (name) {
      onChange(name);
      setIsModalOpen(false);
    }
  };

  // --- Modal rendered via Portal ---
  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/8 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <Search size={20} className="text-[#1B1B1B] dark:text-neutral-200 shrink-0" />
                <div>
                  <h3 className="text-[12px] font-bold text-text-main uppercase tracking-widest leading-tight">
                    Buscador de Centros Educativos
                  </h3>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                    Currículo Oficial República Dominicana
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              >
                <X size={15} className="text-white" strokeWidth={3} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-5 pb-3 pt-1">
              <div className="flex items-center gap-3 bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
                <Search size={17} className="text-neutral-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Escribe el nombre de la escuela o el municipio..."
                  className="flex-1 text-[14px] font-medium text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 bg-transparent outline-none"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setHasSearched(false);
                      inputRef.current?.focus();
                    }}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto min-h-0 border-t border-black/5 dark:border-zinc-800">
              
              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2.5 py-10 text-[13px] text-text-muted font-semibold">
                  <Loader2 size={18} className="animate-spin text-brand-primary" />
                  Buscando centros educativos...
                </div>
              )}

              {/* Results List */}
              {!isLoading && suggestions.length > 0 && (
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 py-1.5 mb-1">
                    {suggestions.length} resultado{suggestions.length !== 1 ? "s" : ""} encontrado{suggestions.length !== 1 ? "s" : ""}
                  </p>
                  {suggestions.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => handleSelect(school)}
                      className="w-full text-left px-3 py-3 hover:bg-bg-base dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer flex items-center gap-3.5 group"
                    >
                      <Home size={20} className="fill-brand-primary/25 text-brand-primary shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-text-main leading-tight truncate group-hover:text-brand-primary transition-colors">
                          {school.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {school.municipality && (
                            <span className="text-[10.5px] text-text-muted font-semibold flex items-center gap-1">
                              <MapPin size={10} /> {school.municipality}
                            </span>
                          )}
                          {school.regional && (
                            <span className="text-[10.5px] text-text-muted font-medium">
                              · {school.regional}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-neutral-300 group-hover:text-brand-primary shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && hasSearched && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="py-10 px-5 text-center">
                  <Building2 size={32} className="fill-neutral-400/20 text-neutral-400 mx-auto mb-3" />
                  <p className="text-[14px] font-bold text-text-main">No se encontraron resultados</p>
                  <p className="text-[12px] text-text-muted font-medium mt-1 max-w-xs mx-auto">
                    Intenta con otro nombre o usa la opción manual debajo para agregar tu centro educativo.
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !hasSearched && searchQuery.trim().length < 2 && (
                <div className="py-10 px-5 text-center">
                  <Search size={32} className="fill-brand-primary/25 text-brand-primary mx-auto mb-3" />
                  <p className="text-[14px] font-bold text-text-main">Comienza a escribir para buscar</p>
                  <p className="text-[12px] text-text-muted font-medium mt-1 max-w-xs mx-auto">
                    Ingresa al menos 2 letras. Filtra entre más de 46,000 <span className="font-bold text-text-main">Centros Educativos</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Manual Entry Footer */}
            <div className="border-t border-black/5 dark:border-zinc-800 px-5 py-3.5 bg-neutral-50/50 dark:bg-zinc-800/30">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center mb-2.5">
                ¿No encuentras tu centro educativo?
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleManualAdd();
                  }}
                  placeholder="Escribe el nombre de tu escuela manualmente..."
                  className="flex-1 h-9 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-lg px-3 text-[12px] font-medium text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/10 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleManualAdd}
                  disabled={!manualName.trim() && !searchQuery.trim()}
                  className="h-9 bg-brand-primary hover:bg-brand-hover text-white px-5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={13} /> Agregar
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger Field — styled like the other inputs */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-left text-sm transition-all shadow-xs flex items-center gap-2.5 cursor-pointer hover:border-neutral-300 dark:hover:border-zinc-700 focus:border-[#1B1B1B] focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none"
      >
        <Search size={14} className="text-neutral-400 shrink-0" />
        {value ? (
          <span className="text-[#1B1B1B] dark:text-neutral-100 font-medium truncate">{value}</span>
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
      </button>

      {/* Render modal via Portal to escape any overflow:hidden containers */}
      {ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
