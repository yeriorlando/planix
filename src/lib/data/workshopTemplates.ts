// Plantillas predefinidas de talleres educativos con datos curriculares del sistema dominicano (MINERD)
import type { WorkshopTemplate, WorkshopType } from '../../types/tallerTypes';

export const WORKSHOP_TEMPLATES: WorkshopTemplate[] = [
  {
    tipo: 'LECTURA_DIVERTIDA',
    nombre: 'Lectura Divertida',
    descripcion: 'Taller enfocado en desarrollar el amor por la lectura a través de actividades lúdicas, dramatizaciones, cuentacuentos y comprensión lectora creativa.',
    icono: 'BookOpen',
    color: '#3B82F6',
    gradiente: 'from-blue-500 to-indigo-600',
    competencias_por_nivel: {
      inicial: [
        'Comprende textos orales sencillos como cuentos, rimas y canciones, respondiendo a preguntas sobre los mismos.',
        'Disfruta de la lectura compartida y muestra interés por los libros y materiales impresos de su entorno.',
        'Expresa ideas, sentimientos y emociones a partir de la escucha de textos literarios.',
      ],
      primaria: [
        'Comprende textos escritos funcionales y literarios, identificando su estructura, ideas principales y secundarias.',
        'Produce textos orales y escritos con coherencia, cohesión y adecuación al propósito comunicativo.',
        'Valora la lectura como fuente de placer, conocimiento y desarrollo personal.',
        'Interpreta información explícita e implícita en textos narrativos, descriptivos e informativos.',
      ],
      secundaria: [
        'Analiza críticamente textos literarios y no literarios, identificando recursos estilísticos y argumentativos.',
        'Produce textos escritos con estructura compleja, coherencia global y uso adecuado de recursos lingüísticos.',
        'Valora la diversidad literaria como expresión cultural de los pueblos.',
        'Interpreta textos multimodales con pensamiento crítico y creativo.',
      ],
    },
    indicadores_por_nivel: {
      inicial: [
        'Escucha con atención cuentos y narraciones cortas.',
        'Identifica personajes principales en una historia.',
        'Participa activamente en actividades de lectura compartida.',
        'Expresa sus ideas sobre lo que le gusta de un cuento.',
        'Reconoce las partes de un libro (portada, páginas).',
      ],
      primaria: [
        'Identifica la idea principal and secundaria de un texto.',
        'Infiere el significado de palabras desconocidas por contexto.',
        'Resume textos leídos manteniendo la coherencia.',
        'Responde preguntas literales e inferenciales sobre textos leídos.',
        'Lee con fluidez, ritmo y entonación adecuada.',
        'Distingue entre hechos y opiniones en un texto.',
        'Compara personajes, escenarios y tramas de diferentes textos.',
      ],
      secundaria: [
        'Analiza la estructura narrativa de obras literarias.',
        'Identifica figuras retóricas y recursos estilísticos.',
        'Elabora ensayos críticos sobre obras leídas.',
        'Establece relaciones intertextuales entre diferentes obras.',
        'Evalúa la intención comunicativa del autor.',
        'Argumenta su posición frente a temas planteados en los textos.',
      ],
    },
    temas_sugeridos: [
      'Cuentacuentos interactivo',
      'Teatro de lectura (Reader\'s Theater)',
      'Club de lectura temático',
      'Lectura en voz alta con dramatización',
      'Creación de cuentos colectivos',
      'Feria del libro en el aula',
      'Lectura y arte: ilustraciones creativas',
      'Comprensión lectora con juegos',
      'Poesía y rimas divertidas',
      'Periódico escolar',
      'Reseñas literarias creativas',
      'Lectura y tecnología: audiolibros',
      'Bingo de lectura',
      'Mapa de la historia',
      'Lectura silenciosa sostenida',
      'Diario de lectura personal',
      'Entrevista a personajes literarios',
      'Escritura creativa inspirada en lecturas',
      'Debates literarios',
      'Maratón de lectura',
    ],
  },
  {
    tipo: 'MATEMATICA_FASCINA',
    nombre: 'La Matemática me Fascina',
    descripcion: 'Taller diseñado para despertar el interés y la curiosidad por las matemáticas mediante juegos, retos lógicos, resolución de problemas creativos y aplicación en la vida cotidiana.',
    icono: 'Calculator',
    color: '#EF4444',
    gradiente: 'from-red-500 to-rose-600',
    competencias_por_nivel: {
      inicial: [
        'Establece relaciones de cantidad, espacio y medida a través de la manipulación de objetos concretos.',
        'Reconoce y reproduce patrones sencillos en su entorno inmediato.',
        'Clasifica, agrupa y ordena objetos según características observables.',
      ],
      primaria: [
        'Resuelve situaciones de problema con números naturales utilizando las operaciones básicas.',
        'Reconoce y describe formas geométricas, sus propiedades y relaciones espaciales.',
        'Interpreta y representa datos en tablas y gráficos sencillos.',
        'Aplica estrategias de cálculo mental y estimación en situaciones cotidianas.',
      ],
      secundaria: [
        'Resuelve problemas que involucran expresiones algebraicas, ecuaciones y funciones.',
        'Demuestra propiedades geométricas y aplica el razonamiento deductivo.',
        'Analiza datos estadísticos utilizando medidas de tendencia central y dispersión.',
        'Aplica el pensamiento lógico-matemático en la resolución de problemas complejos.',
      ],
    },
    indicadores_por_nivel: {
      inicial: [
        'Cuenta objetos del 1 al 10 de manera ordenada.',
        'Clasifica objetos por color, forma y tamaño.',
        'Reconoce figuras geométricas básicas (círculo, cuadrado, triángulo).',
        'Establece relaciones de "más que", "menos que" e "igual que".',
        'Reproduce patrones simples de color y forma.',
      ],
      primaria: [
        'Resuelve problemas de adición y sustracción con números hasta el millón.',
        'Aplica las tablas de multiplicar en la resolución de problemas.',
        'Identifica y clasifica figuras geométricas según sus propiedades.',
        'Interpreta datos presentados en gráficos de barras y pictogramas.',
        'Utiliza unidades de medida estándar para longitud, peso y capacidad.',
        'Resuelve problemas con fracciones y decimales.',
        'Aplica el cálculo mental con estrategias variadas.',
      ],
      secundaria: [
        'Resuelve ecuaciones lineales y cuadráticas.',
        'Calcula el área y perímetro de figuras compuestas.',
        'Interpreta y construye gráficos estadísticos.',
        'Aplica el teorema de Pitágoras en la resolución de problemas.',
        'Resuelve problemas de proporcionalidad directa e inversa.',
        'Calcula probabilidades de eventos simples y compuestos.',
      ],
    },
    temas_sugeridos: [
      'Juegos matemáticos con dados y cartas',
      'Retos de lógica y acertijos',
      'Matemática en la cocina (fracciones y medidas)',
      'Geometría con origami',
      'Olimpiadas matemáticas del aula',
      'Tangram y rompecabezas geométricos',
      'Tienda escolar (operaciones con dinero)',
      'Estadística con encuestas en el aula',
      'Sudoku y juegos numéricos',
      'Construcción de figuras 3D',
      'Matemática y música: patrones rítmicos',
      'Gymkana matemática',
      'Problemas de la vida real',
      'Código secreto matemático',
      'Bingo de operaciones',
      'Escape room matemático',
      'Medición del entorno escolar',
      'Gráficos y datos del clima',
      'Simetría en la naturaleza',
      'El supermercado matemático',
    ],
  },
  {
    tipo: 'CATEDRA_CIUDADANA',
    nombre: 'Cátedra Ciudadana',
    descripcion: 'Taller orientado a formar ciudadanos responsables, democráticos y comprometidos con su comunidad, promoviendo valores de convivencia, justicia social y participación activa.',
    icono: 'Landmark',
    color: '#F97316',
    gradiente: 'from-orange-500 to-amber-600',
    competencias_por_nivel: {
      inicial: [
        'Reconoce normas básicas de convivencia en su entorno familiar y escolar.',
        'Identifica símbolos patrios y celebraciones comunitarias.',
        'Practica valores de respeto, solidaridad y cooperación con sus compañeros.',
      ],
      primaria: [
        'Describe la organización política y social de la República Dominicana.',
        'Practica valores democráticos y de participación ciudadana en el aula y la escuela.',
        'Identifica derechos y deberes ciudadanos según la Constitución dominicana.',
        'Analiza situaciones de convivencia proponiendo soluciones pacíficas a los conflictos.',
      ],
      secundaria: [
        'Analiza críticamente la realidad sociopolítica dominicana y mundial.',
        'Promueve la participación democrática y el ejercicio responsable de la ciudadanía.',
        'Evalúa el impacto de las decisiones políticas y económicas en la sociedad.',
        'Propone acciones de transformación social basadas en principios éticos y de justicia.',
      ],
    },
    indicadores_por_nivel: {
      inicial: [
        'Cumple normas de convivencia en el aula.',
        'Reconoce la bandera y el himno nacional.',
        'Comparte materiales con sus compañeros.',
        'Respeta los turnos en las actividades grupales.',
        'Identifica roles familiares y comunitarios.',
      ],
      primaria: [
        'Identifica los símbolos patrios y su significado.',
        'Describe las funciones de los poderes del Estado.',
        'Participa activamente en el gobierno estudiantil.',
        'Propone soluciones pacíficas ante conflictos escolares.',
        'Reconoce los derechos de la niñez dominicana.',
        'Valora la diversidad cultural de su comunidad.',
        'Practica el diálogo como herramienta de convivencia.',
      ],
      secundaria: [
        'Analiza la Constitución dominicana y sus principios fundamentales.',
        'Evalúa el funcionamiento de las instituciones democráticas.',
        'Participa en debates sobre temas de interés social.',
        'Propone proyectos comunitarios de impacto positivo.',
        'Identifica situaciones de vulneración de derechos humanos.',
        'Argumenta posiciones éticas sobre dilemas sociales.',
      ],
    },
    temas_sugeridos: [
      'Gobierno estudiantil y elecciones',
      'Conociendo la Constitución dominicana',
      'Derechos y deberes de la niñez',
      'Resolución pacífica de conflictos',
      'Héroes y heroínas dominicanos/as',
      'Diversidad cultural y respeto',
      'El medio ambiente: nuestro deber ciudadano',
      'Simulacro de asamblea comunitaria',
      'Igualdad de género en la sociedad',
      'Bulling: prevención y acción',
      'Mi comunidad, mi responsabilidad',
      'Periodismo ciudadano escolar',
      'Debate sobre temas de actualidad',
      'Proyecto de servicio comunitario',
      'Valores democráticos en acción',
      'La paz como forma de vida',
      'Economía básica: presupuesto familiar',
      'Identidad cultural dominicana',
      'Redes sociales y ciudadanía digital',
      'El voluntariado como forma de participación',
    ],
  },
  {
    tipo: 'EDUCACION_AMBIENTAL',
    nombre: 'Educación Ambiental',
    descripcion: 'Taller dedicado a concientizar sobre la protección del medio ambiente, la sostenibilidad, la biodiversidad y la relación armónica entre el ser humano y la naturaleza.',
    icono: 'Sprout',
    color: '#22C55E',
    gradiente: 'from-green-500 to-emerald-600',
    competencias_por_nivel: {
      inicial: [
        'Reconoce elementos de la naturaleza (plantas, animales, agua, sol) y su importancia.',
        'Practica hábitos de cuidado del entorno natural inmediato.',
        'Explora su entorno natural con curiosidad, haciendo observaciones sencillas.',
      ],
      primaria: [
        'Identifica los principales ecosistemas dominicanos y su biodiversidad.',
        'Practica acciones de conservación y uso responsable de los recursos naturales.',
        'Analiza el impacto de las acciones humanas en el medio ambiente.',
        'Propone soluciones sencillas a problemas ambientales de su comunidad.',
      ],
      secundaria: [
        'Evalúa críticamente la relación entre desarrollo económico y sostenibilidad ambiental.',
        'Analiza los efectos del cambio climático a nivel local y global.',
        'Diseña proyectos de intervención ambiental basados en evidencia científica.',
        'Promueve prácticas sostenibles en su comunidad educativa y local.',
      ],
    },
    indicadores_por_nivel: {
      inicial: [
        'Identifica plantas y animales de su entorno.',
        'Practica el reciclaje de materiales en el aula.',
        'Riega y cuida plantas del huerto escolar.',
        'Reconoce la importancia del agua y su cuidado.',
        'Clasifica elementos naturales y artificiales.',
      ],
      primaria: [
        'Identifica los principales ecosistemas de la República Dominicana.',
        'Clasifica residuos según su tipo (orgánico, inorgánico, reciclable).',
        'Describe el ciclo del agua y su importancia para la vida.',
        'Propone acciones para reducir la contaminación en su escuela.',
        'Identifica especies endémicas de la isla Hispaniola.',
        'Practica las 3R: Reducir, Reutilizar, Reciclar.',
        'Elabora proyectos de huerto escolar.',
      ],
      secundaria: [
        'Analiza las causas y consecuencias del cambio climático.',
        'Evalúa el impacto ambiental de actividades económicas locales.',
        'Diseña proyectos de energías renovables a escala escolar.',
        'Investiga la pérdida de biodiversidad en ecosistemas dominicanos.',
        'Propone políticas ambientales para su comunidad.',
        'Calcula la huella ecológica personal y propone reducciones.',
      ],
    },
    temas_sugeridos: [
      'Huerto escolar: siembra y cosecha',
      'Reciclaje creativo: arte con materiales reutilizados',
      'El ciclo del agua: experimentos prácticos',
      'Ecosistemas dominicanos: exploración virtual',
      'Cambio climático: causas y soluciones',
      'Biodiversidad de la isla Hispaniola',
      'Energías renovables: solar y eólica',
      'Contaminación del agua: análisis y prevención',
      'Compostaje en la escuela',
      'Día de limpieza del entorno escolar',
      'Flora y fauna endémica dominicana',
      'Reducción de plásticos: reto escolar',
      'Observación de aves (birdwatching)',
      'El suelo: importancia y conservación',
      'Deforestación y reforestación',
      'Manejo de residuos sólidos',
      'La capa de ozono y los rayos UV',
      'Eco-mural: arte ambiental',
      'Excursión virtual a áreas protegidas',
      'Mi huella ecológica',
    ],
  },
];

