export interface UnitSubtheme {
    id: string;
    name: string;
}

export interface UnitTheme {
    id: string;
    name: string;
    subthemes: UnitSubtheme[];
}

export interface ContentBlock {
    id: string;
    themes: string[]; // IDs o nombres de los temas asociados
    conceptual: string;
    procedural: string;
    attitudinal: string;
}

export interface Unit {
    id: string;
    name: string;
    themes: UnitTheme[];
    grade_levels?: string[]; // New field for multi-grade support
    subjectId?: string; // To link unit to a subject in flat lists
    level_ids?: string[]; // New field for education levels (Inicial, Primaria, Secundaria)
    achievementIndicators?: string[]; // New field for pre-loaded achievement indicators
    description?: string; // Unit description from Supabase
    week_duration?: number; // Duration in weeks from Supabase

    // Legacy / Migrated content
    conceptual_content?: string[] | ContentBlock[]; // Modificado para soportar bloques serializados
    procedural_content?: string[];
    attitudinal_content?: string[];
}

export interface SubjectUnits {
    subjectId: string;
    grade: string;
    units: Unit[];
}

export const UNIT_CURRICULUM_DATA: SubjectUnits[] = [
    {
        subjectId: 'naturales',
        grade: '2do',
        units: [
            {
                id: '301',
                name: 'Ciencias de la Vida',
                grade_levels: ['2do'],
                achievementIndicators: [
                    "Identifica en los seres vivos de su entorno y el ser humano, órganos internos de los sistemas con modelo o simulación: digestivo, circulatorio y respiratorio.",
                    "Identifica y describe propiedades utilizando el lenguaje apropiado que caracterizan los estados del agua y a las mezclas.",
                    "Usa diferentes vías de comunicación para explicar o dar soluciones de forma abierta y creativa a su manera de percibir las propiedades y características de la materia.",
                    "Ejecuta experimentos guiados en colaboración, observando, describiendo, utilizando herramientas o equipos siguiendo características observables.",
                    "Asocia y construye modelos, estructuras y funciones de elementos mecánicos de máquinas, objetos, juegos, herramientas.",
                    "Comunica los registros de sus ideas, observaciones, exploraciones y experimentos, usando y cuidando los sentidos e instrumentos.",
                    "Expresa prácticas y hábitos saludables de alimentación, cuidado y protección de sus órganos.",
                    "Aplica medidas de cuidado al Medioambiente, acciones sencillas concretas de sostenibilidad.",
                    "Identifica actitudes y valores proactivos en su desarrollo personal, en el cuidado de su salud y bienestar personal y comunitario."
                ],
                themes: [
                    {
                        id: 't-301-1',
                        name: 'Ciencias de la Vida',
                        subthemes: [
                            { id: 'st-301-1-1', name: 'Sistemas digestivo, circulatorio y respiratorio de los seres vivos (órganos principales y función)' },
                            { id: 'st-301-1-2', name: 'Relación entre plantas, animales y seres humanos' },
                            { id: 'st-301-1-3', name: 'Nutrición: alimentos y nutrientes' },
                            { id: 'st-301-1-4', name: 'Ecosistemas: hábitat y ambiente' },
                            { id: 'st-301-1-5', name: 'Enfermedades infecciosas: síntomas (fiebre, tos, vómito, diarrea)' },
                            { id: 'st-301-1-6', name: 'Cuidados a personas, plantas y animales' }
                        ]
                    }
                ]
            },
            {
                id: '302',
                name: 'Ciencias Físicas',
                grade_levels: ['2do'],
                themes: [
                    {
                        id: 't-302-1',
                        name: 'Ciencias Físicas',
                        subthemes: [
                            { id: 'st-302-1-1', name: 'Cambios de estado de la materia (solidificación y fusión)' },
                            { id: 'st-302-1-2', name: 'Mezclas en medios líquido y sólido' },
                            { id: 'st-302-1-3', name: 'Sonido: intensidad, timbre y eco' },
                            { id: 'st-302-1-4', name: 'Interacción y movimiento: Distancia, tiempo, rapidez' },
                            { id: 'st-302-1-5', name: 'Tecnología de la comunicación' },
                            { id: 'st-302-1-6', name: 'Máquinas: elementos mecánicos' },
                            { id: 'st-302-1-7', name: 'Estructuras arquitectónicas (carreteras, puentes, túneles)' }
                        ]
                    }
                ]
            },
            {
                id: '303',
                name: 'Ciencias de la Tierra y el Universo',
                grade_levels: ['2do'],
                themes: [
                    {
                        id: 't-303-1',
                        name: 'Ciencias de la Tierra y el Universo',
                        subthemes: [
                            { id: 'st-303-1-1', name: 'Materiales del suelo (rocas, agua, textura, humedad)' },
                            { id: 'st-303-1-2', name: 'Fenómenos atmosféricos: precipitación (lluvia, granizo), temperatura, viento, arcoíris' },
                            { id: 'st-303-1-3', name: 'Fuentes de energía: agua y aire' },
                            { id: 'st-303-1-4', name: 'Fenómenos naturales: sismos, derrumbes' },
                            { id: 'st-303-1-5', name: 'Movimiento de la Tierra: el día y la noche' },
                            { id: 'st-303-1-6', name: 'Estaciones del año' },
                            { id: 'st-303-1-7', name: 'Ciclo del agua (precipitación, escorrentía, evaporación)' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        subjectId: 'sociales',
        grade: '2do',
        units: [
            {
                id: '401',
                name: 'Orientación Espacial y La Comunidad',
                grade_levels: ['2do'],
                achievementIndicators: [
                    "Reconoce su ubicación espacial y puntos de referencia en su entorno cercano.",
                    "Identifica la isla de Santo Domingo y sus límites geográficos básicos.",
                    "Distingue características del espacio natural y social de su comunidad.",
                    "Participa en el cuidado de los servicios públicos de su comunidad.",
                    "Respeta las normas de convivencia en la familia y la comunidad.",
                    "Identifica los derechos y deberes que tiene como niño o niña."
                ],
                themes: [
                    {
                        id: 't-401-1',
                        name: 'Orientación Espacial y La Comunidad',
                        subthemes: [
                            { id: 'st-401-1-1', name: 'Puntos cardinales (Norte, Sur, Este, Oeste)' },
                            { id: 'st-401-1-2', name: 'Hemisferios, Ecuador, Globo terráqueo' },
                            { id: 'st-401-1-3', name: 'La República Dominicana y la isla de Santo Domingo en el mapa (límites, extensión)' },
                            { id: 'st-401-1-4', name: 'Ubicación en el mapa del Caribe y mundo' },
                            { id: 'st-401-1-5', name: 'Espacio natural y social de la comunidad (barrio, sector, paraje)' },
                            { id: 'st-401-1-6', name: 'Cuidado del espacio natural y espacios públicos (baños, parques, playas)' }
                        ]
                    }
                ]
            },
            {
                id: '402',
                name: 'Historia y Valores',
                grade_levels: ['2do'],
                themes: [
                    {
                        id: 't-402-1',
                        name: 'Historia Familiar y Comunitaria / Valores',
                        subthemes: [
                            { id: 'st-402-1-1', name: 'Historia familiar: costumbres, gastronomía' },
                            { id: 'st-402-1-2', name: 'Árbol genealógico' },
                            { id: 'st-402-1-3', name: 'Valores: cortesía, cooperación, compasión, amor, respeto, responsabilidad' },
                            { id: 'st-402-1-4', name: 'Democracia: libertad, respeto, colaboración' }
                        ]
                    }
                ]
            },
            {
                id: '404',
                name: 'Derechos y deberes del Niño y la Niña y Educación vial',
                grade_levels: ['2do'],
                themes: [
                    {
                        id: 't-404-1',
                        name: 'Derechos y deberes del Niño y la Niña y Educación vial',
                        subthemes: [
                            { id: 'st-404-1-1', name: 'Derechos y deberes del Niño y la Niña' },
                            { id: 'st-404-1-2', name: 'Normas y señales de tránsito' },
                            { id: 'st-404-1-3', name: 'Clasificación de señales: informativas, reglamentarias, preventivas' },
                            { id: 'st-404-1-4', name: 'Significado de formas y colores en señales' },
                            { id: 'st-404-1-5', name: 'Responsabilidad de hombres y mujeres en el cumplimiento de normas' }
                        ]
                    }
                ]
            },
            {
                id: '405',
                name: 'Eventos históricos esenciales que conforman nuestra identidad',
                grade_levels: ['2do'],
                themes: [
                    {
                        id: 't-405-1',
                        name: 'Eventos Históricos e Identidad Nacional',
                        subthemes: [
                            { id: 'st-405-1-1', name: 'Primeros pobladores: Taínos (ubicación, vivienda, alimentación, costumbres)' },
                            { id: 'st-405-1-2', name: 'Llegada de los españoles y africanos' },
                            { id: 'st-405-1-3', name: 'Independencia Nacional (1844) y Restauración' },
                            { id: 'st-405-1-4', name: 'Padres de la Patria y Heroínas (hazañas y nombres)' },
                            { id: 'st-405-1-5', name: 'Símbolos Patrios: Bandera, Escudo Nacional e Himno (origen y significado)' },
                            { id: 'st-405-1-6', name: 'Patrimonio histórico y natural' }
                        ]
                    }
                ]
            }
        ]
    }
];

export function getUnitsBySubjectAndGrade(subjectId: string, grade: string): Unit[] {
    // Collect all units for the given subject regardless of how they are bucketed in mock data
    const subjectBuckets = UNIT_CURRICULUM_DATA.filter(d => d.subjectId === subjectId);

    // Flatten all units
    const allUnits = subjectBuckets.flatMap(b => b.units);

    // Filter units that specifically include the requested grade in their grade_levels
    const matchingUnits = allUnits.filter(u => u.grade_levels?.includes(grade));

    // Remove duplicates based on ID (just in case)
    const uniqueUnits = Array.from(new Map(matchingUnits.map(item => [item.id, item])).values());

    return uniqueUnits;
}

export function getThemeById(units: Unit[], themeId: string): UnitTheme | null {
    for (const unit of units) {
        const theme = unit.themes.find(t => t.id === themeId);
        if (theme) return theme;
    }
    return null;
}

export function getSubthemeById(theme: UnitTheme, subthemeId: string): UnitSubtheme | null {
    return theme.subthemes.find(s => s.id === subthemeId) || null;
}
