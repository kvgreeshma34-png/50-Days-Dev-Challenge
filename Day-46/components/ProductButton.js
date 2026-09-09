/* ========================================== */
/* ProductButton.js: The State Publisher      */
/* ========================================== */

import { globalStore } from '../store.js';

class ProductButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['action', 'label'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const action = this.getAttribute('action') || 'add';
        const label = this.getAttribute('label') || 'Action';
        
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    background: var(--btn-bg, #4f46e5);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    font-family: inherit;
                    transition: opacity 0.2s, transform 0.1s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                button:hover { opacity: 0.9; }
                button:active { transform: scale(0.98); }
            </style>
            
            <button id="action-btn">${label}</button>
        `;

        const btn = this.shadowRoot.getElementById('action-btn');
        
        btn.onclick = () => {
            const currentState = globalStore.getState();
            const currentCount = currentState.cartCount || 0;
            
            if (action === 'add') {
                globalStore.setState({ cartCount: currentCount + 1 });
            } else if (action === 'remove') {
                globalStore.setState({ cartCount: Math.max(0, currentCount - 1) });
            } else if (action === 'reset') {
                globalStore.setState({ cartCount: 0 });
            }
            
            console.log(`✅ Published state change: Action '${action}' executed.`);
        };
    }
}

customElements.define('product-button', ProductButton);