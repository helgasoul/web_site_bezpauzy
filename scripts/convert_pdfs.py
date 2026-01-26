#!/usr/bin/env python3
"""
Скрипт для конвертации PDF в Markdown
Обрабатывает пути с кириллицей и специальными символами
"""

import os
import sys
import subprocess
from pathlib import Path

def find_pdf_files(base_dir):
    """Находит PDF файлы в директории"""
    pdf_files = {}
    
    # Целевые файлы для конвертации
    targets = {
        '16.0_pp_98_104_Libido_and_Sexual_Function_in_the_Menopause.pdf': 'litrature/16.0_Libido_and_Sexual_Function_in_the_Menopause.md',
        '20.0_pp_135_143_Hormonal_Management_of_Osteoporosis_during_the_Menopause.pdf': 'litrature/20.0_Hormonal_Management_of_Osteoporosis.md',
        'EMAS position statement- Vitamin D and postmenopausal health.pdf': 'litrature/EMAS_Vitamin_D_postmenopausal_health.md'
    }
    
    # Получаем абсолютный путь к базовой директории
    base_path = Path(base_dir).resolve()
    
    print(f"Ищу файлы в: {base_path}")
    
    # Ищем файлы рекурсивно
    for pdf_file in base_path.rglob('*.pdf'):
        filename = pdf_file.name
        if filename in targets:
            pdf_files[str(pdf_file)] = targets[filename]
            print(f"✅ Найден: {pdf_file}")
    
    return pdf_files

def convert_pdf(pdf_path, md_path):
    """Конвертирует PDF в Markdown используя Node.js скрипт"""
    script_path = Path(__file__).parent.parent / 'scripts' / 'pdf-to-markdown.js'
    
    if not script_path.exists():
        print(f"❌ Скрипт не найден: {script_path}")
        return False
    
    try:
        print(f"\nКонвертирую: {Path(pdf_path).name}")
        print(f"  -> {md_path}")
        
        result = subprocess.run(
            ['node', str(script_path), pdf_path, md_path],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        
        if result.returncode == 0:
            print(f"✅ Успешно!")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ Ошибка:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Исключение: {str(e)}")
        return False

def main():
    # Определяем рабочую директорию
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    base_dir = 'litrature'
    
    if not Path(base_dir).exists():
        print(f"❌ Директория не найдена: {base_dir}")
        sys.exit(1)
    
    # Ищем PDF файлы
    pdf_files = find_pdf_files(base_dir)
    
    if not pdf_files:
        print("\n❌ PDF файлы не найдены!")
        print("\nПопробуйте запустить из корня проекта:")
        print("  python3 scripts/convert_pdfs.py")
        sys.exit(1)
    
    print(f"\n✅ Найдено файлов для конвертации: {len(pdf_files)}\n")
    
    # Конвертируем каждый файл
    success_count = 0
    for pdf_path, md_path in pdf_files.items():
        if convert_pdf(pdf_path, md_path):
            success_count += 1
        print()
    
    print(f"\n{'='*60}")
    print(f"Готово! Конвертировано: {success_count}/{len(pdf_files)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

