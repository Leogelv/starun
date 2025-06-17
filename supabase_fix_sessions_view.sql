-- Fix recent_chat_sessions view to properly count all messages

DROP VIEW IF EXISTS recent_chat_sessions;

CREATE OR REPLACE VIEW recent_chat_sessions AS
SELECT DISTINCT
    ch.session_id,
    ch.telegram_id,
    tu.username,
    tu.first_name,
    COUNT(*) OVER (PARTITION BY ch.session_id) as message_count,
    MIN(ch.created_at) OVER (PARTITION BY ch.session_id) as session_start,
    MAX(ch.created_at) OVER (PARTITION BY ch.session_id) as session_end,
    FIRST_VALUE(
        CASE WHEN ch.message_type = 'user' THEN ch.content END
    ) OVER (
        PARTITION BY ch.session_id 
        ORDER BY CASE WHEN ch.message_type = 'user' THEN ch.created_at END
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as first_message_preview
FROM chat_history ch
LEFT JOIN tg_users tu ON ch.telegram_id = tu.telegram_id
ORDER BY MAX(ch.created_at) OVER (PARTITION BY ch.session_id) DESC;