const db = require('../db');

class Payment {
    static async create(data) {
        const { id, merchant_id, order_id, amount, currency, method, vpa, status } = data;
        await db.query(
            'INSERT INTO payments (id, merchant_id, order_id, amount, currency, method, vpa, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [id, merchant_id, order_id, amount, currency, method, vpa, status]
        );
        return data;
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByIdAndMerchant(id, merchantId) {
        const result = await db.query(
            'SELECT * FROM payments WHERE id = $1 AND merchant_id = $2',
            [id, merchantId]
        );
        return result.rows[0];
    }

    static async updateStatus(id, status, errorCode, errorDescription) {
        return db.query(
            'UPDATE payments SET status = $1, error_code = $2, error_description = $3, updated_at = NOW() WHERE id = $4',
            [status, errorCode, errorDescription, id]
        );
    }

    static async capture(id) {
        return db.query('UPDATE payments SET captured = TRUE, updated_at = NOW() WHERE id = $1', [id]);
    }
}

module.exports = Payment;
