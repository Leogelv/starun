# Руководство по реализации новых функций

## Обзор процесса

Это пошаговое руководство описывает стандартный процесс добавления новой функциональности в проект. Процесс следует архитектуре FSD и обеспечивает консистентность кода.

## Пошаговый процесс реализации

### Шаг 1: Создание таблицы в Supabase

**Где**: Supabase Dashboard → Table Editor

**Что делать**:
1. Создайте новую таблицу с префиксом `tg_` (например, `tg_lessons`)
2. Добавьте необходимые поля:
   ```sql
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
   -- Ваши поля
   title TEXT NOT NULL,
   description TEXT,
   order_index INTEGER DEFAULT 0,
   is_active BOOLEAN DEFAULT true
   ```
3. Настройте RLS (Row Level Security) при необходимости
4. Создайте индексы для часто используемых полей

**Пример для сущности "Уроки"**:
```sql
CREATE TABLE tg_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    user_id BIGINT REFERENCES tg_users(telegram_id)
);

-- Индекс для сортировки
CREATE INDEX idx_lessons_order ON tg_lessons(order_index);
-- Индекс для фильтрации по пользователю
CREATE INDEX idx_lessons_user ON tg_lessons(user_id);
```

### Шаг 2: Создание API Route в Next.js

**Где**: `/app/api/[entity]/route.ts`

**Что делать**:
1. Создайте папку для вашей сущности в `/app/api/`
2. Создайте файл `route.ts` с обработчиками

**Шаблон API Route**:
```typescript
// app/api/lessons/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - получение списка
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = supabase
      .from('tg_lessons')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

// POST - создание новой записи
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('tg_lessons')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
```

**Для конкретной записи** создайте `/app/api/lessons/[id]/route.ts`:
```typescript
// app/api/lessons/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('tg_lessons')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

// PUT - обновление
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('tg_lessons')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

// DELETE - удаление
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('tg_lessons')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
```

### Шаг 3: Создание API клиента в shared

**Где**: `/fsd/shared/api/[entity]/index.ts`

**Что делать**:
1. Создайте папку для вашей сущности в `/fsd/shared/api/`
2. Создайте файл `index.ts` с функциями API

**Шаблон API клиента**:
```typescript
// fsd/shared/api/lessons/index.ts
import { apiClient } from '../index';
import type { Lesson } from '@fsd/entities/lessons/types';

export const lessonsApi = {
  // Получить список уроков
  getAll: async (userId?: number) => {
    const params = userId ? { userId: userId.toString() } : {};
    const response = await apiClient.get<Lesson[]>('/lessons', { params });
    return response.data;
  },

  // Получить урок по ID
  getById: async (id: string) => {
    const response = await apiClient.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  // Создать урок
  create: async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post<Lesson>('/lessons', lesson);
    return response.data;
  },

  // Обновить урок
  update: async (id: string, lesson: Partial<Lesson>) => {
    const response = await apiClient.put<Lesson>(`/lessons/${id}`, lesson);
    return response.data;
  },

  // Удалить урок
  delete: async (id: string) => {
    const response = await apiClient.delete(`/lessons/${id}`);
    return response.data;
  }
};
```

### Шаг 4: Создание типов в entities

**Где**: `/fsd/entities/[entity]/types.ts`

**Что делать**:
1. Создайте папку для вашей сущности в `/fsd/entities/`
2. Создайте файл `types.ts` с типами

**Шаблон типов**:
```typescript
// fsd/entities/lessons/types.ts
export interface Lesson {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  is_active: boolean;
  user_id: number | null;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  content?: string;
  order_index?: number;
  user_id?: number;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  content?: string;
  order_index?: number;
  is_active?: boolean;
}
```

### Шаг 5: Создание React Query хуков

**Где**: `/fsd/entities/[entity]/hooks/`

**Что делать**:
1. Создайте папку `hooks` в папке вашей сущности
2. Создайте хуки для разных операций

