const db = require('../db');

class IdempotencyKey {
    static async findValid(key, merchantId) {
        const result = await db.query(
            'SELECT response FROM idempotency_keys WHERE key = $1 AND merchant_id = $2 AND expires_at > NOW()',
            [key, merchantId]
        );
        return result.rows[0];
    }

    static async delete(key, merchantId) {
        return db.query('DELETE FROM idempotency_keys WHERE key = $1 AND merchant_id = $2', [key, merchantId]);
    }

    static async create(key, merchantId, response) {
        return db.query(
            'INSERT INTO idempotency_keys (key, merchant_id, response, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'24 hours\')',
            [key, merchantId, response]
        );
    }
}

module.exports = IdempotencyKey;
