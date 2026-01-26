#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для конвертации PDF файла о сердечно-сосудистых заболеваниях в Markdown
"""

import pdfplumber
import os
import sys

def find_and_convert():
    """Находит и конвертирует PDF файл"""
    # Ищем файл через os.walk
    base_dir = '.'
    target_file = None
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if '21.0_pp_144_154_Cardiovascular_Disease_and_the_Menopause.pdf' in file:
                target_file = os.path.join(root, file)
                break
        if target_file:
            break
    
    if not target_file:
        print("❌ Файл не найден")
        sys.exit(1)
    
    print(f"Найден файл: {target_file}")
    
    output_file = target_file.replace('.pdf', '.md')
    
    try:
        text_content = []
        with pdfplumber.open(target_file) as pdf:
            print(f"Открыт PDF, страниц: {len(pdf.pages)}")
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    text_content.append(text)
                print(f"Страница {i+1}: {len(text) if text else 0} символов")
        
        full_text = '\n\n'.join(text_content)
        
        filename = os.path.basename(target_file).replace('.pdf', '')
        markdown = f'# {filename}\n\n{full_text}'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        print(f'✅ Конвертировано: {target_file} -> {output_file}')
        print(f'Размер markdown: {len(markdown)} символов')
        print(f'Количество страниц: {len(text_content)}')
        
    except Exception as e:
        import traceback
        print(f'❌ Ошибка: {str(e)}')
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    find_and_convert()

