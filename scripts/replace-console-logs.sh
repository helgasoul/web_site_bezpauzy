#!/bin/bash

# Скрипт для замены console.log/error/warn на logger в API routes
# Использование: ./scripts/replace-console-logs.sh

API_DIR="app/api"

# Функция для замены console.* на logger.*
replace_console() {
    local file=$1
    
    # Проверяем, есть ли импорт logger
    if ! grep -q "import { logger }" "$file"; then
        # Находим последний импорт
        last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        
        if [ -n "$last_import_line" ]; then
            # Добавляем импорт logger после последнего импорта
            sed -i.bak "${last_import_line}a\\
import { logger } from '@/lib/logger'
" "$file"
            rm -f "${file}.bak"
        fi
    fi
    
    # Заменяем console.log на logger.debug (для отладочных сообщений)
    sed -i.bak 's/console\.log(/logger.debug(/g' "$file"
    
    # Заменяем console.error на logger.error
    sed -i.bak 's/console\.error(/logger.error(/g' "$file"
    
    # Заменяем console.warn на logger.warn
    sed -i.bak 's/console\.warn(/logger.warn(/g' "$file"
    
    rm -f "${file}.bak"
}

# Находим все .ts файлы в app/api
find "$API_DIR" -name "*.ts" -type f | while read file; do
    # Проверяем, есть ли console.log/error/warn в файле
    if grep -q "console\.\(log\|error\|warn\)" "$file"; then
        echo "Processing: $file"
        replace_console "$file"
    fi
done

echo "Done! Все console.log/error/warn заменены на logger."
