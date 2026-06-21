import os

filepath = r"c:\Users\Yeri Orlando\Desktop\Planix Nuevo\Planix1\src\pages\AdminCurriculum.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add MATEMATICA_1RO_METADATA and normalizeSequenceForEditor before "export default function AdminCurriculum()"
helper_code = '''// Official Matemática 1er Grado metadata from Supabase
const MATEMATICA_1RO_METADATA: Record<string, { title: string; description: string; order: number; durationWeeks: number }> = {
  'seq-1-matematica-1ro': {
    title: '\\u00bfCu\\u00e1ntos hay?',
    description: 'Conteo y reconocimiento de cantidades para saber cu\\u00e1ntos elementos hay en una colecci\\u00f3n.',
    order: 1,
    durationWeeks: 4
  },
  'seq-2-matematica-1ro': {
    title: 'N\\u00fameros y Problemas',
    description: 'Uso de los n\\u00fameros para resolver situaciones sencillas de la vida cotidiana.',
    order: 2,
    durationWeeks: 4
  },
  'seq-3-matematica-1ro': {
    title: 'El Circo',
    description: 'Comparaci\\u00f3n de cantidades y uso de n\\u00fameros en contextos l\\u00fadicos.',
    order: 3,
    durationWeeks: 4
  },
  'seq-4-matematica-1ro': {
    title: 'Juegos, sumas y restas',
    description: 'Resoluci\\u00f3n de sumas y restas simples mediante juegos y actividades pr\\u00e1cticas.',
    order: 4,
    durationWeeks: 4
  },
  'seq-5-matematica-1ro': {
    title: '\\u00a1Feliz Cumplea\\u00f1os!',
    description: 'Uso de n\\u00fameros para ordenar, contar y reconocer el paso del tiempo.',
    order: 5,
    durationWeeks: 4
  },
  'seq-6-matematica-1ro': {
    title: '\\u00a1Cosas Sabrosas!',
    description: 'Conteo, comparaci\\u00f3n y resoluci\\u00f3n de problemas con alimentos y situaciones cercanas.',
    order: 6,
    durationWeeks: 4
  }
};

/**
 * Normalizes any raw sequence (local JSON or DB override) to the standard editor schema.
 * Handles field name mismatches between Lengua (id/title) and Matemática (sequenceId/sequenceTitle).
 */
const normalizeSequenceForEditor = (seq: any, id: string): any => {
  if (!seq) return null;
  const normalized = JSON.parse(JSON.stringify(seq)); // deep clone

  // Check if we have official metadata for this sequence
  const officialMeta = MATEMATICA_1RO_METADATA[id];

  // Root metadata normalization
  normalized.id = normalized.id || normalized.sequenceId || id;
  normalized.title = normalized.title || normalized.sequenceTitle || officialMeta?.title || "";
  normalized.gradeId = normalized.gradeId || "primaria-1ro";
  normalized.subjectId = normalized.subjectId || (id.includes('matematica') ? 'matematica' : 'lengua');
  if (normalized.subjectId === 'matematica-1ro') normalized.subjectId = 'matematica';

  // Order
  if (normalized.order === undefined || normalized.order === null || normalized.order === '') {
    if (officialMeta) {
      normalized.order = officialMeta.order;
    } else {
      const matched = id.match(/seq-(\\d+)/);
      normalized.order = matched ? parseInt(matched[1]) : 1;
    }
  }

  // Duration
  if (normalized.durationWeeks === undefined || normalized.durationWeeks === null || normalized.durationWeeks === '') {
    normalized.durationWeeks = officialMeta?.durationWeeks || 4;
  }

  // Description
  if (!normalized.description) {
    normalized.description = officialMeta?.description || "";
  }

  // Normalize nested blocks, activities, and moments
  if (Array.isArray(normalized.blocks)) {
    normalized.blocks = normalized.blocks.map((blk: any, bIdx: number) => {
      const b = { ...blk };
      b.id = b.id || `blk-${id}-${bIdx + 1}`;
      b.title = b.title || b.blockTitle || `Bloque ${b.blockNumber || (bIdx + 1)}`;
      b.blockNumber = b.blockNumber !== undefined ? b.blockNumber : bIdx + 1;

      if (Array.isArray(b.activities)) {
        b.activities = b.activities.map((act: any, aIdx: number) => {
          const a = { ...act };
          a.id = a.id || `act-${id}-${bIdx + 1}-${aIdx + 1}`;
          a.title = a.title || a.activityTitle || `Actividad ${aIdx + 1}`;

          if (Array.isArray(a.moments)) {
            a.moments = a.moments.map((mom: any, mIdx: number) => {
              const m = { ...mom };
              // Matemática uses "title", editor expects "titulo"
              m.titulo = m.titulo || m.title || `Momento ${mIdx + 1}`;
              m.description = m.description || m.descripcion || "";
              return m;
            });
          }
          return a;
        });
      }
      return b;
    });
  }

  return normalized;
};

export default function AdminCurriculum() {'''

