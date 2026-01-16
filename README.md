# Antigravity Pay: Production-Ready Asynchronous Payment Gateway

Antigravity Pay is a high-performance, scalable payment gateway implementation architected with modern distributed system patterns. This project demonstrates advanced capabilities like asynchronous job processing, reliable webhook delivery with exponential backoff, and a clean MVC architecture.

## 🚀 Key Features

- **Asynchronous Processing**: High-throughput payment and refund processing using **Redis-based Bull queues**.
- **Reliable Webhooks**: 
  - **HMAC-SHA256 Signatures**: Secure payload verification.
  - **Automatic Retries**: 5 attempts with **Exponential Backoff** (1m, 5m, 30m, 2h).
  - **Manual Retry**: Re-trigger failed webhooks directly from the dashboard.
- **Embeddable JavaScript SDK**: 
  - Lightweight client-side integration via secure iframe modals.
  - Cross-origin communication using `postMessage`.
- **Idempotent APIs**: Prevention of duplicate transactions through unique `Idempotency-Key` tracking.
- **Merchant Dashboard**:
  - Real-time Webhook Configuration and Delivery Logs.
  - Interactive API Documentation with code snippets.
- **Full Refund Lifecycle**: Support for full and partial refunds with balance validation.

## 🛠️ Technical Stack

- **Runtime**: Node.js 18 (Backend API & Worker)
- **Framework**: Express.js
- **Database**: PostgreSQL 15 (Data Persistence)
- **Message Broker**: Redis 7 (Job Queue Management)
- **Queue Engine**: Bull
- **Orchestration**: Docker Compose

## 🏗️ Architecture: Clean MVC

The backend follows a strict separating of concerns to ensure maintainability:

- **Models** (`src/models/`): Data access layers for logic isolation.
- **Controllers** (`src/controllers/`): Business logic orchestration.
- **Routes** (`src/routes/`): API endpoint definitions.
- **Middleware** (`src/middleware/`): Authentication and Security.
- **Worker**: Dedicated background processing engine.

## 📦 Getting Started

### Prerequisites
- Docker & Docker Compose

### Launch the Gateway
```bash
docker-compose up --build
```

### Application URLs
- **Merchant Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Checkout Service (SDK Host)**: [http://localhost:3001](http://localhost:3001)
- **API Base URL**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

## 📖 API Usage Guide

### 1. Create a Payment (Idempotent)
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Idempotency-Key: unique_req_001" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_101",
    "amount": 50000,
    "method": "upi",
    "vpa": "user@upi"
  }'
```

### 2. Refund a Transaction
```bash
curl -X POST http://localhost:8000/api/v1/payments/{payment_id}/refunds \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{"amount": 20000, "reason": "Customer cancellation"}'
```

### 3. Queue Status (Evaluation Endpoint)
```bash
curl http://localhost:8000/api/v1/test/jobs/status
```

## 🧪 Development & Testing

The system includes a **Test Mode** for rapid evaluation:
- **`TEST_MODE=true`**: Simulates deterministic payment outcomes.
- **`WEBHOOK_RETRY_INTERVALS_TEST=true`**: Reduces retry intervals to seconds (5s, 10s, 15s) instead of hours for faster testing of the retry logic.

---
Built by **Antigravity** — *Engineered for Reliability.*
