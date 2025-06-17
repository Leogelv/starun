# Telegram Mini App - Документация проекта

## Обзор

Этот проект представляет собой Telegram Mini App, построенный на современном стеке технологий с использованием архитектурного паттерна Feature Sliced Design (FSD). Проект оптимизирован для работы как внутри Telegram, так и в обычном браузере.

## Содержание документации

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Детальное описание архитектуры проекта
2. **[FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md)** - Пошаговое руководство по реализации новых функций
3. **[API_CONVENTIONS.md](./API_CONVENTIONS.md)** - Соглашения по работе с API
4. **[TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md)** - Руководство по интеграции с Telegram

## Технологический стек

- **Frontend Framework**: Next.js 15.3.2 (App Router)
- **Язык**: TypeScript
- **UI библиотеки**: Ant Design + Tailwind CSS
- **Управление состоянием**: React Query (TanStack Query)
- **База данных**: Supabase (PostgreSQL)
- **API клиент**: Axios
- **Telegram интеграция**: @telegram-apps/sdk-react

## Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Настройка переменных окружения
Создайте файл `.env.local` со следующими переменными:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Запуск проекта
```bash
npm run dev
```

## Структура проекта

```
├── app/              # Next.js App Router
├── fsd/              # Feature Sliced Design слои
│   ├── app/          # Провайдеры и глобальные стили
│   ├── entities/     # Бизнес-сущности
│   ├── pages/        # Страничные компоненты
│   └── shared/       # Общие ресурсы
├── public/           # Статические файлы
└── docs/             # Документация проекта
```

## Основные концепции

### Feature Sliced Design (FSD)
Проект следует методологии FSD, которая обеспечивает:
- Четкое разделение ответственности
- Масштабируемость кодовой базы
- Предсказуемую структуру файлов
- Изоляцию бизнес-логики

### Работа с данными
- **React Query** для кэширования и синхронизации серверного состояния
- **Supabase** для работы с базой данных
- **Axios** для HTTP-запросов

### Telegram интеграция
- Автоматическое определение Telegram-окружения
- Поддержка нативных функций (haptic feedback, back button)
- Адаптивный UI для Telegram и браузера

## Полезные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен-сборки
npm run lint         # Проверка кода линтером
npm run type-check   # Проверка типов TypeScript
```

## Где искать информацию

- **Новая функциональность**: См. [FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md)
- **API endpoints**: См. [API_CONVENTIONS.md](./API_CONVENTIONS.md)
- **Telegram-специфичный код**: См. [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md)
- **Общая архитектура**: См. [ARCHITECTURE.md](./ARCHITECTURE.md)