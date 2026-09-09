class CustomModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                .modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                :host([open]) .modal-backdrop {
                    opacity: 1;
                    pointer-events: auto;
                }
                .modal-content {
                    background: #ffffff;
                    color: #1e293b;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 480px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    position: relative;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.35rem;
                    color: #1e1b4b;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .close-btn {
                    background: none; 
                    border: none;
                    font-size: 1.25rem; 
                    cursor: pointer;
                    color: #64748b;
                }
                .close-btn:hover { color: #0f172a; }
                .modal-body {
                    font-size: 0.95rem;
                    color: #475569;
                    line-height: 1.5;
                }
                .modal-footer {
                    margin-top: 1.5rem;
                    display: flex;
                    justify-content: flex-end;
                }
                .action-btn {
                    background-color: #10b981;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
                    transition: background 0.2s;
                }
                .action-btn:hover {
                    background-color: #059669;
                }
            </style>
            
            <div class="modal-backdrop" id="backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><slot name="title">Welcome</slot></h2>
                        <button class="close-btn" id="close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <slot name="body">Modal body text goes here...</slot>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="action-btn" id="default-action">Get Started</button>
                        </slot>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.getElementById('close').addEventListener('click', () => this.close());
        this.shadowRoot.getElementById('backdrop').addEventListener('click', (e) => {
            if (e.target.id === 'backdrop') this.close();
        });
    }

    open() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
}

customElements.define('custom-modal', CustomModal);