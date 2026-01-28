# Админ-панель "Без |Паузы"

## 🚀 Быстрый старт

### 1. Создайте первого суперадмина

```bash
npm run admin:create admin@bezpauzy.com YourSecurePassword123
```

### 2. Настройте JWT_SECRET в `.env.local`

```env
JWT_SECRET=your-very-secure-random-string-here
```

**Генерация:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Запустите и войдите

```bash
npm run dev
```

Откройте: `http://localhost:3000/admin/login`

---

## 📁 Структура

```
app/admin/
├── login/          - Страница входа
├── page.tsx        - Dashboard
├── layout.tsx      - Layout с sidebar и header
└── [разделы]/      - Остальные разделы

lib/admin/
├── auth.ts         - Авторизация и проверка ролей
└── middleware.ts   - Middleware для защиты routes

components/admin/
├── AdminSidebar.tsx    - Боковое меню
├── AdminHeader.tsx     - Верхняя панель
├── DashboardStats.tsx  - Статистика на dashboard
└── DashboardCharts.tsx - Графики на dashboard
```

---

## ✅ Что готово

- ✅ Авторизация (login/logout)
- ✅ Dashboard с базовой статистикой
- ✅ Система ролей (RBAC)
- ✅ Sidebar с навигацией
- ✅ Header с поиском
- ✅ Middleware для защиты routes

---

## 🚧 В разработке

- ⏳ Раздел "Пользователи"
- ⏳ Раздел "Заказы"
- ⏳ Раздел "Блог"
- ⏳ Остальные разделы

---

## 📚 Документация

- `docs/ADMIN_PANEL_SPEC.md` - Полная спецификация
- `docs/ADMIN_PANEL_DECISIONS.md` - Решения по архитектуре
- `docs/ADMIN_PANEL_SETUP.md` - Инструкция по настройке
- `docs/ADMIN_PANEL_QUICKSTART.md` - Быстрый старт
