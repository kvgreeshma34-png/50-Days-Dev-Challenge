/* ========================================== */
/* ProductButton.js: The State Publisher      */
/* ========================================== */

import { globalStore } from '../store.js';

class ProductButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const productName = this.getAttribute('product-name') || 'Item';
        
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    font-family: inherit;
                    transition: background 0.2s, transform 0.1s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                button:hover { background: #059669; }
                button:active { transform: scale(0.98); }
            </style>
            
            <button id="add-btn">Add ${productName}</button>
        `;

        const btn = this.shadowRoot.getElementById('add-btn');
        
        btn.addEventListener('click', () => {
            const currentState = globalStore.getState();
            
            globalStore.setState({
                cartCount: (currentState.cartCount || 0) + 1 
            });
            
            console.log(`✅ Published state change: Added ${productName}`);
        });
    }
}

customElements.define('product-button', ProductButton);