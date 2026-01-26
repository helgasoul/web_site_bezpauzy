# Папка для готовых PDF гайдов

Поместите сюда готовые PDF файлы гайдов.

## Структура файлов

Файлы должны быть названы согласно маппингу в `app/api/guides/[guideId]/route.ts`:

- `Гайд_по_противовоспалительному_питанию.pdf` - для гайда по противовоспалительному питанию (guideId: `anti-inflammatory-nutrition`)
- `Гайд_по_улучшению_сна_в_менопаузе.pdf` - для гайда по сну (guideId: `sleep-improvement`)
- `Гайд_по_управлению_приливами.pdf` - для гайда по приливам (guideId: `hot-flashes-management`)
- `Гайд_по_здоровью_костей_в_менопаузе.pdf` - для гайда по костям (guideId: `bone-health`)

## Как добавить новый гайд

1. Поместите PDF файл в эту папку с правильным именем
2. Добавьте маппинг в `app/api/guides/[guideId]/route.ts` в объект `guideFiles`
3. Обновите `components/resources/GuidesPage.tsx` - добавьте `downloadComponent` с правильным `guideId`

## Пример

```typescript
// В app/api/guides/[guideId]/route.ts
const guideFiles: Record<string, { filename: string, displayName: string }> = {
  'my-new-guide': {
    filename: 'Мой_новый_гайд.pdf',
    displayName: 'Мой новый гайд.pdf'
  },
}
```