**Шаблон хуков**:
```typescript
// fsd/entities/lessons/hooks/useLessons.ts
import { useQuery } from '@tanstack/react-query';
import { lessonsApi } from '@fsd/shared/api/lessons';

export const useLessons = (userId?: number) => {
  return useQuery({
    queryKey: ['lessons', userId],
    queryFn: () => lessonsApi.getAll(userId),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// fsd/entities/lessons/hooks/useLesson.ts
export const useLesson = (id: string) => {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getById(id),
    enabled: !!id,
  });
};

// fsd/entities/lessons/hooks/useCreateLesson.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi } from '@fsd/shared/api/lessons';
import type { CreateLessonDto } from '../types';

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lesson: CreateLessonDto) => lessonsApi.create(lesson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};

// fsd/entities/lessons/hooks/useUpdateLesson.ts
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateLessonDto & { id: string }) => 
      lessonsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });
    },
  });
};

// fsd/entities/lessons/hooks/useDeleteLesson.ts
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};
```

### Шаг 6: Использование в компонентах страниц

**Где**: `/fsd/pages/[page]/`

**Что делать**:
1. Импортируйте хуки из entities
2. Используйте данные в компоненте

**Пример использования**:
```typescript
// fsd/pages/client/LessonsPage.tsx
'use client';

import { useLessons } from '@fsd/entities/lessons/hooks/useLessons';
import { useCreateLesson } from '@fsd/entities/lessons/hooks/useCreateLesson';
import { Card, Button, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const LessonsPage = () => {
  const { data: lessons, isLoading, error } = useLessons();
  const createMutation = useCreateLesson();
  
  const handleCreateLesson = async () => {
    try {
      await createMutation.mutateAsync({
        title: 'Новый урок',
        description: 'Описание урока'
      });
      message.success('Урок создан');
    } catch (error) {
      message.error('Ошибка при создании урока');
    }
  };
  
  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Ошибка загрузки уроков</div>;
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Уроки</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateLesson}
          loading={createMutation.isPending}
        >
          Добавить урок
        </Button>
      </div>
      
      <div className="grid gap-4">
        {lessons?.map((lesson) => (
          <Card key={lesson.id} title={lesson.title}>
            <p>{lesson.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### Шаг 7: Подключение страницы в роутинг

**Где**: `/app/(client)/[route]/page.tsx`

**Что делать**:
1. Создайте папку для роута
2. Импортируйте компонент страницы

**Пример**:
```typescript
// app/(client)/lessons/page.tsx
import { LessonsPage } from '@fsd/pages/client/LessonsPage';

export default function Page() {
  return <LessonsPage />;
}
```

## Чеклист для новой функции

- [ ] Таблица создана в Supabase
- [ ] API Route создан в `/app/api/`
- [ ] API клиент создан в `/fsd/shared/api/`
- [ ] Типы определены в `/fsd/entities/[entity]/types.ts`
- [ ] React Query хуки созданы в `/fsd/entities/[entity]/hooks/`
- [ ] Компонент страницы создан в `/fsd/pages/`
- [ ] Страница подключена в `/app/`
- [ ] Добавлена навигация (если нужно)
- [ ] Протестирована работа с данными
- [ ] Обработаны состояния загрузки и ошибок

## Полезные паттерны

### Оптимистичные обновления

```typescript
const updateMutation = useMutation({
  mutationFn: lessonsApi.update,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['lessons']);
    const previousLessons = queryClient.getQueryData(['lessons']);
    
    queryClient.setQueryData(['lessons'], (old) => {
      // Обновляем данные оптимистично
    });
    
    return { previousLessons };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['lessons'], context.previousLessons);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['lessons']);
  },
});
```

### Пагинация

```typescript
const useLessonsPaginated = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['lessons', page, limit],
    queryFn: () => lessonsApi.getPaginated(page, limit),
    keepPreviousData: true,
  });
};
```

### Фильтрация и поиск

```typescript
const useLessonsSearch = (query: string) => {
  return useQuery({
    queryKey: ['lessons', 'search', query],
    queryFn: () => lessonsApi.search(query),
    enabled: query.length > 2,
    debounce: 300,
  });
};
```

## Распространенные ошибки

1. **Забыли invalidate queries** - всегда обновляйте кэш после мутаций
2. **Неправильные query keys** - используйте массивы для структурирования
3. **Отсутствие обработки ошибок** - всегда обрабатывайте ошибки
4. **Прямые вызовы API** - используйте React Query хуки
5. **Смешивание слоев** - следуйте правилам FSD

## Дополнительные ресурсы

- [React Query документация](https://tanstack.com/query/latest)
- [Supabase документация](https://supabase.com/docs)
- [Feature Sliced Design](https://feature-sliced.design/)
- [Next.js App Router](https://nextjs.org/docs/app)