// Template para taller personalizado
export const CUSTOM_WORKSHOP_TEMPLATE: WorkshopTemplate = {
  tipo: 'PERSONALIZADO',
  nombre: 'Taller Personalizado',
  descripcion: 'Crea un taller con el tema y las competencias que necesites, adaptado a tu grupo y contexto educativo.',
  icono: 'Sparkles',
  color: '#8B5CF6',
  gradiente: 'from-violet-500 to-purple-600',
  competencias_por_nivel: {
    inicial: [],
    primaria: [],
    secundaria: [],
  },
  indicadores_por_nivel: {
    inicial: [],
    primaria: [],
    secundaria: [],
  },
  temas_sugeridos: [],
};

// Helpers
export function getWorkshopTemplate(tipo: WorkshopType): WorkshopTemplate {
  if (tipo === 'PERSONALIZADO') return CUSTOM_WORKSHOP_TEMPLATE;
  return WORKSHOP_TEMPLATES.find(t => t.tipo === tipo) || CUSTOM_WORKSHOP_TEMPLATE;
}

export function getAllWorkshopTemplates(): WorkshopTemplate[] {
  return [...WORKSHOP_TEMPLATES, CUSTOM_WORKSHOP_TEMPLATE];
}

export function getCompetenciesForLevel(tipo: WorkshopType, nivel: string): string[] {
  const template = getWorkshopTemplate(tipo);
  return template.competencias_por_nivel[nivel.toLowerCase()] || [];
}

export function getIndicatorsForLevel(tipo: WorkshopType, nivel: string): string[] {
  const template = getWorkshopTemplate(tipo);
  return template.indicadores_por_nivel[nivel.toLowerCase()] || [];
}

export function getSuggestedTopics(tipo: WorkshopType): string[] {
  const template = getWorkshopTemplate(tipo);
  return template.temas_sugeridos;
}
