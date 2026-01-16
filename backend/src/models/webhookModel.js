const db = require('../db');

class WebhookLog {
    static async create(data) {
        const { merchant_id, event, payload, status } = data;
        const result = await db.query(
            'INSERT INTO webhook_logs (merchant_id, event, payload, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [merchant_id, event, payload, status]
        );
        return result.rows[0].id;
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM webhook_logs WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByMerchant(merchantId, limit, offset) {
        const result = await db.query(
            'SELECT * FROM webhook_logs WHERE merchant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [merchantId, limit, offset]
        );
        const countResult = await db.query('SELECT COUNT(*) FROM webhook_logs WHERE merchant_id = $1', [merchantId]);
        return { data: result.rows, total: parseInt(countResult.rows[0].count) };
    }

    static async updateAttempt(id, status, attempts, responseCode, responseBody, nextRetryAt) {
        return db.query(
            'UPDATE webhook_logs SET status = $1, attempts = $2, last_attempt_at = NOW(), response_code = $3, response_body = $4, next_retry_at = $5 WHERE id = $6',
            [status, attempts, responseCode, responseBody, nextRetryAt, id]
        );
    }

    static async resetRetry(id) {
        return db.query(
            'UPDATE webhook_logs SET status = \'pending\', attempts = 0, next_retry_at = NOW() WHERE id = $1',
            [id]
        );
    }
}

module.exports = WebhookLog;
