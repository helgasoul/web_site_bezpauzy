#!/usr/bin/env python3
"""
Скрипт для чтения и перевода The Pause Life Lab Checklist на русский
"""

import sys
import os

try:
    from docx import Document
except ImportError:
    print("❌ Ошибка: библиотека python-docx не установлена.")
    print("📦 Установите её командой: pip install python-docx")
    sys.exit(1)

def read_docx(file_path):
    """Читает DOCX файл и возвращает текст"""
    try:
        doc = Document(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        return '\n\n'.join(paragraphs)
    except Exception as e:
        print(f"❌ Ошибка при чтении файла: {e}")
        return None

if __name__ == '__main__':
    # Путь к файлу
    file_path = 'litrature/Загруженные в Без|паузы/Imaging in Management of Breast Diseases Volume 2, Disease-Based Approach 2025_split/The_Pause_Life_Lab_Checklist.docx'
    
    # Проверяем существование файла
    if not os.path.exists(file_path):
        print(f"❌ Файл не найден: {file_path}")
        sys.exit(1)
    
    print(f"📄 Читаю файл: {file_path}")
    text = read_docx(file_path)
    
    if text:
        print(f"\n✅ Прочитано {len(text)} символов\n")
        print("=" * 80)
        print(text[:3000])  # Первые 3000 символов
        print("=" * 80)
        
        # Сохраняем в файл для дальнейшей обработки
        output_path = 'litrature/converted/frax-checklist-raw.txt'
        os.makedirs('litrature/converted', exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"\n💾 Сохранено в: {output_path}")
    else:
        print("❌ Не удалось прочитать файл")
        sys.exit(1)

