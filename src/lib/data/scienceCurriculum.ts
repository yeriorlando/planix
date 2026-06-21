// Mock data for Ciencias Naturales y Sociales - Adecuación Curricular 2023

export interface CurriculumCompetency {
    type?: string;
    name?: string;
    description?: string;
    fundamental?: string;
    specific?: string;
}

export const SCIENCE_CURRICULUM_DATA = [
    {
        subject_id: 1,
        subject_name: "Lengua Española",
        curriculum_type: "CON_BASE",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Expresa y comprende, de forma oral y escrita en diferentes contextos, textos funcionales y literarios de extensión más amplia y estructuras sintácticas más complejas, utilizando medios y recursos variados, demostrando mayor avance en los procesos de lectura y escritura, con mayor nivel de autonomía."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Produce textos orales y escritos en demostración de razonamiento lógico sobre indagaciones en fuentes bibliográficas y/o investigaciones científicas sencillas que realiza; para aportar soluciones a problemas familiares, estudiantiles, sociales, y su divulgación a través de medios tecnológicos y de otros tipos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Utiliza textos variados para conocer y cuestionar las prácticas sociales de ciudadanía; con la finalidad de promover valores universales y humanísticos, así como la divulgación y promoción de situaciones de salud y medio ambiente, mediante el uso de herramientas tecnológicas, entre otras."
            }
        ],
        curriculum_topics: [] // To be populated if needed
    },
    {
        subject_id: 13,
        subject_name: "Lengua Española (3er Grado)",
        curriculum_type: "CON_BASE",
        grade_level: "3ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Expresa y comprende, de forma oral y escrita en contextos variados, textos funcionales y literarios, con extensión, estructura sintáctica, lexical y semántica más compleja que en grados anteriores, apoyándose en herramientas y recursos variados, demostrando dominio de la lectura y la escritura de forma autónoma."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Expone con creatividad y de manera crítica las conclusiones sobre la solución de problemas, obtenidas en investigaciones científicas, a través de un género textual conveniente y con uso de recursos variados, respetando la diversidad de opiniones."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Describe problemas sociales de manera colectiva (antidemocráticos, discriminación, entre otros), a través de textos orales y escritos, a fin de solucionarlos y canalizar emociones, sentimientos, relaciones humanas, así como la preservación de la salud, el ecosistema, mediante el uso de medios y recursos diversos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 11,
        subject_name: "Lengua Española (1er Grado)",
        curriculum_type: "CON_BASE",
        grade_level: "1er",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Expresa y comprende, de forma oral y escrita en diferentes contextos, textos funcionales y literarios muy sencillos y de estructura sintáctica simple, mediante el uso de medios y recursos apropiados, demostrando avance progresivo en sus procesos de lectura y escritura."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Utiliza textos orales y escritos in la creación de nuevos conocimientos, abordando temas y problemas de su vida familiar, estudiantil y social; a los fines de buscar solución a través de investigaciones científicas muy sencillas y haciendo uso de tecnologías y otros recursos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Identifica relaciones socioculturales y del entorno natural dominicano, a través de textos orales y escritos; a fin de demostrar conocimiento y percepción del mundo, a partir de temas sobre salud, ambiente y la comunidad, con el uso de herramientas tecnológicas y de otros tipos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 2,
        subject_name: "Matemática",
        curriculum_type: "CON_BASE",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Relaciona materiales y objetos físicos, imágenes y diagramas con ideas matemáticas que expresa claramente para buscar soluciones a situaciones de problemas elementales relacionados con su entorno cotidiano."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Resuelve situaciones de problema, en forma coherente y con el apoyo de recursos manipulativos y digitales; identificando patrones, estructuras o regularidades de forma inductiva para la explicación matemática de situaciones cotidianas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Valora las normas de convivencia y el trabajo en equipo, respetando las ideas de compañeros para llegar a acuerdos sobre los temas matemáticos desarrollados."
            }
        ],
        curriculum_topics: [] // To be populated if needed
    },
    {
        subject_id: 22, // Assigning a unique ID for 1st grade math if needed, or keeping it 2 and relying on grade_level
        subject_name: "Matemática (1er Grado)",
        curriculum_type: "CON_BASE",
        grade_level: "1er",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Relaciona materiales y objetos físicos, imágenes y diagramas con ideas matemáticas que expresa claramente para buscar soluciones a situaciones de problemas elementales relacionados con su entorno cotidiano."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Resuelve situaciones de problema, en forma coherente y con el apoyo de recursos manipulativos y digitales; identificando patrones, estructuras o regularidades de forma inductiva para la explicación matemática de situaciones cotidianas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Valora las normas de convivencia y el trabajo en equipo, respetando las ideas de compañeros para llegar a acuerdos sobre los temas matemáticos desarrollados."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 3,
        subject_name: "Ciencias Naturales",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones científicas y tecnológicas e inferencias de observaciones, exploraciones guiadas y cuestionamientos de fenómenos naturales."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica procedimientos organizados, sistemáticos y creativos explorando, construyendo, simulando y haciéndose consciente de sus cuestionamientos a partir de observación y medición."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud constructiva, reflexiva y en armonía en sí mismo, con los demás y su entorno, tomando acciones proactivas en atención a su bienestar."
            }
        ],
        curriculum_topics: [
            {
                id: "301",
                category: "Ciencias de la Vida",
                concepts: [
                    "Sistemas digestivo, circulatorio y respiratorio de los seres vivos (órganos principales y función)",
                    "Relación entre plantas, animales y seres humanos",
                    "Nutrición: alimentos y nutrientes",
                    "Ecosistemas: hábitat y ambiente",
                    "Enfermedades infecciosas: síntomas (fiebre, tos, vómito, diarrea)",
                    "Cuidados a personas, plantas y animales"
                ],
                procedures: [
                    "Identificación, discusión, descripción y comparación de órganos internos",
                    "Construcción de modelos de sistemas del cuerpo humano y animal",
                    "Observación de latidos del corazón y movimientos respiratorios (inspiración/espiración)",
                    "Análisis del proceso digestivo en animales",
                    "Indagación y análisis sobre nutrientes en alimentos (huevo, leche, vegetales, frutas, carnes)",
                    "Construcción de modelos de plantas (raíz, tallo, hoja, flor, fruto)",
                    "Experimentación guiada: crecimiento de plantas según nutrientes",
                    "Indagación sobre medidas higiénicas y prevención de enfermedades",
                    "Argumentación sobre la importancia de las vacunas",
                    "Discusión sobre eliminación de criaderos de mosquitos"
                ],
                attitudes_values: [
                    "Curiosidad, creatividad, objetividad y responsabilidad",
                    "Participación en acciones preventivas para la salud y el medio ambiente",
                    "Valoración de la ingesta de alimentos ricos en nutrientes",
                    "Utilización de diferentes vías de comunicación para explicar hábitos saludables",
                    "Adopción de medidas de seguridad ante sustancias tóxicas"
                ]
            },
            {
                id: "302",
                category: "Ciencias Físicas",
                concepts: [
                    "Cambios de estado de la materia (solidificación y fusión)",
                    "Mezclas en medios líquido y sólido",
                    "Sonido: intensidad, timbre y eco",
                    "Interacción y movimiento: Distancia, tiempo, rapidez",
                    "Tecnología de la comunicación",
                    "Máquinas: elementos mecánicos",
                    "Estructuras arquitectónicas (carreteras, puentes, túneles)"
                ],
                procedures: [
                    "Experimentación guiada: agua <-> hielo",
                    "Indagación sobre mezclas (sólido disuelto en líquido como gelatina; arena, grava)",
                    "Utilización de recursos tecnológicos para ubicación (sector, ciudad, país)",
                    "Medición y comparación de longitudes (regla, estatura) y volúmenes en líquidos",
                    "Medición del tiempo (minutos, horas, días, años, edad)",
                    "Experimentación con objetos en movimiento (trayectoria, distancia, rapidez)",
                    "Indagación y clasificación de sonidos (personas, animales, aparatos)",
                    "Construcción y utilización de instrumentos musicales o máquinas simples"
                ],
                attitudes_values: [
                    "Motivación por aprender sobre el entorno",
                    "Medidas de protección frente a objetos o materiales peligrosos",
                    "Utilización sostenible de recursos tecnológicos"
                ]
            },
            {
                id: "303",
                category: "Ciencias de la Tierra y el Universo",
                concepts: [
                    "Materiales del suelo (rocas, agua, textura, humedad)",
                    "Fenómenos atmosféricos: precipitación (lluvia, granizo), temperatura, viento, arcoíris",
                    "Fuentes de energía: agua y aire",
                    "Fenómenos naturales: sismos, derrumbes",
                    "Movimiento de la Tierra: el día y la noche",
                    "Estaciones del año",
                    "Ciclo del agua (precipitación, escorrentía, evaporación)"
                ],
                procedures: [
                    "Exploración y formulación de preguntas sobre fenómenos atmosféricos",
                    "Descripción y comparación de estaciones del año",
                    "Experimentación guiada: diferenciación de tipos de suelo (color, vegetación)",
                    "Formulación de preguntas sobre movimientos de la Tierra (sismos, derrumbes)",
                    "Observación y comparación de la posición del Sol",
                    "Exploración del ciclo del agua mediante diagramas"
                ],
                attitudes_values: [
                    "Cuidado del medio ambiente",
                    "Solidaridad y respeto por las diferencias",
                    "Interés por descubrir propiedades de la materia"
                ]
            }
        ]
    },
    {
        subject_id: 4,
        subject_name: "Ciencias Sociales",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Compara conceptos e informaciones de su historia familiar y comunitaria, con la finalidad de reflexionar en forma crítica sobre sus ideas y soluciones creativas a situaciones diversas, utilizando la tecnología."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Comprende en forma crítica conceptos y situaciones problemáticas del espacio natural y social de su entorno comunitario, con la finalidad de aportar ideas a las soluciones creativas utilizando tecnología."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Emplea actitudes de respeto a sí mismo y a las demás personas en cualquier espacio; con la finalidad de construir una ciudadanía basada en la participación democrática, la exigencia de sus derechos, el cumplimiento de sus deberes y el cuidado de su entorno natural y social."
            }
        ],
        curriculum_topics: [
            {
                id: "401",
                category: "Orientación Espacial y La Comunidad",
                concepts: [
                    "Puntos cardinales (Norte, Sur, Este, Oeste)",
                    "Hemisferios, Ecuador, Globo terráqueo",
                    "La República Dominicana y la isla de Santo Domingo en el mapa (límites, extensión)",
                    "Ubicación en el mapa del Caribe y mundo",
                    "Espacio natural y social de la comunidad (barrio, sector, paraje)",
                    "Cuidado del espacio natural y espacios públicos (baños, parques, playas)"
                ],
                procedures: [
                    "Identificación de puntos cardinales en el entorno (casa, escuela)",
                    "Identificación y dibujo de la isla de Santo Domingo en el mapa",
                    "Lectura de mapas físicos y políticos (océanos, islas, países vecinos)",
                    "Reconocimiento del globo terráqueo y líneas imaginarias",
                    "Identificación de productos de la comunidad y entorno cercano",
                    "Participación en campañas de limpieza de espacios públicos"
                ],
                attitudes_values: [
                    "Participación en trabajos de equipo",
                    "Respeto y valoración de instituciones sociales",
                    "Establecimiento de pertenencia a la comunidad",
                    "Valoración de la importancia de cuidar espacios públicos"
                ]
            },
            {
                id: "402",
                category: "Historia Familiar y Comunitaria / Valores",
                concepts: [
                    "Historia familiar: antecedentes, costumbres, gastronomía",
                    "Árbol genealógico",
                    "Valores: cortesía, cooperación, compasión, amor, respeto, responsabilidad",
                    "Democracia: libertad, respeto, colaboración"
                ],
                procedures: [
                    "Indagación y levantamiento de información familiar (entrevistas, fotos)",
                    "Escucha de narraciones históricas de la familia y comunidad",
                    "Elaboración del árbol genealógico",
                    "Lectura de cuentos infantiles sobre valores y derechos humanos",
                    "Realización de diálogos y sociodramas para solución pacífica de conflictos",
                    "Realización de murales sobre derechos humanos"
                ],
                attitudes_values: [
                    "Respeto por los puntos de vista diferentes",
                    "Respeto por los turnos en conversaciones grupales"
                ]
            },
            {
                id: "404",
                category: "Derechos y deberes del Niño y la Niña y Educación vial",
                concepts: [
                    "Derechos y deberes del Niño y la Niña",
                    "Normas y señales de tránsito",
                    "Clasificación de señales: informativas, reglamentarias, preventivas",
                    "Significado de formas y colores en señales",
                    "Responsabilidad de hombres y mujeres en el cumplimiento de normas"
                ],
                procedures: [
                    "Identificación de deberes para la familia, escuela y comunidad",
                    "Representación gráfica de señales de tránsito",
                    "Exploración de normas de educación vial",
                    "Identificación de señales en la calle y su significado",
                    "Escucha y análisis de noticias sobre educación vial"
                ],
                attitudes_values: [
                    "Valoración de los derechos de los niños",
                    "Valoración de la importancia de las señales para la protección",
                    "Cumplimiento de deberes y normas establecidas"
                ]
            },
            {
                id: "405",
                category: "Eventos Históricos e Identidad Nacional",
                concepts: [
                    "Primeros pobladores: Taínos (ubicación, vivienda, alimentación, costumbres)",
                    "Llegada de los españoles y africanos",
                    "Independencia Nacional (1844) y Restauración",
                    "Padres de la Patria y Heroínas (hazañas y nombres)",
                    "Símbolos Patrios: Bandera, Escudo Nacional e Himno (origen y significado)",
                    "Patrimonio histórico y natural"
                ],
                procedures: [
                    "Indagación sobre la vida de los Taínos",
                    "Comparación entre el modo de vida antiguo y actual",
                    "Creación de línea de tiempo de acontecimientos históricos",
                    "Elaboración de acrósticos sobre héroes y heroínas",
                    "Reconocimiento del aporte de las mujeres a los símbolos patrios",
                    "Dibujo y análisis de la Bandera y el Escudo",
                    "Interpretación y canto del Himno Nacional",
                    "Elaboración de murales sobre patrimonio cultural"
                ],
                attitudes_values: [
                    "Respeto por los símbolos patrios",
                    "Reconocimiento del valor histórico de los héroes",
                    "Valoración de la diversidad cultural y migraciones"
                ]
            }
        ]
    },
    {
        subject_id: 33,
        subject_name: "Ciencias Naturales (1er Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "1ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones de observaciones, exploraciones, y cuestionamientos de fenómenos naturales a partir de su contexto próximo y experimentado en ciencias de la vida, físicas, de la tierra y el universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica procedimientos organizados y creativos explorando, manipulando, construyendo y haciéndose consciente de sus cuestionamientos a partir de observación y medición llevando a cabo de vivencias, experimentos, exploraciones y observaciones guiadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud preventiva y en armonía en sí mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenibles de los recursos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 44,
        subject_name: "Ciencias Sociales (1er Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "1ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Identifica informaciones familiares, escolares y comunitarias; con la finalidad de conocer su entorno y relacionar el presente con el pasado."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Reconoce conceptos e informaciones básicas de su familia y comunidad; con la finalidad de reflexionar en forma crítica, comentando sus ideas y soluciones creativas a situaciones, apoyadas en la tecnología."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Muestra respeto a sí mismo y a las demás personas; con la finalidad de construir una ciudadanía basada en la participación democrática, la exigencia de sus derechos y el cumplimiento de sus deberes y cuidado de su entorno natural y social."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 34,
        subject_name: "Ciencias Naturales (3er Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "3ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones científicas y tecnológicas e inferencias de observaciones y experimentación guiadas de fenómenos naturales básicos a partir de su contexto próximo o experimentado o modelado en ciencias de la vida, físicas, de la tierra y el universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica sencillos y organizados procedimientos científicos y tecnológicos, mientras explora o experimenta, simula o construye, haciéndose consciente de sus cuestionamientos o hipótesis a partir de su observación y medición llevando a cabo de vivencias, experimentos, proyectos, exploraciones y observaciones guiadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud preventiva, interrogativa y en armonía integral en sí mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenibles de los recursos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 443,
        subject_name: "Ciencias Sociales (3er Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "3ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Comunica sus ideas sobre acontecimientos, a partir del análisis de distintas fuentes geográficas e históricas; con la finalidad de comprender el pasado y reconocer el espacio geográfico que ocupa su municipio, provincia, región y país."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Utiliza procedimientos científicos y tecnológicos en el análisis crítico de fenómenos geográficos, hechos históricos y culturales de la provincia, región y país; con la finalidad de realizar propuestas lógicas y creativas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Integra en su vida el respeto a sí mismo y a las demás personas; con la finalidad de promover relaciones democráticas y armoniosas, el cuidado a su entorno natural y la construcción de una cultura de paz en el municipio y región donde vive."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 6,
        subject_name: "Educación Artística",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "2do", // Generic for now, applies to all
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Comprende y expresa ideas, sentimientos, emociones y experiencias culturales en diversas situaciones de comunicación, utilizando distintos lenguajes artísticos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico",
                description: "Utiliza la imaginación y la creatividad para expresar sus vivencias y resolver problemas de forma original mediante expresiones artísticas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual",
                description: "Valora y respeta la diversidad cultural y las expresiones artísticas propias y de otros, fortaleciendo su identidad y autoestima."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 62,
        subject_name: "Educación Artística (2do Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Usa imágenes, movimientos, textos, gestos, colores y materiales diversos, para comunicar ideas, emociones, sentimientos y vivencias, en contextos diversos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Incorpora en sus expresiones artísticas, características de personajes, instrumentos, objetos y manifestaciones de su comunidad; con la finalidad de usarlos como elementos de comunicación de ideas, sentimientos y vivencias en la solución de problemas de manera creativa en distintos contextos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Integra ideas y situaciones de su entorno natural y cultural en sus creaciones; con el objeto de reafirmar su identidad personal y social, así como el interés por su salud y el medio ambiente."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 63,
        subject_name: "Educación Artística (3er Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "3ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Intercambia ideas, conceptos y sentimientos, utilizando elementos de los lenguajes artísticos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Utiliza elementos de los lenguajes artísticos, incorporando aspectos de la ciencia y la tecnología, con la finalidad de aplicar soluciones creativas en sus trabajos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Participa en actividades artísticas grupales, mostrando respeto por la diversidad de opiniones y formas de expresiones al emplear el reciclaje, sonidos y movimientos a fin de promover el cuidado de la salud y del medio ambiente."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 61,
        subject_name: "Educación Artística (1er Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Expresa artísticamente sentimientos y emociones producto de la percepción de sí mismo/a y de su entorno."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Utiliza en forma lógica, critica y creativa elementos artísticos diversos en sus expresiones, identificándolos consigo mismo y sus contextos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Representa situaciones de su entorno explorando las capacidades expresivas de su cuerpo; con el fin de mostrar respeto a sí mismo(a), a otras personas y del entorno natural y social, en interacción con estos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 701,
        subject_name: "Educación Física (1er Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Utiliza su cuerpo para expresar sentimientos, emociones y estados de ánimo en relación armónica con las demás personas y su entorno social y cultural."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico",
                description: "Muestra nivel de dominio en su acción motriz, a partir de la noción de su esquema corporal, al percibir y apreciar patrones, tamaños, formas, direcciones y relaciones espaciales y temporales estáticas en entornos cercanos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Resolución de Problemas",
                description: "Muestra niveles básicos de desempeño motriz en situaciones de juego, a partir de sus condiciones físicas naturales."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana",
                description: "Realiza acciones motrices diversas en relación con los demás, mostrando respeto y responsabilidad."
            },
            {
                type: "FUNDAMENTAL",
                name: "Científica y Tecnológica",
                description: "Identifica las condiciones del perímetro de juegos y deportes, a fin de utilizarlas en relación con sus acciones motrices de la vida diaria."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ambiental y de la Salud",
                description: "Reconoce algunos cambios en su cuerpo y sus habilidades motoras, con el objeto de valorarlas, evitando situaciones de riesgo para su salud, la de los demás y de su entorno."
            },
            {
                type: "FUNDAMENTAL",
                name: "Desarrollo Personal y Espiritual",
                description: "Identifica sus habilidades motrices y capacidades físicas en el desarrollo de actividades corporales diversas, para utilizarlas en el juego y disfrutar de este."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 7,
        subject_name: "Educación Física",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Realiza acciones motrices simples y en situaciones de juego, con el fin de expresar diversos sentimientos, emociones y estados de ánimo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Domina posturas motrices en la resolución de situaciones de juego simples; a los fines de evidenciar en forma lógica y creativa un desempeño motriz eficaz a partir de sus condiciones físicas naturales."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Reconoce las diferencias y similitudes propias en relación con sus compañeros; con la finalidad de disfrutar de manera armoniosa la realización de la actividad motriz, cuidando su salud y el Medioambiente."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 8,
        subject_name: "Formación Integral Humana y Religiosa",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "2do",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Reconoce valores en los principales hechos de la historia de Jesús de Nazaret, con el objetivo de identificarlos en su familia, la escuela y la cultura dominicana, a través de testimonio de personas y textos bíblicos, con respeto y alegría."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Contrasta normas del juego, el trato a los demás y el uso de las tecnologías para su bienestar y el fortalecimiento de las relaciones en su entorno comunitario y escolar, con autonomía y naturalidad partiendo de las enseñanzas de Jesús de Nazaret."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Distingue acciones que favorecen el cuidado y protección de su cuerpo, el de los demás y la naturaleza como dones de Dios con la finalidad de mantenerlos saludables, con autonomía, creatividad y valoración."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 81,
        subject_name: "Formación Integral Humana y Religiosa (1er Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Define los valores del nacimiento de Jesús de Nazaret con la finalidad de cultivarlos en las celebraciones de la Navidad y en sus relaciones con los demás, a partir del texto bíblico y de las buenas enseñanzas de sus familiares."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Identifica normas de convivencia en su familia, la escuela y la comunidad, a fin de aplicarlas en el juego con los demás y en el uso de las tecnologías, tomando en cuenta las enseñanzas de Jesús de Nazaret."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Reconoce la naturaleza, su cuerpo y el de los demás como creación de Dios, con la finalidad de valorarlos y cuidarlos tomando en cuenta su dimensión espiritual."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 83,
        subject_name: "Formación Integral Humana y Religiosa (3er Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "3ro",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Plantea sus ideas sobre las diferentes etapas de la vida de Jesús Nazaret, con la finalidad de aplicar las enseñanzas que de ellas se desprenden en su familia con creatividad, admiración, tomando en cuenta textos de los evangelios."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Practica normas de convivencia en el juego, el trato a los demás y el uso de las tecnologías, con el fin de favorecer el bienestar de sí mismo y cultivar buenas relaciones con sus compañeros, familiares y demás personas, con espontaneidad, empeño y libertad desde la propuesta de Jesús de Nazaret."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Demuestra valoración de la vida humana y de la creación reconociendo que vienen de Dios, con la finalidad de promover en sus acciones el cuidado de la vida y la protección de su entorno natural con creatividad, respeto, admiración y disfrute."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 84,
        subject_name: "Formación Integral Humana y Religiosa (4to Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "4to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Expresa que su cuerpo cambia, se comunica y que necesita cuidado y protección, con la finalidad de reconocer su valor y el de los demás en diferentes contextos, tomando en cuenta que es criatura de Dios, hecho a su imagen y semejanza."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Distingue los aportes del trabajo humano y de las ciencias y tecnologías en la familia, la escuela y la comunidad, con el fin de reconocer en estas contribuciones la expresión del quehacer de Dios, con respeto, criticidad y asertividad."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Identifica las características de su desarrollo físico, cognitivo, afectivo-sexual y espiritual para afianzar el amor a sí mismo, a los demás y a la naturaleza tomando como referencia el amor de Dios expresado en la persona de Jesús de Nazaret, con actitud de respeto, autonomía, libertad, asertividad y agradecimiento."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 74,
        subject_name: "Educación Física (4to Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "4to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Explora sus condiciones y características corporales, con el objeto de usarlas como medio de expresión de sentimientos, emociones y estados de ánimo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Interpreta los cambios físicos que experimenta su cuerpo con el apoyo de conocimientos científicos cotidianos; con el fin de valorar su incidencia en sus habilidades motrices y capacidades físicas que le permiten alcanzar la eficacia motora progresiva en situaciones creativas de juego."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Reconoce en sus relaciones sociales que entre las personas existen diferencias individuales que debe valorar y respetar; con el fin de actuar con sentido de responsabilidad en la realización de acciones motrices diversas, cuidando la salud humana y ambiental."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 444,
        subject_name: "Ciencias Sociales (4to Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "4to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Selecciona fuentes de información seguras y confiables sobre elementos de la geografía e historia del Caribe y las Antillas; con la finalidad de presentar sus argumentos sobre lo estudiado."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Identifica problemas en hechos históricos del Caribe y las Antillas en los siglos estudiados; con la finalidad de relacionarlos en forma lógica, creativa y crítica, con el espacio geográfico en el que ocurrieron, con apoyo de la tecnología."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Actúa democráticamente, defiende la convivencia pacífica, la preservación de la salud, el patrimonio histórico, natural y cultural del Caribe y la República Dominicana; con la finalidad de construir una ciudadanía basada en el respeto y la cultura de paz."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 445,
        subject_name: "Ciencias de la Naturaleza (4to Grado)",
        curriculum_type: "CON_BASE",
        grade_level: "4to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones científicas y tecnológicas a partir de analizar observaciones, medición, modelos y experimentación de fenómenos naturales fundamentales en contexto próximo o experimentado o modelado en ciencias de la vida, físicas, de la tierra y el universo"
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica organizados y lógicos procedimientos científicos y tecnológicos, que analiza mientras explora o experimenta, simula o construye, haciéndose consciente de sus cuestionamientos e inferencias a partir de su observación y medición llevando a cabo experimentos, proyectos, exploraciones y observaciones guiadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud preventiva, creativa, curiosa, colaborativa, responsable y en armonía integral consigo mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenible de los recursos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 85,
        subject_name: "Formación Integral Humana y Religiosa (5to Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "5to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Comunica la importancia de los cambios que se dan en su cuerpo, sus deberes y derechos a fin de construir relaciones de respeto y equidad en su entorno familiar, escolar y social, tomando en cuenta los derechos consignados sobre la niñez y su valor como hijo e hija de Dios."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Analiza la contribución y perjuicios del trabajo humano, las ciencias y las tecnologías en el ámbito social, cultural y espiritual de las personas a fin de mejorar la creación de Dios, con creatividad, sentido ético y responsabilidad."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Propone acciones que favorecen el cuidado a los demás y al entorno natural como casa común en la familia y la escuela a partir de la vida y las enseñanzas de Jesús de Nazaret para afianzar sus principios morales, su autoestima con respeto, responsabilidad, asertividad y gratitud."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 45,
        subject_name: "Ciencias Sociales (5to Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "5to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Utiliza fuentes seguras y confiables, sobre geografía e historia del continente americano de la isla de Santo Domingo; con la finalidad de respetar la autoría de las informaciones consultadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Analiza situaciones referidas a la geografía, la historia como ciencia, el continente americano, el Caribe y los procesos históricos de República Dominicana con la finalidad de plantear su punto de vista sobre sus hallazgos de manera lógica, crítica y creativa, usando la tecnología."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Defiende actitudes democráticas, respeta a los símbolos patrios del país, valora el patrimonio histórico, natural y cultural de Latinoamérica y de República Dominicana con la finalidad de construir una ciudadanía respetuosa de los derechos humanos y defensora de la cultura de paz."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 35,
        subject_name: "Ciencias de la Naturaleza (5to Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "5to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones científicas y tecnológicas a partir de analizar y evaluar preguntas o hipótesis de observaciones, medición, modelos y experimentación de fenómenos naturales en contexto próximo o experimentado o modelado en ciencias de la vida, físicas, de la tierra y el universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica organizados y sistemáticos procedimientos científicos y tecnológicos, que evalúa mientras explora o experimenta, simula o construye, haciéndose consciente de sus cuestionamientos e inferencia a partir de su observación y medición llevando a cabo vivencias, experimentos, proyectos, exploraciones y observaciones guiadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud preventiva, creativa, curiosa, colaborativa, responsable y en armonía integral en sí mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenible de los recursos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 86,
        subject_name: "Formación Integral Humana y Religiosa (6to Grado)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "6to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Promueve el valor de su cuerpo, el derecho de la niñez a ser protegida de todo tipo de maltrato y explotación a fin de promover su bienestar y el de los demás, con esmero, respeto y agradecimiento a Dios."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Promueve el valor del trabajo humano, el progreso de las ciencias y las tecnologías como expresión del amor de Dios y el desarrollo de los pueblos a fin de reconocer el esfuerzo, sacrificio de las personas que trabajan, con responsabilidad, respeto y asertividad."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Diseña y desarrolla acciones que favorecen su desarrollo físico, cognitivo, afectivo-sexual y espiritual, el cuidado y protección del entorno natural, a fin de buscar soluciones a situaciones que se viven en la familia, la escuela y la comunidad a partir de la vida y valores de Jesús de Nazaret, con asertividad, responsabilidad, respeto y gratitud."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 36,
        subject_name: "Ciencias de la Naturaleza (6to Grado)",
        curriculum_type: "ADAPTACION_CURRICULAR",
        grade_level: "6to",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Ofrece explicaciones científicas y tecnológicas a partir de analizar, evaluar y crear preguntas o hipótesis de observaciones, medición, modelos y experimentación de fenómenos naturales en contexto próximo o experimentado o modelado en ciencias de la vida, físicas, de la tierra y el universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
                description: "Aplica organizados, sistemáticos y creativos procedimientos científicos y tecnológicos, que analiza y evalúa mientras explora o experimenta, simula o construye, haciéndose consciente de sus cuestionamientos e inferencia a partir de su observación y medición llevando a cabo de vivencias, experimentos, proyectos, exploraciones y observaciones guiadas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
                description: "Asume una actitud preventiva, autónoma, autoconsciente, creativa, innovadora, crítica, de apertura, investigadora, colaborativa, solidaria, perseverante, responsable y en armonía integral en sí mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenible de los recursos."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 1773492576618,
        subject_name: "Lengua Española (1ro Sec)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro Sec",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Se comunica con claridad en diferentes contextos, siguiendo los procesos de compresión y producción oral y escrita, con creatividad, al emplear adecuadamente un tipo de texto (funcional o literario), las TIC, así como otros recursos y medios."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico",
                description: "Utiliza secuencias argumentativas (hechos, ejemplos, analogías, argumentos y contra argumentos), en discursos orales y escritos, creando nuevos conocimientos a partir de procesos de comprensión y producción de textos orales y escritos abordados con temas y problemas sociales de su realidad."
            },
            {
                type: "FUNDAMENTAL",
                name: "Resolución de Problemas",
                description: "Identifica problemas de su vida estudiantil o cotidiana a través de un tipo de texto específico y apropiado, como punto de partida para su estudio y solución."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana",
                description: "Analiza textos variados de manera oral o escrita que ponen de relieve hechos y tradiciones históricas relevantes, identificando nuevas relaciones sociales al reconocer y valorar el patrimonio natural y sociocultural dominicano."
            },
            {
                type: "FUNDAMENTAL",
                name: "Científica y Tecnológica",
                description: "Demuestra conocimiento de procesos investigativos científicos sencillos y del uso de tecnología de acuerdo con su grado, a través de textos científicos y especialmente los de secuencia expositivo-explicativa."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ambiental y de la Salud",
                description: "Explica con claridad situaciones sobre salud, medioambiente y la comunidad, mediante textos de diferente secuencias y géneros, a través de herramientas tecnológicas y otros medios y recursos."
            },
            {
                type: "FUNDAMENTAL",
                name: "Desarrollo Personal y Espiritual",
                description: "Demuestra conocimiento y comprensión de sí mismo y de los demás al expresar su percepción del mundo, a partir de un tipo de texto favorable a las situaciones y a las personas."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 1774220286715,
        subject_name: "Ciencias de la Naturaleza (1ro Sec)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro Sec",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Se comunica utilizando el lenguaje científico y tecnológico de Ciencias de la Tierra y el Universo que implica sus ideas básicas a respuestas a preguntas y situaciones de problemas simulados y reales sobre los subsistemas terrestres."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico",
                description: "Ofrece explicaciones científicas y tecnológicas a problemas y fenómenos naturales relacionados con las Ciencias de la Tierra y el Universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Resolución de Problemas",
                description: "Aplica procedimientos científicos y tecnológicos básicos y organizados para solucionar problemas o dar respuestas a fenómenos naturales relacionados con las Ciencias de la Tierra y el Universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana",
                description: "Analiza la naturaleza de las ciencias naturales y el alcance del desarrollo tecnológico en nuestra sociedad relacionado con las Ciencias de la Tierra y el Universo, sus aportes y reflexiones éticas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Científica y Tecnológica",
                description: "Se cuestiona e identifica problemas y situaciones y les da una explicación utilizando ideas y procesos fundamentales de las Ciencias de la Tierra y el Universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ambiental y de la Salud",
                description: "Actúa con responsabilidad crítica y autónoma para el cuidado de su salud y ambiente usando fundamentos relacionados con las Ciencias de la Tierra y el Universo."
            },
            {
                type: "FUNDAMENTAL",
                name: "Desarrollo Personal y Espiritual",
                description: "Gestiona actitudes intelectuales, emocionales y conductuales proactivas al desarrollo de su proyección personal desde las Ciencias de la Tierra y el Universo."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 1774220286716,
        subject_name: "Matemática (1ro Sec)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro Sec",
        competencies: [
            {
                type: "FUNDAMENTAL",
                name: "Comunicativa",
                description: "Usa métodos orales, escritos, concretos, pictóricos, gráficos y el lenguaje matemático para describir situaciones del entorno."
            },
            {
                type: "FUNDAMENTAL",
                name: "Pensamiento Lógico, Creativo y Crítico",
                description: "Reconoce en el trabajo matemático, razonamientos deductivos e inductivos como soporte a planteamientos y resolución de problemas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Resolución de Problemas",
                description: "Utiliza un enfoque de resolución de problemas para investigar y estudiar los conocimientos matemáticos, a partir de situaciones dentro y fuera de la matemática."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ética y Ciudadana",
                description: "Interpreta situaciones del contexto que impliquen la movilización de conocimientos e ideas matemáticas, respetando diferentes puntos de vista y asumiendo actitud responsable."
            },
            {
                type: "FUNDAMENTAL",
                name: "Científica y Tecnológica",
                description: "Utiliza herramientas tecnológicas para la resolución de problemas diversos, integrando conocimientos matemáticos en situaciones del contexto."
            },
            {
                type: "FUNDAMENTAL",
                name: "Ambiental y de la Salud",
                description: "Aplica modelos matemáticos para ayudar a comprender problemas relacionados con enfermedades que afecten la salud de las personas."
            },
            {
                type: "FUNDAMENTAL",
                name: "Desarrollo Personal y Espiritual",
                description: "Exhibe una actitud responsable en la interpretación de situaciones en el quehacer matemático, respetando los diferentes puntos de vista de los demás."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 1774220286717,
        subject_name: "Ciencias Sociales (1ro Sec)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro Sec",
        competencies: [
            {
                fundamental: "Comunicativa",
                specific: "Identifica en medios impresos y digitales fuentes primarias y secundarias sobre procesos sociales, políticos, económicos, culturales, históricos y geográficos; con la finalidad de obtener informaciones confiables."
            },
            {
                fundamental: "Pensamiento Lógico, Creativo y Crítico",
                specific: "Relaciona a través de propuestas y proyectos de investigación, hechos históricos con el espacio geográfico, ocurridos en diferentes periodos, con la finalidad de desarrollar una conciencia crítica en cuanto al tiempo y el espacio."
            },
            {
                fundamental: "Resolución de Problemas",
                specific: "Verifica en el levantamiento de informaciones, la existencia de un problema, con la finalidad de ubicar el contexto social en el que se produce."
            },
            {
                fundamental: "Ética y Ciudadana",
                specific: "Realiza propuestas que promueven la interacción sociocultural, el respeto a la Constitución y la construcción ciudadana, con la finalidad de fortalecer la democracia, la cultura de paz y el respeto a los derechos humanos."
            },
            {
                fundamental: "Científica y Tecnológica",
                specific: "Utiliza sus habilidades al analizar planteamientos y teorías científicas en sus investigaciones, tanto en el ámbito de los fenómenos naturales como sociales, con la finalidad de proporcionar explicaciones fundamentadas y rigurosas."
            },
            {
                fundamental: "Ambiental y de la Salud",
                specific: "Analiza críticamente las acciones humanas que pueden poner en riesgo los estilos de vida saludables y el equilibrio ambiental, con la finalidad de comprender sus efectos sobre la sociedad y la naturaleza."
            },
            {
                fundamental: "Desarrollo Personal y Espiritual",
                specific: "Emplea relaciones armoniosas y equilibradas, con la finalidad de promover la construcción de la cultura de paz, fundamentada en el respeto hacia uno mismo y hacia los demás."
            }
        ],
        curriculum_topics: []
    },
    {
        subject_id: 1773492576621,
        subject_name: "Lenguas Extranjeras - Inglés (1ro Sec)",
        curriculum_type: "ADECUACION_OFICIAL",
        grade_level: "1ro Sec",
        competencies: [
            {
                fundamental: "Comunicativa",
                specific: "Comprende y expresa ideas, sentimientos y valores culturales en distintas situaciones de comunicación orales y escritas relativas a necesidades concretas y temas cotidianos, utilizando el idioma inglés de forma breve y sencilla para compartir información propia y de otras personas, describir sus actividades cotidianas, el entorno inmediato, y sus puntos de vista."
            },
            {
                fundamental: "Pensamiento Lógico, Creativo y Crítico",
                specific: "Interactúa en el idioma inglés, empleando estrategias de desempeño, el razonamiento lógico-verbal y la expresión creativa y crítica con el propósito de comunicarse de forma clara y efectiva en distintas situaciones concretas de comunicación oral y escrita."
            },
            {
                fundamental: "Resolución de Problemas",
                specific: "Se comunica en inglés oral y escrito de forma básica, pero comprensible, compartiendo información que permite identificar, describir y abordar problemas y situaciones comunes de su entorno inmediato."
            },
            {
                fundamental: "Ética y Ciudadana",
                specific: "Se comunica en intercambios breves y sencillos, participando en un plano de respeto y colaboración, e identificando algunas de las diferencias individuales y la identidad social y cultural propia y de otros países."
            },
            {
                fundamental: "Científica y Tecnológica",
                specific: "Interactúa en el idioma inglés compartiendo información, ideas y opiniones sobre aspectos científicos y tecnológicos de su entorno inmediato en distintas situaciones cotidianas de comunicación."
            },
            {
                fundamental: "Ambiental y de la Salud",
                specific: "Muestra preferencias por actividades cotidianas y opciones que impactan de forma positiva la salud y el medioambiente en distintas situaciones de comunicación."
            },
            {
                fundamental: "Desarrollo Personal y Espiritual",
                specific: "Se comunica en el idioma inglés, con cortesía, asertividad, actitud de respeto, honestidad y aceptación al expresarse sobre sí mismo y las demás personas en cuanto a preferencias, experiencias, características personales y actividades cotidianas."
            }
        ],
        indicators: [
            "**Responde de forma** adecuada a preguntas e indicaciones, a partir de la escucha o lectura de textos claros, breves y sencillos, donde se describen el entorno inmediato, información personal propia y de otras personas, actividades cotidianas y preferencias personales.",
            "**Se expresa en** inglés mediante una serie de frases y oraciones breves y sencillas enlazadas por conectores comunes para compartir información, puntos de vista e ideas referentes al entorno próximo y actividades cotidianas, aunque con pausas y reformulaciones en lo oral y con posibles errores básicos en lo escrito.",
            "**Interactúa de forma** oral y escrita utilizando una serie de frases y oraciones breves y sencillas y con diversidad de vocabulario básico referente a información personal, actividades cotidianas y el entorno inmediato, pero con suficiente claridad para ser comprendido con un poco de esfuerzo.",
            "**Responde a preguntas** e indicaciones utilizando el pensamiento lógico verbal, creativo y crítico para comprender la información contenida en mensajes orales y escritos referentes a necesidades concretas y temas cotidianos.",
            "**Se expresa en** inglés a través de frases y oraciones con creatividad y mediante una estructura lógica básica, enlazadas por conectores comunes, con pausas y reformulaciones en lo oral y con posibles errores básicos en lo escrito.",
            "**Interactúa de forma** oral y escrita siguiendo la lógica de la interacción y el contexto inmediato, expresándose mediante frases y oraciones breves y sencillas con creatividad y pensamiento reflexivo.",
            "**Responde acorde a** preguntas e indicaciones a partir de información sencilla contenida en textos orales o escritos sobre situaciones y problemas cotidianos o del entorno próximo.",
            "**Se expresa de** forma oral y escrita, utilizando expresiones breves y sencillas para describir de forma clara: ideas, elementos, personas y acciones relativas a problemas o situaciones de su entorno inmediato.",
            "**Interactúa en intercambios** comunicativos breves y sencillos, identificando problemas y situaciones variadas de sus actividades cotidianas y de su entorno inmediato, planteando opciones justas para enfrentar la situación, con expresiones breves y sencillas.",
            "**Participa de forma** activa, con escucha atenta y respetuosa en las interacciones formativas e informativas que realiza, identificando aspectos de la identidad social y cultural propia y de otros países, con actitud de aceptación y asertividad.",
            "**Expresa preferencias y** puntos de vista de forma oral o escrita, con actitud y conducta respetuosa, cortés y asertiva, teniendo en cuenta las diferencias individuales y la cultura propia y de otras personas.",
            "**Interactúa en un** plano de cortesía, asertividad and respeto tomando en cuenta las diferencias individuales y la identidad social y cultural propia y de otras personas relativas a rasgos físicos, formas de interactuar, preferencias, puntualidad, celebraciones y clima.",
            "**Responde de forma** adecuada a preguntas e indicaciones a partir de la escucha o lectura de textos breves y de vocabulario y expresiones básicas y sencillas sobre asuntos científicos y tecnológicos compartidos de forma presencial o virtual.",
            "**Identifica y describe** aspectos científicos y tecnológicos relativos a sus actividades cotidianas y entorno inmediato, tales como anatomía de las personas y elementos tecnológicos y de la naturaleza utilizando frases y oraciones breves y sencillas orales y escritas.",
            "**Interactúa en forma** oral o escrita por diferentes medios físicos y electrónicos, para intercambiar información, ideas y opiniones sobre aspectos científicos y tecnológicos del entorno inmediato, actividades cotidianas y la descripción de las personas.",
            "**Responde de forma** favorable a la preservación del medio ambiente y la salud ante preguntas e indicaciones sobre información de las personas, el entorno y sus actividades cotidianas.",
            "**Ofrece información, opiniones** e instrucciones sobre acciones que impactan positivamente el medio ambiente y la salud.",
            "**Interactúa para compartir** información personal, de su entorno inmediato y de actividades cotidianas, mostrando preferencia por aquellas que impactan positivamente la salud y el medioambiente.",
            "**Identifica respetuosamente a** las personas por su apariencia y forma de ser, preferencias sobre actividades cotidianas y lugares, en un plano de cortesía, aceptación y asertividad ante sí mismo y los demás.",
            "**Comparte información sobre** su identidad personal y preferencias sobre lugares y actividades cotidianas con humildad, cortesía, asertividad y respeto.",
            "**Interactúa con cortesía** asertividad y respeto, en intercambios orales y escritos de información, opiniones e instrucciones."
        ],
        curriculum_topics: []
    }
];

// Helper function to get curriculum topics by subject
export function getCurriculumTopicsBySubject(subjectId: number) {
    const subject = SCIENCE_CURRICULUM_DATA.find(s => s.subject_id === subjectId);
    return subject?.curriculum_topics || [];
}

// Comprehensive helper to get full subject curriculum data
export function getCurriculumBySubject(subjectId: number | string) {
    const sId = typeof subjectId === 'string' ? Number(subjectId) : subjectId;
    return SCIENCE_CURRICULUM_DATA.find(s => s.subject_id === sId);
}

// Helper function to get competencies by subject
export function getCompetenciesBySubject(subjectId: number | string): CurriculumCompetency[] {
    const subject = getCurriculumBySubject(subjectId);
    return (subject?.competencies || []) as CurriculumCompetency[];
}

// Helper function to get topic by ID
export function getTopicById(topicId: string) {
    for (const subject of SCIENCE_CURRICULUM_DATA) {
        const topic = subject.curriculum_topics.find(t => t.id === topicId);
        if (topic) return topic;
    }
    return null;
}
