#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для конвертации одного PDF файла в Markdown
"""

import sys
import os

try:
    import PyPDF2
except ImportError:
    try:
        import pdfplumber
    except ImportError:
        print("❌ Необходимо установить PyPDF2 или pdfplumber")
        print("Выполните: pip install PyPDF2 или pip install pdfplumber")
        sys.exit(1)

def convert_pdf_to_markdown(pdf_path, output_path=None):
    """Конвертирует PDF в Markdown"""
    try:
        if not os.path.exists(pdf_path):
            print(f"❌ Файл не найден: {pdf_path}")
            sys.exit(1)
        
        # Пробуем использовать pdfplumber (лучше для извлечения текста)
        try:
            import pdfplumber
            text_content = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)
            full_text = "\n\n".join(text_content)
        except:
            # Fallback на PyPDF2
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_content = []
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        text_content.append(text)
                full_text = "\n\n".join(text_content)
        
        # Базовая конвертация в markdown
        filename = os.path.basename(pdf_path).replace('.pdf', '')
        markdown = f"# {filename}\n\n"
        
        # Разбиваем на строки и обрабатываем
        lines = full_text.split('\n')
        markdown_lines = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if not line:
                if markdown_lines and markdown_lines[-1] != '':
                    markdown_lines.append('')
                continue
            
            # Простое определение заголовков
            if line.isupper() and len(line) > 3 and len(line) < 100 and not line.isdigit():
                if i > 0 and markdown_lines and markdown_lines[-1] != '':
                    markdown_lines.append('')
                markdown_lines.append(f"## {line}")
                markdown_lines.append('')
            else:
                markdown_lines.append(line)
        
        markdown += "\n".join(markdown_lines)
        
        # Убираем лишние пустые строки
        markdown = "\n".join([line for i, line in enumerate(markdown.split('\n')) 
                              if i == 0 or line != '' or markdown.split('\n')[i-1] != ''])
        
        # Сохраняем результат
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            print(f"✅ Конвертировано: {pdf_path} -> {output_path}")
        else:
            print(markdown)
        
        return markdown
    
    except Exception as e:
        print(f"❌ Ошибка при конвертации {pdf_path}: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python scripts/convert_pdf_single.py <path-to-pdf> [output-path]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else pdf_path.replace('.pdf', '.md')
    
    convert_pdf_to_markdown(pdf_path, output_path)

