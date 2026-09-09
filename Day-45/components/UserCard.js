// --- NATIVE WEB COMPONENT: USER CARD ---
class UserCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['name', 'role'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || 'User Name';
        const role = this.getAttribute('role') || 'Team Member';
        const initial = name.charAt(0).toUpperCase();

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    flex: 1 1 220px;
                    max-width: 260px;
                }
                .user-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                    box-sizing: border-box;
                }
                .avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 0.4rem 0;
                }
                .role-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin: 0 0 1rem 0;
                }
                .badge {
                    background: #ede9fe;
                    color: #7c3aed;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: auto;
                }
            </style>
            <div class="user-card">
                <div class="avatar">${initial}</div>
                <h4 class="name">${name}</h4>
                <p class="role-text">${role}</p>
                <div class="badge">${role}</div>
            </div>
        `;
    }
}

customElements.define('user-card', UserCard);