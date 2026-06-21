import json, sys

with open('supabase_sequences.json', 'r', encoding='utf-8-sig') as f:
    raw = json.load(f)

# Handle PowerShell wrapping in {"value": [...]}
if isinstance(raw, dict) and 'value' in raw:
    sequences = raw['value']
elif isinstance(raw, list):
    sequences = raw
else:
    print("Unexpected format:", type(raw))
    sys.exit(1)

print(f"Total sequences in DB: {len(sequences)}")
print()

# Find all Matematica 1ro sequences
math_seqs = [s for s in sequences if 'matematica' in (s.get('subject_id') or '').lower() and '1ro' in (s.get('grade_id') or '').lower()]

print(f"Matematica 1ro sequences found: {len(math_seqs)}")
print()

for seq in math_seqs:
    print("=" * 80)
    print(f"  ID:             {seq.get('id')}")
    print(f"  subject_id:     {seq.get('subject_id')}")
    print(f"  grade_id:       {seq.get('grade_id')}")
    print(f"  title:          {seq.get('title')}")
    print(f"  order:          {seq.get('order')}")
    print(f"  description:    {seq.get('description')}")
    print(f"  duration_weeks: {seq.get('duration_weeks')}")
    print(f"  created_at:     {seq.get('created_at')}")
    blocks = seq.get('blocks', [])
    print(f"  blocks count:   {len(blocks)}")
    for bIdx, blk in enumerate(blocks):
        title = blk.get('title', 'N/A')
        acts = blk.get('activities', [])
        print(f"    Block {bIdx+1}: {title} ({len(acts)} activities)")
    
    # Also check content_data for sequenceTitle
    cd = seq.get('content_data', {})
    if cd:
        print(f"  content_data.sequenceTitle: {cd.get('sequenceTitle')}")
        print(f"  content_data.sequenceId:    {cd.get('sequenceId')}")
        print(f"  content_data.duration_weeks: {cd.get('duration_weeks')}")
    print()

# Also dump full JSON for these sequences to a separate file
with open('scratch/math_1ro_sequences_full.json', 'w', encoding='utf-8') as f:
    json.dump(math_seqs, f, indent=2, ensure_ascii=False)
print(f"\nFull data dumped to scratch/math_1ro_sequences_full.json")
