-- Script para corregir los grados incorrectos de las unidades de Sociales y Naturales de 4to grado
-- en la base de datos D1.

-- 1. Mover las unidades de Sociales que corresponden a 5to de Primaria
UPDATE custom_units 
SET grade_id = '5to', 
    content = json_set(content, '$.grade_levels', json_array('5to'))
WHERE id = 'b4250e10-34ce-4125-869c-782e395effeb'; -- Geografía del Caribe y las Antillas

UPDATE custom_units 
SET grade_id = '5to', 
    content = json_set(content, '$.grade_levels', json_array('5to'))
WHERE id = '7244e219-15e4-4194-85ac-7715454eddfa'; -- Origen y formación del pueblo dominicano

-- 2. Mover las unidades de Sociales que corresponden a 6to de Primaria
UPDATE custom_units 
SET grade_id = '6to', 
    content = json_set(content, '$.grade_levels', json_array('6to'))
WHERE id = '46160d3b-f9bd-4ce7-b632-a7a37fa11878'; -- Características de la Isla de Santo Domingo XVII y XVIII

UPDATE custom_units 
SET grade_id = '6to', 
    content = json_set(content, '$.grade_levels', json_array('6to'))
WHERE id = '953af061-82b4-4b9b-b7f4-2ef058b81d93'; -- Siglo XIX: primera mitad

UPDATE custom_units 
SET grade_id = '6to', 
    content = json_set(content, '$.grade_levels', json_array('6to'))
WHERE id = '1fa7ba0a-18cb-45ec-93fb-34c3a03a7631'; -- Convivencia humana

-- 3. Eliminar las unidades genéricas redundantes de Naturales de 4to grado
DELETE FROM custom_units 
WHERE id IN (
    'a381f5fc-38bf-4bb1-9235-9bc53ab48d00', -- Ciencias de la tierra y el universo
    '32556908-8127-4713-ab62-f080d0422071', -- Ciencias de la vida
    '478b0a16-3c48-40a8-87fa-f6343d784ab9'  -- Ciencias físicas
);