target = "export default function AdminCurriculum() {"
if target in content:
    content = content.replace(target, helper_code, 1)
    print("Step 1: Inserted MATEMATICA_1RO_METADATA + normalizeSequenceForEditor before component")
else:
    print("ERROR: Could not find 'export default function AdminCurriculum() {'")
    exit(1)

# 2. Replace the selection useEffect to call normalizeSequenceForEditor
old_use_effect = """  // Populate editor when selections change
  useEffect(() => {
    if (selectedSeqId) {
      const override = dbOverrides[selectedSeqId];
      const local = LOCAL_SEQUENCES[selectedSeqId];
      if (override) {
        // Merge with local fallback defaults for root level fields (like order, durationWeeks, description)
        const merged = {
          ...local,
          ...override,
          order: override.order !== undefined && override.order !== null && override.order !== '' ? override.order : local?.order,
          durationWeeks: override.durationWeeks !== undefined && override.durationWeeks !== null && override.durationWeeks !== '' ? override.durationWeeks : local?.durationWeeks,
          description: override.description !== undefined && override.description !== null && override.description !== '' ? override.description : local?.description,
          blocks: override.blocks || local?.blocks || []
        };
        setEditingSequence(JSON.parse(JSON.stringify(merged))); // Deep copy
      } else {
        if (local) {
          setEditingSequence(JSON.parse(JSON.stringify(local))); // Deep copy
        }
      }
    }
  }, [selectedSeqId, dbOverrides]);"""

new_use_effect = """  // Populate editor when selections change (with normalization for Matemática field mismatches)
  useEffect(() => {
    if (selectedSeqId) {
      const override = dbOverrides[selectedSeqId];
      const local = LOCAL_SEQUENCES[selectedSeqId];

      let merged: any = null;
      if (override) {
        // Merge with local fallback defaults
        merged = {
          ...local,
          ...override,
          blocks: override.blocks || local?.blocks || []
        };
      } else if (local) {
        merged = local;
      }

      if (merged) {
        const normalized = normalizeSequenceForEditor(merged, selectedSeqId);
        setEditingSequence(normalized);
      } else {
        setEditingSequence(null);
      }
    }
  }, [selectedSeqId, dbOverrides]);"""

if old_use_effect in content:
    content = content.replace(old_use_effect, new_use_effect, 1)
    print("Step 2: Replaced selection useEffect with normalization call")
else:
    # Fallback: find by comment and endpoint
    start_marker = "// Populate editor when selections change"
    end_marker = "}, [selectedSeqId, dbOverrides]);"
    start_idx = content.find(start_marker)
    if start_idx != -1:
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            end_idx += len(end_marker)
            content = content[:start_idx] + new_use_effect + content[end_idx:]
            print("Step 2 (fallback): Replaced selection useEffect using marker-based matching")
        else:
            print("ERROR: Could not find end of selection useEffect")
            exit(1)
    else:
        print("ERROR: Could not find selection useEffect start comment")
        exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSuccessfully patched AdminCurriculum.tsx with official Supabase metadata!")
