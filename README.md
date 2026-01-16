# Payment Gateway - Async Webhooks

A payment gateway system with asynchronous processing and webhook support.

## Features

- Async payment processing with Redis Bull queues
- Webhook delivery with retries
- Merchant dashboard
- Refund support
- Idempotency for duplicate prevention

## Tech Stack

- Node.js 18
- Express.js
- PostgreSQL 15
- Redis 7
- Docker Compose

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Run the Application
```bash
docker-compose up --build
```

### Access the Services
- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001
- API: http://localhost:8000/api/v1

## Project Structure

- `backend/` - API server and worker
- `checkout_page/` - Checkout service
- `dashboard/` - Merchant dashboard
- `test-merchant/` - Test utilities
