# API Соглашения и паттерны

## Обзор

Этот документ описывает соглашения и паттерны работы с API в проекте. Мы используем многоуровневую архитектуру с четким разделением ответственности.

## Архитектура API

### Уровни API

```
┌─────────────────┐
│   UI Component  │
└────────┬────────┘
         │ использует
┌────────▼────────┐
│  Entity Hook    │ (React Query)
└────────┬────────┘
         │ вызывает
┌────────▼────────┐
│   API Client    │ (Axios)
└────────┬────────┘
         │ запрос к
┌────────▼────────┐
│  Next.js Route  │
└────────┬────────┘
         │ обращается к
┌────────▼────────┐
│    Supabase     │
└─────────────────┘
```

## Next.js API Routes

### Структура папок

```
app/api/
├── [entity]/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET (one), PUT, DELETE
├── auth/
│   └── route.ts              # Аутентификация
└── admin/
    └── [entity]/
        └── route.ts          # Административные endpoints
```

### Стандартные HTTP методы

#### GET - Получение данных
```typescript
// Список записей
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры фильтрации
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Построение запроса
    let query = supabase
      .from('table_name')
      .select('*', { count: 'exact' });
    
    // Применение фильтров
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    // Пагинация
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);
    
    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
```

#### POST - Создание записи
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = validateCreateDto(body);
    
    const { data, error } = await supabase
      .from('table_name')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
```

#### PUT - Обновление записи
```typescript
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = validateUpdateDto(body);
    
    const { data, error } = await supabase
      .from('table_name')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}
```

#### DELETE - Удаление записи
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json(
      { message: 'Record deleted successfully' },
      { status: 204 }
    );
  } catch (error) {
    return handleError(error);
  }
}
```

### Обработка ошибок

```typescript
function handleError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.errors 
      },
      { status: 400 }
    );
  }
  
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## API Client (Axios)

### Базовая конфигурация

```typescript
// fsd/shared/api/index.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Добавление токена, если есть
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Обработка неавторизованного доступа
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Паттерн API сервисов

```typescript
// fsd/shared/api/[entity]/index.ts
import { apiClient } from '../index';
import type { Entity, CreateEntityDto, UpdateEntityDto } from '@fsd/entities/[entity]/types';

export const entityApi = {
  // Получение списка с пагинацией
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await apiClient.get<{
      data: Entity[];
      pagination: PaginationMeta;
    }>('/entity', { params });
    return response.data;
  },

  // Получение одной записи
  getById: async (id: string) => {
    const response = await apiClient.get<Entity>(`/entity/${id}`);
    return response.data;
  },

  // Создание
  create: async (data: CreateEntityDto) => {
    const response = await apiClient.post<Entity>('/entity', data);
    return response.data;
  },

  // Обновление
  update: async (id: string, data: UpdateEntityDto) => {
    const response = await apiClient.put<Entity>(`/entity/${id}`, data);
    return response.data;
  },

  // Удаление
  delete: async (id: string) => {
    await apiClient.delete(`/entity/${id}`);
  },

  // Массовые операции
  bulkCreate: async (data: CreateEntityDto[]) => {
    const response = await apiClient.post<Entity[]>('/entity/bulk', data);
    return response.data;
  },

  bulkDelete: async (ids: string[]) => {
    await apiClient.post('/entity/bulk-delete', { ids });
  },
};
```

## React Query хуки

### Базовые хуки

```typescript
// fsd/entities/[entity]/hooks/useEntity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityApi } from '@fsd/shared/api/entity';

// Query Keys factory
export const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (params?: any) => [...entityKeys.lists(), params] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
};

// Получение списка
export const useEntityList = (params?: any) => {
  return useQuery({
    queryKey: entityKeys.list(params),
    queryFn: () => entityApi.getList(params),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Получение одной записи
export const useEntity = (id: string) => {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => entityApi.getById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: entityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: entityKeys.lists() 
      });
    },
  });
};

// Обновление с оптимистичным обновлением
export const useUpdateEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateEntityDto & { id: string }) =>
      entityApi.update(id, data),
    onMutate: async ({ id, ...newData }) => {
      await queryClient.cancelQueries({ 
        queryKey: entityKeys.detail(id) 
      });
      
      const previousData = queryClient.getQueryData(
        entityKeys.detail(id)
      );
      
      queryClient.setQueryData(
        entityKeys.detail(id),
        (old: any) => ({ ...old, ...newData })
      );
      
      return { previousData };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(
        entityKeys.detail(id),
        context?.previousData
      );
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: entityKeys.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: entityKeys.lists() 
      });
    },
  });
};
```

### Продвинутые паттерны

#### Infinite Query для бесконечной прокрутки
```typescript
export const useEntityInfinite = (params?: any) => {
  return useInfiniteQuery({
    queryKey: ['entity', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      entityApi.getList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.totalPages 
        ? pagination.page + 1 
        : undefined;
    },
  });
};
```

#### Prefetching
```typescript
export const usePrefetchEntity = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: entityKeys.detail(id),
      queryFn: () => entityApi.getById(id),
    });
  };
};
```

## Типизация

### DTO (Data Transfer Objects)

```typescript
// fsd/entities/[entity]/types.ts

// Базовая сущность
export interface Entity {
  id: string;
  created_at: string;
  updated_at: string;
  // ... специфичные поля
}

// Создание
export interface CreateEntityDto {
  // Только обязательные поля без id и timestamps
}

// Обновление
export interface UpdateEntityDto {
  // Все поля опциональные
}

// Фильтры
export interface EntityFilters {
  search?: string;
  status?: 'active' | 'inactive';
  dateFrom?: string;
  dateTo?: string;
}

// Ответ с пагинацией
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Безопасность

### Валидация данных

```typescript
// Используйте Zod для валидации
import { z } from 'zod';

const CreateEntitySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export function validateCreateDto(data: unknown) {
  return CreateEntitySchema.parse(data);
}
```

### Авторизация

```typescript
// Middleware для проверки авторизации
export async function checkAuth(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    throw new AuthError('No token provided');
  }
  
  // Проверка токена
  const user = await verifyToken(token);
  return user;
}
```

## Best Practices

### 1. Используйте правильные HTTP статусы

- `200` - Успешный GET, PUT
- `201` - Успешный POST
- `204` - Успешный DELETE
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Запрещено
- `404` - Не найдено
- `500` - Серверная ошибка

### 2. Версионирование API

```typescript
// app/api/v1/[entity]/route.ts
// app/api/v2/[entity]/route.ts
```

### 3. Rate Limiting

```typescript
const rateLimiter = new Map();

export function rateLimit(ip: string, limit = 100) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 минута
  
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
}
```

### 4. Логирование

```typescript
export function logApiCall(method: string, path: string, duration: number) {
  console.log(`[API] ${method} ${path} - ${duration}ms`);
}
```

### 5. Кэширование

```typescript
// Используйте React Query для кэширования на клиенте
// Используйте Cache-Control headers для HTTP кэширования
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});
```