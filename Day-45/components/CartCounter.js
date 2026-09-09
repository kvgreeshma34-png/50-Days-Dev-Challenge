/* ========================================== */
/* CartCounter.js: The Reactive Subscriber    */
/* ========================================== */

import { globalStore } from '../store.js';

class CartCounter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = `
            <style>
                .badge {
                    background: #4f46e5;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-family: inherit;
                    transition: transform 0.2s ease;
                    display: inline-block;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .pop {
                    transform: scale(1.15);
                }
            </style>
            <div class="badge">🛒 Cart Items: <span id="count">0</span></div>
        `;
    }

    connectedCallback() {
        const initialState = globalStore.getState();
        this.updateUI(initialState.cartCount);

        this.unsubscribe = globalStore.subscribe((newState) => {
            this.updateUI(newState.cartCount);
        });
    }

    updateUI(count) {
        const countSpan = this.shadowRoot.getElementById('count');
        const badge = this.shadowRoot.querySelector('.badge');
        
        if (countSpan) countSpan.textContent = count || 0;
        
        if (badge) {
            badge.classList.add('pop');
            setTimeout(() => badge.classList.remove('pop'), 200);
        }
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
            console.log("🧹 CartCounter unsubscribed to prevent memory leaks.");
        }
    }
}

customElements.define('cart-counter', CartCounter);