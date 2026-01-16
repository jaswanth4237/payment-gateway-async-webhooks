class PaymentGateway {
    constructor(options) {
        this.key = options.key;
        this.orderId = options.orderId;
        this.onSuccess = options.onSuccess || function () { };
        this.onFailure = options.onFailure || function () { };
        this.onClose = options.onClose || function () { };

        if (!this.key || !this.orderId) {
            console.error('PaymentGateway: key and orderId are required');
        }
    }

    open() {
        this.createModal();
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    createModal() {
        if (document.getElementById('payment-gateway-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'payment-gateway-modal';
        modal.setAttribute('data-test-id', 'payment-modal');
        modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center;
      justify-content: center; z-index: 999999; backdrop-filter: blur(4px);
    `;

        const content = document.createElement('div');
        content.style.cssText = `
      background: white; width: 450px; height: 600px; border-radius: 12px;
      position: relative; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    `;

        const iframe = document.createElement('iframe');
        iframe.src = `http://localhost:3001/checkout?order_id=${this.orderId}&embedded=true`;
        iframe.setAttribute('data-test-id', 'payment-iframe');
        iframe.style.cssText = `width: 100%; height: 100%; border: none;`;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('data-test-id', 'close-modal-button');
        closeBtn.style.cssText = `
      position: absolute; top: 10px; right: 10px; background: none; border: none;
      font-size: 24px; cursor: pointer; color: #666; z-index: 10;
    `;
        closeBtn.onclick = () => this.close();

        content.appendChild(closeBtn);
        content.appendChild(iframe);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    handleMessage(event) {
        const { type, data } = event.data;
        if (type === 'payment_success') {
            this.onSuccess(data);
            this.close();
        } else if (type === 'payment_failed') {
            this.onFailure(data);
        } else if (type === 'close_modal') {
            this.close();
        }
    }

    close() {
        const modal = document.getElementById('payment-gateway-modal');
        if (modal) {
            modal.remove();
            window.removeEventListener('message', this.handleMessage.bind(this));
            this.onClose();
        }
    }
}

window.PaymentGateway = PaymentGateway;
console.log('PaymentGateway SDK Loaded');
