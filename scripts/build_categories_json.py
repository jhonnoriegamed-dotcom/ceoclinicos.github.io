# Genera questions/es/categories.json desde los archivos en questions/es/categories/
# Ejecutar desde website_clinicos: python scripts/build_categories_json.py

import os
import json

DIR = os.path.join(os.path.dirname(__file__), '..', 'questions', 'es', 'categories')
OUT = os.path.join(os.path.dirname(__file__), '..', 'questions', 'es', 'categories.json')

NAME_BY_ID = {
    'anatomia': 'Anatomía', 'cardiologia': 'Cardiología', 'cirugia': 'Cirugía',
    'embriologia': 'Embriología', 'endocrinologia': 'Endocrinología', 'farmacologia': 'Farmacología',
    'fisiologia': 'Fisiología', 'fisiopatologia': 'Fisiopatología', 'gastroenterologia': 'Gastroenterología',
    'gineco_obstetricia': 'Gineco-Obstetricia', 'histologia': 'Histología', 'medicina_interna': 'Medicina Interna',
    'microbiologia': 'Microbiología', 'neurologia': 'Neurología', 'neumonologia': 'Neumonología',
    'odontologia': 'Odontología', 'oftalmologia': 'Oftalmología', 'otorrinolaringologia': 'Otorrinolaringología',
    'parasitologia': 'Parasitología', 'pediatria': 'Pediatría', 'psiquiatria': 'Psiquiatría',
    'traumatologia': 'Traumatología', 'urologia': 'Urología', 'general': 'General',
    'true_false_general': 'Verdadero/Falso',
}

def id_to_name(cat_id):
    if cat_id in NAME_BY_ID:
        return NAME_BY_ID[cat_id]
    return cat_id.replace('_', ' ').title()

def main():
    if not os.path.isdir(DIR):
        print('No existe la carpeta:', DIR)
        return
    entries = []
    seen = set()
    for f in sorted(os.listdir(DIR)):
        if not f.endswith('.json'):
            continue
        base = f.replace('_questions.json', '').replace('_questions_en.json', '').replace('_questions_pt.json', '')
        if not base or base in seen:
            continue
        seen.add(base)
        entries.append({'id': base, 'name': id_to_name(base)})
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as out:
        json.dump(entries, out, ensure_ascii=False, indent=2)
    print('Escrito', OUT, 'con', len(entries), 'categorías.')

if __name__ == '__main__':
    main()
