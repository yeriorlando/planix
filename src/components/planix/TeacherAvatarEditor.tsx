'use client';

import React, { useState } from 'react';
import { User, UserCheck, Sparkles, X, Palette, Scissors, Shirt, Eye, Smile, Star } from 'lucide-react';

// ─── DiceBear avataaars style options for ADULTS (DiceBear 7.x) ────────────

const HAIR_OPTIONS = {
    M: [
        'theCaesar', 'shortFlat', 'shortCurly', 'dreads01', 'frizzle', 'shaggy', 'shaggyMullet',
        'shortWaved', 'sides', 'theCaesarAndSidePart'
    ],
    F: [
        'straight01', 'bob', 'curly', 'bun', 'fro', 'longButNotTooLong', 'straight02',
        'straightAndStrand', 'curvy', 'dreads'
    ],
};

const HAIR_LABELS: Record<string, string> = {
    // Maestro
    theCaesar: 'Corto Clásico',
    shortFlat: 'Lacio / Flat',
    shortCurly: 'Rizado Corto',
    dreads01: 'Dreads',
    frizzle: 'Frizzle',
    shaggy: 'Shaggy',
    shaggyMullet: 'Mullet Suave',
    shortWaved: 'Ondulado',
    sides: 'Laterales',
    theCaesarAndSidePart: 'Raya al Lado',
    // Maestra
    straight01: 'Lacio Largo',
    bob: 'Bob Class',
    curly: 'Rizado Largo',
    bun: 'Moño Alto',
    fro: 'Afro Natural',
    longButNotTooLong: 'Media Melena',
    straight02: 'Flequillo',
    straightAndStrand: 'Lacio con Mechón',
    curvy: 'Ondulado Largo',
    dreads: 'Dreads Largos',
};

const FACIAL_HAIR_OPTIONS = [
    'none', 'beardLight', 'beardMajestic', 'beardMedium', 'moustacheFancy', 'moustacheMagnum'
];

const FACIAL_HAIR_LABELS: Record<string, string> = {
    none: 'Limpio',
    beardLight: 'Sombreada',
    beardMajestic: 'Barba Completa',
    beardMedium: 'Barba Media',
    moustacheFancy: 'Bigote Fino',
    moustacheMagnum: 'Bigote Clásico',
};

// IDs should be pure hex without # for the URL
const HAIR_COLORS = [
    { id: '2c1b18', label: 'Negro', hex: '#1C1C1C' },
    { id: '4a2817', label: 'Moreno', hex: '#49281A' },
    { id: '724130', label: 'Castaño Oscuro', hex: '#724130' },
    { id: 'a55728', label: 'Castaño', hex: '#A55728' },
    { id: 'e8c170', label: 'Rubio', hex: '#E8C86A' },
    { id: 'ecdcbf', label: 'Gris / Platino', hex: '#E1E1E1' },
];

const SKIN_COLORS = [
    { id: 'ffdbb4', label: 'Clara', hex: '#EDB98A' },
    { id: 'fd9841', label: 'Media', hex: '#FD9841' },
    { id: 'd08b5b', label: 'Trigueña', hex: '#D08B5B' },
    { id: 'ae5d29', label: 'Oscura', hex: '#AE5D29' },
    { id: '614335', label: 'Muy Oscura', hex: '#614335' },
];

const CLOTHING_OPTIONS = {
    M: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'shirtCrewNeck', 'shirtVNeck'],
    F: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'shirtScoopNeck', 'shirtVNeck'],
};

const CLOTHING_LABELS: Record<string, string> = {
    blazerAndShirt: 'Saco y Camisa',
    blazerAndSweater: 'Saco y Suéter',
    collarAndSweater: 'Camisa y Suéter',
    shirtCrewNeck: 'Básico Cuello Redondo',
    shirtVNeck: 'Básico Cuello en V',
    shirtScoopNeck: 'Blusa Escotada',
};

