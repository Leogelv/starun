-- Исправление RLS политик для chat_history

-- Удаляем старую политику
DROP POLICY IF EXISTS "Enable all access for service role" ON chat_history;

-- Создаем политику, которая разрешает все операции для аутентифицированных пользователей и service role
CREATE POLICY "Enable full access for authenticated users and service role" ON chat_history
    FOR ALL 
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Альтернативно, если нужен полный доступ без аутентификации (для Next.js API):
-- ВАЖНО: Это менее безопасно, но проще для Next.js API routes
DROP POLICY IF EXISTS "Enable full access for authenticated users and service role" ON chat_history;

CREATE POLICY "Enable all access for anon and service role" ON chat_history
    FOR ALL 
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Убеждаемся, что RLS включен
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;