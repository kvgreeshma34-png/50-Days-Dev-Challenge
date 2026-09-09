export default class CustomModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('modal-template');
        if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
    }

    connectedCallback() {
        const closeBtn = this.shadowRoot.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeAttribute('open');
            });
        }

        // Close when clicking backdrop outside container
        this.shadowRoot.host.addEventListener('click', (e) => {
            if (e.target === this) {
                this.removeAttribute('open');
            }
        });
    }
}

customElements.define('custom-modal', CustomModal);