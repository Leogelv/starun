# Интеграция с Telegram

## Обзор

Этот документ описывает интеграцию приложения с Telegram Mini App Platform. Проект поддерживает работу как внутри Telegram, так и в обычном браузере (режим разработки).

## Основные компоненты

### 1. TelegramContext

**Путь**: `/fsd/app/providers/TelegramContext.tsx`

Основной провайдер для работы с Telegram SDK:

```typescript
const TelegramContext = () => {
  // Определение окружения
  const isTelegramApp = isTMA();
  
  // Инициализация SDK
  init();
  
  // Настройка поведения приложения
  postEvent('web_app_request_fullscreen');
  postEvent('web_app_setup_swipe_behavior', { 
    allow_vertical_swipe: false 
  });
  
  // Управление кнопкой "Назад"
  mountBackButton();
}
```

### 2. TelegramUser

**Путь**: `/fsd/app/providers/TelegramUser.tsx`

Автоматическая регистрация пользователей:

```typescript
const TelegramUser = () => {
  // Получение данных пользователя
  const initData = getInitData();
  const launchParams = retrieveLaunchParams();
  
  // Создание/обновление пользователя в БД
  const upsertMutation = useUpsertTgUser();
  
  useEffect(() => {
    if (telegramData?.user) {
      upsertMutation.mutate({
        telegram_id: telegramData.user.id,
        first_name: telegramData.user.firstName,
        last_name: telegramData.user.lastName,
        username: telegramData.user.username,
        language_code: telegramData.user.languageCode,
        photo_url: telegramData.user.photoUrl,
      });
    }
  }, [telegramData]);
}
```

## Telegram SDK функции

### Инициализация

```typescript
import { init, isTMA } from "@telegram-apps/sdk-react";

// Проверка, запущено ли в Telegram
if (isTMA()) {
  // Инициализация SDK
  init();
}
```

### UI управление

#### Полноэкранный режим
```typescript
import { postEvent } from "@telegram-apps/sdk-react";

// Включить полноэкранный режим
postEvent('web_app_request_fullscreen');
```

#### Управление свайпами
```typescript
// Отключить закрытие приложения свайпом вниз
postEvent('web_app_setup_swipe_behavior', { 
  allow_vertical_swipe: false 
});
```

#### Safe Area
```typescript
// Запросить информацию о безопасных зонах
postEvent('web_app_request_safe_area');
```

### Кнопка "Назад"

```typescript
import { 
  mountBackButton, 
  unmountBackButton, 
  backButton 
} from "@telegram-apps/sdk-react";

// Показать кнопку
mountBackButton();

// Обработчик нажатия
backButton.on('click', () => {
  router.back();
});

// Скрыть кнопку
unmountBackButton();
```

### Haptic Feedback

```typescript
import { hapticFeedback } from "@telegram-apps/sdk-react";

// Легкая вибрация
hapticFeedback.impactOccurred('light');

// Средняя вибрация
hapticFeedback.impactOccurred('medium');

// Сильная вибрация
hapticFeedback.impactOccurred('heavy');

// Уведомление об успехе
hapticFeedback.notificationOccurred('success');

// Уведомление об ошибке
hapticFeedback.notificationOccurred('error');
```

### Получение данных пользователя

```typescript
import { 
  getInitData, 
  retrieveLaunchParams 
} from "@telegram-apps/sdk-react";

// Получить initData
const initData = getInitData();
/*
{
  user: {
    id: 123456789,
    firstName: "Ivan",
    lastName: "Ivanov",
    username: "ivanivanov",
    languageCode: "ru",
    photoUrl: "https://..."
  },
  authDate: "2024-01-01T00:00:00Z",
  hash: "...",
  startParam: "ref123"
}
*/

// Получить параметры запуска
const launchParams = retrieveLaunchParams();
```

## Режим разработки

### Browser Mode

Для разработки вне Telegram используется режим браузера:

```typescript
// fsd/shared/mocks/telegramMocks.ts
export const isBrowserModeEnabled = () => {
  return process.env.NEXT_PUBLIC_BROWSER_MODE === 'true';
};
```

### Mock SDK

