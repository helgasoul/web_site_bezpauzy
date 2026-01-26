#!/usr/bin/env python3
"""
Скрипт для переименования директории с символом | в имени
"""

import os
import sys
from pathlib import Path

def rename_directory():
    # Путь к директории проекта
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Старое и новое имя
    old_name = 'litrature/Загруженные в Без|паузы'
    new_name = 'litrature/Загруженные в Без-паузы'
    
    old_path = Path(old_name)
    new_path = Path(new_name)
    
    print(f"Попытка переименовать:")
    print(f"  От: {old_path}")
    print(f"  К:  {new_path}")
    print()
    
    # Проверяем существование старой директории
    if not old_path.exists():
        print(f"❌ Директория не найдена: {old_path}")
        print(f"   Абсолютный путь: {old_path.resolve()}")
        
        # Попробуем найти директорию
        litrature_path = Path('litrature')
        if litrature_path.exists():
            print(f"\nДиректории в litrature:")
            for item in litrature_path.iterdir():
                if item.is_dir():
                    print(f"  - {item.name}")
        
        sys.exit(1)
    
    # Проверяем, существует ли новая директория
    if new_path.exists():
        print(f"⚠️  Директория уже существует: {new_path}")
        response = input("Перезаписать? (y/n): ")
        if response.lower() != 'y':
            print("Отменено")
            sys.exit(0)
        # Удаляем старую
        import shutil
        shutil.rmtree(new_path)
    
    # Переименовываем
    try:
        old_path.rename(new_path)
        print(f"✅ Успешно переименовано: {old_name} -> {new_name}")
        return True
    except Exception as e:
        print(f"❌ Ошибка при переименовании: {e}")
        sys.exit(1)

if __name__ == '__main__':
    rename_directory()

