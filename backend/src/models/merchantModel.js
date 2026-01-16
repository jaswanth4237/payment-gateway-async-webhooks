const db = require('../db');

class Merchant {
    static async findByCredentials(apiKey, apiSecret) {
        const result = await db.query(
            'SELECT * FROM merchants WHERE api_key = $1 AND api_secret = $2',
            [apiKey, apiSecret]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM merchants WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async updateWebhookConfig(id, url) {
        return db.query('UPDATE merchants SET webhook_url = $1 WHERE id = $2', [url, id]);
    }

    static async updateWebhookSecret(id, secret) {
        return db.query('UPDATE merchants SET webhook_secret = $1 WHERE id = $2', [secret, id]);
    }
}

module.exports = Merchant;
