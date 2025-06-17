-- Дополнительные функции для Supabase

-- Функция для подсчета уникальных пользователей в чате
CREATE OR REPLACE FUNCTION count_distinct_users()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT telegram_id) 
    INTO user_count 
    FROM chat_history;
    
    RETURN COALESCE(user_count, 0);
END;
$$ LANGUAGE plpgsql;