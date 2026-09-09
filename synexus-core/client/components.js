import { globalStore } from './store.js';

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const name = this.getAttribute('name') || 'User';
    const role = this.getAttribute('role') || 'Contributor';
    const status = this.getAttribute('status') || 'Active';

    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #4f46e5, #9333ea);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .info h4 { font-size: 1.1rem; color: var(--text-main, #0f172a); margin-bottom: 4px; }
        .info p { font-size: 0.9rem; color: var(--text-muted, #64748b); }
        .status-badge {
          margin-left: auto;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-size: 0.8rem;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
        }
      </style>
      <div class="card">
        <div class="avatar">${name.charAt(0)}</div>
        <div class="info">
          <h4>${name}</h4>
          <p>${role}</p>
        </div>
        <div class="status-badge">${status}</div>
      </div>
    `;
  }
}
customElements.define('user-card', UserCard);


class DataFeed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render(globalStore.getState().feedItems);
    this.unsubscribe = globalStore.subscribe((state) => {
      this.render(state.feedItems);
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render(items) {
    this.shadowRoot.innerHTML = `
      <style>
        .feed-card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        h3 { font-size: 1.2rem; margin-bottom: 12px; color: var(--text-main, #0f172a); }
        ul { list-style: none; display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; }
        li {
          background: var(--bg-main, #f8fafc);
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          font-size: 0.9rem;
          color: var(--text-main, #0f172a);
        }
      </style>
      <div class="feed-card">
        <h3>Supabase Cloud Activity Feed</h3>
        <ul>
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}
customElements.define('data-feed', DataFeed);


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
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        .modal-backdrop.open { display: flex; }
        .modal-box {
          background: var(--bg-card, #ffffff);
          color: var(--text-main, #0f172a);
          border: 1px solid var(--border-color, #e2e8f0);
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }
        .modal-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover { background: #4338ca; }
      </style>
      <div class="modal-backdrop" id="backdrop">
        <div class="modal-box">
          <slot name="title">Modal Title</slot>
          <div style="margin: 12px 0; color: var(--text-muted, #64748b);">
            <slot name="content">Modal content goes here...</slot>
          </div>
          <div class="modal-actions">
            <button id="close-btn">Got it</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.getElementById('backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'backdrop') this.close();
    });
  }

  open() { 
    const backdrop = this.shadowRoot.getElementById('backdrop');
    if (backdrop) backdrop.classList.add('open'); 
  }
  
  close() { 
    const backdrop = this.shadowRoot.getElementById('backdrop');
    if (backdrop) backdrop.classList.remove('open'); 
  }
}
customElements.define('custom-modal', CustomModal);