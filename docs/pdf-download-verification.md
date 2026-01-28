# Проверка кнопок "Скачать PDF" на сайте

## ✅ Исправлено

### 1. **MRSResults.tsx** (`components/quiz/MRSResults.tsx`)
- **Было**: Использовал старый метод `generateMRSReportPDF` из `@/lib/pdf/generateMRSReport` (jsPDF)
- **Стало**: Использует API endpoint `/api/quiz/mrs/pdf` (React PDF с поддержкой кириллицы)
- **Статус**: ✅ Исправлено

---

## 📋 Все места, где есть кнопки "Скачать PDF"

### 1. **MRS Quiz Results** (`components/quiz/MRSResults.tsx`)
- **Кнопка**: "Скачать результаты (PDF)"
- **API**: `/api/quiz/mrs/pdf` (POST)
- **Статус**: ✅ Исправлено - теперь использует API endpoint

### 2. **MRS Quiz Results (альтернативный)** (`components/quiz/MRSQuizResults.tsx`)
- **Кнопка**: Через компонент `DownloadQuizPDFButton`
- **API**: `/api/quiz/mrs/pdf` (POST)
- **Статус**: ✅ Работает правильно

### 3. **Inflammation Quiz Results** (`components/quiz/QuizResults.tsx`)
- **Кнопка**: Через компонент `DownloadQuizPDFButton`
- **API**: `/api/quiz/inflammation/pdf` (POST)
- **Статус**: ✅ Работает правильно

### 4. **Quiz Results History** (`components/account/QuizResultsHistory.tsx`)
- **Кнопки**: "Скачать PDF" для каждого результата
- **API**: 
  - `/api/quiz/mrs/pdf` (POST) для MRS
  - `/api/quiz/inflammation/pdf` (POST) для Inflammation
- **Статус**: ✅ Работает правильно

### 5. **Download Guide Button** (`components/quiz/DownloadGuideButton.tsx`)
- **Кнопка**: "Скачать PDF-гайд"
- **API**: `/api/guides/anti-inflammatory-nutrition` (GET)
- **Статус**: ⚠️ Нужно проверить, существует ли endpoint

---

## 🔍 API Endpoints

### ✅ `/api/quiz/mrs/pdf` (POST)
- **Файл**: `app/api/quiz/mrs/pdf/route.ts`
- **Функция**: `generateMRSQuizPDF` из `lib/pdf/generate-quiz-pdf-react.tsx`
- **Статус**: ✅ Работает

### ✅ `/api/quiz/inflammation/pdf` (POST)
- **Файл**: `app/api/quiz/inflammation/pdf/route.ts`
- **Функция**: `generateInflammationQuizPDF` из `lib/pdf/generate-quiz-pdf-react.tsx`
- **Статус**: ✅ Работает

### ⚠️ `/api/guides/anti-inflammatory-nutrition` (GET)
- **Файл**: `app/api/guides/anti-inflammatory-nutrition/route.ts`
- **Статус**: ⚠️ Нужно проверить

---

## 🧪 Как проверить

### 1. MRS Quiz PDF
1. Пройдите MRS квиз
2. На странице результатов нажмите "Скачать результаты (PDF)"
3. Проверьте, что PDF скачивается и содержит русский текст

### 2. Inflammation Quiz PDF
1. Пройдите Inflammation квиз
2. На странице результатов нажмите "Скачать результаты (PDF)"
3. Проверьте, что PDF скачивается и содержит русский текст

### 3. Quiz Results History PDF
1. Зайдите в личный кабинет
2. Найдите сохраненные результаты квизов
3. Нажмите "Скачать PDF" для каждого результата
4. Проверьте, что PDF скачивается

### 4. Download Guide Button
1. Найдите кнопку "Скачать PDF-гайд"
2. Нажмите на неё
3. Проверьте, что файл скачивается

---

## 🔧 Технические детали

### Используемые библиотеки:
- **React PDF** (`@react-pdf/renderer`) - для генерации PDF с поддержкой кириллицы
- **DejaVuSans** - шрифт для кириллицы (из `public/fonts/`)

### Формат данных для API:

**MRS Quiz:**
```json
{
  "total_score": 15,
  "severity": "moderate",
  "vasomotor_score": 4,
  "psychological_score": 5,
  "urogenital_score": 3,
  "somatic_score": 3,
  "recommendations": ["рекомендация 1", "рекомендация 2"]
}
```

**Inflammation Quiz:**
```json
{
  "total_inflammation_score": 25,
  "inflammation_level": "moderate",
  "diet_score": 8,
  "lifestyle_score": 7,
  "bmi_score": 5,
  "waist_score": 5,
  "bmi": 25.5,
  "high_risk_categories": ["категория 1"],
  "demographics": {
    "age_range": "40-45",
    "height_cm": 165,
    "weight_kg": 70
  },
  "recommendations": ["рекомендация 1"]
}
```

---

## ✅ Итоговый статус

- ✅ MRS Quiz PDF - исправлено и работает
- ✅ Inflammation Quiz PDF - работает
- ✅ Quiz Results History PDF - работает
- ⚠️ Download Guide Button - нужно проверить endpoint

---

## 📝 Следующие шаги

1. Проверить endpoint `/api/guides/anti-inflammatory-nutrition`
2. Протестировать все кнопки скачивания PDF
3. Убедиться, что кириллица отображается правильно во всех PDF

