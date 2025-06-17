-- SQL команды для создания таблицы истории чатов в Supabase

-- 1. Создание таблицы для истории чатов
CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    material_ids INTEGER[] DEFAULT NULL,
    session_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_chat_history_telegram_id ON chat_history(telegram_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_message_type ON chat_history(message_type);

-- 3. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_chat_history_updated_at ON chat_history;
CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Настройка Row Level Security (RLS)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 6. Создание политики доступа (только для service role)
CREATE POLICY "Enable all access for service role" ON chat_history
    FOR ALL USING (auth.role() = 'service_role');

-- 7. Создание представления для статистики пользователей
CREATE OR REPLACE VIEW user_chat_stats AS
SELECT 
    ch.telegram_id,
    tu.username,
    tu.first_name,
    tu.last_name,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE ch.message_type = 'user') as user_messages,
    COUNT(*) FILTER (WHERE ch.message_type = 'assistant') as assistant_messages,
    COUNT(DISTINCT ch.session_id) as total_sessions,
    MIN(ch.created_at) as first_message_at,
    MAX(ch.created_at) as last_message_at
FROM chat_history ch
LEFT JOIN tg_users tu ON ch.telegram_id = tu.telegram_id
GROUP BY ch.telegram_id, tu.username, tu.first_name, tu.last_name;

-- 8. Создание представления для последних сессий
CREATE OR REPLACE VIEW recent_chat_sessions AS
SELECT DISTINCT
    ch.session_id,
    ch.telegram_id,
    tu.username,
    tu.first_name,
    COUNT(*) OVER (PARTITION BY ch.session_id) as message_count,
    MIN(ch.created_at) OVER (PARTITION BY ch.session_id) as session_start,
    MAX(ch.created_at) OVER (PARTITION BY ch.session_id) as session_end,
    FIRST_VALUE(ch.content) OVER (
        PARTITION BY ch.session_id 
        ORDER BY ch.created_at 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as first_message_preview
FROM chat_history ch
LEFT JOIN tg_users tu ON ch.telegram_id = tu.telegram_id
WHERE ch.message_type = 'user'
ORDER BY MAX(ch.created_at) OVER (PARTITION BY ch.session_id) DESC;

-- 9. Вставка примерных данных (опционально, для тестирования)
-- INSERT INTO chat_history (telegram_id, message_type, content, session_id) VALUES
-- (123456789, 'user', 'Привет! Как дела?', gen_random_uuid()),
-- (123456789, 'assistant', 'Привет! Все отлично, как дела у тебя?', currval('chat_history_id_seq')),
-- (987654321, 'user', 'Расскажи про медитацию', gen_random_uuid()),
-- (987654321, 'assistant', 'Медитация - это практика осознанности...', currval('chat_history_id_seq'));

-- 10. Функция для очистки старых записей (опционально)
CREATE OR REPLACE FUNCTION cleanup_old_chat_history(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;