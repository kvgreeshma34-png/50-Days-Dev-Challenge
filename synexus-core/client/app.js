import './components.js';
import { globalStore } from './store.js';
import { saveToCache, getFromCache, getAllFromCache } from './db.js';
import { fetchDashboardData, fetchLogsFromSupabase, postLogToSupabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initRouter();
    initToastSystem();
    initDataForm();
    initDashboardStreams();
    initCacheExport();
    initServiceWorker();

    // Load persistent logs straight from Supabase PostgreSQL table
    const remoteLogs = await fetchLogsFromSupabase();
    if (remoteLogs && remoteLogs.length > 0) {
        globalStore.dispatch({ type: 'SET_FEED_ITEMS', payload: remoteLogs });
    }

    try {
        await saveToCache('last_sync', { status: 'active', time: new Date().toISOString() });
    } catch (err) {
        console.error('IndexedDB cache error:', err);
    }
});

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            showToast(`Switched to ${newTheme} mode`);
        });
    }
}

function initRouter() {
    const navLinks = document.querySelectorAll('.nav-link');
    const panes = document.querySelectorAll('.section-pane');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            panes.forEach(pane => {
                pane.classList.remove('active-pane');
                if (pane.id === targetId) pane.classList.add('active-pane');
            });
        });
    });
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function initToastSystem() {
    const modalBtn = document.getElementById('open-modal-btn');
    const modalEl = document.getElementById('system-modal');

    if (modalBtn && modalEl) {
        modalBtn.addEventListener('click', async () => {
            modalEl.open();
            const logMsg = `💬 System modal triggered at ${new Date().toLocaleTimeString()}`;
            globalStore.dispatch({ type: 'ADD_FEED_ITEM', payload: logMsg });
            await postLogToSupabase(logMsg);
        });
    }
}

function initDataForm() {
    const formEl = document.getElementById('database-input-form');
    const inputEl = document.getElementById('custom-log-input');

    if (formEl && inputEl) {
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = inputEl.value.trim();
            if (!message) return;

            try {
                await postLogToSupabase(message);
                globalStore.dispatch({ type: 'ADD_FEED_ITEM', payload: message });
                showToast('Successfully stored in database!');
                inputEl.value = '';
            } catch (err) {
                showToast('Failed to save to database.');
            }
        });
    }
}

function initDashboardStreams() {
    const loadBtn = document.getElementById('load-streams-btn');
    const contentDiv = document.getElementById('dashboard-content');

    if (loadBtn && contentDiv) {
        loadBtn.addEventListener('click', async () => {
            contentDiv.innerHTML = `<p style="color: var(--primary-color);">🔄 Fetching concurrent live streams...</p>`;
            try {
                const data = await fetchDashboardData();
                contentDiv.innerHTML = `
                    <div style="background: var(--bg-main); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <p><strong>Repository:</strong> ${data.repoName}</p>
                        <p><strong>GitHub Stars:</strong> ⭐ ${data.repoStars}</p>
                        <p><strong>Client IP Feed:</strong> ${data.clientIp}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">Synchronized at: ${data.fetchedAt}</p>
                    </div>
                `;
                showToast('Data streams successfully loaded!');
                const logMsg = `🌐 Resilient network streams synchronized`;
                globalStore.dispatch({ type: 'ADD_FEED_ITEM', payload: logMsg });
                await postLogToSupabase(logMsg);
            } catch (error) {
                contentDiv.innerHTML = `<p style="color: #ef4444;">❌ Error loading streams: ${error.message}</p>`;
                showToast('Failed to sync network streams.');
            }
        });
    }
}

function initCacheExport() {
    const exportBtn = document.getElementById('export-cache-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                const allCacheData = await getAllFromCache();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCacheData, null, 2));
                
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `synexus_core_cache_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();

                showToast('IndexedDB cache exported successfully!');
            } catch (err) {
                showToast('Failed to export cache data.');
            }
        });
    }
}

function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW error:', err));
        });
    }
}