const db = require('../db');

class Refund {
    static async create(data) {
        const { id, payment_id, merchant_id, amount, reason, status } = data;
        await db.query(
            'INSERT INTO refunds (id, payment_id, merchant_id, amount, reason, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, payment_id, merchant_id, amount, reason, status]
        );
        return data;
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM refunds WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByIdAndMerchant(id, merchantId) {
        const result = await db.query(
            'SELECT * FROM refunds WHERE id = $1 AND merchant_id = $2',
            [id, merchantId]
        );
        return result.rows[0];
    }

    static async getTotalRefunded(paymentId) {
        const result = await db.query(
            'SELECT SUM(amount) as total_refunded FROM refunds WHERE payment_id = $1 AND status IN (\'pending\', \'processed\')',
            [paymentId]
        );
        return parseInt(result.rows[0].total_refunded || 0);
    }

    static async updateStatus(id, status) {
        return db.query(
            'UPDATE refunds SET status = $1, processed_at = NOW() WHERE id = $2',
            [status, id]
        );
    }
}

module.exports = Refund;
