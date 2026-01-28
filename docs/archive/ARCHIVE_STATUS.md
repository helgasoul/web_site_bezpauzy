# Статус архива fix документов

## ✅ Создана структура архива

Архивная структура создана в `docs/archive/` с следующими категориями:

- `n8n-fixes/` - для документов об исправлениях в n8n workflow
- `quiz-results-fixes/` - для документов об исправлениях в системе результатов тестов  
- `telegram-fixes/` - для документов об исправлениях в Telegram интеграции
- `github-fixes/` - для документов об исправлениях в GitHub workflow
- `other-fixes/` - для других fix документов

## 📝 Планируемые к перемещению файлы

Следующие файлы должны быть перемещены в архив (если они существуют):

### n8n-fixes/:
- n8n-fix-generate-website-link-node.md
- n8n-fix-merge-duplicate-user-records.md
- n8n-fix-check-user-exists-node.md
- n8n-fix-duplicate-telegram-id-update.md
- n8n-fix-consent-on-link-code.md
- n8n-fix-get-link-code-empty-output.md
- n8n-fix-update-code-wrong-filter.md
- n8n-fix-duplicate-telegram-id-constraint.md
- n8n-fix-user-id-null.md
- n8n-fix-duplicate-users.md
- n8n-fix-link-code-not-found.md
- n8n-fix-log-message-details-node.md
- n8n-fix-update-user-telegram-id-expression.md
- n8n-fix-link-code-routing.md
- n8n-workflow-quick-fix.md
- n8n-workflow-fixes.md
- n8n-verify-website-user-id-flow.md

### quiz-results-fixes/:
- quiz-results-final-fix.md
- quiz-results-fix-duplicate-users.md
- quiz-results-complete-fix-guide.md
- quiz-results-fix-null-user-id.md
- quiz-results-fix-summary.md
- quiz-results-fix-instructions.md
- quiz-results-diagnostic-step-2.md
- quiz-results-debug-instructions.md
- quiz-results-diagnostic-questions.md
- quiz-results-display-issue-plan.md
- quiz-results-simple-sql-queries.md
- quiz-results-fix-user-mapping.sql
- quiz-results-update-null-user-id.sql

### telegram-fixes/:
- telegram-consent-automatic-solution.md
- telegram-consent-form-implementation.md
- telegram-consent-complete-solution.md
- telegram-handle-link-code-without-start.md
- telegram-deep-link-parameter-issue.md
- telegram-start-command-handling.md
- telegram-deep-link-format.md
- telegram-auth-tables-structure.md

### github-fixes/:
- github-desktop-no-changes-fix.md

### other-fixes/:
- pdf-font-fix.md
- chat-page-empty-fix.md

### Корень проекта (переместить в other-fixes/):
- PDF_CYRILLIC_FIX.md
- N8N_FIXES.md
- ENCODING_FIX.md

## 📋 Инструкция для перемещения

Если эти файлы существуют, переместите их в соответствующие архивные папки вручную или используйте команды:

```bash
# Для файлов в docs/
mv docs/n8n-fix-*.md docs/archive/n8n-fixes/
mv docs/quiz-results-fix-*.md docs/archive/quiz-results-fixes/
mv docs/telegram-*.md docs/archive/telegram-fixes/
mv docs/github-desktop-no-changes-fix.md docs/archive/github-fixes/

# Для файлов в корне проекта
mv PDF_CYRILLIC_FIX.md docs/archive/other-fixes/
mv N8N_FIXES.md docs/archive/n8n-fixes/
mv ENCODING_FIX.md docs/archive/other-fixes/
```

## ⚠️ Примечание

По состоянию на создание этого документа, большинство указанных файлов не найдены на диске. Возможно они были уже удалены или перемещены ранее.

Архивная структура готова к использованию для будущих fix документов, которые нужно архивировать.