const CLOTHING_COLORS = [
    { id: '3c4d5b', label: 'Azul Marino', hex: '#3C4D5B' },
    { id: '262e33', label: 'Negro', hex: '#262E33' },
    { id: '65c9ff', label: 'Celeste', hex: '#65C9FF' },
    { id: '5199e4', label: 'Azul Planix', hex: '#5199E4' },
    { id: 'ff5c5c', label: 'Rojo', hex: '#FF5C5C' },
    { id: '929598', label: 'Gris', hex: '#929598' },
    { id: 'ffffff', label: 'Blanco', hex: '#FFFFFF' },
];

// New Lens colors
const ACCESSORY_COLORS = [
    { id: '262e33', label: 'Negro', hex: '#262E33' },
    { id: '3c4d5b', label: 'Dorado / Metal', hex: '#3C4D5B' },
    { id: '65c9ff', label: 'Azul', hex: '#65C9FF' },
    { id: 'ff5c5c', label: 'Rojo / Moderno', hex: '#FF5C5C' },
    { id: 'ffffff', label: 'Blanco / Transp.', hex: '#FFFFFF' },
];

const EYE_OPTIONS = ['default', 'happy', 'side', 'squint', 'wink'] as const;
const EYE_LABELS: Record<string, string> = {
    default: 'Normales',
    happy: 'Sonrientes',
    side: 'Mirada lateral',
    squint: 'Enfocado',
    wink: 'Guiño',
};

const MOUTH_OPTIONS = ['smile', 'serious', 'default', 'twinkle'] as const;
const MOUTH_LABELS: Record<string, string> = {
    smile: 'Sonrisa',
    serious: 'Serio',
    default: 'Neutral',
    twinkle: 'Alegre',
};

const EYEBROW_OPTIONS = ['defaultNatural', 'flatNatural', 'raisedExcitedNatural', 'angryNatural'] as const;
const EYEBROW_LABELS: Record<string, string> = {
    defaultNatural: 'Naturales',
    flatNatural: 'Planas',
    raisedExcitedNatural: 'Expresivas',
    angryNatural: 'Interesadas',
};

export interface TeacherAvatarConfig {
    style: 'avataaars';
    gender: 'M' | 'F';
    hair: string;
    hairColor: string;
    skinColor: string;
    clothing: string;
    clothingColor: string;
    eyes: string;
    mouth: string;
    eyebrows: string;
    facialHair: string;
    accessories: 'none' | 'prescription01' | 'prescription02' | 'round';
    accessoriesColor: string;
}

export function buildTeacherAvatarUrl(config: TeacherAvatarConfig, seed: string): string {
    const params = new URLSearchParams();
    params.set('seed', seed || 'teacher');
    params.set('top', config.hair);
    params.set('hairColor', config.hairColor);
    params.set('skinColor', config.skinColor);
    params.set('clothing', config.clothing);
    params.set('clothesColor', config.clothingColor);
    params.set('eyes', config.eyes);
    params.set('mouth', config.mouth);
    params.set('eyebrows', config.eyebrows || 'defaultNatural');

    // DiceBear 7.x masculine fix
    if (config.gender === 'M') {
        if (config.facialHair !== 'none') {
            params.set('facialHair', config.facialHair);
            params.set('facialHairProbability', '100');
            params.set('facialHairColor', config.hairColor);
        } else {
            params.set('facialHairProbability', '0');
        }
    } else {
        params.set('facialHairProbability', '0');
    }

    if (config.accessories !== 'none') {
        params.set('accessories', config.accessories);
        params.set('accessoriesProbability', '100');
        params.set('accessoriesColor', config.accessoriesColor || '262e33');
    } else {
        params.set('accessoriesProbability', '0');
    }

    params.set('size', '512');
    params.set('backgroundColor', 'f8fafc');

    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
}

interface Props {
    seed: string;
    value: TeacherAvatarConfig | null;
    onSave: (url: string) => void;
    onClose: () => void;
}