```typescript
// fsd/shared/mocks/mockTelegramSDK.ts
export const mockTelegramSDK = {
  init: () => console.log('[Mock] SDK initialized'),
  postEvent: (event: string, params?: any) => {
    console.log('[Mock] Event:', event, params);
  },
  hapticFeedback: {
    impactOccurred: (style: string) => {
      console.log('[Mock] Haptic:', style);
    }
  },
  // ... другие методы
};
```

### Настройка окружения

```env
# .env.development
NEXT_PUBLIC_BROWSER_MODE=true

# .env.production
NEXT_PUBLIC_BROWSER_MODE=false
```

## Компоненты для Telegram

### Адаптивная навигация

```typescript
// fsd/shared/components/BottomMenu.tsx
export const BottomMenu = () => {
  const handleClick = () => {
    // Haptic feedback при клике
    if (isBrowserModeEnabled()) {
      mockTelegramSDK.hapticFeedback.impactOccurred('medium');
    } else {
      hapticFeedback.impactOccurred('medium');
    }
  };
  
  return (
    <div className="fixed bottom-0 safe-area-bottom">
      {/* Навигация с учетом safe area */}
    </div>
  );
};
```

### Заглушка для браузера

```typescript
// fsd/shared/components/ClientUnsupported.tsx
export const ClientUnsupported = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1>Приложение доступно только в Telegram</h1>
        <p>Откройте это приложение через Telegram</p>
      </div>
    </div>
  );
};
```

## Структура данных пользователя

### Telegram User
```typescript
interface TelegramUser {
  id: number;           // Telegram ID
  firstName: string;    // Имя
  lastName?: string;    // Фамилия
  username?: string;    // Username без @
  languageCode?: string;// Код языка (ru, en)
  photoUrl?: string;    // URL фото профиля
  isPremium?: boolean;  // Premium статус
}
```

### База данных (tg_users)
```sql
CREATE TABLE tg_users (
  telegram_id BIGINT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language_code TEXT,
  photo_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  -- Дополнительные поля приложения
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);
```

## Безопасность

### Валидация InitData

```typescript
// На сервере
import crypto from 'crypto';

function validateTelegramData(initData: string, botToken: string) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

### Проверка авторизации

```typescript
// app/api/middleware.ts
export async function checkTelegramAuth(request: Request) {
  const initData = request.headers.get('X-Telegram-Init-Data');
  
  if (!initData) {
    throw new Error('Unauthorized');
  }
  
  const isValid = validateTelegramData(
    initData, 
    process.env.TELEGRAM_BOT_TOKEN!
  );
  
  if (!isValid) {
    throw new Error('Invalid init data');
  }
}
```

## Лучшие практики

### 1. Всегда проверяйте окружение

```typescript
const isInTelegram = isTMA();

if (isInTelegram) {
  // Telegram-specific код
} else {
  // Fallback для браузера
}
```

### 2. Используйте Haptic Feedback

Добавляйте тактильную обратную связь для важных действий:

```typescript
// При успешном действии
hapticFeedback.notificationOccurred('success');

// При ошибке
hapticFeedback.notificationOccurred('error');

// При нажатии кнопок
hapticFeedback.impactOccurred('light');
```

### 3. Адаптивный дизайн

```css
/* Учитывайте safe areas */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 4. Оптимизация производительности

- Минимизируйте размер bundle
- Используйте lazy loading
- Оптимизируйте изображения
- Кэшируйте данные с React Query

### 5. Обработка ошибок

```typescript
try {
  init();
} catch (error) {
  console.error('Failed to initialize Telegram SDK:', error);
  // Показать fallback UI
}
```

## Отладка

### Логирование событий

```typescript
// В режиме разработки
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('telegram-event', (e) => {
    console.log('Telegram Event:', e);
  });
}
```

### Telegram Web App Debugger

Используйте официальный отладчик:
1. Откройте [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. `Bot Settings` → `Menu Button` → `Configure menu button`
4. Добавьте `?debug=1` к URL вашего приложения

## Полезные ссылки

- [Telegram Mini Apps Documentation](https://docs.telegram-mini-apps.com/)
- [Official Telegram Bot API](https://core.telegram.org/bots/webapps)
- [@telegram-apps/sdk-react](https://www.npmjs.com/package/@telegram-apps/sdk-react)
- [Telegram Web App Examples](https://github.com/telegram-mini-apps)