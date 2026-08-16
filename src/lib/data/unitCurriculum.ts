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
,
{
        "subjectId": "ingles",
        "grade": "4to",
        "units": [
            {
                "id": "7813869b-ff1d-45ea-a649-684709bcc0f5",
                "name": "UNIDAD 1 - IDENTIFICACIÓN PERSONAL Y PRESENTACIONES",
                "themes": [
                    {
                        "id": "600e3e41-5898-40a5-af4f-0a281c06373c",
                        "name": "Tema 1: El Alfabeto y los Nombres",
                        "subthemes": [
                            {
                                "id": "6c5a638c-b7cd-4588-8415-ff3bc649b831",
                                "name": "1.1 El abecedario en inglés (A-Z)"
                            },
                            {
                                "id": "385be9d6-7def-4cc6-9ce8-292967656831",
                                "name": "1.2 Pronunciación de las letras"
                            },
                            {
                                "id": "8a5cc2fe-8e02-4a1b-81bf-575d9087316a",
                                "name": "1.3 Nombres comunes en inglés"
                            },
                            {
                                "id": "b9f16379-0413-4dea-9678-39dd10ee702f",
                                "name": "1.4 Apellidos comunes en inglés"
                            },
                            {
                                "id": "85083437-a361-40b7-a454-3bbd13a96413",
                                "name": "1.5 Títulos de cortesía: Mr., Mrs., Ms., Miss"
                            },
                            {
                                "id": "e5480b32-b57c-4201-8605-0e9c6757643b",
                                "name": "1.6 Deletreo de palabras y nombres"
                            }
                        ]
                    },
                    {
                        "id": "f9106d6c-6cb0-4107-9b3a-57bd1bd0c331",
                        "name": "Tema 2: Presentación Personal",
                        "subthemes": [
                            {
                                "id": "bc4d3e3b-9092-4a71-9353-99ced7c27c2a",
                                "name": "2.1 Pronombres personales: I, You, He, She, It, We, They"
                            },
                            {
                                "id": "1f504753-e07b-41d7-b265-c9299d04f623",
                                "name": "2.2 Verbo \"to be\" en presente: am, is, are"
                            },
                            {
                                "id": "9d152fbf-665f-4a95-af7e-1ee6cfce7b95",
                                "name": "2.3 Saludos formales e informales"
                            },
                            {
                                "id": "452e1b3f-1e70-479b-ba5d-0aef680639df",
                                "name": "2.4 Despedidas"
                            },
                            {
                                "id": "5c1691ff-4597-4c2a-993f-ddecdd2f6cc9",
                                "name": "2.5 Nacionalidades"
                            },
                            {
                                "id": "4d5c1618-77be-4890-a525-cd7616d64234",
                                "name": "2.6 Preguntas y respuestas básicas: \"How are you?\", \"What's your name?\""
                            }
                        ]
                    },
                    {
                        "id": "2db9bccb-dda6-4e3e-a191-83f58aa46673",
                        "name": "Tema 3: Solicitar y Ofrecer Información Personal",
                        "subthemes": [
                            {
                                "id": "b1b386a6-07f9-4f08-af37-9b9889f915fa",
                                "name": "3.1 Pronombres interrogativos: What, Who, Where, How"
                            },
                            {
                                "id": "207ffa55-3087-4b18-a406-72af9de2b484",
                                "name": "3.2 Números cardinales del 1 al 20"
                            },
                            {
                                "id": "5183cae2-31fb-4cf4-af2d-73cc238b55f2",
                                "name": "3.3 Preguntas sobre nombre: \"What is your name?\""
                            },
                            {
                                "id": "e1b2aa6a-ab58-4bd0-b603-b722de041312",
                                "name": "3.4 Preguntas sobre edad: \"How old are you?\""
                            },
                            {
                                "id": "ea69de57-59b8-43d9-a4b1-227a8b1b7df2",
                                "name": "3.5 Preguntas sobre origen: \"Where are you from?\""
                            },
                            {
                                "id": "aea1bfab-e632-436c-90d1-14a596a7d29e",
                                "name": "3.6 Respuestas y diálogos de presentación"
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "4to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "5b491ccd-45fc-42db-a4c7-7312c2d88e33",
                        "themes": [
                            "Tema 1: El Alfabeto y los Nombres"
                        ],
                        "conceptual": "- El abecedario en inglés (A, B, C, D... Z)\n- Pronunciación de las letras\n- Nombres comunes en inglés (Mary, John, James, David, Anna)\n- Apellidos comunes en inglés (Smith, Jones, Brown, Taylor)\n- Títulos de cortesía: Mr., Mrs., Ms., Miss\n- Deletreo de palabras",
                        "procedural": "- Deletrear su propio nombre en inglés\n- Pronunciar correctamente las letras del abecedario\n- Escribir su nombre y apellido en inglés\n- Usar títulos de cortesía al presentar a alguien\n- Identificar letras al escuchar su pronunciación\n- Deletrear palabras sencillas",
                        "attitudinal": "- Motivación para aprender el idioma inglés\n- Respeto al pronunciar correctamente los nombres de los compañeros\n- Valoración de la identidad personal\n- Cortesía al saludar y presentarse\n- Confianza al participar en actividades orales\n- Interés por aprender vocabulario nuevo"
                    },
                    {
                        "id": "8c0ffa60-9fc0-49c7-80fc-cb0ab775ff85",
                        "themes": [
                            "Tema 2: Presentación Personal"
                        ],
                        "conceptual": "- Pronombres personales: I, You, He, She, It, We, They\n- Verbo \"to be\" en presente: am, is, are\n- Saludos formales e informales: Hello, Hi, Good morning, Good afternoon, Good evening\n- Despedidas: Goodbye, See you later, Bye\n- Nacionalidades: Dominican, American, Spanish, Mexican, Brazilian, French\n- Preguntas básicas: \"How are you?\", \"What's your name?\"\n- Respuestas: \"I am fine, thank you\", \"My name is...\"",
                        "procedural": "- Presentarse diciendo \"I am...\" o \"My name is...\"\n- Saludar y despedirse en diferentes momentos del día\n- Decir su nacionalidad: \"I am Dominican\"\n- Preguntar \"How are you?\" y responder adecuadamente\n- Presentar a un compañero: \"This is...\"\n- Identificar el género al usar he/she",
                        "attitudinal": "- Cortesía al saludar y despedirse\n- Confianza para hablar en público\n- Aceptación de las diferencias culturales\n- Respeto por los turnos de habla\n- Actitud positiva hacia el aprendizaje del inglés\n- Valoración de la identidad cultural propia"
                    },
                    {
                        "id": "c84f6d56-6139-4176-8f08-676bd21cc019",
                        "themes": [
                            "Tema 3: Solicitar y Ofrecer Información Personal"
                        ],
                        "conceptual": "- Pronombres interrogativos: What, Who, Where, How\n- Números cardinales del 1 al 20: one, two, three... twenty\n- Preguntas sobre nombre: \"What is your name?\"\n- Preguntas sobre edad: \"How old are you?\"\n- Preguntas sobre origen: \"Where are you from?\"\n- Respuestas: \"I am... years old\", \"I am from...\"\n- Preguntas sobre identidad: \"Who is he/she?\"",
                        "procedural": "- Preguntar y responder el nombre en inglés\n- Preguntar y responder la edad usando números\n- Preguntar y responder el país de origen\n- Responder \"How old are you?\" correctamente\n- Formular preguntas con What, Who, Where, How\n- Participar en diálogos cortos de presentación\n- Completar tarjetas de identificación personal",
                        "attitudinal": "- Respeto por la información personal de los demás\n- Curiosidad por conocer a otros\n- Escucha activa durante los diálogos\n- Honestidad al compartir información personal\n- Respeto por las diferencias individuales\n- Colaboración en actividades en pareja"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "f59fd3fc-7afc-4b95-a340-3a25ed341288",
                "name": "UNIDAD 2 - DESCRIPCIÓN DE ANIMALES, OBJETOS Y ACTIVIDADES COTIDIANAS",
                "themes": [
                    {
                        "id": "9ab2159d-2b6d-4901-8f17-c56308b60be9",
                        "name": "Tema 4: La Familia y las Relaciones Sociales",
                        "subthemes": [
                            {
                                "id": "27c35d25-b302-424a-8661-b5237bcc7477",
                                "name": "4.1 Miembros de la familia: mother, father, sister, brother, grandmother, grandfather"
                            },
                            {
                                "id": "c8a86564-d107-4cbd-bc83-40021d53e212",
                                "name": "4.2 Otros familiares: uncle, aunt, cousin"
                            },
                            {
                                "id": "8e12000d-5393-47df-b362-578eade5d74e",
                                "name": "4.3 Relaciones sociales: friend, classmate, teacher, neighbor"
                            },
                            {
                                "id": "a42ba558-45f9-4d4f-813f-2b61f1525e0d",
                                "name": "4.4 Verbo \"to be\" para presentar familiares"
                            },
                            {
                                "id": "40352e99-9e53-443c-b3cf-1efc3ef29c57",
                                "name": "4.5 Preguntas sobre relaciones: \"Who is he/she?\""
                            },
                            {
                                "id": "6b9861e5-2b60-4b40-b1d8-2a66409a8beb",
                                "name": "4.6 Adjetivos posesivos: my, your, his, her"
                            },
                            {
                                "id": "472dda91-a6ee-4991-ac5a-e0a2bc0d14b4",
                                "name": "4.7 Árbol genealógico simple"
                            }
                        ]
                    },
                    {
                        "id": "35966313-83a7-4556-a435-37b853adff53",
                        "name": "Tema 5: Animales y Objetos",
                        "subthemes": [
                            {
                                "id": "6c488342-7e7e-4c56-bf92-54d6b93498e3",
                                "name": "5.1 Animales domésticos: dog, cat, rabbit, bird, fish"
                            },
                            {
                                "id": "0821fdea-e84e-47cd-895a-0ea723b8d993",
                                "name": "5.2 Animales salvajes: lion, elephant, tiger, monkey, giraffe"
                            },
                            {
                                "id": "33a40cca-c46d-4e52-bc5f-f8a75bbe14d0",
                                "name": "5.3 Animales de granja: pig, horse, cow, sheep, chicken"
                            },
                            {
                                "id": "02c0943e-3505-4ec9-a1c9-0fcdb24761e9",
                                "name": "5.4 Insectos: bee, butterfly, ant"
                            },
                            {
                                "id": "585f5d96-d941-4afc-acff-231f2193e8f3",
                                "name": "5.5 Adjetivos calificativos: big, small, long, short, fast, slow, strong"
                            },
                            {
                                "id": "c1145a52-4677-4a9b-87ad-ba7131e85e3f",
                                "name": "5.6 Colores básicos: black, white, brown, yellow, green, blue, red"
                            },
                            {
                                "id": "edd9d5a7-9d99-4989-885c-38cbb122b610",
                                "name": "5.7 Partes del cuerpo de animales: legs, wings, beak, tail, ears"
                            },
                            {
                                "id": "e9f07825-a2f7-489e-bff6-571e1010abf0",
                                "name": "5.8 Verbo \"to be\" para describir: \"The dog is big.\""
                            },
                            {
                                "id": "f837fcc3-15a9-4296-842d-18e94a4f29d7",
                                "name": "5.9 Verbo \"have\" para describir: \"It has long ears.\""
                            },
                            {
                                "id": "45dbdd87-d9a5-42a9-b893-28474e33c5c3",
                                "name": "5.10 Sustantivos en singular y plural"
                            },
                            {
                                "id": "e188afd8-42b3-4c1d-879f-1d855f2978a6",
                                "name": "5.11 Artículos: a, an, the"
                            }
                        ]
                    },
                    {
                        "id": "c1967fec-31dc-4a99-bdb0-8149ff678043",
                        "name": "Tema 6: Actividades Cotidianas y Gustos",
                        "subthemes": [
                            {
                                "id": "67033c61-436a-447b-b396-6f3d5367705e",
                                "name": "6.1 Verbos de acción cotidiana: read, write, eat, sleep, walk, play, study"
                            },
                            {
                                "id": "f61eda1b-e849-477a-a022-a3759ba15c64",
                                "name": "6.2 Presente simple para rutinas diarias"
                            },
                            {
                                "id": "ad44e93a-4f42-4159-968f-4abecf977c5f",
                                "name": "6.3 Verbos \"like\" y \"hate\" para gustos"
                            },
                            {
                                "id": "3352e6b6-c06f-4bb3-9197-480688426314",
                                "name": "6.4 Preguntas con \"Do\": \"Do you like...?\""
                            },
                            {
                                "id": "e082f078-3e63-42d0-9a22-61eadae9a5c7",
                                "name": "6.5 Respuestas cortas: \"Yes, I do.\" / \"No, I don't.\""
                            },
                            {
                                "id": "b08a0606-a0af-4ab1-93a1-bdac8cb66385",
                                "name": "6.6 Quehaceres domésticos: do the dishes, make the bed, sweep the floor"
                            },
                            {
                                "id": "66a1edd9-b8cc-47cf-a5c3-e428cfee3fc7",
                                "name": "6.7 Lugares de trabajo: school, hospital, office, store, park"
                            },
                            {
                                "id": "abb143a0-b954-4744-84c3-2fd87c018fc6",
                                "name": "6.8 Adverbios de frecuencia: always, usually, sometimes, never"
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "4to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "759e36bb-853b-4de5-8330-4ebb3ee8658e",
                        "themes": [
                            "Tema 4: La Familia y las Relaciones Sociales"
                        ],
                        "conceptual": "- Miembros de la familia: mother, father, sister, brother, baby, grandmother, grandfather, uncle, aunt, cousin\n- Relaciones sociales: friend, classmate, teacher, neighbor, classmate\n- Verbo \"to be\" para presentar: \"This is my mother.\"\n- Preguntas: \"Who is she/he?\"\n- Adjetivos posesivos: my, your, his, her\n- Pronombres demostrativos: this, that",
                        "procedural": "- Presentar a un familiar: \"This is my sister.\"\n- Preguntar sobre relaciones: \"Who is he?\"\n- Describir relaciones familiares\n- Identificar miembros de la familia en imágenes\n- Crear un árbol genealógico simple\n- Hablar sobre su familia usando \"I have...\"",
                        "attitudinal": "- Valoración de los vínculos afectivos en la familia\n- Respeto al referirse a los miembros de la familia\n- Identidad y sentido de pertenencia a una familia\n- Respeto por las diferencias en las estructuras familiares\n- Cortesía al hablar de la familia de otros"
                    },
                    {
                        "id": "5b2c9dba-516e-4ba5-90b0-6bd383b63278",
                        "themes": [
                            "Tema 5: Animales y Objetos"
                        ],
                        "conceptual": "- Animales domésticos: dog, cat, rabbit, bird, fish, hamster\n- Animales salvajes: lion, elephant, tiger, monkey, bear, giraffe\n- Animales de granja: pig, horse, cow, sheep, chicken\n- Insectos: bee, butterfly, ant\n- Adjetivos calificativos: big, small, long, short, fast, slow, strong, weak, beautiful, ugly\n- Colores: black, white, brown, yellow, green, blue, red\n- Partes del cuerpo de animales: legs, wings, beak, tail, ears, eyes\n- Verbo \"to be\" para describir: \"The dog is big.\"\n- Verbo \"have\" para describir: \"It has long ears.\"\n- Sustantivos en singular y plural: cat/cats, box/boxes, fish/fish\n- Artículos: a, an, the",
                        "procedural": "- Describir animales usando adjetivos: \"The cat is small.\"\n- Describir características físicas: \"It has four legs.\"\n- Comparar animales: \"The elephant is big. The mouse is small.\"\n- Identificar animales por su descripción\n- Clasificar animales domésticos y salvajes\n- Formar plurales de sustantivos\n- Usar \"a\" y \"an\" correctamente\n- Dibujar y describir un animal favorito",
                        "attitudinal": "- Valoración de la biodiversidad\n- Cuidado y protección de los animales\n- Respeto por los seres vivos\n- Interés por aprender sobre animales\n- Responsabilidad con las mascotas\n- Curiosidad por la naturaleza"
                    },
                    {
                        "id": "90a97a9f-31a9-4bd9-8bd2-87514b0c8074",
                        "themes": [
                            "Tema 6: Actividades Cotidianas y Gustos"
                        ],
                        "conceptual": " Verbos de acción cotidiana: read, write, eat, sleep, walk, play, study, run, swim, sing, dance, draw\n- Presente simple para rutinas: \"I get up at 7:00 am.\" \"She plays in the park.\"\n- Verbos \"like\" y \"hate\" para gustos: \"I like...\" \"He hates...\"\n- Preguntas con \"Do\": \"Do you like...?\"\n- Respuestas cortas: \"Yes, I do.\" \"No, I don't.\"\n- Quehaceres domésticos: do the dishes, make the bed, sweep the floor, clean the room, wash the clothes\n- Lugares de trabajo: school, hospital, office, store, park, bank, restaurant\n- Adverbios de frecuencia: always, usually, sometimes, never",
                        "procedural": "- Hablar sobre su rutina diaria: \"I eat breakfast at 7:30.\"\n- Expresar gustos y preferencias: \"I like to play soccer.\"\n- Preguntar sobre gustos: \"Do you like ice cream?\"\n- Describir quehaceres domésticos: \"I make my bed.\"\n- Identificar lugares de trabajo\n- Usar adverbios de frecuencia: \"I always do my homework.\"\n- Participar en diálogos sobre actividades cotidianas\n- Crear una rutina diaria en inglés",
                        "attitudinal": "- Hábitos saludables de alimentación, recreación y cuidado del cuerpo\n- Respeto por los gustos y preferencias de las demás personas\n- Aceptación del trabajo doméstico como cooperación\n- Reconocimiento de la igualdad de género en actividades\n- Responsabilidad en los quehaceres del hogar\n- Valoración de la importancia del trabajo"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "95261400-0f4e-4d05-89f2-5dfb8a4388b2",
                "name": "PERIODO 3: UNIDAD 3 - ACCIONES EN PROGRESO (ESCUELA Y TIEMPO LIBRE)",
                "themes": [
                    {
                        "id": "12664dfb-907f-4c70-bd67-6911fba36a96",
                        "name": "Tema 7: Mi Escuela y Salón de Clases",
                        "subthemes": [
                            {
                                "id": "2162a16a-0c8b-4a7d-b672-905e82c0b21c",
                                "name": "7.1 Objetos del aula: table, desk, door, window, pencil, book, eraser, board, clock"
                            },
                            {
                                "id": "a30ef10a-11ad-4f89-9be5-62fbdcd6d9c6",
                                "name": "7.2 Otros objetos: chair, crayon, ruler, backpack, notebook"
                            },
                            {
                                "id": "3a15a541-c3cf-490a-8bfb-ebf83a6daece",
                                "name": "7.3 Áreas de la escuela: classroom, library, cafeteria, playground, gym"
                            },
                            {
                                "id": "14553321-51bb-4156-98ba-ffc870895cce",
                                "name": "7.4 Modo imperativo para instrucciones: \"Open your book.\", \"Sit down.\""
                            },
                            {
                                "id": "d40167bb-f791-4f2d-8726-f2f0d448c12a",
                                "name": "7.5 Actividades escolares: read, write, do homework, study, draw"
                            },
                            {
                                "id": "4fb78eb6-e569-45f1-a936-766a3e3bece9",
                                "name": "7.6 Presente continuo para acciones en curso"
                            },
                            {
                                "id": "c9933d66-3628-48fe-a360-8e13aceac795",
                                "name": "7.7 Preguntas en presente continuo: \"What are you doing?\""
                            }
                        ]
                    },
                    {
                        "id": "4303628c-e7f9-4cc2-bc34-f9dd84e4c362",
                        "name": "Tema 8: Tiempo Libre y Deportes",
                        "subthemes": [
                            {
                                "id": "ef49506c-3db3-4437-a94a-8a0c4f4e67aa",
                                "name": "8.1 Deportes: soccer, baseball, basketball, volleyball, swimming, tennis"
                            },
                            {
                                "id": "18affede-9b92-4d9c-91f6-87be6e2229b2",
                                "name": "8.2 Actividades recreativas: watch TV, listen to music, play video games"
                            },
                            {
                                "id": "66fdb992-70fa-4960-bfbe-e6594fe06ef3",
                                "name": "8.3 Verbos de acción: play, watch, listen, ride, read, dance, sing"
                            },
                            {
                                "id": "bfed92a0-3695-491f-a21f-1d2b7c85310c",
                                "name": "8.4 Presente continuo para acciones de tiempo libre"
                            },
                            {
                                "id": "3e0e379c-6c36-4b2e-9bbe-143aa754a664",
                                "name": "8.5 Preguntas y respuestas en presente continuo"
                            },
                            {
                                "id": "a4bc5805-6d16-463a-8f2f-7470e85870ec",
                                "name": "8.6 Expresar preferencias: \"I like playing...\""
                            }
                        ]
                    },
                    {
                        "id": "630901c9-cd65-4650-b7e5-5f1990d44d28",
                        "name": "Tema 9: Tiempo y Figuras",
                        "subthemes": [
                            {
                                "id": "48b42cd3-545b-4b94-8082-8b7ddead0a4d",
                                "name": "9.1 Días de la semana: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
                            },
                            {
                                "id": "a1930ae7-4432-48a4-8eeb-7e8beee476e5",
                                "name": "9.2 Figuras geométricas: circle, square, triangle, rectangle, star"
                            },
                            {
                                "id": "004d9118-e361-4db8-88e8-3a8715761142",
                                "name": "9.3 Preposiciones de tiempo: on, in, at"
                            },
                            {
                                "id": "19d9308e-9dff-4548-b325-49f2cad4379b",
                                "name": "9.4 Adverbios de tiempo: today, tomorrow, now, later"
                            },
                            {
                                "id": "4b7e980f-55dd-471b-8e64-8bc7f38a3d3b",
                                "name": "9.5 Números ordinales: first, second, third, fourth, fifth"
                            },
                            {
                                "id": "41d2578a-c3b4-47c7-90d5-d01f3f7a8229",
                                "name": "9.6 Preguntas: \"What day is today?\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "4to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "266600c2-f731-4486-a808-35d88546c696",
                        "themes": [
                            "Tema 7: Mi Escuela y Salón de Clases"
                        ],
                        "conceptual": "- Objetos del aula: table, desk, door, window, pencil, book, eraser, board, clock, chair, crayon, ruler, backpack, notebook\n- Áreas de la escuela: classroom, library, cafeteria, playground, principal's office, bathroom, gym\n- Modo imperativo: \"Open your book.\", \"Sit down.\", \"Stand up.\", \"Listen.\", \"Write your name.\", \"Close the door.\", \"Read page 5.\"\n- Actividades escolares: read, write, do homework, take a test, study, learn, listen, speak, draw, paint\n- Presente continuo: \"I am reading.\", \"She is writing.\", \"They are studying.\"\n- Preguntas en presente continuo: \"What are you doing?\", \"What is he/she doing?\"",
                        "procedural": "- Seguir instrucciones en imperativo: \"Open your book.\"\n- Dar instrucciones a otros: \"Sit down, please.\"\n- Describir lo que están haciendo: \"I am writing.\" \"He is reading.\"\n- Preguntar sobre acciones en curso: \"What are you doing?\"\n- Identificar objetos del aula en inglés\n- Nombrar áreas de la escuela\n- Crear oraciones en presente continuo",
                        "attitudinal": "- Respeto a las normas de convivencia en el aula\n- Igualdad y equidad en la participación\n- Valoración de la educación\n- Responsabilidad con los materiales escolares\n- Colaboración en actividades grupales\n- Orden y limpieza en el aula\n- Respeto por los turnos de habla"
                    },
                    {
                        "id": "a667c13a-c16c-4f62-a95a-e3fb2fcf9aa2",
                        "themes": [
                            "Tema 8: Tiempo Libre y Deportes"
                        ],
                        "conceptual": "- Deportes: soccer, baseball, basketball, volleyball, swimming, tennis, running, karate, cycling, golf\n- Actividades recreativas: watch TV, listen to music, play video games, ride a bike, see movies, read books, play with friends, go to the park, dance, sing\n- Verbos de acción: play, watch, listen, ride, read, see, dance, sing, run, swim\n- Presente continuo para acciones en progreso:\n— \"I am playing soccer.\"\n— \"She is watching TV.\"\n— \"They are listening to music.\"\n- Preguntas en presente continuo: \"What are you doing?\", \"What is he doing?\", \"Are you playing?\"\n- Respuestas cortas: \"Yes, I am.\" \"No, I'm not.\"\n- Expresar preferencias: \"I like playing soccer.\" \"I don't like watching TV.\"",
                        "procedural": "- Describir acciones en progreso: \"I am playing baseball.\"\n- Preguntar sobre actividades de tiempo libre: \"What are you doing?\"\n- Hablar sobre deportes favoritos: \"I like soccer.\"\n- Nombrar deportes y actividades recreativas\n- Crear diálogos sobre tiempo libre\n- Describir lo que están haciendo otros: \"He is swimming.\"\n- Participar en juegos de roles sobre actividades recreativas",
                        "attitudinal": "- Preferencia por actividades recreativas sanas\n- Respeto por los gustos y preferencias de los demás\n- Valoración del tiempo libre y la recreación\n- Trabajo en equipo y cooperación\n- Hábitos saludables de recreación\n- Importancia del deporte para la salud\n- Aceptación de las diferencias en gustos deportivos"
                    },
                    {
                        "id": "faeaee56-0cf0-4a58-97fd-d5ead8b10018",
                        "themes": [
                            "Tema 9: Tiempo y Figuras"
                        ],
                        "conceptual": "- Días de la semana: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\n- Figuras geométricas: circle, square, triangle, rectangle, star, heart, diamond\n- Preposiciones de tiempo: on, in, at\n— \"on Monday\", \"in the morning\", \"at 3:00 pm\"\n- Preguntas sobre tiempo: \"What day is today?\", \"What is the day?\"\n- Presente continuo con referencia temporal: \"I am playing soccer on Saturday.\"\n- Adverbios de tiempo: today, tomorrow, now, later, always\n- Números ordinales: first, second, third, fourth, fifth",
                        "procedural": "- Nombrar los días de la semana en orden\n- Preguntar y responder: \"What day is today?\"\n- Identificar figuras geométricas en objetos\n- Describir objetos usando figuras: \"The clock is a circle.\"\n- Usar preposiciones de tiempo: \"on Monday\", \"in the morning\"\n- Crear oraciones con días de la semana: \"I play soccer on Saturday.\"\n- Clasificar objetos según su forma",
                        "attitudinal": "- Puntualidad y responsabilidad en el cumplimiento de compromisos\n- Organización del tiempo\n- Respeto por el tiempo de los demás\n- Valoración de la planificación\n- Creatividad al identificar figuras en el entorno\n- Observación crítica de formas y patrones"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "bf1ef303-6142-4bcd-8e1f-efa812e20a6c",
                "name": "PERIODO 4: UNIDAD 4 - UBICACIÓN EN EL ESPACIO (ALIMENTACIÓN, SALUD Y MEDIO AMBIENTE)",
                "themes": [
                    {
                        "id": "aef7cac5-c410-489e-b796-27fe2e66402d",
                        "name": " Tema 10:Alimentación y Bebidas",
                        "subthemes": [
                            {
                                "id": "3f560224-fadc-4ad9-adc9-f7105fc94727",
                                "name": "10.1 Alimentos: rice, beans, fish, chicken, salad, bread, meat, eggs"
                            },
                            {
                                "id": "023695cc-e74a-43cf-9d21-98aae87e4438",
                                "name": "10.2 Frutas: apple, banana, orange, strawberry, mango, watermelon"
                            },
                            {
                                "id": "070660a3-3ddd-4809-a51d-57b1d9742118",
                                "name": "10.3 Verduras: tomato, lettuce, onion, carrot, potato, corn"
                            },
                            {
                                "id": "d68586ba-e23e-4a75-ba5e-41b8c3c3c257",
                                "name": "10.4 Bebidas: water, milk, juice, coffee, tea, soda"
                            },
                            {
                                "id": "5de1555d-7e4f-4a1a-9ed2-518f9f613171",
                                "name": "10.5 Comidas del día: breakfast, lunch, dinner, snack"
                            },
                            {
                                "id": "6a66d0c1-95bc-44d3-bf29-54c9b6114c49",
                                "name": "10.6 Expresar preferencias: \"I like...\" / \"I don't like...\""
                            },
                            {
                                "id": "9c0e3907-e804-4744-898b-9203f2ca58cf",
                                "name": "10.7 Preguntas: \"Do you like...?\""
                            },
                            {
                                "id": "0e737855-ade9-4eab-8215-2c92cfbc819c",
                                "name": "10.8 Artículos y sustantivos contables/incontables"
                            }
                        ]
                    },
                    {
                        "id": "1f3b56c6-bb0e-42ef-a838-6658d7f17b44",
                        "name": "Tema 11: Salud y Cuidados Personales",
                        "subthemes": [
                            {
                                "id": "418d1d9f-4f59-4396-8bbf-5d9bc5691c64",
                                "name": "11.1 Hábitos saludables: brush teeth, wash hands, exercise, eat healthy"
                            },
                            {
                                "id": "980aa75c-36a9-44b9-9345-707d1d1e10ff",
                                "name": "11.2 Partes del cuerpo: head, arms, legs, hands, feet, eyes, ears, nose"
                            }
                        ]
                    },
                    {
                        "id": "ea15f2f1-56c2-463b-b30b-3b2a0091c213",
                        "name": "Tema 12: Ubicación y Medio Ambiente",
                        "subthemes": []
                    }
                ],
                "grade_levels": [
                    "4to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "b7caa65a-3123-4db9-bcb3-62e8d210ebd2",
                        "themes": [
                            "Tema 10: Alimentación y Bebidas"
                        ],
                        "conceptual": "- Alimentos: fruit, vegetables, rice, beans, fish, chicken, salad, bread, meat, eggs, pasta, cheese, soup, cake, cookies\n- Bebidas: water, milk, juice, coffee, tea, soda, hot chocolate, lemonade\n- Comidas del día: breakfast, lunch, dinner, snack\n- Frutas: apple, banana, orange, strawberry, grapes, watermelon, mango, pear, peach\n- Verduras: tomato, lettuce, onion, carrot, potato, corn, broccoli\n- Expresar preferencias: \"I like rice and beans.\", \"I don't like coffee.\"\n- Preguntas sobre alimentos: \"Do you like...?\", \"What is your favorite food?\"\n- Artículos: a, an, some, any\n- Sustantivos contables e incontables: apple/apples, rice, milk",
                        "procedural": "- Nombrar alimentos y bebidas en inglés\n- Expresar preferencias alimenticias: \"I like pizza.\" \"I don't like soup.\"\n- Preguntar sobre gustos: \"Do you like ice cream?\"\n- Hablar sobre comidas del día: \"I eat breakfast at 7:00.\"\n- Clasificar alimentos saludables y no saludables\n- Crear un menú simple en inglés\n- Identificar alimentos en imágenes\n- Usar \"some\" y \"any\" correctamente",
                        "attitudinal": "- Hábitos saludables de alimentación\n- Valoración de una dieta equilibrada\n- Respeto por las preferencias alimenticias de los demás\n- Conocimiento de alimentos típicos dominicanos y de otros países\n- Importancia de una buena nutrición para la salud\n- Preferencia por opciones saludables\n- Agradecimiento por los alimentos"
                    },
                    {
                        "id": "b74b4c39-15d8-4315-bc5c-068386240090",
                        "themes": [
                            "Tema 11: Salud y Cuidados Personales"
                        ],
                        "conceptual": "- Hábitos saludables: eat healthy, exercise, brush teeth, wash hands, sleep well, drink water, take a shower, comb hair\n- Cuidados físicos: healthy, strong, clean, tired, hungry, thirsty, sleepy, sick, well, energetic\n- Partes del cuerpo: head, face, eyes, nose, mouth, ears, arms, legs, hands, feet, shoulders, knees, toes\n- Sentimientos y estados: happy, sad, angry, scared, excited, tired, hungry, thirsty, sick\n- Lengua y comunicación: speak, talk, listen, read, write, ask, answer, understand\n- Verbo \"to be\" para estados: \"I am tired.\" \"She is happy.\"\n- Verbo \"have\" para descripciones: \"I have a headache.\"\n- Preguntas sobre salud: \"How are you?\", \"What's wrong?\", \"Are you okay?\"\n- Respuestas: \"I am fine.\" \"I am sick.\" \"My head hurts.\"",
                        "procedural": "- Hablar sobre hábitos saludables: \"I brush my teeth every day.\"\n- Describir estados físicos y emocionales: \"I am happy.\" \"She is tired.\"\n- Preguntar sobre el estado de salud: \"How are you?\"\n- Identificar partes del cuerpo en inglés\n- Expresar necesidades: \"I am hungry.\" \"I am thirsty.\"\n- Describir rutinas de cuidado personal\n- Participar en diálogos sobre salud\n- Crear una lista de hábitos saludables",
                        "attitudinal": "- Cuidado de la salud y el bienestar personal\n- Valoración de los hábitos saludables\n- Empatía hacia personas enfermas o con necesidades\n- Respeto por el cuerpo propio y el de los demás\n- Importancia de la higiene personal\n- Prevención de enfermedades\n- Actitud positiva hacia el autocuidado\n- Agradecimiento por la salud"
                    },
                    {
                        "id": "bef7d3dd-768b-4a49-846f-ca7c9a13d446",
                        "themes": [
                            "Tema 12: Ubicación y Medio Ambiente"
                        ],
                        "conceptual": "- Preposiciones de lugar: in, on, under, next to, behind, between, in front of, above, below, near, far\n- Ubicar en el espacio: \"The book is on the table.\", \"My house is next to the park.\"\n- Meses del año: January, February, March, April, May, June, July, August, September, October, November, December\n- Estaciones del año: spring, summer, fall/autumn, winter\n- Hábitats: desert, ocean, forest, river, jungle, mountain, lake, grassland, arctic\n- Medio ambiente: environment, nature, tree, water, air, recycle, reduce, reuse, protect, clean, save\n- Verbos relacionados: recycle, reduce, reuse, protect, clean, save, plant, care\n- Presente simple del verbo \"to be\" para ubicar: \"The cat is under the chair.\"\n- Preguntas de ubicación: \"Where is the book?\", \"Where are you?\"\n- Respuestas: \"It is on the desk.\" \"I am in the classroom.\"",
                        "procedural": "- Ubicar objetos en el espacio: \"The pencil is on the desk.\"\n- Describir ubicación de lugares: \"The school is next to the park.\"\n- Preguntar y responder sobre ubicación: \"Where is the book?\"\n- Nombrar los meses del año en orden\n- Identificar las estaciones del año\n- Asociar hábitats con animales y características\n- Describir acciones para cuidar el medio ambiente: \"We recycle paper.\"\n- Crear oraciones con preposiciones de lugar\n- Dibujar y describir ubicaciones\n- Participar en juegos de búsqueda: \"Where is the pencil?\"",
                        "attitudinal": "- Valoración y cuidado del medio ambiente\n- Respeto por el entorno natural\n- Importancia del reciclaje y la sostenibilidad\n- Responsabilidad con el cuidado del planeta\n- Conexión con la naturaleza y los hábitats\n- Preferencia por opciones ecológicas\n- Conciencia ambiental\n- Participación en acciones de protección del medio ambiente"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            }
        ]
    },
    {
        "subjectId": "ingles",
        "grade": "5to",
        "units": [
            {
                "id": "60a5ed66-1e1e-4be0-8e34-94d976dde35b",
                "name": "UNIDAD 2: DESCRIPCIÓN DE PERSONAS, VIVIENDAS Y GUSTOS",
                "themes": [
                    {
                        "id": "630b5af1-1ed4-4db7-a0f3-718c7434e9dd",
                        "name": "Tema 4: Descripción Física y Forma de Ser",
                        "subthemes": [
                            {
                                "id": "b9635495-c12f-4715-b1f6-b6eb669e5953",
                                "name": "4.1 Adjetivos para describir apariencia física: tall, short, thin, fat, blond, dark, beautiful, handsome, young, old"
                            },
                            {
                                "id": "d892b956-72e9-45e1-94eb-ee20ea65dddf",
                                "name": "4.2 Partes del cuerpo: head, shoulders, knees, toes, hair, eyes, nose, mouth, ears, arms, legs, hands, feet"
                            },
                            {
                                "id": "f8789bda-06cb-46db-b695-e867de7f403e",
                                "name": "4.3 Adjetivos para describir la forma de ser: kind, honest, generous, nice, friendly, helpful, intelligent, funny, shy"
                            },
                            {
                                "id": "4c489405-661b-4bc0-a258-718005dd62c8",
                                "name": "4.4 Verbo \"to be\" para descripción: \"Mary is short and slim.\""
                            },
                            {
                                "id": "d6782b64-2665-4e0a-a725-e4a22b1592a0",
                                "name": "4.5 Verbo \"have\" para descripción: \"She has blue eyes.\""
                            },
                            {
                                "id": "34bcac9b-f909-4aab-ac72-77e8f4e4f243",
                                "name": "4.6 Preguntas: \"What does she look like?\" \"She is tall and thin.\""
                            }
                        ]
                    },
                    {
                        "id": "20248bd9-3546-4e61-93b7-575a53e2b5a8",
                        "name": "Tema 5: La Vivienda y sus Partes",
                        "subthemes": [
                            {
                                "id": "d9b94d70-43a1-4114-9d14-20fd87d9c764",
                                "name": "5.1 Partes de la vivienda: bedroom, bathroom, kitchen, living room, dining room, garden, garage, balcony, hallway"
                            },
                            {
                                "id": "e5be2dae-d396-4be0-a503-51bfedd4b3f5",
                                "name": "5.2 Tipos de vivienda: house, apartment, studio, mansion, cottage, farmhouse"
                            },
                            {
                                "id": "6db83f61-c38a-424d-94b4-e610b38dada7",
                                "name": "5.3 Mobiliario y objetos del hogar: bed, chair, table, sofa, dresser, refrigerator, stove, blender, toaster, oven"
                            },
                            {
                                "id": "5215b09e-8052-4be3-9718-a4a169891191",
                                "name": "5.4 Utensilios y objetos: spoon, knife, dish, glass, pillow, blanket, mirror"
                            },
                            {
                                "id": "fd67b076-aa5f-43f2-8033-a7a1cca49523",
                                "name": "5.5 Estructura: \"There is / There are\" para describir"
                            },
                            {
                                "id": "41079b83-2c12-4e42-93cc-2d718020b2b5",
                                "name": "5.6 Preguntas: \"Is there a...?\" \"Are there any...?\""
                            }
                        ]
                    },
                    {
                        "id": "8eaaa402-efee-41f8-be85-ea1f64db06d5",
                        "name": "Tema 6: Gustos y Preferencias",
                        "subthemes": [
                            {
                                "id": "f3a10fe8-9b21-478b-977a-f5215c9cab89",
                                "name": "6.1 Repaso de verbos \"like\", \"love\", \"hate\""
                            },
                            {
                                "id": "e91ee841-026e-466b-b32d-95eb0164044c",
                                "name": "6.2 Verbos: \"prefer\", \"enjoy\" para gustos"
                            },
                            {
                                "id": "decbce33-8790-4be4-86e3-359350ec212d",
                                "name": "6.3 Alimentos y bebidas (avanzado): rice, meat, salad, vegetables, fruits, juice, milk, yogurt, tea, coffee"
                            },
                            {
                                "id": "c068d72b-63c8-4bf8-b3e8-5522be624012",
                                "name": "6.4 Deportes y recreación (avanzado): baseball, soccer, karate, listen to music, go to the movies"
                            },
                            {
                                "id": "3128d06c-72b2-41cd-ab6e-b6ae329303e8",
                                "name": "6.5 Expresar preferencias: \"I prefer...\" \"I enjoy...\""
                            },
                            {
                                "id": "f515001f-a63f-4692-805e-30d7b99fb7d7",
                                "name": "6.6 Preguntas: \"Do you like...?\" \"What do you prefer?\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "5to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "7a69c629-8ad8-42be-b567-3dc9fdebffc6",
                        "themes": [
                            "Tema 4: Descripción Física y Forma de Ser"
                        ],
                        "conceptual": "- Adjetivos para describir apariencia física: tall, short, thin, fat, slim, chubby, blond, dark, brown, black, red, gray, beautiful, handsome, pretty, cute, young, old, middle-aged\n- Partes del cuerpo: head, hair, eyes, nose, mouth, ears, arms, legs, hands, feet, shoulders, knees, toes, neck, back, stomach, chest, face, eyebrows, eyelashes, cheeks, chin, forehead, lips, teeth, tongue, wrists, ankles, elbows, fingers, thumbs, nails\n- Adjetivos para describir la forma de ser: kind, honest, generous, nice, friendly, helpful, intelligent, funny, shy, outgoing, serious, calm, energetic, patient, responsible, respectful, polite, cheerful, optimistic, creative, brave, loyal, sincere, humble, confident, caring, thoughtful, understanding, reliable, hardworking, organized, disciplined, punctual\n- Verbo \"to be\" para descripción: \"Mary is short and slim.\" \"He is kind and honest.\"\n- Verbo \"have\" para descripción física: \"She has blue eyes.\" \"He has brown hair.\"\n- Preguntas: \"What does she look like?\" \"What is he like?\"\n- Grado comparativo del adjetivo: taller than, shorter than, more intelligent than",
                        "procedural": "- Describir apariencia física: \"She is tall and thin. She has long brown hair.\"\n- Describir la forma de ser: \"He is kind and friendly.\"\n- Preguntar y responder sobre apariencia: \"What does she look like?\"\n- Preguntar y responder sobre personalidad: \"What is he like?\"\n- Comparar personas: \"My brother is taller than me.\"\n- Identificar partes del cuerpo en inglés\n- Describir a un familiar o amigo usando adjetivos\n- Participar en juegos de adivinanzas: \"Who is it?\"",
                        "attitudinal": "- Respeto por las diferencias individuales\n- Valoración de las personas por sus cualidades éticas y morales\n- Reconocimiento sin estereotipos de fortalezas, limitaciones y potencialidades\n- Aceptación de los demás sin discriminación por apariencia física\n- Interés en compartir conocimientos, talentos y habilidades\n- Motivación para desarrollar habilidades y talentos\n- Respeto por las preferencias de las demás personas"
                    },
                    {
                        "id": "3f427463-206e-47c7-abed-80baca831385",
                        "themes": [
                            "Tema 5: La Vivienda y sus Partes"
                        ],
                        "conceptual": "- Partes de la vivienda: bedroom, bathroom, kitchen, living room, dining room, garden, garage, balcony, hallway, basement, attic, laundry room, study, terrace, patio, backyard, front yard, driveway, entrance, roof, wall, window, door, floor, stairs\n- Tipos de vivienda: house, apartment, studio, mansion, cottage, farmhouse, cabin, villa, townhouse, duplex, penthouse, bungalow, castle, palace, hut, tent, mobile home, houseboat, lighthouse, treehouse\n- Mobiliario y objetos del hogar: bed, chair, table, sofa, couch, dresser, wardrobe, closet, nightstand, lamp, mirror, rug, carpet, curtain, pillow, blanket, sheet, mattress, desk, bookshelf, shelf, cabinet, drawer, refrigerator, stove, oven, microwave, blender, toaster, coffee maker, dishwasher, washing machine, dryer, iron, ironing board, vacuum cleaner, broom, mop, bucket, sponge, towel, soap, shampoo, toothbrush, toothpaste\n- Estructura: \"There is / There are\" para describir\n- Presente simple del verbo \"have\": \"My house has two bedrooms.\"\n- Preguntas: \"Is there a...?\", \"Are there any...?\", \"Does your house have...?\"\n- Preposiciones de lugar: in, on, under, next to, behind, between, in front of, above, below, near, far",
                        "procedural": "- Describir su vivienda: \"My house has three bedrooms and two bathrooms.\"\n- Describir el mobiliario: \"There is a big sofa in the living room.\"\n- Preguntar y responder sobre viviendas: \"Does your house have a garden?\"\n- Preguntar y responder sobre ubicación de objetos: \"Where is the lamp?\"\n- Usar \"There is\" y \"There are\" correctamente\n- Dibujar y describir su casa ideal\n- Comparar diferentes tipos de vivienda\n- Participar en diálogos sobre el hogar",
                        "attitudinal": "- Valoración de la importancia del trabajo para las personas y la sociedad\n- Valoración del orden, la higiene y prevención de accidentes en el hogar\n- Respeto por la condición socioeconómica de las demás personas\n- Cuidado y respeto por las pertenencias propias y de los demás\n- Aceptación del trabajo doméstico como una oportunidad para la cooperación y cuidado recíproco\n- Corresponsabilidad en los quehaceres del hogar con igualdad y equidad de género\n- Mantenimiento de la limpieza y orden en su escuela y entorno"
                    },
                    {
                        "id": "33483cf4-8970-40b9-85a9-b2988c7d9622",
                        "themes": [
                            "Tema 6: Gustos y Preferencias"
                        ],
                        "conceptual": "- Verbos para gustos y preferencias: like, love, enjoy, prefer, hate, dislike, don't like, can't stand, be fond of, be interested in\n- Alimentos y bebidas (avanzado): rice, meat, salad, vegetables, fruits, juice, milk, yogurt, tea, coffee, fish, chicken, pasta, pizza, hamburger, sandwich, soup, cake, cookies, ice cream, chocolate, chips, bread, cheese, eggs, ham, bacon, cereal, pancakes, waffles, toast, jam, butter, honey\n- Deportes y recreación (avanzado): baseball, soccer, basketball, volleyball, swimming, tennis, running, cycling, skateboarding, surfing, skiing, snowboarding, gymnastics, karate, judo, boxing, wrestling, golf, bowling, fishing, hiking, camping, birdwatching, photography, painting, drawing, writing, reading, listening to music, playing an instrument, singing, dancing, acting, watching movies, playing video games, cooking, baking, gardening, traveling, shopping, spending time with friends, going to the park, going to the beach, going to the movies, going to the museum, going to the zoo, going to the amusement park, going to the aquarium\n- Preguntas: \"What do you like to do?\", \"What is your favorite...?\"\n- Expresar preferencias: \"I prefer...\" \"I enjoy...\"\n- Preguntas: \"Do you like...?\" \"What do you prefer?\"\n- Conjunciones: and, or, but, because, so\n- Adverbios de intensidad: really, very, quite, so",
                        "procedural": "- Expresar gustos y preferencias: \"I like playing soccer.\" \"I prefer watching movies.\"\n- Preguntar y responder sobre gustos: \"Do you like vegetables?\"\n- Describir alimentos favoritos: \"My favorite food is pizza.\"\n- Describir deportes favoritos: \"My favorite sport is baseball.\"\n- Usar diferentes verbos para gustos: like, love, enjoy, prefer, hate\n- Preguntar y responder: \"What do you like to do in your free time?\"\n- Crear diálogos sobre gustos y preferencias\n- Participar en encuestas: \"What do you like?\"",
                        "attitudinal": "- Hábitos saludables de alimentación, recreación y cuidado del cuerpo\n- Respeto por los gustos y preferencias de las demás personas\n- Preferencia por actividades recreativas sanas\n- Valoración de la importancia del trabajo para las personas y la sociedad\n- Respeto por las preferencias de las demás personas\n- Prácticas saludables de higiene, alimentación, recreación y cuidado personal\n- Reconocimiento de la igualdad y equidad de género en la realización de actividades\n- Valoración de la diversidad en gustos y preferencias"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "2093c181-442f-4170-928f-2981399b64f1",
                "name": "UNIDAD 1: IDENTIFICACIÓN PERSONAL Y PRESENTACIONES (NIVEL 5TO)",
                "themes": [
                    {
                        "id": "e8ffc148-3199-4f95-aa88-c9fd5cc017c4",
                        "name": "Tema 1: Presentación Personal Avanzada",
                        "subthemes": [
                            {
                                "id": "e031e409-84cb-4b5a-a977-44968d72bffa",
                                "name": "1.1 Repaso de pronombres personales y verbo \"to be\""
                            },
                            {
                                "id": "18682efd-7e1d-4a5b-9831-8904c0582b7a",
                                "name": "1.2 Información personal completa: nombre, edad, nacionalidad, dirección"
                            },
                            {
                                "id": "7f716712-8fc4-473d-965d-4ae3aad75fb1",
                                "name": "1.3 Preguntas con \"What\", \"Where\", \"How old\", \"Where do you live?\""
                            },
                            {
                                "id": "73726908-36f3-458c-8129-20fd81e23b18",
                                "name": "1.4 Descripción de ocupaciones: \"I am a student.\" \"My mother is a nurse.\""
                            },
                            {
                                "id": "4f1ee6e9-ecdc-4ece-be1d-eb54c2d34e6b",
                                "name": "1.5 Números cardinales hasta 100: twenty, thirty, forty, fifty... one hundred"
                            }
                        ]
                    },
                    {
                        "id": "50d52b84-3d62-4df1-b9cf-0845fb2b5849",
                        "name": "Tema 2: La Familia y Ocupaciones",
                        "subthemes": [
                            {
                                "id": "ed8749ba-a950-43a6-9bdc-fe259f3c45c8",
                                "name": "2.1 Miembros de la familia: mother, father, sister, brother, grandmother, grandfather, uncle, aunt, cousin"
                            },
                            {
                                "id": "fa03e10d-6691-4e10-ae1f-459ae2c843c0",
                                "name": "2.2 Ocupaciones y profesiones: nurse, secretary, businessperson, police officer, teacher, doctor, engineer, lawyer"
                            },
                            {
                                "id": "81f3f8c4-7030-442d-9dbd-279207d2c148",
                                "name": "2.3 Presente simple del verbo \"be\" para describir ocupaciones"
                            },
                            {
                                "id": "3c82da4b-7a70-4807-b0a6-db33dbfddc4e",
                                "name": "2.4 Presente simple del verbo \"have\" para describir la familia: \"I have two brothers.\""
                            },
                            {
                                "id": "00b99e7c-1500-44e0-b265-94304fa31b58",
                                "name": "2.5 Preguntas: \"What does your mother do?\" \"She is a teacher.\""
                            }
                        ]
                    },
                    {
                        "id": "5c6f24b8-3194-4773-81bb-7ec2cebac02f",
                        "name": "Tema 3: Nacionalidades y Países",
                        "subthemes": [
                            {
                                "id": "c944a3bd-e9e3-4e7c-85dd-977d24d618bf",
                                "name": "3.1 Nacionalidades: Dominican, American, Mexican, Brazilian, French, Italian, German, Chinese, Japanese"
                            },
                            {
                                "id": "7692e185-8aaa-436e-8711-1fadec5a5b05",
                                "name": "3.2 Países: the Dominican Republic, the United States, Spain, Mexico, Brazil, France, Italy, Germany, China, Japan"
                            },
                            {
                                "id": "71f86922-2df1-4d21-b37d-e937228d5412",
                                "name": "3.3 Preguntas: \"Where are you from?\" \"I am from...\""
                            },
                            {
                                "id": "1796bbaf-ed6b-48b4-8cce-af866f15f0c1",
                                "name": "3.4 Preguntas: \"What nationality are you?\" \"I am...\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "5to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "6e70d39c-b409-40af-91ba-f1d3df0194b6",
                        "themes": [
                            "Tema 1: Presentación Personal Avanzada"
                        ],
                        "conceptual": "- Repaso de pronombres personales: I, You, He, She, It, We, They\n- Repaso del verbo \"to be\" en presente: am, is, are\n- Información personal completa: nombre, edad, nacionalidad, dirección, número de teléfono\n- Preguntas: \"What is your name?\", \"How old are you?\", \"Where are you from?\", \"Where do you live?\", \"What is your phone number?\"\n- Números cardinales hasta 100: twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred\n- Direcciones: \"I live in...\", \"My address is...\"\n- Ocupaciones: \"I am a student.\", \"My mother is a teacher.\"",
                        "procedural": "- Presentarse con información completa: \"My name is... I am... years old. I am from...\"\n- Preguntar y responder sobre información personal completa\n- Usar números hasta 100 para decir edad y dirección\n- Describir ocupaciones propias y de familiares\n- Completar formularios con información personal en inglés\n- Participar en diálogos de presentación avanzados",
                        "attitudinal": "- Motivación para aprender inglés\n- Confianza al hablar de sí mismo en inglés\n- Respeto por la información personal propia y de los demás\n- Valoración de la identidad personal\n- Cortesía al preguntar información personal\n- Responsabilidad al compartir información personal"
                    },
                    {
                        "id": "7527c91f-ebc1-44e0-bca3-36dad7d9d2ff",
                        "themes": [
                            "Tema 2: La Familia y Ocupaciones"
                        ],
                        "conceptual": "- Miembros de la familia: mother, father, sister, brother, grandmother, grandfather, uncle, aunt, cousin\n- Ocupaciones y profesiones: teacher, doctor, nurse, engineer, lawyer, police officer, secretary, businessperson, dentist, architect, artist, pilot, firefighter, chef, farmer\n- Presente simple del verbo \"to be\" para ocupaciones: \"She is a nurse.\"\n- Presente simple del verbo \"have\" para describir la familia: \"I have two brothers and one sister.\"\n- Adjetivos posesivos: my, your, his, her, our, their\n- Preguntas: \"What does your mother do?\", \"How many brothers do you have?\", \"Do you have any sisters?\"\n- Sustantivos en singular y plural: brother/brothers, sister/sisters",
                        "procedural": "- Presentar a su familia: \"This is my mother. She is a nurse.\"\n- Describir ocupaciones de familiares: \"My father is an engineer.\"\n- Preguntar sobre la familia de otros: \"What does your mother do?\"\n- Describir su familia: \"I have one brother and two sisters.\"\n- Preguntar y responder \"How many...?\"\n- Crear un árbol genealógico con descripciones\n- Usar adjetivos posesivos correctamente",
                        "attitudinal": "- Respeto por las diferencias relativas a edad, género, ocupación, nacionalidad y etnia\n- Reconocimiento de la igualdad y equidad de género en el desempeño exitoso de las diferentes ocupaciones\n- Valoración de la importancia del trabajo para las personas y la sociedad\n- Valoración de los vínculos afectivos en la familia\n- Respeto al referirse a los miembros de la familia\n- Identidad y sentido de pertenencia a una familia"
                    },
                    {
                        "id": "2c1a467e-0ae8-4a0a-b325-497fa48f20d3",
                        "themes": [
                            "Tema 3: Nacionalidades y Países"
                        ],
                        "conceptual": "- Nacionalidades: Dominican, American, Mexican, Brazilian, French, Italian, German, Chinese, Japanese, Spanish, Canadian, Argentinian, Colombian, Peruvian, Chilean, Venezuelan, Cuban, Puerto Rican, English, Irish, Scottish, Dutch, Swiss, Greek, Turkish, Indian, Australian, South African, Nigerian, Egyptian\n- Países: the Dominican Republic, the United States, Spain, Mexico, Brazil, France, Italy, Germany, China, Japan, Canada, Argentina, Colombia, Peru, Chile, Venezuela, Cuba, Puerto Rico, England, Ireland, Scotland, Netherlands, Switzerland, Greece, Turkey, India, Australia, South Africa, Nigeria, Egypt\n- Preguntas: \"Where are you from?\", \"What nationality are you?\", \"Where is he/she from?\"\n- Respuestas: \"I am from...\", \"I am...\", \"He/She is from...\", \"He/She is...\"\n- Preguntas: \"Where is... from?\", \"What nationality is...?\"\n- Nacionalidades como adjetivos: \"I am Dominican.\" \"She is American.\"",
                        "procedural": "- Preguntar y responder sobre país de origen: \"Where are you from?\"\n- Preguntar y responder sobre nacionalidad: \"What nationality are you?\"\n- Preguntar sobre el origen de otras personas: \"Where is he from?\"\n- Asociar países con sus nacionalidades\n- Usar nacionalidades como adjetivos en oraciones\n- Participar en diálogos sobre nacionalidades y países\n- Identificar países en un mapa y decir su nacionalidad en inglés\n- Compartir información sobre su país: \"I am from the Dominican Republic. I am Dominican.\"",
                        "attitudinal": "- Valoración de la identidad personal, social y cultural propia y de las demás personas\n- Respeto por las diferencias culturales y nacionalidades\n- Curiosidad por conocer otros países y culturas\n- Orgullo por su nacionalidad: \"I am Dominican.\"\n- Aceptación y respeto por personas de otros países\n- Valoración de la diversidad cultural\n- Cortesía y respeto al preguntar sobre el origen de otros"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "ffa85882-3d4b-4431-bf6e-74bf789e11a1",
                "name": "UNIDAD 3: ACTIVIDADES COTIDIANAS Y TIEMPO ATMOSFÉRICO",
                "themes": [
                    {
                        "id": "e246fa47-7e7e-4511-9140-fc08a9c55608",
                        "name": "Tema 7: Actividades Cotidianas",
                        "subthemes": [
                            {
                                "id": "9dc2b58f-668e-4360-89da-84523ece7f1a",
                                "name": "7.1 Verbos de acción cotidiana: go to school, study, eat, sleep, wake up, get dressed, brush teeth, wash hands"
                            },
                            {
                                "id": "e35944f5-a932-4f6a-9203-262456a1eae7",
                                "name": "7.2 Presente simple para rutinas: \"I get up at 6:30 am.\""
                            },
                            {
                                "id": "12a7b5a7-92cf-4412-8bc9-bdff91ac12e2",
                                "name": "7.3 Quehaceres del hogar: do the laundry, sweep the floor, wash the dishes, make the bed, clean the room"
                            },
                            {
                                "id": "b3d44e7e-fa7e-43a7-984f-f371178af792",
                                "name": "7.4 Horas y rutinas: \"I go to school at 7:00 am.\""
                            },
                            {
                                "id": "d117f262-2673-4b46-9ac9-f8a3d4581249",
                                "name": "7.5 Adverbios de frecuencia: always, usually, sometimes, never, often, rarely"
                            },
                            {
                                "id": "b48ef6a6-12c8-4c58-a94a-97fc1c730dac",
                                "name": "7.6 Preguntas: \"What time do you get up?\" \"I get up at 6:30.\""
                            }
                        ]
                    },
                    {
                        "id": "274aa798-11fc-4216-8b91-bfee6c81ba6c",
                        "name": "Tema 8: Tiempo Atmosférico",
                        "subthemes": [
                            {
                                "id": "37702e20-dbcc-421b-9162-722e64cd5c7f",
                                "name": "8.1 Vocabulario del clima: sunny, rainy, cloudy, windy, snowy, foggy, stormy, hot, cold, warm, cool"
                            },
                            {
                                "id": "b5524501-7230-4901-a180-c477118a1b0a",
                                "name": "8.2 Temperatura: grados Celsius (°C) y Fahrenheit (°F)"
                            },
                            {
                                "id": "8e751ad0-f650-417c-8f46-1692351f1ea6",
                                "name": "8.3 Presente simple para describir el clima: \"It is sunny today.\""
                            },
                            {
                                "id": "04501501-00fd-423d-a647-984b4e995f6e",
                                "name": "8.4 Presente continuo para describir el clima: \"It is raining now.\""
                            },
                            {
                                "id": "5e567130-e242-4c1c-bd22-841e4bd07c23",
                                "name": "8.5 Preguntas: \"What's the weather like?\" \"It is sunny and hot.\""
                            },
                            {
                                "id": "9390a45a-be0e-4bcc-ab3e-e96ee90059d0",
                                "name": "8.6 Estaciones del año: winter, spring, summer, fall/autumn"
                            },
                            {
                                "id": "b9f0bab6-0a5d-4cea-b291-3b2afd02a366",
                                "name": "8.7 Actividades por estación: \"In summer, I go to the beach.\""
                            }
                        ]
                    },
                    {
                        "id": "4dc0a249-6be8-445a-abcd-3c371b3ff236",
                        "name": "Tema 9: Meses y Fechas",
                        "subthemes": [
                            {
                                "id": "842fa529-b629-41d8-b8a8-02d323c5dada",
                                "name": "9.1 Meses del año: January, February, March, April, May, June, July, August, September, October, November, December"
                            },
                            {
                                "id": "a8c7b368-6749-43f2-ad28-600a10984d9e",
                                "name": "9.2 Números ordinales para fechas: first, second, third..."
                            },
                            {
                                "id": "43a25179-7e0a-428b-9bdc-011b59748ef1",
                                "name": "9.3 Preposiciones de tiempo: in, on, at"
                            },
                            {
                                "id": "3b9ebe90-bb24-460e-bce1-26f8e9b6171c",
                                "name": "9.4 Preguntas: \"When is your birthday?\" \"My birthday is in May.\""
                            },
                            {
                                "id": "eed23b54-8b9e-481d-b6a8-060bdf2494d0",
                                "name": "9.5 Preguntas: \"What is the date today?\" \"Today is September 15th.\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "5to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "c7753663-d413-404e-ace6-a33b1955115b",
                        "themes": [
                            "Tema 7: Actividades Cotidianas"
                        ],
                        "conceptual": "- Verbos de acción cotidiana: wake up, get up, get dressed, brush teeth, wash face, comb hair, eat breakfast, go to school, study, learn, read, write, do homework, eat lunch, play, rest, eat dinner, take a shower, go to bed, sleep, watch TV, listen to music, read a book, play with friends, help at home, clean the room, do the dishes, make the bed, sweep the floor, do the laundry, wash the clothes, fold the clothes, set the table, clear the table, take out the trash, water the plants, feed the pets, walk the dog\n- Presente simple para rutinas: \"I get up at 6:30 am.\" \"She goes to school at 7:00 am.\"\n- Horas y rutinas: \"I go to school at 7:00 am.\"\n- Adverbios de frecuencia: always, usually, often, sometimes, rarely, never, every day, every morning, every afternoon, every evening, every night, on weekends, on weekdays, in the morning, in the afternoon, in the evening, at night\n- Preposiciones de tiempo: at, in, on\n- Conjunciones: and, then, after, before, when, because, so\n- Preguntas: \"What time do you get up?\", \"What do you do in the morning?\", \"When do you do your homework?\"",
                        "procedural": "- Hablar sobre su rutina diaria: \"I wake up at 6:00. Then I brush my teeth and wash my face.\"\n- Preguntar y responder sobre rutinas: \"What time do you get up?\"\n- Describir actividades cotidianas: \"I go to school in the morning.\"\n- Usar adverbios de frecuencia: \"I always brush my teeth.\"\n- Usar preposiciones de tiempo correctamente: at, in, on\n- Ordenar secuencias de actividades: \"First, I wake up. Then, I get dressed.\"\n- Crear y presentar una rutina diaria completa\n- Participar en diálogos sobre actividades diarias",
                        "attitudinal": "- Hábitos saludables de alimentación, recreación y cuidado del cuerpo\n- Responsabilidad en el cumplimiento de sus compromisos\n- Puntualidad en las actividades diarias\n- Orden y limpieza en sus actividades\n- Corresponsabilidad en los quehaceres del hogar\n- Valoración del tiempo y su organización\n- Respeto por los horarios y rutinas de los demás\n- Valoración de la importancia del trabajo y el estudio"
                    },
                    {
                        "id": "979958a2-3543-4f3d-8ef1-f9a48a2d2c2a",
                        "themes": [
                            "Tema 8: Tiempo Atmosférico"
                        ],
                        "conceptual": "- Vocabulario del clima: sunny, rainy, cloudy, windy, snowy, foggy, stormy, hot, cold, warm, cool, humid, dry, freezing, freezing cold, boiling hot, mild, breezy, overcast, clear, partly cloudy, drizzling, pouring, thundering, lightning\n- Temperatura: grados Celsius (°C) y grados Fahrenheit (°F)\n- Presente simple para describir el clima: \"It is sunny today.\" \"It is cold in winter.\"\n- Presente continuo para describir el clima: \"It is raining now.\" \"It is snowing outside.\"\n- Preguntas: \"What's the weather like?\", \"How is the weather?\", \"What's the weather like today?\"\n- Respuestas: \"It is sunny and hot.\" \"It is raining.\" \"It is cold and windy.\"\n- Estaciones del año: winter, spring, summer, fall/autumn\n- Actividades por estación: \"In summer, I go to the beach.\" \"In winter, it is cold.\"\n- Ropa para diferentes climas: coat, jacket, sweater, t-shirt, shorts, raincoat, umbrella, boots, sandals, hat, gloves, scarf, sunglasses",
                        "procedural": "- Describir el clima actual: \"It is sunny and warm today.\"\n- Preguntar y responder sobre el clima: \"What's the weather like?\"\n- Describir el clima en diferentes estaciones: \"In summer, it is hot.\"\n- Describir actividades según el clima: \"When it is sunny, I go to the beach.\"\n- Identificar diferentes condiciones climáticas en imágenes\n- Usar vocabulario del clima en oraciones\n- Comparar el clima de diferentes lugares: \"In Santo Domingo, it is hot.\"\n- Hablar sobre la ropa adecuada para cada clima: \"I wear a coat when it is cold.\"",
                        "attitudinal": "- Protección ante condiciones del tiempo que puedan afectar la salud\n- Prevención de riesgos ante fenómenos atmosféricos\n- Solidaridad con personas vulnerables afectadas por fenómenos naturales\n- Valoración de la naturaleza y el medio ambiente\n- Cuidado y protección del medio ambiente\n- Conciencia sobre el cambio climático\n- Respeto por las condiciones climáticas y sus efectos en la vida diaria\n- Prácticas saludables según las condiciones del tiempo"
                    },
                    {
                        "id": "c82b3f27-9e96-4372-adb6-0be5f7506aee",
                        "themes": [
                            "Tema 9: Meses y Fechas"
                        ],
                        "conceptual": "- Meses del año: January, February, March, April, May, June, July, August, September, October, November, December\n- Números ordinales para fechas: first (1st), second (2nd), third (3rd), fourth (4th), fifth (5th), sixth (6th), seventh (7th), eighth (8th), ninth (9th), tenth (10th), eleventh (11th), twelfth (12th), thirteenth (13th), fourteenth (14th), fifteenth (15th), sixteenth (16th), seventeenth (17th), eighteenth (18th), nineteenth (19th), twentieth (20th), twenty-first (21st), twenty-second (22nd), twenty-third (23rd), twenty-fourth (24th), twenty-fifth (25th), twenty-sixth (26th), twenty-seventh (27th), twenty-eighth (28th), twenty-ninth (29th), thirtieth (30th), thirty-first (31st)\n- Preposiciones de tiempo: in (meses, años, estaciones), on (días, fechas), at (horas)\n- Preguntas: \"When is your birthday?\", \"What month is it?\", \"What is the date today?\", \"What day is it today?\"\n- Respuestas: \"My birthday is in May.\" \"Today is September 15th.\" \"It is Monday.\"\n- Estaciones y meses: \"Winter is in December, January, and February.\"\n- Fechas importantes: New Year's Day, Valentine's Day, Independence Day, Christmas, Halloween, Thanksgiving",
                        "procedural": "- Decir los meses del año en orden\n- Preguntar y responder sobre fechas: \"What is the date today?\"\n- Preguntar y responder sobre cumpleaños: \"When is your birthday?\"\n- Usar preposiciones de tiempo correctamente: in, on, at\n- Asociar meses con estaciones del año\n- Usar números ordinales para fechas\n- Decir fechas completas: \"Today is September 15th, 2025.\"\n- Identificar y decir fechas importantes en inglés\n- Crear un calendario en inglés con actividades",
                        "attitudinal": "- Puntualidad y responsabilidad en el cumplimiento de compromisos\n- Organización del tiempo y planificación\n- Valoración de la planificación como medio para mejor aprovechamiento del tiempo y recursos\n- Respeto por el tiempo de los demás\n- Responsabilidad en el cumplimiento de fechas importantes\n- Valoración de las celebraciones y tradiciones\n- Conocimiento de fechas importantes de su país y otros países"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "1251f489-356c-4029-9956-b66bef897801",
                "name": "UNIDAD 4: HABILIDADES Y CONDICIONES DEL TIEMPO",
                "themes": [
                    {
                        "id": "0e3a3568-11c4-4ff9-b4d7-c580bbbfceda",
                        "name": "Tema 10: Habilidades y Talentos",
                        "subthemes": [
                            {
                                "id": "7178c542-5693-433b-8495-03e2bacf0f66",
                                "name": "10.1 Modal \"can\" para habilidades: \"I can ride a bike.\""
                            },
                            {
                                "id": "54a0c5f8-c9f6-47c4-aee7-3caabe4789a0",
                                "name": "10.2 Modal \"can\" en negativo: \"Penguins can't fly.\""
                            },
                            {
                                "id": "0c0d06f3-1606-438c-bd4d-c0bf86d14505",
                                "name": "10.3 Modal \"can\" en preguntas: \"Can you play the guitar?\""
                            },
                            {
                                "id": "10773dcd-9797-4691-9264-6f2d2f4240b2",
                                "name": "10.4 Respuestas cortas: \"Yes, I can.\" \"No, I can't.\""
                            },
                            {
                                "id": "ae880da0-4d0b-4ab7-9df4-aa96cc352724",
                                "name": "10.5 Verbos de habilidad: play, ride, swim, run, sing, dance, draw, speak, cook, read, write"
                            },
                            {
                                "id": "fd39d66c-e601-4bca-8f07-b2f1969f9281",
                                "name": "10.6 Instrumentos musicales: guitar, violin, drums, piano, flute"
                            },
                            {
                                "id": "cd1d31cb-ff63-4ef2-8ec1-ea23b7d55ee8",
                                "name": "10.7 Deportes y actividades: baseball, soccer, karate, swimming, cycling"
                            }
                        ]
                    },
                    {
                        "id": "e02a534e-e9d9-436f-bf33-b0d70fb3ddc2",
                        "name": "Tema 11: Rutinas y Horarios",
                        "subthemes": [
                            {
                                "id": "05e42bf5-5eed-427f-ab4f-ff1dcfa32319",
                                "name": "11.1 Repaso del presente simple para rutinas"
                            },
                            {
                                "id": "d14a1d9c-54e7-48cb-b25c-6ac40e1e3d51",
                                "name": "11.2 Adverbios de tiempo: early, late, now, today, tomorrow"
                            },
                            {
                                "id": "6e5ed6c4-750c-467b-a541-2b8b8e86b935",
                                "name": "11.3 Preguntas: \"What time do you...?\""
                            },
                            {
                                "id": "4c5a70a1-7882-4e97-8066-83c1ee955626",
                                "name": "11.4 Preposiciones de tiempo: in, on, at"
                            },
                            {
                                "id": "e0532bac-1c00-442e-8e3a-1db33202eaa6",
                                "name": "11.5 Conjunciones: and, or, but"
                            },
                            {
                                "id": "e1742df5-13a9-4eaf-87bb-69d4f84fac7b",
                                "name": "11.6 Diálogos sobre rutinas diarias completas"
                            }
                        ]
                    },
                    {
                        "id": "02f12880-72f4-407c-9ca8-c2580c80f7c8",
                        "name": "Tema 12: Comparaciones Culturales",
                        "subthemes": [
                            {
                                "id": "a0ab2ca7-e91c-4f7a-99f0-7caebdadc29f",
                                "name": "12.1 Preposiciones de lugar: in, on, under, next to, behind, between"
                            },
                            {
                                "id": "c525e1a2-06a8-40aa-9343-85595d8985b5",
                                "name": "12.2 Ubicar objetos y personas en el espacio"
                            },
                            {
                                "id": "50143140-1152-4483-bc9d-b52e9b9dde63",
                                "name": "12.3 Meses del año: January, February, March, April, May, June"
                            },
                            {
                                "id": "74aa3b40-b700-4b9f-abb3-e6d73b6fd2c7",
                                "name": "12.4 Meses del año (2da parte): July, August, September, October, November, December"
                            },
                            {
                                "id": "cef4ccf2-0015-4f05-8c4c-65494690ba7f",
                                "name": "12.5 Estaciones del año: spring, summer, fall, winter"
                            },
                            {
                                "id": "a218462b-cf9f-4469-822f-360e8392a6bf",
                                "name": "12.6 Hábitats: desert, ocean, forest, river, jungle, mountain"
                            },
                            {
                                "id": "c49c1247-b868-4883-8351-0a29d2f79d94",
                                "name": "12.7 Vocabulario del medio ambiente: recycle, reduce, reuse, protect, save"
                            },
                            {
                                "id": "b0718788-78a6-40a0-9e6f-4da9f7b37423",
                                "name": "12.8 Preguntas de ubicación: \"Where is...?\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "5to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "cce016fb-9df4-47b9-a1ce-91484dd63ed6",
                        "themes": [
                            "Tema 10: Habilidades y Talentos"
                        ],
                        "conceptual": "- Modal \"can\" para habilidades: afirmativo, negativo e interrogativo\n- Verbos de habilidad: play, ride, swim, run, sing, dance, draw, speak, cook, read, write, paint, knit, sew, bake, drive, fly, climb, jump, skate, ski, surf, dive, shoot, throw, catch, kick, hit, solve, build, fix, repair, design, create, invent, discover, explore, teach, learn, understand, remember, forget, imagine, dream, plan, organize, lead, follow, help, care, share, listen, observe, analyze, decide, choose, express, communicate, negotiate, cooperate, collaborate\n- Instrumentos musicales: guitar, violin, drums, piano, flute, trumpet, saxophone, harp, cello, clarinet, bass, keyboard, tambourine, maracas, bongos, accordion, harmonica, banjo, mandolin, ukulele, xylophone\n- Deportes y actividades (avanzado): baseball, soccer, karate, swimming, cycling, surfing, skiing, snowboarding, gymnastics, judo, boxing, wrestling, golf, bowling, fishing, hiking, camping, birdwatching, photography, painting, drawing, writing, reading, cooking, baking, gardening, traveling, dancing, singing, acting\n- Preguntas: \"Can you swim?\", \"What can you do?\", \"Can he play the guitar?\"\n- Respuestas: \"Yes, I can.\" \"No, I can't.\" \"Yes, he can.\" \"No, she can't.\"\n- Modal \"could\" para habilidades pasadas (introducción): \"When I was younger, I could...\"",
                        "procedural": "- Preguntar y responder sobre habilidades: \"Can you swim?\"\n- Describir talentos: \"I can play the guitar.\"\n- Describir habilidades de otros: \"She can sing very well.\"\n- Usar \"can\" en afirmativo, negativo e interrogativo\n- Hablar sobre habilidades que desean aprender: \"I want to learn...\"\n- Preguntar y responder: \"What can you do?\"\n- Participar en diálogos sobre talentos y habilidades\n- Crear una lista de habilidades personales en inglés\n- Juego de adivinanzas: \"Who can...\"",
                        "attitudinal": "- Motivación para desarrollar habilidades y talentos\n- Superación de barreras y limitaciones\n- Reconocimiento sin estereotipos de fortalezas y limitaciones\n- Interés en compartir conocimientos, talentos y habilidades\n- Respeto por las habilidades y talentos de los demás\n- Valoración de la diversidad de habilidades\n- Confianza en sus propias habilidades\n- Inclusión y respeto hacia personas con diferentes habilidades"
                    },
                    {
                        "id": "06e49377-8994-4484-b738-76b743278120",
                        "themes": [
                            "Tema 11: Rutinas y Horarios"
                        ],
                        "conceptual": "- Repaso del presente simple para rutinas\n- Adverbios de tiempo: early, late, now, today, tomorrow, yesterday, soon, later, immediately, recently, already, yet, still, just, before, after, during, while, since, for, until, as soon as, whenever, every day, every week, every month, every year\n- Preguntas: \"What time do you...?\", \"When do you...?\", \"How often do you...?\"\n- Preposiciones de tiempo: in, on, at\n- Conjunciones: and, or, but, because, so, when, while, after, before, until, since, for, as, as soon as, whenever\n- Horas específicas: \"I get up at 6:30 am.\" \"I go to school at 7:00 am.\"\n- Expresar frecuencia: once a day, twice a week, three times a month\n- Expresar duración: for, since\n- Presente simple con adverbios de tiempo: \"I always brush my teeth before breakfast.\"",
                        "procedural": "- Hablar sobre su rutina diaria con detalles: \"I wake up at 6:00, then I get dressed and eat breakfast.\"\n- Preguntar y responder sobre horarios: \"What time do you go to school?\"\n- Describir actividades con adverbios de tiempo: \"I usually do my homework after school.\"\n- Usar preposiciones de tiempo correctamente: in, on, at\n- Usar conjunciones para conectar ideas: \"I wake up early because I go to school.\"\n- Preguntar y responder sobre frecuencia: \"How often do you play soccer?\"\n- Crear un horario semanal en inglés\n- Participar en diálogos sobre rutinas diarias completas",
                        "attitudinal": "- Responsabilidad y puntualidad en el cumplimiento de compromisos\n- Organización del tiempo y planificación\n- Valoración de la planificación como medio para mejor aprovechamiento del tiempo y recursos\n- Respeto por el tiempo de los demás\n- Hábitos saludables de organización diaria\n- Corresponsabilidad en las actividades cotidianas\n- Valoración de la rutina como herramienta de organización personal"
                    },
                    {
                        "id": "3085fb02-e71b-4de7-9978-769255b83b1c",
                        "themes": [],
                        "conceptual": "- Comparación de viviendas en RD y otros países: tipos, materiales, distribución\n- Comparación de alimentos típicos: comida dominicana vs. comida internacional\n- Comparación de deportes y recreación: deportes populares en RD y en otros países\n- Comparación de actividades cotidianas: rutinas diarias en diferentes culturas\n- Comparación de hábitos de higiene y cuidado personal\n- Comparación de condiciones climáticas: clima tropical vs. clima templado\n- Comparación de ocupaciones y profesiones: roles laborales en diferentes países\n- Comparación de la familia: estructura familiar en diferentes culturas\n- Comparación de rasgos físicos y forma de ser: diversidad cultural\n- Comparación de gustos y preferencias: diferencias culturales en alimentación, música, deportes\n- Grado comparativo del adjetivo: \"Houses in the USA are bigger than houses in RD.\"\n- Preguntas: \"How are houses different?\", \"What is the weather like in...?\"\n- Conjunciones: and, or, but, because, so, although\n",
                        "procedural": "- Comparar viviendas de diferentes países: \"In the USA, houses are different.\"\n- Comparar alimentos típicos: \"In Italy, people eat pasta.\"\n- Comparar deportes populares: \"Baseball is popular in the Dominican Republic.\"\n- Comparar actividades cotidianas: \"In different countries, people have different routines.\"\n- Comparar condiciones climáticas: \"The weather is different in each country.\"\n- Identificar diferencias culturales\n- Usar el grado comparativo para comparar: \"My house is smaller than his house.\"\n- Usar conjunciones para conectar ideas: \"In RD it is hot, but in Canada it is cold.\"\n- Crear un proyecto sobre comparaciones culturales\n- Participar en diálogos sobre diferencias culturales",
                        "attitudinal": "- Valoración de su identidad cultural\n- Respeto y valoración de otras culturas\n- Curiosidad por aprender sobre otros países y culturas\n- Aceptación y respeto por las diferencias culturales\n- Orgullo por su país y sus tradiciones\n- Solidaridad y empatía hacia personas de otras culturas\n- Promoción de los atractivos de su país: lugares, música, deportes, comida\n- Respeto por las preferencias y costumbres de los demás\n- Reflexión crítica sobre las diferencias culturales"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            }
        ]
    },
    {
        "subjectId": "ingles",
        "grade": "6to",
        "units": [
            {
                "id": "99300f99-5687-4f18-b3f0-6ca1dbfec70b",
                "name": "UNIDAD 1: IDENTIFICACIÓN PERSONAL, SENTIMIENTOS Y NECESIDADES",
                "themes": [
                    {
                        "id": "7c5170ce-e3b5-4bdc-a3ee-e26818fa3499",
                        "name": "Tema 1: Información Personal Avanzada",
                        "subthemes": [
                            {
                                "id": "aa7eec8c-0d26-45ce-93ed-795edbf9ec35",
                                "name": "1.1 Repaso de información personal básica: nombre, edad, nacionalidad, dirección, teléfono"
                            },
                            {
                                "id": "2fcb2994-76af-43ae-ad7f-5ab5aa7be094",
                                "name": "1.2 Información adicional: correo electrónico, fecha de nacimiento, lugar de nacimiento"
                            },
                            {
                                "id": "7173d3f0-2c06-4d99-b2a9-613390662e52",
                                "name": "1.3 Preguntas avanzadas: \"What is your email address?\", \"Where were you born?\""
                            },
                            {
                                "id": "e2fb00d8-781d-47ef-86bc-874fd698ae60",
                                "name": "1.4 Presente simple para información personal: \"I live in Santo Domingo.\""
                            },
                            {
                                "id": "b99b86ac-e6cb-44c1-a5f0-b97026a58a51",
                                "name": "1.5 Números cardinales avanzados: cientos, miles"
                            },
                            {
                                "id": "36d6a7f8-6692-44b4-8de3-64a97be9295d",
                                "name": "1.6 Ocupaciones y profesiones avanzadas: accountant, architect, artist, scientist, journalist"
                            }
                        ]
                    },
                    {
                        "id": "7385247c-66ee-4bb8-a6ea-36ed34a67a97",
                        "name": "Tema 2: Sentimientos y Emociones",
                        "subthemes": [
                            {
                                "id": "5dea3076-36c8-4b1b-88d2-b94448aa1500",
                                "name": "2.1 Sentimientos: happy, sad, angry, scared, excited, nervous, worried, surprised, confused, embarrassed, proud, grateful, hopeful, calm, relaxed, stressed, anxious, lonely, loved, appreciated, misunderstood, disappointed, bored, curious, tired, energetic, peaceful, frustrated, jealous, envious, ashamed, guilty, sorry, thankful, optimistic, pessimistic, confident, insecure, brave, afraid, courageous, determined, motivated, inspired, creative, imaginative, adventurous, cautious, shy, outgoing, friendly, unfriendly, kind, unkind, generous, selfish, honest, dishonest, reliable, unreliable, patient, impatient, responsible, irresponsible, respectful, disrespectful, polite, rude, helpful, unhelpful, thoughtful, careless, considerate, inconsiderate, understanding, judgmental, open-minded, closed-minded, flexible, rigid, adaptable, stubborn, cooperative, competitive, independent, dependent, strong, weak, brave, cowardly, loyal, disloyal, faithful, unfaithful, sincere, insincere, humble, arrogant, modest, boastful, cheerful, gloomy, optimistic, pessimistic, positive, negative, active, passive, dynamic, static, energetic, lethargic, enthusiastic, apathetic, passionate, indifferent"
                            },
                            {
                                "id": "4e4c0998-8cf2-4cca-97db-24db8d921094",
                                "name": "2.2 Verbo \"to be\" para sentimientos: \"I am happy.\" \"She is sad.\""
                            },
                            {
                                "id": "a2f497ef-a6e5-4fe5-b915-605343145d6a",
                                "name": "2.3  Verbo \"feel\" para sentimientos: \"I feel excited.\" \"He feels nervous.\""
                            },
                            {
                                "id": "a525651e-2599-4760-b57b-1cf0852bbbfc",
                                "name": "2.4 Verbo \"need\" para necesidades: \"I need water.\" \"She needs help.\""
                            },
                            {
                                "id": "81d09e89-ed06-4d2f-9b11-58948cb5e5bd",
                                "name": "2.5 Preguntas: \"How do you feel?\", \"Are you okay?\", \"What do you need?\""
                            },
                            {
                                "id": "c0024dc4-c19f-446b-bb49-936e67905b15",
                                "name": "2.6 Verbos modales: \"I want to...\" \"I would like to...\""
                            }
                        ]
                    },
                    {
                        "id": "38ebf646-c3b0-4470-b821-4a89d664996a",
                        "name": "Tema 3: Necesidades Personales",
                        "subthemes": [
                            {
                                "id": "d40c905f-0ef6-48d6-aa7d-6ae415be0f56",
                                "name": "3.1 Necesidades básicas: hungry, thirsty, tired, sleepy, hot, cold, sick, scared, lonely, bored, confused, lost, worried, stressed, anxious, angry, sad, frustrated, overwhelmed, exhausted, weak, dizzy, nauseous, itchy, sore, stiff, achy, allergic, sick, infected, inflamed, swollen, bleeding, broken, sprained, strained, pulled, twisted, fractured, bruised, cut, burned, scraped, bitten, stung, poisoned, contagious, feverish, chilled, sweaty, clammy, pale, flushed, dizzy, faint, weak, tired, exhausted, sleepy, drowsy, groggy, confused, disoriented, forgetful, distracted, anxious, stressed, overwhelmed, frustrated, angry, sad, depressed, lonely, isolated, misunderstood, unappreciated, undervalued, insecure, inadequate, powerless, helpless, hopeless, desperate, worried, concerned, scared, terrified, horrified, shocked, surprised, amazed, astonished, speechless, stunned, bewildered, confused, perplexed, puzzled, curious, interested, fascinated, captivated, absorbed, engaged, entertained, amused, delighted, thrilled, excited, enthusiastic, passionate, motivated, determined, hopeful, optimistic, confident, proud, satisfied, content, pleased, grateful, thankful, appreciative, blessed, lucky, fortunate, happy, joyful, cheerful, optimistic, positive, energetic, lively, vibrant, active, dynamic, passionate, enthusiastic, motivated, determined, focused, committed, dedicated, loyal, faithful, sincere, honest, trustworthy, reliable, responsible, dependable, loyal, faithful, constant, steady, stable, balanced, peaceful, calm, serene, quiet, tranquil, restful, relaxing, soothing, comforting, reassuring, supportive, encouraging, inspiring, motivating, uplifting, refreshing, rejuvenating, revitalizing, renewing"
                            },
                            {
                                "id": "4ebaa9aa-1470-4e79-b186-8a26c3489eb5",
                                "name": "3.2 Preguntas sobre necesidades: \"What do you need?\", \"Are you hungry?\", \"Do you need help?\""
                            },
                            {
                                "id": "88d1d048-1852-40b3-a185-6c76876b4faa",
                                "name": "3.3 Expresar necesidades: \"I need a drink.\" \"I need to rest.\""
                            },
                            {
                                "id": "bc9a9ed0-3528-4cce-84cd-64b704f2c77e",
                                "name": "3.4 Ofrecer ayuda: \"Can I help you?\", \"Do you need anything?\""
                            },
                            {
                                "id": "904c7308-3517-40cf-869a-087463e636cc",
                                "name": "3.5 Aceptar y rechazar ayuda: \"Yes, please.\" \"No, thank you.\""
                            },
                            {
                                "id": "c5047cc3-240b-43d2-8e5a-8ac8c55eafb3",
                                "name": "3.6 Frases de cortesía: \"Would you like...?\", \"I would like...\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "6to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "05d42852-685f-4903-9c46-8e5047b79a7b",
                        "themes": [
                            "Tema 1: Información Personal Avanzada"
                        ],
                        "conceptual": "- Repaso de información personal básica: nombre, edad, nacionalidad, dirección, teléfono\n- Información adicional: correo electrónico, fecha de nacimiento, lugar de nacimiento, ocupación, estado civil, número de identificación\n- Preguntas avanzadas: \"What is your email address?\", \"Where were you born?\", \"What is your date of birth?\", \"What do you do?\"\n- Presente simple para información personal: \"I live in Santo Domingo.\" \"I work as a teacher.\"\n- Números cardinales avanzados: cientos, miles, millones\n- Ocupaciones y profesiones avanzadas: accountant, architect, artist, scientist, journalist, engineer, lawyer, doctor, nurse, teacher, professor, researcher, psychologist, veterinarian, pharmacist, optometrist, nutritionist, dentist, surgeon, specialist, consultant, manager, director, executive, CEO, entrepreneur, businessperson, investor, analyst, designer, developer, programmer, technician, mechanic, electrician, plumber, carpenter, painter, baker, chef, waiter, server, receptionist, secretary, assistant, coordinator, administrator, supervisor, inspector, auditor, advisor, counselor, therapist, social worker, community organizer, activist, volunteer, missionary, pastor, priest, rabbi, imam, monk, nun, teacher, professor, instructor, trainer, coach, mentor, tutor, guide, leader, facilitator, mediator, negotiator, diplomat, ambassador, consul, representative, delegate, senator, congressperson, mayor, governor, president, prime minister, minister, secretary, ambassador, consul, diplomat, judge, attorney, prosecutor, defender, advocate, paralegal, notary, accountant, auditor, bookkeeper, teller, cashier, banker, broker, agent, realtor, appraiser, inspector, surveyor, engineer, architect, designer, planner, developer, builder, contractor, construction worker, laborer, farmer, rancher, fisherman, miner, logger, ranger, park ranger, forest ranger, wildlife biologist, ecologist, environmentalist, conservationist, activist, organizer, campaigner, lobbyist, advocate, spokesperson, representative, delegate, ambassador, consul, diplomat, envoy, emissary, messenger, courier, mail carrier, delivery driver, truck driver, bus driver, taxi driver, pilot, flight attendant, captain, sailor, marine, soldier, officer, police officer, detective, investigator, firefighter, paramedic, emergency medical technician, dispatcher, operator, technician, mechanic, engineer, scientist, researcher, analyst, specialist, expert, consultant, advisor, counselor, therapist, psychologist, psychiatrist, social worker, case manager, community organizer, activist, volunteer, missionary, pastor, priest, rabbi, imam, monk, nun\n- Verbos para describir: \"I am a student.\" \"She works in a hospital.\"\n- Preguntas: \"What do you do?\", \"Where do you work?\", \"What is your job?\"",
                        "procedural": "- Presentarse con información completa: \"My name is... I am... years old. I am from... I live in... My email is...\"\n- Preguntar y responder sobre información personal avanzada\n- Usar números grandes para direcciones, teléfonos, edades\n- Describir ocupaciones propias y de familiares: \"My mother is a nurse.\"\n- Completar formularios con información personal en inglés\n- Participar en diálogos de presentación avanzados\n- Usar presente simple para describir rutinas laborales o escolares",
                        "attitudinal": "- Motivación para aprender inglés\n- Confianza al hablar de sí mismo en inglés\n- Respeto por la información personal propia y de los demás\n- Valoración de la identidad personal y profesional\n- Cortesía al preguntar información personal\n- Responsabilidad al compartir información personal\n- Valoración de la importancia del trabajo para las personas y la sociedad\n- Reconocimiento de la igualdad y equidad de género en las ocupaciones"
                    },
                    {
                        "id": "d64ea3b1-ed02-4be3-8ce2-648c4bc9dbeb",
                        "themes": [
                            "Tema 2: Sentimientos y Emociones"
                        ],
                        "conceptual": "- Sentimientos y emociones: happy, sad, angry, scared, excited, nervous, worried, surprised, confused, embarrassed, proud, grateful, hopeful, calm, relaxed, stressed, anxious, lonely, loved, appreciated, misunderstood, disappointed, bored, curious, tired, energetic, peaceful, frustrated, jealous, envious, ashamed, guilty, sorry, thankful, optimistic, pessimistic, confident, insecure, brave, afraid, courageous, determined, motivated, inspired, creative, imaginative, adventurous, cautious, shy, outgoing, friendly, unfriendly, kind, unkind, generous, selfish, honest, dishonest, reliable, unreliable, patient, impatient, responsible, irresponsible, respectful, disrespectful, polite, rude, helpful, unhelpful, thoughtful, careless, considerate, inconsiderate, understanding, judgmental, open-minded, closed-minded, flexible, rigid, adaptable, stubborn, cooperative, competitive, independent, dependent, strong, weak, brave, cowardly, loyal, disloyal, faithful, unfaithful, sincere, insincere, humble, arrogant, modest, boastful, cheerful, gloomy, optimistic, pessimistic, positive, negative, active, passive, dynamic, static, energetic, lethargic, enthusiastic, apathetic, passionate, indifferent, delighted, thrilled, joyful, blissful, content, satisfied, pleased, thankful, appreciative, blessed, lucky, fortunate, relieved, reassured, comforted, supported, encouraged, motivated, inspired, uplifted, elevated, empowered, enabled, facilitated, supported, encouraged\n- Verbos para sentimientos: be, feel, look, seem, appear, sound, sense, experience, express, show, hide, control, manage, regulate, understand, recognize, acknowledge, validate, accept, embrace, release, let go, transform, heal, grow, develop, mature, evolve, progress\n- Verbo \"to be\" para sentimientos: \"I am happy.\" \"She is sad.\"\n- Verbo \"feel\" para sentimientos: \"I feel excited.\" \"He feels nervous.\"\n- Preguntas: \"How do you feel?\", \"Are you okay?\", \"What's wrong?\"\n- Causas y razones: \"I am happy because...\" \"She is sad because...\"\n- Conectores: because, so, since, as, due to, thanks to",
                        "procedural": "- Expresar sentimientos y emociones: \"I am happy.\" \"I feel excited.\"\n- Preguntar y responder sobre estados emocionales: \"How do you feel?\"\n- Describir causas de sentimientos: \"I am happy because I got good grades.\"\n- Usar verbos \"be\" y \"feel\" correctamente\n- Identificar sentimientos en imágenes y situaciones\n- Participar en diálogos sobre emociones\n- Expresar empatía: \"I understand how you feel.\"\n- Usar conectores para explicar causas: because, so, since",
                        "attitudinal": "- Empatía hacia los sentimientos y necesidades de las demás personas\n- Asertividad en la expresión de los sentimientos y necesidades\n- Manejo de las emociones\n- Valoración de la identidad y sentido de pertenencia\n- Respeto por los sentimientos de los demás\n- Cortesía y asertividad en la interacción con las demás personas\n- Aceptación de las diferencias individuales\n- Confianza en la expresión de emociones en inglés"
                    },
                    {
                        "id": "5ac33ec8-6701-4ae7-8ac6-c3f3383109a4",
                        "themes": [
                            "Tema 3: Necesidades Personales"
                        ],
                        "conceptual": "- Necesidades básicas: hungry, thirsty, tired, sleepy, hot, cold, sick, scared, lonely, bored, confused, lost, worried, stressed, anxious, angry, sad, frustrated, overwhelmed, exhausted, weak, dizzy, nauseous, itchy, sore, stiff, achy, allergic, sick, infected, inflamed, swollen, bleeding, broken, sprained, strained, pulled, twisted, fractured, bruised, cut, burned, scraped, bitten, stung, poisoned, contagious, feverish, chilled, sweaty, clammy, pale, flushed, dizzy, faint, weak, tired, exhausted, sleepy, drowsy, groggy, confused, disoriented, forgetful, distracted, anxious, stressed, overwhelmed, frustrated, angry, sad, depressed, lonely, isolated, misunderstood, unappreciated, undervalued, insecure, inadequate, powerless, helpless, hopeless, desperate, worried, concerned, scared, terrified, horrified, shocked, surprised, amazed, astonished, speechless, stunned, bewildered, confused, perplexed, puzzled, curious, interested, fascinated, captivated, absorbed, engaged, entertained, amused, delighted, thrilled, excited, enthusiastic, passionate, motivated, determined, hopeful, optimistic, confident, proud, satisfied, content, pleased, grateful, thankful, appreciative, blessed, lucky, fortunate\n- Verbos para necesidades: need, want, require, desire, wish, hope, expect, demand, request, ask, seek, look for, search for, find, get, obtain, acquire, receive, take, have, use, enjoy, appreciate, value, respect, honor, cherish, treasure, hold dear, protect, care for, nurture, nourish, sustain, support, help, assist, aid, serve, provide, give, offer, share, contribute, participate, engage, involve, collaborate, cooperate, work together, team up, partner, ally, unite, join, connect, bond, relate, communicate, express, share, listen, understand, accept, embrace, include, value, respect, honor, cherish\n- Preguntas sobre necesidades: \"What do you need?\", \"Are you hungry?\", \"Do you need help?\"\n- Expresar necesidades: \"I need a drink.\" \"I need to rest.\"\n- Ofrecer ayuda: \"Can I help you?\", \"Do you need anything?\"\n- Aceptar y rechazar ayuda: \"Yes, please.\" \"No, thank you.\"\n- Frases de cortesía: \"Would you like...?\", \"I would like...\"\n- Verbos modales: \"I want to...\" \"I would like to...\"\n- Verbos: need, want, require, desire, wish, hope",
                        "procedural": "- Expresar necesidades básicas y personales: \"I need water.\" \"I need to sleep.\"\n- Preguntar y responder sobre necesidades: \"What do you need?\"\n- Ofrecer y solicitar ayuda: \"Can I help you?\", \"Can you help me?\"\n- Aceptar y rechazar ayuda cortésmente: \"Yes, please.\" \"No, thank you.\"\n- Usar verbos modales: \"I want to...\" \"I would like to...\"\n- Participar en diálogos sobre necesidades\n- Expresar necesidades en diferentes situaciones: en la escuela, en casa, en la comunidad\n- Usar frases de cortesía: \"Would you like...?\", \"I would like...\"",
                        "attitudinal": "- Reconocimiento de los derechos propios y de las demás personas referentes a protección, alimentación, salud, tranquilidad, educación, vivienda digna, aceptación\n- Empatía hacia los sentimientos y necesidades de las demás personas\n- Asertividad en la expresión de los sentimientos y necesidades\n- Cortesía y asertividad en la interacción con las demás personas\n- Respeto a la privacidad de la información personal propia y la de las demás personas\n- Disposición de ofrecer ayuda a las demás personas\n- Solidaridad con personas vulnerables\n- Valoración de la importancia de la ayuda mutua y la cooperación\n- Uso sano, responsable y seguro de las TIC en las actividades informativas, formativas y recreativas"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "2aa81112-8c0c-4598-b424-6f84d1f7a4e9",
                "name": "UNIDAD 2: SALUD, DOLENCIAS Y CUIDADOS FÍSICOS",
                "themes": [
                    {
                        "id": "71aeb80f-f309-48de-b786-6a93ecda6d61",
                        "name": "Tema 4: Dolencias y Enfermedades",
                        "subthemes": [
                            {
                                "id": "6cd48e32-1999-4553-ab3b-8bec5df12143",
                                "name": "4.1 Vocabulario de dolencias: headache, stomachache, toothache, backache, earache, sore throat, fever, cough, cold, flu, allergy, asthma, bronchitis, chickenpox, measles, mumps, rash, burn, cut, bruise, sprain, fracture, infection, inflammation, swelling, pain, ache, discomfort, dizziness, nausea, vomiting, diarrhea, constipation, fever, chills, sweating, sneezing, runny nose, stuffy nose, soreness, stiffness, weakness, fatigue, exhaustion, insomnia, stress, anxiety, depression, loneliness"
                            },
                            {
                                "id": "cda3c572-7ce7-4351-ac7d-496fdfc05842",
                                "name": "4.2 Verbos para dolencias: \"I have a headache.\" \"My stomach hurts.\""
                            },
                            {
                                "id": "b18f69e5-cc72-4460-b646-0620dd9254c5",
                                "name": "4.3 Verbo \"hurt\" para dolor: \"My arm hurts.\" \"Does your back hurt?\""
                            },
                            {
                                "id": "73898b1b-a5d2-412c-ae0a-03653c21d5e1",
                                "name": "4.4 Preguntas: \"What's wrong?\", \"What's the matter?\", \"Where does it hurt?\""
                            },
                            {
                                "id": "aaa77cfe-ce86-4305-9560-a227b656cfab",
                                "name": "4.5 Síntomas: \"I have a fever.\" \"I feel dizzy.\""
                            },
                            {
                                "id": "fff7fb05-1695-4b58-9ba1-e65c36ab92b2",
                                "name": "4.6 Remedios y tratamientos: medicine, syrup, pills, rest, water, tea, soup, bandage, ice, heat, cream, ointment, doctor, nurse, hospital, clinic, pharmacy"
                            },
                            {
                                "id": "b69a11f9-cd06-4ba2-ba27-8351ab5a677e",
                                "name": "4.7 Frases: \"I feel sick.\", \"I need to see a doctor.\""
                            }
                        ]
                    },
                    {
                        "id": "934ac357-84a4-4611-a4d9-5d10a5cd9fae",
                        "name": "Tema 5: Cuidados Físicos y Salud",
                        "subthemes": [
                            {
                                "id": "39a3848e-3c76-426d-b97e-17486853a7c2",
                                "name": "5.1 Hábitos saludables: eat healthy, exercise, sleep well, drink water, wash hands, brush teeth, take a shower, rest, relax, meditate, breathe, stretch, walk, run, swim, play sports, eat fruits, eat vegetables, avoid junk food, avoid sugar, avoid smoking, avoid alcohol, avoid stress, practice yoga, go to the doctor, take medicine, get vaccinated, wash clothes, clean house, disinfect surfaces, wear sunscreen, wear hat, wear sunglasses, use umbrella, use insect repellent, wash hands frequently, cover mouth when coughing, use tissues, dispose of waste properly, recycle, reduce waste, conserve water, save energy, protect nature, care for animals, plant trees, clean beaches, protect oceans, prevent fires, avoid littering, use biodegradable products, reduce plastic, use reusable bags, save water, save electricity, use public transport, walk instead of drive, ride a bike, carpool, conserve resources, protect the environment, recycle paper, recycle plastic, recycle glass, recycle metal, compost organic waste, reduce food waste, reuse containers, repair instead of replace, buy secondhand, donate clothes, volunteer, help others, share knowledge, teach others, learn new things, practice self-care, manage stress, practice mindfulness, stay positive, be grateful, help others, be kind, be honest, be respectful, be responsible, be reliable, be punctual, be organized, be disciplined, be creative, be curious, be open-minded, be tolerant, be patient, be perseverant, be resilient, be courageous, be humble, be generous, be compassionate, be empathetic, be supportive, be encouraging, be motivating, be inspiring, be uplifting"
                            },
                            {
                                "id": "4fb25842-cd29-489a-b9da-be9b69a945fe",
                                "name": "5.2 Presente simple para hábitos: \"I brush my teeth every day.\""
                            },
                            {
                                "id": "3656f09c-0c32-4317-9bac-c613a2b0151e",
                                "name": "5.3 Expresar recomendaciones: \"You should eat healthy.\" \"You need to rest.\""
                            },
                            {
                                "id": "3cab2e64-fb44-455e-bedd-e5f314a8b13b",
                                "name": "5.4 Preguntas: \"What do you do to stay healthy?\""
                            }
                        ]
                    },
                    {
                        "id": "1f08d097-1006-41d8-95b0-05f2d6ce9d6b",
                        "name": "Tema 6: Partes del Cuerpo y Funciones",
                        "subthemes": [
                            {
                                "id": "b4737e36-5785-4ebe-9733-ea01427da272",
                                "name": "6.1 Partes del cuerpo (avanzado): head, brain, skull, face, eyes, ears, nose, mouth, teeth, tongue, lips, cheeks, chin, forehead, eyebrows, eyelashes, eyelids, neck, throat, shoulders, arms, elbows, wrists, hands, fingers, thumbs, nails, chest, lungs, heart, ribs, spine, back, stomach, kidneys, liver, intestines, hips, legs, knees, ankles, feet, toes, heels, soles, skin, muscles, bones, joints, veins, arteries, blood, nerves, cells, tissue, organs, systems, immune system, respiratory system, digestive system, circulatory system, nervous system, skeletal system, muscular system, reproductive system, endocrine system, urinary system, lymphatic system, integumentary system"
                            },
                            {
                                "id": "c12c3b91-c9a7-4544-9ed3-566b7891ca98",
                                "name": "6.2 Verbos para funciones: \"The heart pumps blood.\" \"The lungs breathe.\""
                            },
                            {
                                "id": "4f9174e8-4361-4e7c-a7a6-e7cf13f465c3",
                                "name": "6.3 Preguntas: \"What is the function of the heart?\", \"What do lungs do?\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "6to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "441ade88-2582-4783-ad38-5fdc628f20cb",
                        "themes": [
                            "Tema 4: Dolencias y Enfermedades"
                        ],
                        "conceptual": "Vocabulario de dolencias (headache, stomachache, toothache, fever, cough, cold, flu), síntomas (dizziness, nausea, vomiting), verbos (have, hurt, feel), preguntas (What's wrong?, Where does it hurt?), remedios (medicine, rest, water), lugares (hospital, clinic, pharmacy)",
                        "procedural": "Expresar dolencias, preguntar y responder sobre dolencias, describir síntomas, preguntar y responder sobre dolor, solicitar ayuda médica, describir remedios, participar en diálogos médico-paciente",
                        "attitudinal": "Importancia de la prevención, empatía por personas con dolencias, respeto por el cuerpo, cuidado de la salud, valoración de hábitos saludables, actitud positiva hacia el autocuidado, solidaridad con enfermos"
                    },
                    {
                        "id": "5fc6cc68-776e-4166-83ab-22123af65e56",
                        "themes": [
                            "Tema 5: Cuidados Físicos y Salud"
                        ],
                        "conceptual": "Hábitos saludables (eat healthy, exercise, sleep well, drink water, wash hands, brush teeth), alimentación saludable (fruits, vegetables), higiene personal, prevención (vaccination, sunscreen), cuidado ambiental (recycle, reduce waste), recomendaciones (should, need to, have to)",
                        "procedural": "Describir hábitos saludables, preguntar y responder sobre cuidados de salud, expresar recomendaciones, describir rutinas de cuidado personal, usar verbos modales, identificar alimentos saludables, crear plan de cuidado personal",
                        "attitudinal": "Hábitos saludables, valoración de dieta equilibrada, importancia de la higiene, prevención de enfermedades, cuidado de la salud, protección del medio ambiente, responsabilidad, conciencia ambiental"
                    },
                    {
                        "id": "448f7583-619b-44df-b09d-659051f04842",
                        "themes": [
                            "Tema 6: Partes del Cuerpo y Funciones"
                        ],
                        "conceptual": "Partes del cuerpo (head, brain, heart, lungs, stomach, bones, muscles), sistemas del cuerpo (respiratory, digestive, circulatory, nervous), verbos para funciones (pump, breathe, think, digest), preguntas (What does the heart do?), adjetivos (healthy, strong, weak)",
                        "procedural": "Identificar y nombrar partes del cuerpo, describir funciones de órganos y sistemas, preguntar y responder sobre funciones, describir hábitos saludables, identificar sistemas del cuerpo, crear diagrama del cuerpo con etiquetas",
                        "attitudinal": "Cuidado de la salud, respeto por el cuerpo, valoración de hábitos saludables, prevención de enfermedades, conciencia sobre el funcionamiento del cuerpo, actitud positiva hacia el autocuidado"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "0e7e5537-0ead-4aec-b97e-5c280324f289",
                "name": "UNIDAD 3: BIENES, SERVICIOS Y COMPRAS",
                "themes": [
                    {
                        "id": "165e4a0a-f931-4da5-9229-a6d5b99e4b0c",
                        "name": "Tema 7: Establecimientos Comerciales",
                        "subthemes": [
                            {
                                "id": "a3acc421-0500-46c1-baf4-0b84e8b9af0e",
                                "name": "7.1 Establecimientos: supermarket, grocery store, bakery, butcher shop, fish market, fruit market, clothing store, shoe store, electronics store, hardware store, pharmacy, bank, post office, restaurant, cafeteria, fast food, hotel, mall, department store, bookstore, stationery store, toy store, jewelry store, watch store, furniture store, home goods store, garden center, pet store, sports store, music store, movie theater, library, museum, gallery, stadium, gym, spa, salon, barbershop, laundry, dry cleaners, car wash, gas station, repair shop, mechanic, dentist, clinic, hospital, school, university, office, factory, warehouse, farm, market, plaza, arcade, amusement park, zoo, aquarium, botanical garden, national park, beach, river, lake, mountain, forest, desert, ocean, island, city, town, village, neighborhood, community, street, avenue, boulevard, square, bridge, tunnel, highway, airport, train station, bus station, port, dock, pier, lighthouse, castle, palace, temple, church, mosque, synagogue, cathedral, chapel, monastery, convent, shrine, sacred place, historical site, monument, memorial, museum, gallery, cultural center, community center, convention center, exhibition hall, conference room, auditorium, theater, opera house, concert hall, stadium, arena, gymnasium, sports complex, pool, spa, wellness center, yoga studio, dance studio, art studio, photography studio, recording studio, broadcasting station, television station, radio station, newspaper office, publishing house, printing press, factory, warehouse, distribution center, logistics center, headquarters, branch office, franchise, partnership, corporation, small business, startup, entrepreneur, investor, stakeholder, shareholder, customer, client, consumer, buyer, seller, vendor, supplier, distributor, retailer, wholesaler, manufacturer, producer, provider, service provider, professional, consultant, advisor, specialist, expert, technician, engineer, scientist, researcher, professor, teacher, instructor, trainer, coach, mentor, guide, leader, manager, director, executive, president, CEO, owner, partner, employee, worker, staff, laborer, assistant, associate, coordinator, administrator, secretary, receptionist, assistant, trainee, intern, volunteer, apprentice, beginner, learner, student, pupil, scholar, graduate, postgraduate, fellow, alumni"
                            },
                            {
                                "id": "b99cd883-fe09-43a0-b364-5a09ef9d99aa",
                                "name": "7.2 Verbos para compras: buy, sell, pay, spend, save, cost, want, need, choose, select, try, fit, wear, use, have, take, give, offer, find, lose, return, exchange, refund, guarantee, warranty, receipt, change, cash, credit card, debit card, check, money, dollars, pesos, coins, bills, price, discount, sale, offer, bargain, cheap, expensive, affordable, affordable, expensive, costly, pricey, reasonable, fair, overpriced, undervalued, worth, value, quality, quantity, size, color, style, brand, model, design, material, fabric, leather, cotton, wool, silk, polyester, nylon, plastic, metal, wood, glass, ceramic, porcelain, stone, marble, granite, concrete, brick, tile, wood, laminate, vinyl, carpet, tile, linoleum, hardwood, laminate, engineered wood, bamboo, cork, glass, aluminum, steel, iron, copper, brass, bronze, silver, gold, platinum, titanium, carbon fiber, fiberglass, polyester, nylon, acrylic, plastic, biodegradable, recyclable, reusable, sustainable, eco-friendly, organic, natural, artificial, synthetic, man-made, processed, refined, pure, natural, fresh, organic, local, imported, seasonal, homemade, artisanal, craft, industrial, commercial, retail, wholesale, online, digital, virtual, physical, tangible, intangible"
                            },
                            {
                                "id": "59ce6610-9e16-4a12-9936-62c142110e1e",
                                "name": "7.3 Preguntas: \"How much is it?\", \"How much does it cost?\", \"What is the price?\""
                            },
                            {
                                "id": "760c00ed-10fd-45b3-93a6-3b09f435d613",
                                "name": "7.4 Frases para comprar: \"I would like to buy...\" \"Can I try this on?\""
                            },
                            {
                                "id": "1f30897f-3d7f-4ed2-8fdd-ee8852f0758e",
                                "name": "7.5 Ofertas y descuentos: \"It is on sale.\" \"It is 20% off.\""
                            },
                            {
                                "id": "6299eac1-fc45-4355-b86a-3d7beaff26da",
                                "name": "7.6 Dinero y precios: \"It costs 100 pesos.\" \"It is 5 dollars.\""
                            },
                            {
                                "id": "a6790d24-1192-4056-86b8-79cdc27712d9",
                                "name": "7.7 How much / How many: \"How much water do you need?\", \"How many apples do you want?\""
                            }
                        ]
                    },
                    {
                        "id": "68e4305a-7050-4038-b3d1-c81e3cbe9d36",
                        "name": "Tema 8: Compras y Servicios",
                        "subthemes": [
                            {
                                "id": "3216320f-c5f8-4b2d-bbc0-7d9eead1c2a8",
                                "name": "8.1 Verbos para servicios: \"Can you help me?\", \"I need a service.\""
                            },
                            {
                                "id": "c44058d5-2f79-4762-b58a-06df6a001f84",
                                "name": "8.2 Preguntas de servicio: \"Do you have...?\", \"Where can I find...?\""
                            },
                            {
                                "id": "10347220-243a-461f-aeaa-ab17afb0b05c",
                                "name": "8.3 Ubicación en espacios: \"Where is the supermarket?\", \"How do I get to the bank?\""
                            },
                            {
                                "id": "1167217f-213a-4c3d-afb3-a70c5b7cbfb7",
                                "name": "8.4 Direcciones e indicaciones: \"Go straight.\", \"Turn left.\", \"Turn right.\", \"It is next to...\""
                            },
                            {
                                "id": "b0489af7-dc30-478b-bc89-921cdf3d8706",
                                "name": "8.5 Frases de cortesía: \"Excuse me.\", \"Thank you.\", \"You're welcome.\""
                            },
                            {
                                "id": "1c93c887-ab83-4946-994f-99b69e783e72",
                                "name": "8.6 Sustantivos contables e incontables avanzados: some, any, much, many, a lot of, a little, a few"
                            }
                        ]
                    },
                    {
                        "id": "0daa0f7b-2364-46e7-bc93-e45042f4a55e",
                        "name": "Tema 9: Bienes y Consumo",
                        "subthemes": [
                            {
                                "id": "9326fd45-33e3-4d25-bfd1-31c618717984",
                                "name": "9.1 Hábitos de consumo: responsible, smart, sustainable, ethical, conscious, intentional, planned, organized, disciplined, moderate, frugal, economical, thrifty, prudent, careful, discerning, selective, eco-friendly, green, ethical, fair trade, organic, local, handmade, artisanal, secondhand, vintage, antique, classic, modern, minimalist, simple, practical, functional, durable, long-lasting, quality, value, essential, necessary, useful, helpful, convenient, efficient, effective, reliable, trustworthy, honest, transparent, fair, just, equitable, accessible, affordable, inclusive, diverse, multicultural, global, local, traditional, innovative, creative, imaginative, expressive, communicative, collaborative, cooperative, respectful, responsible, sustainable, resilient, adaptable, flexible, open-minded, curious, critical, analytical, reflective, thoughtful, considerate, empathetic, compassionate, generous, kind, caring, supportive, encouraging, inspiring, motivating, empowering, uplifting, positive, optimistic, hopeful, confident, capable, competent, skillful, talented, creative, innovative, resourceful, resilient, persistent, determined, focused, disciplined, organized, balanced, healthy, harmonious, peaceful, serene, calm, centered, grounded, stable, secure, protected, safe, careful, cautious, mindful, conscious, aware, enlightened, grateful, thankful, appreciative, content, satisfied, happy, joyful, cheerful, optimistic, positive, energetic, vibrant, lively, active, dynamic, passionate, enthusiastic, motivated, determined, committed, dedicated, loyal, faithful, sincere, honest, trustworthy, reliable, responsible, dependable, loyal, faithful, constant, steady, stable, balanced, peaceful, calm, serene, quiet, tranquil, restful, relaxing, soothing, comforting, reassuring, supportive, encouraging, inspiring, motivating, uplifting, refreshing, rejuvenating, revitalizing, renewing"
                            },
                            {
                                "id": "37811915-a8f8-42ce-968d-53738d30f837",
                                "name": "9.2 Frases: \"I need to buy groceries.\", \"Let's go shopping.\""
                            },
                            {
                                "id": "31b72ad6-1b88-433d-a671-a0a7b2f8371b",
                                "name": "9.3 Preguntas: \"What do you need to buy?\", \"Where do you usually shop?\""
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "6to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "51b05032-251d-4816-82a7-dafcc17760df",
                        "themes": [
                            "Tema 7: Establecimientos Comerciales"
                        ],
                        "conceptual": "- Establecimientos comerciales: supermarket, grocery store, bakery, butcher shop, fish market, fruit market, clothing store, shoe store, electronics store, hardware store, pharmacy, bank, post office, restaurant, cafeteria, fast food, hotel, mall, department store, bookstore, stationery store, toy store, jewelry store, furniture store, home goods store, garden center, pet store, sports store, music store, movie theater, library, museum, gallery, stadium, gym, spa, salon, barbershop, laundry, dry cleaners, car wash, gas station, repair shop, mechanic, dentist, clinic, hospital, school, university, office, factory, warehouse, farm, market, plaza, arcade, amusement park, zoo, aquarium, botanical garden, national park, beach, river, lake, mountain, forest, desert, ocean, island\n- Verbos para compras: buy, sell, pay, spend, save, cost, want, need, choose, select, try, fit, wear, use, have, take, give, offer, find, lose, return, exchange, refund\n- Preguntas: \"Where can I buy...?\", \"Is there a... near here?\", \"What time does the store open/close?\"\n- Precios y dinero: \"How much is it?\", \"How much does it cost?\", \"What is the price?\"\n- Monedas: dollars, pesos, coins, bills, cash, credit card, debit card, check\n- Frases: \"I would like to buy...\", \"Can I try this on?\", \"Do you have...?\"",
                        "procedural": "- Identificar y nombrar establecimientos comerciales en inglés\n- Preguntar y responder sobre ubicación de tiendas: \"Where is the supermarket?\"\n- Preguntar y responder sobre horarios: \"What time does the store open?\"\n- Preguntar precios: \"How much does it cost?\"\n- Usar verbos de compra correctamente: buy, sell, pay, spend\n- Preguntar disponibilidad: \"Do you have...?\"\n- Participar en diálogos: en la tienda, en el supermercado\n- Usar frases de cortesía: \"I would like to...\"",
                        "attitudinal": "- Valoración de la importancia del trabajo para las personas y la sociedad\n- Respeto por la condición socioeconómica de las demás personas\n- Hábitos de consumo responsables e inteligentes\n- Importancia del ahorro\n- Cortesía y asertividad en la interacción con las demás personas\n- Respeto por los establecimientos y servicios públicos\n- Valoración de la planificación como medio para mejor aprovechamiento de recursos"
                    },
                    {
                        "id": "5129c4bb-aaa3-47c9-a38d-8a16639999e6",
                        "themes": [
                            "Tema 8: Compras y Servicios"
                        ],
                        "conceptual": "- Verbos para servicios: \"Can you help me?\", \"I need a service.\", \"Do you have this in another size/color?\"\n- Preguntas de servicio: \"Do you have...?\", \"Where can I find...?\", \"What is the price of...?\"\n- Ubicación en espacios: \"Where is the supermarket?\", \"How do I get to the bank?\"\n- Direcciones e indicaciones: \"Go straight.\", \"Turn left.\", \"Turn right.\", \"It is next to...\", \"It is between... and...\", \"It is across from...\", \"It is on the corner of... and...\", \"It is at the end of the street.\"\n- Frases de cortesía: \"Excuse me.\", \"Thank you.\", \"You're welcome.\", \"I'm sorry.\"\n- Sustantivos contables e incontables avanzados: some, any, much, many, a lot of, a little, a few\n- Preguntas: \"How much...?\", \"How many...?\"\n- Frases: \"I need to buy...\" \"Let's go shopping.\" \"I am looking for...\"",
                        "procedural": "- Preguntar y responder sobre disponibilidad de productos: \"Do you have...?\"\n- Preguntar y responder sobre precios: \"How much is it?\"\n- Pedir direcciones e indicaciones: \"Where is the bank?\"\n- Dar direcciones e indicaciones: \"Go straight and turn left.\"\n- Usar frases de cortesía: \"Excuse me, where is...?\"\n- Usar \"How much\" y \"How many\" correctamente\n- Participar en diálogos: en la tienda, en el supermercado, en la farmacia\n- Expresar necesidades de compra: \"I need to buy milk and eggs.\"\n- Describir lo que buscan: \"I am looking for a book.\"",
                        "attitudinal": "- Hábitos de consumo responsables e inteligentes\n- Importancia del ahorro\n- Cortesía y asertividad en la interacción con las demás personas\n- Respeto por los establecimientos y servicios públicos\n- Valoración de la planificación como medio para mejor aprovechamiento del tiempo y recursos\n- Responsabilidad en el manejo del dinero\n- Aprecio por el trabajo de los comerciantes y prestadores de servicios"
                    },
                    {
                        "id": "a3ed0f7c-5f31-4f94-8d27-f5f5a5b40cdc",
                        "themes": [
                            "Tema 7: Establecimientos Comerciales",
                            "Tema 9: Bienes y Consumo"
                        ],
                        "conceptual": "- Hábitos de consumo: responsible, smart, sustainable, ethical, conscious, intentional, planned, organized, disciplined, moderate, frugal, economical, thrifty, prudent, careful, discerning, selective, eco-friendly, green, fair trade, organic, local, handmade, artisanal, secondhand, vintage, antique, classic, modern, minimalist, simple, practical, functional, durable, long-lasting, quality, value\n- Bienes y servicios: essential, necessary, useful, helpful, convenient, efficient, effective, reliable, trustworthy, honest, transparent, fair, just, equitable, accessible, affordable, inclusive\n- Frases: \"I need to buy groceries.\", \"Let's go shopping.\", \"I am looking for...\", \"I would like to return this.\"\n- Preguntas: \"What do you need to buy?\", \"Where do you usually shop?\", \"How much do you spend on food?\"\n- Verbos: buy, sell, pay, spend, save, cost, want, need, choose, select, try, fit, wear, use, have, take, give, offer, find, lose, return, exchange, refund, compare, decide, plan, organize, budget, invest, donate, share\n- Sustantivos: money, cash, credit card, debit card, check, coins, bills, price, cost, value, quality, brand, model, design, size, color, material, receipt, change, discount, offer, sale, bargain, guarantee, warranty",
                        "procedural": "- Expresar necesidades de compra: \"I need to buy rice and beans.\"\n- Preguntar y responder sobre hábitos de consumo: \"Where do you usually shop?\"\n- Describir productos y sus características: \"This shirt is nice.\"\n- Comparar precios y productos: \"This is cheaper than that.\"\n- Usar vocabulario de consumo responsable: eco-friendly, sustainable, organic\n- Participar en diálogos: en el mercado, en el supermercado\n- Crear una lista de compras en inglés\n- Describir su presupuesto: \"I have 500 pesos to spend.\"",
                        "attitudinal": "- Hábitos de consumo responsables e inteligentes\n- Importancia del ahorro\n- Preferencia por opciones que impactan positivamente el medio ambiente\n- Valoración de la planificación como medio para mejor aprovechamiento del tiempo y recursos\n- Respeto por la condición socioeconómica de las demás personas\n- Cortesía y asertividad en la interacción con las demás personas\n- Reflexión crítica ante las consecuencias de sus propias decisiones\n- Valoración de la importancia del trabajo para las personas y la sociedad\n- Hábitos de consumo conscientes y sostenibles\n- Solidaridad y colaboración en el consumo responsable"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            },
            {
                "id": "60410c39-faa2-4b08-8264-556f79167e05",
                "name": "UNIDAD 4: EXPERIENCIAS PASADAS Y PLANES FUTUROS",
                "themes": [
                    {
                        "id": "97487bbf-23ed-437e-b563-835f6f9395d1",
                        "name": "Tema 10: Pasado Simple",
                        "subthemes": [
                            {
                                "id": "da653ec6-315f-41c7-9bc5-97ffae6afdef",
                                "name": "10.1 Pasado simple del verbo \"to be\": was, were"
                            },
                            {
                                "id": "31de29fb-4142-47ba-82ec-afbf48bd5974",
                                "name": "10.2 Pasado simple de verbos regulares: -ed, -d, -ied"
                            },
                            {
                                "id": "0c2d318d-6fb6-4dab-acdc-1193271b0c57",
                                "name": "10.3 Pasado simple de verbos irregulares: go-went, see-saw, write-wrote, eat-ate, drink-drank, read-read, play-played, visit-visited, travel-traveled, study-studied, work-worked, live-lived, move-moved, change-changed, decide-decided, think-thought, know-knew, say-said, tell-told, make-made, do-did, take-took, have-had, give-gave, find-found, hear-heard, see-saw, come-came, become-became, run-ran, swim-swam, sing-sang, ring-rang, drink-drank, eat-ate, fall-fell, feel-felt, forget-forgot, get-got, grow-grew, hold-held, keep-kept, leave-left, let-let, lose-lost, meet-met, pay-paid, put-put, read-read, ride-rode, rise-rose, say-said, see-saw, sell-sold, send-sent, set-set, shake-shook, shine-shone, shoot-shot, show-shown, shut-shut, sing-sang, sink-sank, sit-sat, sleep-slept, speak-spoke, spend-spent, stand-stood, steal-stole, stick-stuck, strike-struck, swear-swore, sweep-swept, swim-swam, swing-swung, take-took, teach-taught, tear-tore, tell-told, think-thought, throw-threw, understand-understood, wake-woke, wear-wore, win-won, write-wrote"
                            },
                            {
                                "id": "52d8e891-4ea5-49bc-a54d-21e4a991d868",
                                "name": "10.4 Preguntas en pasado: \"Did you...?\", \"What did you do?\""
                            },
                            {
                                "id": "b05d9353-0212-4729-a78c-2f6f5fee3c2a",
                                "name": "10.5 Negativas en pasado: \"I didn't...\", \"She didn't...\""
                            },
                            {
                                "id": "e9fd0d88-ea79-4f0a-8ee4-273552132922",
                                "name": "10.6 Expresiones de tiempo pasado: yesterday, last week, last year, last month, ago, in 2024, when I was a child"
                            },
                            {
                                "id": "e88d218c-af67-42df-b187-0715cc44adbb",
                                "name": "10.7 Narraciones de eventos pasados: \"Yesterday, I went to the park.\""
                            },
                            {
                                "id": "4b227574-42fd-4f60-a5ab-92b0128a6448",
                                "name": "10.8 Biografías simples: \"Salomé Ureña wrote many poems.\""
                            }
                        ]
                    },
                    {
                        "id": "1230f1a9-6013-44db-a60e-8eaea6ad828e",
                        "name": "Tema 11: Planes Futuros",
                        "subthemes": [
                            {
                                "id": "9f41e4a8-7741-4746-8474-e2ad8097839b",
                                "name": "11.1 Presente continuo para planes futuros: \"I am visiting my grandparents next weekend.\""
                            },
                            {
                                "id": "5b1332b1-945c-4eab-9de5-7e7d7e0f3b92",
                                "name": "11.2 Estructura \"Be going to\": \"I am going to study for a test.\""
                            },
                            {
                                "id": "172a0b56-3e61-4682-bb67-a500a0af3ec9",
                                "name": "11.3 Preguntas sobre planes: \"What are you going to do?\", \"What are you doing tomorrow?\""
                            },
                            {
                                "id": "d26ee2ee-4690-4c17-bb9c-d2a0b5800beb",
                                "name": "11.4 Invitaciones: \"Do you want to play baseball today?\""
                            },
                            {
                                "id": "c7b69d39-0eda-46de-aaba-3de41bd60fbc",
                                "name": "11.5 Estructura \"Let's\": \"Let's go dancing!\""
                            },
                            {
                                "id": "1148868b-28f3-46c2-8edd-0084f682194a",
                                "name": "11.6 Expresar intenciones: \"I plan to...\", \"I would like to...\""
                            },
                            {
                                "id": "af4e5f1d-b667-4597-817f-60506f15990e",
                                "name": "11.7 Expresiones de tiempo futuro: tomorrow, next week, next month, next year, in the future, soon, later, next weekend, next summer, next fall, next winter, next spring, soon, later, eventually, ultimately, finally, meanwhile, in the meantime, in the near future, in the distant future, long-term, short-term, immediate, upcoming, approaching, coming, near, distant, remote, future, next, following, subsequent, later, subsequent, next, upcoming, approaching, coming, future, eventual, ultimate, final, last, final, concluding, ending, finishing, closing, terminating, concluding, wrapping up, wrapping up, completing, finishing, ending, wrapping up, concluding, finishing, terminating, closing, completing, achieving, reaching, attaining, accomplishing, fulfilling, realizing, actualizing, manifesting, expressing, communicating, sharing, giving, receiving, offering, providing, delivering, presenting, showing, demonstrating, illustrating, explaining, describing, telling, narrating, recounting, relating, reporting, informing, updating, reminding, warning, advising, suggesting, recommending, proposing, offering, inviting, requesting, asking, questioning, inquiring, exploring, discovering, learning, understanding, comprehending, grasping, mastering, conquering, overcoming, surpassing, exceeding, transcending, evolving, growing, developing, maturing, progressing, advancing, moving forward, making progress, taking steps, moving ahead, getting closer, approaching, nearing, coming closer, reaching, arriving, coming, attaining, achieving, succeeding, thriving, flourishing, prospering, blossoming, blooming, shining, glowing, radiating, spreading, expanding, extending, broadening, widening, deepening, intensifying, strengthening, reinforcing, fortifying, empowering, enabling, facilitating, supporting, encouraging, motivating, inspiring, uplifting, elevating, raising, lifting, boosting, enhancing, improving, upgrading, updating, modernizing, innovating, creating, inventing, designing, developing, building, constructing, establishing, founding, forming, shaping, molding, crafting, producing, making, generating, creating, forming, building, constructing, establishing, founding, originating, initiating, starting, beginning, commencing, launching, inaugurating, opening, unveiling, revealing, displaying, showing, exhibiting, presenting, showcasing, demonstrating, illustrating, explaining, clarifying, illuminating, enlightening, educating, training, teaching, instructing, guiding, leading, directing, supervising, managing, coordinating, organizing, planning, preparing, arranging, setting up, putting together, assembling, compiling, composing, writing, drafting, editing, revising, refining, polishing, perfecting, completing, finalizing, finishing, concluding, wrapping up, ending, terminating, closing, completing, achieving, reaching, attaining, accomplishing, fulfilling, realizing, actualizing, manifesting"
                            },
                            {
                                "id": "0441c83e-c8de-4161-9588-c46473eb0f5c",
                                "name": "11.8 Verbos de planificación: plan, organize, prepare, arrange, schedule, set up, put together, assemble, compile, compose, write, draft, edit, revise, refine, polish, perfect, complete, finalize, finish, conclude"
                            }
                        ]
                    },
                    {
                        "id": "7dbd2677-5f25-446b-bcc1-f96f82e578b2",
                        "name": "Tema 12: Narración de Experiencias",
                        "subthemes": [
                            {
                                "id": "b1cca1f2-953b-4cfa-9c20-fe4566b110eb",
                                "name": "12.1 Conectores para narrar: first, then, after that, next, finally, at the end, in the end, eventually, later, meanwhile, while, when, as soon as, before, after, during, since, until, as long as, whenever, wherever, however, therefore, consequently, as a result, because of, due to, thanks to, despite, in spite of, although, even though, whereas, while, on the other hand, in contrast, similarly, likewise, like, unlike, as, such as, for example, for instance, in other words, that is, namely, specifically, particularly, especially, mainly, mostly, primarily, generally, typically, usually, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking, in general, broadly speaking, on the whole, by and large, for the most part, in most cases, usually, typically, often, sometimes, occasionally, rarely, seldom, never, always, constantly, continuously, continually, repeatedly, frequently, regularly, consistently, steadily, gradually, slowly, quickly, suddenly, immediately, instantly, promptly, directly, indirectly, eventually, ultimately, finally, lastly, last but not least, to begin with, to start with, in the first place, in the second place, in conclusion, to conclude, in summary, to summarize, in short, in brief, in a nutshell, all in all, overall, generally speaking,"
                            }
                        ]
                    }
                ],
                "grade_levels": [
                    "6to"
                ],
                "subjectId": "ingles",
                "conceptual_content": [
                    {
                        "id": "d7892709-512a-4849-bec5-723f965422e6",
                        "themes": [
                            "Tema 10: Pasado Simple"
                        ],
                        "conceptual": "- Pasado simple del verbo \"to be\": was / were\n- Pasado simple de verbos regulares: add -ed, -d, -ied\n- play → played, visit → visited, study → studied\n- Pasado simple de verbos irregulares comunes:\n- go → went, see → saw, have → had, do → did, make → made,\n- eat → ate, drink → drank, write → wrote, read → read,\n- take → took, give → gave, come → came, run → ran,\n- sing → sang, swim → swam, ride → rode, drive → drove,\n- speak → spoke, break → broke, choose → chose,\n- fly → flew, grow → grew, know → knew,\n- leave → left, meet → met, pay → paid,\n- put → put, say → said, sell → sold,\n- sit → sat, sleep → slept, tell → told,\n- think → thought, understand → understood, wear → wore, win → won\n- Preguntas en pasado: \"Did you...?\", \"What did you do...?\", \"Where did you go...?\"\n- Negativas en pasado: \"I didn't...\", \"She didn't...\"\n- Expresiones de tiempo pasado:\n- yesterday, last week, last month, last year,\n- ago (two days ago, three years ago),\n- in 2024, when I was a child,\n- last night, last weekend, last summer\n- Verbos: \"I visited my grandmother yesterday.\"\n\"She went to the park last Sunday.\"",
                        "procedural": "- Describir acciones en pasado: \"Yesterday, I went to the park.\"\n- Preguntar y responder sobre eventos pasados: \"What did you do yesterday?\"\n- Usar verbos regulares e irregulares en pasado\n- Formar preguntas en pasado: \"Did you see the movie?\"\n- Formar negativas en pasado: \"I didn't go to school.\"\n- Usar expresiones de tiempo pasado correctamente\n- Narrar eventos simples del pasado\n- Participar en diálogos sobre experiencias pasadas",
                        "attitudinal": "- Valoración de las experiencias personales\n- Interés por compartir experiencias pasadas\n- Respeto por las historias y experiencias de los demás\n- Reflexión sobre el aprendizaje del pasado\n- Curiosidad por conocer las experiencias de otros\n- Actitud positiva al recordar y narrar eventos\n- Aprecio por los recuerdos y la historia personal"
                    },
                    {
                        "id": "e9338cec-24ca-44f3-bee7-0fa573f4b484",
                        "themes": [
                            "Tema 11: Planes Futuros"
                        ],
                        "conceptual": "- Presente continuo para planes futuros:\n\"I am visiting my grandparents next weekend.\"\n\"She is traveling to New York next month.\"\n- Estructura \"Be going to\":\n\"I am going to study for a test.\"\n\"We are going to play soccer.\"\n- Preguntas sobre planes:\n\"What are you going to do?\",\n\"What are you doing tomorrow?\",\n\"Where are you going to go?\"\n- Invitaciones:\n\"Do you want to play baseball today?\"\n\"Would you like to come to my party?\"\n- Estructura \"Let's\":\n\"Let's go to the park!\"\n\"Let's watch a movie!\"\n- Expresar intenciones:\n\"I plan to...\", \"I would like to...\"\n\"I want to...\", \"I hope to...\"\n- Expresiones de tiempo futuro:\ntomorrow, next week, next month, next year,\nsoon, later, in the future, next weekend,\nnext summer, next winter, next spring,\ntonight, this weekend, this summer",
                        "procedural": "- Hablar sobre planes futuros: \"I am going to visit my aunt.\"\n- Preguntar y responder sobre planes: \"What are you going to do tomorrow?\"\n- Usar presente continuo para planes futuros: \"I am playing soccer on Saturday.\"\n- Usar \"Be going to\" para intenciones: \"I am going to study.\"\n- Hacer y responder invitaciones: \"Do you want to come?\"\n- Usar \"Let's\" para sugerencias: \"Let's go to the movies.\"\n- Usar expresiones de tiempo futuro correctamente\n- Participar en diálogos sobre planes y proyectos",
                        "attitudinal": "- Motivación para planificar el futuro\n- Responsabilidad en el cumplimiento de compromisos\n- Puntualidad y organización\n- Valoración de la planificación como medio para mejor aprovechamiento del tiempo y recursos\n- Actitud positiva hacia el futuro\n- Interés por compartir planes y proyectos\n- Respeto por los planes y proyectos de los demás"
                    },
                    {
                        "id": "29f7a26f-fc20-4a12-a036-25f9bcb0dd6c",
                        "themes": [
                            "Tema 12: Narración de Experiencias"
                        ],
                        "conceptual": "- Conectores para narrar:\nfirst, then, after that, next, finally,\nat the end, in the end, eventually, later,\nmeanwhile, while, when, as soon as,\nbefore, after, during, since, until,\nas long as, whenever, wherever, however,\ntherefore, consequently, as a result,\nbecause of, due to, thanks to,\ndespite, in spite of, although, even though,\nwhereas, on the other hand, in contrast,\nsimilarly, likewise, like, unlike\n- Biografías simples:\n\"Salomé Ureña wrote many beautiful poems.\"\n\"Juan Pablo Duarte was a leader.\"\n- Narraciones de eventos pasados:\n\"Yesterday, I went to the park. First, I played soccer. Then, I ate ice cream.\"\n- Pasado simple para narrar:\n\"I visited my grandmother. She cooked delicious food.\"\n- Verbos de narración:\ntell, narrate, recount, relate, report,\ndescribe, explain, share, mention, recall,\nremember, forget, remind, inform, update",
                        "procedural": "- Narrar experiencias pasadas: \"Last weekend, I visited my family.\"\n- Describir eventos en secuencia: \"First, I woke up. Then, I ate breakfast.\"\n- Usar conectores para organizar narraciones: first, then, after that, finally\n- Escribir biografías simples en inglés\n- Narrar eventos personales: \"I went to the beach last summer.\"\n- Preguntar y responder sobre experiencias: \"What did you do last weekend?\"\n- Usar conectores de causa y consecuencia: because, so, therefore\n- Participar en diálogos sobre experiencias pasadas",
                        "attitudinal": "- Valoración de las experiencias y recuerdos\n- Interés por compartir historias personales\n- Respeto por las narrativas de los demás\n- Empatía al escuchar experiencias ajenas\n- Orgullo por la historia y cultura propia\n- Reflexión sobre eventos pasados y su significado\n- Aprecio por la narración como forma de comunicación"
                    }
                ],
                "procedural_content": [],
                "attitudinal_content": []
            }
        ]
    }
];

export function extractUnitNumber(nameOrTitle: string): number | null {
    if (!nameOrTitle || typeof nameOrTitle !== 'string') return null;
    const str = nameOrTitle.trim();

    // 1. Matches "UNIDAD 1", "UNIDAD: 1", "UNIDAD #1", "UNIDAD - 1", "UNIDAD 2: ...", etc.
    const unidadMatch = str.match(/\bunidad\s*[:#\-]?\s*(\d+)/i);
    if (unidadMatch) return parseInt(unidadMatch[1], 10);

    // 2. Matches "PERIODO 1: UNIDAD 2" or "PERIODO 1"
    const periodoMatch = str.match(/\bperiodo\s*[:#\-]?\s*(\d+)/i);
    if (periodoMatch) return parseInt(periodoMatch[1], 10);

    // 3. Matches "BLOQUE 1", "SECUENCIA 1", "SECUENCIA: 2", "TEMA 1"
    const bloqueSecMatch = str.match(/\b(?:bloque|secuencia|tema|bloq|sec)\s*[:#\-]?\s*(\d+)/i);
    if (bloqueSecMatch) return parseInt(bloqueSecMatch[1], 10);

    // 4. Matches leading numbers like "1.", "1 -", "1:", "1 "
    const leadingMatch = str.match(/^\s*(\d+)[\.\-\:\s]/);
    if (leadingMatch) return parseInt(leadingMatch[1], 10);

    return null;
}

export function sortUnitsByNumber<T extends { name?: string; title?: string }>(units: T[]): T[] {
    return [...units].sort((a, b) => {
        const numA = extractUnitNumber(a.name || a.title || '');
        const numB = extractUnitNumber(b.name || b.title || '');

        if (numA !== null && numB !== null) {
            if (numA !== numB) return numA - numB;
        } else if (numA !== null && numB === null) {
            return -1;
        } else if (numA === null && numB !== null) {
            return 1;
        }

        return (a.name || a.title || '').localeCompare(b.name || b.title || '', undefined, { numeric: true, sensitivity: 'base' });
    });
}

export function getUnitsBySubjectAndGrade(subjectId: string, grade: string): Unit[] {
    const normSub = subjectId.toLowerCase().replace(/-sec$/, '');
    // Collect all units for the given subject regardless of how they are bucketed in mock data
    const subjectBuckets = UNIT_CURRICULUM_DATA.filter(d => 
        d.subjectId === subjectId || 
        d.subjectId.toLowerCase().replace(/-sec$/, '') === normSub
    );

    // Flatten all units
    const allUnits = subjectBuckets.flatMap(b => b.units);

    // Filter units that specifically include the requested grade in their grade_levels
    const matchingUnits = allUnits.filter(u => u.grade_levels?.includes(grade));

    // Remove duplicates based on ID (just in case)
    const uniqueUnits = Array.from(new Map(matchingUnits.map(item => [item.id, item])).values());

    return sortUnitsByNumber(uniqueUnits);
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

export interface ExtractedUnitContents {
    conceptual: string[];
    procedural: string[];
    attitudinal: string[];
}

export function extractUnitCurricularContents(unit: any): ExtractedUnitContents {
    const conceptuals: string[] = [];
    const procedurals: string[] = [];
    const attitudinals: string[] = [];

    const cleanAndAdd = (text: string, targetArr: string[]) => {
        if (!text || typeof text !== 'string') return;
        const trimmed = text.trim();
        if (!trimmed) return;
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(trimmed);
                processItem(parsed);
                return;
            } catch {}
        }
        if (!targetArr.includes(trimmed)) {
            targetArr.push(trimmed);
        }
    };

    const processBlockObj = (block: any) => {
        if (!block || typeof block !== 'object') return;
        if (block.conceptual) cleanAndAdd(block.conceptual, conceptuals);
        if (block.procedural) cleanAndAdd(block.procedural, procedurals);
        if (block.attitudinal) cleanAndAdd(block.attitudinal, attitudinals);
    };

    const processItem = (item: any) => {
        if (!item) return;
        if (Array.isArray(item)) {
            item.forEach(processItem);
        } else if (typeof item === 'string') {
            const trimmed = item.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                try {
                    const parsed = JSON.parse(trimmed);
                    processItem(parsed);
                    return;
                } catch {}
            }
            cleanAndAdd(trimmed, conceptuals);
        } else if (typeof item === 'object') {
            processBlockObj(item);
        }
    };

    if (unit) {
        processItem(unit.conceptual_content);
        if (unit.procedural_content) processItem(unit.procedural_content);
        if (unit.attitudinal_content) processItem(unit.attitudinal_content);
    }

    return {
        conceptual: conceptuals.filter(Boolean),
        procedural: procedurals.filter(Boolean),
        attitudinal: attitudinals.filter(Boolean)
    };
}