const defaultConfig = (gender: 'M' | 'F'): TeacherAvatarConfig => ({
    style: 'avataaars',
    gender,
    hair: gender === 'F' ? 'straight01' : 'theCaesar',
    hairColor: '2c1b18',
    skinColor: 'ffdbb4',
    clothing: 'blazerAndShirt',
    clothingColor: '3c4d5b',
    eyes: 'default',
    mouth: 'smile',
    eyebrows: 'defaultNatural',
    facialHair: 'none',
    accessories: 'none',
    accessoriesColor: '262e33',
});

export default function TeacherAvatarEditor({ seed, value, onSave, onClose }: Props) {
    const [config, setConfig] = useState<TeacherAvatarConfig>(value ?? defaultConfig('F'));

    const update = (partial: Partial<TeacherAvatarConfig>) => {
        const updated = { ...config, ...partial };
        setConfig(updated);
    };

    const handleGenderChange = (gender: 'M' | 'F') => {
        const def = defaultConfig(gender);
        update({
            gender,
            hair: def.hair,
            clothing: def.clothing,
            facialHair: 'none',
            eyebrows: 'defaultNatural'
        });
    };

    const avatarUrl = buildTeacherAvatarUrl(config, seed || 'teacher');

    const CategoryHeader = ({ icon: Icon, label, themeColor }: { icon: any; label: string; themeColor: string }) => {
        let colorClasses = "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
        if (themeColor === 'emerald') {
            colorClasses = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400";
        } else if (themeColor === 'purple') {
            colorClasses = "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
        } else if (themeColor === 'rose') {
            colorClasses = "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-455";
        } else if (themeColor === 'amber') {
            colorClasses = "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400";
        }

        return (
            <div className="flex items-center gap-2 mb-2 mt-1 shrink-0">
                <div className={`w-7 h-7 rounded-lg ${colorClasses} flex items-center justify-center`}>
                    <Icon size={14} fill="currentColor" fillOpacity={0.15} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1B1B1B] dark:text-white">{label}</h4>
            </div>
        );
    };

    const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1.5 shrink-0">
            <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-tighter ml-1">{label}</p>
            <div className="flex flex-wrap gap-1">{children}</div>
        </div>
    );

    interface ChipProps {
        active: boolean;
        onClick: () => void;
        children: React.ReactNode;
        key?: any;
    }

    const Chip = ({ active, onClick, children }: ChipProps) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${active
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm transform scale-[1.02]'
                : 'bg-white dark:bg-slate-800 text-foreground border-black/[0.08] dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-550/5'
                }`}
        >
            {children}
        </button>
    );

    interface ColorDotProps {
        hex: string;
        label: string;
        active: boolean;
        onClick: () => void;
        key?: any;
    }

    const ColorDot = ({ hex, label, active, onClick }: ColorDotProps) => (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`h-8 w-8 rounded-full border transition-all relative overflow-hidden flex items-center justify-center ${
                active 
                    ? 'border-blue-500 scale-110 shadow-md ring-4 ring-blue-500/15 z-10' 
                    : 'border-black/[0.08] dark:border-white/10 shadow-3xs hover:scale-110 hover:border-black/25 dark:hover:border-white/30'
            }`}
        >
            <div
                className="absolute inset-0 w-full h-full"
                style={{ backgroundColor: hex }}
            />
            {active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                </div>
            )}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-none md:max-h-[590px] my-auto border border-black/[0.06] dark:border-white/[0.06]">

                {/* Left Column: Preview & Basic Info */}
                <div className="w-full md:w-[240px] bg-slate-50 dark:bg-slate-950 p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06] relative shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0046ab]"></div>

                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none p-6">
                        <Star className="absolute top-10 left-6 text-foreground" size={30} />
                        <Star className="absolute bottom-10 right-6 text-foreground" size={40} />
                    </div>

                    <div className="relative mb-6 pt-2">
                        <div className="w-32 h-32 rounded-[20px] bg-white dark:bg-slate-800 shadow-sm border-2 border-white dark:border-slate-800 overflow-hidden flex items-center justify-center group relative z-10">
                            <img
                                src={avatarUrl}
                                alt="Avatar Preview"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                key={avatarUrl}
                                loading="eager"
                            />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-[0.2em] whitespace-nowrap z-20">
                            Vista Previa
                        </div>
                    </div>

                    <div className="text-center space-y-1 mb-5 shrink-0">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Tu Avatar Planix</h3>
                        <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                            Representación profesional para tu perfil docente.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 mb-5 shrink-0">
                        <button
                            onClick={() => handleGenderChange('M')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${config.gender === 'M'
                                ? 'border-blue-500 bg-blue-500/5 text-blue-600 shadow-xs'
                                : 'border-black/[0.08] dark:border-white/10 bg-white dark:bg-slate-900 text-muted-foreground hover:border-blue-550/30'
                                }`}
                        >
                            <User size={18} fill="currentColor" fillOpacity={config.gender === 'M' ? 0.15 : 0} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Maestro</span>
                        </button>
                        <button
                            onClick={() => handleGenderChange('F')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${config.gender === 'F'
                                ? 'border-blue-500 bg-blue-500/5 text-blue-600 shadow-xs'
                                : 'border-black/[0.08] dark:border-white/10 bg-white dark:bg-slate-900 text-muted-foreground hover:border-blue-550/30'
                                }`}
                        >
                            <UserCheck size={18} fill="currentColor" fillOpacity={config.gender === 'F' ? 0.15 : 0} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Maestra</span>
                        </button>
                    </div>

                    {/* Action Buttons (Desktop only) */}
                    <div className="w-full space-y-2 shrink-0 hidden md:block">
                        <button
                            onClick={() => onSave(avatarUrl)}
                            className="w-full py-2.5 bg-[#0046ab] hover:bg-[#0046ab]/90 text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Sparkles size={14} className="text-white" />
                            Finalizar y Guardar
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 font-extrabold text-xs transition-colors cursor-pointer text-center block"
                        >
                            Cancelar cambios
                        </button>
                    </div>
                </div>

                {/* Right Columns: Triple Column Editor */}
                <div className="flex-1 p-5 md:p-6 flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 shrink-0 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Estudio de Imagen</h2>
                            <p className="text-muted-foreground text-[11px] font-medium mt-0.5">Configura cada detalle de tu presencia profesional.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-650 rounded-full text-white transition-all hover:rotate-90 duration-200 cursor-pointer shadow-xs"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 h-auto overflow-y-visible pr-0 md:pr-1 custom-scrollbar">
                        {/* Col 1: Hair & Facial */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <CategoryHeader icon={Scissors} label="Cabello y Rostro" themeColor="blue" />
                                
                                <Section label="Tono de Piel">
                                    {SKIN_COLORS.map(c => (
                                        <ColorDot key={c.id} hex={c.hex} label={c.label} active={config.skinColor === c.id} onClick={() => update({ skinColor: c.id })} />
                                    ))}
                                </Section>

                                <Section label="Seleccionar Peinado">
                                    {HAIR_OPTIONS[config.gender].map(h => (
                                        <Chip key={h} active={config.hair === h} onClick={() => update({ hair: h })}>
                                              {HAIR_LABELS[h]}
                                        </Chip>
                                    ))}
                                </Section>

                                <Section label="Color de Cabello">
                                    {HAIR_COLORS.map(c => (
                                        <ColorDot key={c.id} hex={c.hex} label={c.label} active={config.hairColor === c.id} onClick={() => update({ hairColor: c.id })} />
                                    ))}
                                </Section>

                                {config.gender === 'M' && (
                                    <Section label="Vello Facial">
                                        {FACIAL_HAIR_OPTIONS.map(fh => (
                                            <Chip key={fh} active={config.facialHair === fh} onClick={() => update({ facialHair: fh })}>
                                                {FACIAL_HAIR_LABELS[fh]}
                                            </Chip>
                                        ))}
                                    </Section>
                                )}
                            </div>
                        </div>

                        {/* Col 2: Clothing & Expression */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <CategoryHeader icon={Shirt} label="Vestimenta" themeColor="emerald" />
                                <Section label="Estilo de Ropa">
                                    {CLOTHING_OPTIONS[config.gender].map(c => (
                                        <Chip key={c} active={config.clothing === c} onClick={() => update({ clothing: c })}>
                                            {CLOTHING_LABELS[c]}
                                        </Chip>
                                    ))}
                                </Section>

                                <Section label="Color de la Prenda">
                                    {CLOTHING_COLORS.map(c => (
                                        <ColorDot key={c.id} hex={c.hex} label={c.label} active={config.clothingColor === c.id} onClick={() => update({ clothingColor: c.id })} />
                                    ))}
                                </Section>
                            </div>

                            <div className="space-y-3">
                                <CategoryHeader icon={Smile} label="Expresión" themeColor="amber" />
                                <Section label="Boca / Sonrisa">
                                    {MOUTH_OPTIONS.map(m => (
                                        <Chip key={m} active={config.mouth === m} onClick={() => update({ mouth: m })}>
                                            {MOUTH_LABELS[m]}
                                        </Chip>
                                    ))}
                                </Section>
                            </div>
                        </div>

                        {/* Col 3: Face details & Accessories */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <CategoryHeader icon={Eye} label="Mirada y Rasgos" themeColor="purple" />
                                <Section label="Forma de Ojos">
                                    {EYE_OPTIONS.map(e => (
                                        <Chip key={e} active={config.eyes === e} onClick={() => update({ eyes: e })}>
                                            {EYE_LABELS[e]}
                                        </Chip>
                                    ))}
                                </Section>

                                <Section label="Estilo de Cejas">
                                    {EYEBROW_OPTIONS.map(eb => (
                                        <Chip key={eb} active={config.eyebrows === eb} onClick={() => update({ eyebrows: eb })}>
                                            {EYEBROW_LABELS[eb]}
                                        </Chip>
                                    ))}
                                </Section>
                            </div>

                            <div className="space-y-3">
                                <CategoryHeader icon={Palette} label="Complementos" themeColor="rose" />
                                <Section label="Accesorios Ópticos">
                                    <Chip active={config.accessories === 'none'} onClick={() => update({ accessories: 'none' })}>
                                        Sin lentes
                                    </Chip>
                                    <Chip active={config.accessories === 'prescription01'} onClick={() => update({ accessories: 'prescription01' })}>
                                        👓 Modelo A
                                    </Chip>
                                    <Chip active={config.accessories === 'prescription02'} onClick={() => update({ accessories: 'prescription02' })}>
                                        👓 Modelo B
                                    </Chip>
                                    <Chip active={config.accessories === 'round'} onClick={() => update({ accessories: 'round' })}>
                                        👓 Redondos
                                    </Chip>
                                </Section>

                                {config.accessories !== 'none' && (
                                    <Section label="Color de los Lentes">
                                        {ACCESSORY_COLORS.map(c => (
                                            <ColorDot key={c.id} hex={c.hex} label={c.label} active={config.accessoriesColor === c.id} onClick={() => update({ accessoriesColor: c.id })} />
                                        ))}
                                    </Section>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Mobile only, at the very end) */}
                    <div className="w-full space-y-2 pt-4 pb-2 shrink-0 md:hidden border-t border-black/[0.06] dark:border-white/[0.06] mt-4">
                        <button
                            onClick={() => onSave(avatarUrl)}
                            className="w-full py-2.5 bg-[#0046ab] hover:bg-[#0046ab]/90 text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <Sparkles size={14} className="text-white" />
                            Finalizar y Guardar
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 font-extrabold text-xs transition-colors cursor-pointer text-center block"
                        >
                            Cancelar cambios
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
}
