#!/bin/bash

# Скрипт для конвертации PDF файлов в markdown
# Использует Python для обхода директорий и Node.js для конвертации

cd "$(dirname "$0")/.."

# Функция для конвертации одного PDF
convert_pdf() {
    local pdf_file="$1"
    local md_file="$2"
    
    echo "Конвертирую: $pdf_file"
    
    node scripts/pdf-to-markdown.js "$pdf_file" "$md_file" 2>&1
}

# Используем Python для поиска файлов (обходит проблемы с кодировкой)
python3 << 'PYTHON_SCRIPT'
import os
import subprocess
import sys

def find_and_convert():
    base_dir = 'litrature'
    
    # Словарь для конвертации
    files_to_convert = {
        '16.0_pp_98_104_Libido_and_Sexual_Function_in_the_Menopause.pdf': 'litrature/16.0_Libido_and_Sexual_Function_in_the_Menopause.md',
        '20.0_pp_135_143_Hormonal_Management_of_Osteoporosis_during_the_Menopause.pdf': 'litrature/20.0_Hormonal_Management_of_Osteoporosis.md',
        'EMAS position statement- Vitamin D and postmenopausal health.pdf': 'litrature/EMAS_Vitamin_D_postmenopausal_health.md'
    }
    
    found_files = {}
    
    # Ищем файлы
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file in files_to_convert:
                full_path = os.path.join(root, file)
                output_path = files_to_convert[file]
                found_files[full_path] = output_path
                print(f"Найден: {full_path}")
                print(f"  -> {output_path}")
    
    if not found_files:
        print("❌ Файлы не найдены!")
        print("\nПопробуйте запустить скрипт из корня проекта:")
        print("  cd /path/to/project")
        print("  bash scripts/convert-pdfs.sh")
        sys.exit(1)
    
    print(f"\n✅ Найдено файлов: {len(found_files)}")
    print("\nНачинаю конвертацию...\n")
    
    # Конвертируем каждый файл
    for pdf_path, md_path in found_files.items():
        print(f"\n{'='*60}")
        print(f"Конвертирую: {os.path.basename(pdf_path)}")
        print(f"{'='*60}")
        
        try:
            # Используем Node.js скрипт
            result = subprocess.run(
                ['node', 'scripts/pdf-to-markdown.js', pdf_path, md_path],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            
            if result.returncode == 0:
                print(f"✅ Успешно: {md_path}")
            else:
                print(f"❌ Ошибка при конвертации {pdf_path}:")
                print(result.stderr)
                
        except Exception as e:
            print(f"❌ Исключение при конвертации {pdf_path}: {str(e)}")

if __name__ == '__main__':
    find_and_convert()
PYTHON_SCRIPT

echo ""
echo "Готово!"

