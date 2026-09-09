// ==========================================
// MAIN APPLICATION ORCHESTRATOR
// ==========================================

import { showToast, debounce } from './utils.js';
import { fetchGitHubUser, fetchPaginatedPosts, deleteRecord, updateRecord, fetchDashboardData, submitInitiative, syncOfflineProposals } from './api.js';
import { connectWebSocket, sendLiveMessage } from './websocket.js';
import { globalStore } from './store.js'; // DAY 43: Global Pub/Sub State Store

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const currentTheme = localStorage.getItem('synexus_theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.setAttribute('aria-pressed', 'true');
        themeToggleBtn.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('synexus_theme', isDark ? 'dark' : 'light');
        themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('nav-active');
    });
}

function initInitiativesSearch() {
    const searchInput = document.getElementById('search-projects');
    const clearBtn = document.getElementById('clear-search');
    const gridContainer = document.getElementById('dynamic-grid');

    if (!gridContainer) return;

    const initiativesData = [
        { 
            title: "Project StoreLane", 
            desc: "A phygital hyperlocal commerce platform designed to digitize small local vendors.", 
            status: "ACTIVE", 
            border: "#10b981", 
            badgeBg: "#d1fae5", 
            badgeColor: "#065f46" 
        },
        { 
            title: "QR Attendance Tracker", 
            desc: "Automated student attendance system utilizing progressive web app (PWA) tech and real-time scanning.", 
            status: "ACTIVE", 
            border: "#10b981", 
            badgeBg: "#d1fae5", 
            badgeColor: "#065f46" 
        },
        { 
            title: "Logistics Management System", 
            desc: "Desktop architecture built for tracking shipments and driver status in real-time.", 
            status: "COMPLETED", 
            border: "#e5e7eb", 
            badgeBg: "#f3f4f6", 
            badgeColor: "#374151" 
        },
        { 
            title: "AI Code Reviewer Engine", 
            desc: "Automated pull request analysis tool that detects syntax bugs and performance bottlenecks.", 
            status: "ACTIVE", 
            border: "#10b981", 
            badgeBg: "#d1fae5", 
            badgeColor: "#065f46" 
        },
        { 
            title: "Campus Event Portal", 
            desc: "Centralized university platform for RSVP tracking, ticket generation, and venue scheduling.", 
            status: "COMPLETED", 
            border: "#e5e7eb", 
            badgeBg: "#f3f4f6", 
            badgeColor: "#374151" 
        },
        { 
            title: "Smart Energy Monitor", 
            desc: "IoT dashboard providing real-time power consumption metrics and predictive outage alerts.", 
            status: "ACTIVE", 
            border: "#10b981", 
            badgeBg: "#d1fae5", 
            badgeColor: "#065f46" 
        }
    ];

    function renderCards(items) {
        gridContainer.innerHTML = items.map((item, index) => `
            <div class="card initiative-card fade-up-card" style="display: flex; flex-direction: column; justify-content: space-between; border: 2px solid ${item.border}; border-radius: 12px; padding: 1.5rem; background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); animation-delay: ${index * 0.08}s;">
                <div>
                    <h3 style="color: #4f46e5; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; font-style: italic;">${item.title}</h3>
                    <p style="color: #4b5563; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; font-style: italic;">${item.desc}</p>
                </div>
                <div class="card-footer" style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span class="status-badge" style="background-color: ${item.badgeBg}; color: ${item.badgeColor}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; font-style: italic;">${item.status}</span>
                    <div class="card-actions" style="display: flex; gap: 8px;">
                        <button class="edit-btn" data-id="${index}" style="background: #e0e7ff; color: #4f46e5; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Edit</button>
                        <button class="delete-btn" data-id="${index}" style="background: #fee2e2; color: #ef4444; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">&times;</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCards(initiativesData);

    if (!searchInput || !clearBtn) return;

    function filterInitiatives(query) {
        const term = query.toLowerCase().trim();
        const filtered = initiativesData.filter(item => 
            item.title.toLowerCase().includes(term) || item.desc.toLowerCase().includes(term)
        );
        renderCards(filtered);

        let emptyMsg = gridContainer.querySelector('.no-results-message');
        if (filtered.length === 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('div');
                emptyMsg.className = 'no-results-message';
                emptyMsg.style.gridColumn = '1 / -1';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.padding = '2rem';
                emptyMsg.style.color = '#64748b';
                emptyMsg.style.fontStyle = 'italic';
                emptyMsg.textContent = 'No matching initiatives found. Try a different keyword.';
                gridContainer.appendChild(emptyMsg);
            }
        }
    }

    if (!searchInput.dataset.searchInitialized) {
        searchInput.dataset.searchInitialized = 'true';

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            clearBtn.classList.toggle('show', val.length > 0);
            filterInitiatives(val);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.remove('show');
            filterInitiatives('');
            searchInput.focus();
        });
    }
}

function initFormValidation() {
    const membershipForm = document.querySelector('.membership-form');
    if (!membershipForm) return;

    membershipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('emailAddress');

        if (!nameInput || !emailInput) return;

        if (!nameInput.value.trim() || !emailInput.value.trim()) {
            alert('Please fill out all required fields properly.');
            showToast('Please fill out all required fields.', 'error');
            return;
        }

        const applicantData = {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            submittedAt: new Date().toISOString()
        };
        localStorage.setItem('synexus_applicant', JSON.stringify(applicantData));
        showToast('Application submitted successfully!', 'success');
        membershipForm.reset();
    });
}

function initProposalFormValidation() {
    const proposalForm = document.getElementById('proposal-form');
    if (!proposalForm) return;

    proposalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('initiative-title');
        const descInput = document.getElementById('initiative-desc');
        const feedbackMsg = document.getElementById('feedback-message');

        if (!titleInput || !titleInput.value.trim()) {
            if (feedbackMsg) {
                feedbackMsg.textContent = 'Please enter an initiative title.';
                feedbackMsg.style.color = '#ef4444';
            }
            showToast('Please enter an initiative title.', 'error');
            return;
        }

        if (feedbackMsg) {
            feedbackMsg.innerHTML = `<p class="loading-text" style="color: #4f46e5;">Processing submission...</p>`;
        }

        const payload = {
            title: titleInput.value.trim(),
            body: descInput ? descInput.value.trim() : ''
        };

        try {
            await submitInitiative(payload);
            if (feedbackMsg) {
                feedbackMsg.innerHTML = `<p style="color: #22c55e;">✅ Proposal submitted to server!</p>`;
            }
            showToast('Proposal submitted successfully!', 'success');
            proposalForm.reset();
            
        } catch (error) {
            if (error.message === "OFFLINE_SAVED") {
                if (feedbackMsg) {
                    feedbackMsg.innerHTML = `<p style="color: #f59e0b;">📡 You are offline. Proposal saved securely to your device and will sync later!</p>`;
                }
                showToast('Network offline. Saved securely to device.', 'info');
                proposalForm.reset();
            } else {
                if (feedbackMsg) {
                    feedbackMsg.innerHTML = `<p style="color: #ef4444;">⚠️ ${error.message}</p>`;
                }
                showToast(error.message, 'error');
            }
        }
    });
}

function initAutoSyncListeners() {
    window.addEventListener('online', async () => {
        showToast("Internet connection restored. Syncing data...", "info");
        const success = await syncOfflineProposals();
        if (success) {
            showToast("Offline data successfully synced to server!", "success");
        }
    });

    window.addEventListener('load', () => {
        if (navigator.onLine) {
            syncOfflineProposals();
        }
    });
}

function initCrudOperations() {
    const gridContainer = document.getElementById('dynamic-grid');
    if (gridContainer && !gridContainer.dataset.crudInit) {
        gridContainer.dataset.crudInit = 'true';

        gridContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const itemId = e.target.getAttribute('data-id');
                const confirmed = confirm("Are you sure you want to delete this record?");
                if (!confirmed) return;

                try {
                    await deleteRecord(itemId);
                    showToast("Record successfully deleted!", "success");
                    e.target.closest('.card')?.remove();
                } catch (error) {
                    console.error("Delete error:", error);
                    showToast(error.message, "error");
                }
            }
        });
    }
}

function initKanbanBoard() {
    const columns = document.querySelectorAll('.kanban-column');
    if (columns.length === 0) return;

    function updateCounts() {
        columns.forEach(col => {
            const list = col.querySelector('.task-list');
            const badge = col.querySelector('.column-count');
            if (list && badge) {
                badge.textContent = list.querySelectorAll('.task-card').length;
            }
        });
    }

    function saveState() {
        const state = {};
        columns.forEach(col => {
            const list = col.querySelector('.task-list');
            if (list && col.id) {
                const tasks = [];
                list.querySelectorAll('.task-card').forEach(card => {
                    tasks.push(card.textContent.trim());
                });
                state[col.id] = tasks;
            }
        });
        localStorage.setItem('synexus_kanban_data', JSON.stringify(state));
    }

    function setupCard(card) {
        card.setAttribute('draggable', 'true');

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.textContent.trim());
            card.classList.add('is-dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('is-dragging');
            saveState();
            updateCounts();
        });
    }

    columns.forEach(col => {
        const list = col.querySelector('.task-list');
        if (!list) return;

        if (!list.dataset.kanbanInitialized) {
            list.dataset.kanbanInitialized = 'true';

            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.is-dragging');
                if (draggingCard) {
                    list.appendChild(draggingCard);
                    saveState();
                    updateCounts();
                    showToast('Task status updated!', 'success');
                }
            });
        }
    });

    const saved = localStorage.getItem('synexus_kanban_data');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            Object.keys(state).forEach(colId => {
                const col = document.getElementById(colId);
                if (col) {
                    const list = col.querySelector('.task-list');
                    if (list) {
                        list.innerHTML = ''; 
                        state[colId].forEach(text => {
                            const newCard = document.createElement('div');
                            newCard.className = 'task-card';
                            newCard.textContent = text;
                            setupCard(newCard);
                            list.appendChild(newCard);
                        });
                    }
                }
            });
        } catch (e) {
            console.error('Error loading kanban state:', e);
        }
    } else {
        document.querySelectorAll('.task-card').forEach(setupCard);
    }

    updateCounts();
}

function initTaskTracker() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.querySelector('.task-tracker-section #task-list');

    if (!taskInput || !addTaskBtn || !taskListContainer) return;

    let taskState = [];

    function saveStateToStorage() {
        localStorage.setItem('synexus_taskState', JSON.stringify(taskState));
    }

    function loadStateFromStorage() {
        const storedTasks = localStorage.getItem('synexus_taskState');
        if (storedTasks) {
            try {
                taskState = JSON.parse(storedTasks);
            } catch (e) {
                taskState = [];
            }
        }
    }

    function renderTasks() {
        taskListContainer.innerHTML = '';

        if (taskState.length === 0) {
            taskListContainer.innerHTML = `
                <li class="empty-state" style="text-align: center; color: var(--text-muted, #64748b); padding: 1rem 0; list-style: none;">
                    ✨ No milestones yet. Add your first task above!
                </li>
            `;
            return;
        }

        taskState.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'done' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="toggle-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button class="delete-btn" data-id="${task.id}">&times;</button>
            `;
            taskListContainer.appendChild(li);
        });
    }

    function handleAddTask() {
        const textValue = taskInput.value.trim();
        if (textValue === '') return;

        taskState.push({
            id: Date.now(),
            text: textValue,
            completed: false
        });

        saveStateToStorage();
        taskInput.value = '';
        renderTasks();
        showToast("Successfully added new task!", "success");
    }

    if (!addTaskBtn.dataset.taskInitialized) {
        addTaskBtn.dataset.taskInitialized = 'true';

        addTaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAddTask();
        });

        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTask();
            }
        });

        taskListContainer.addEventListener('click', (e) => {
            const target = e.target;
            const targetId = Number(target.getAttribute('data-id'));
            if (!targetId) return;

            if (target.classList.contains('delete-btn')) {
                taskState = taskState.filter(task => task.id !== targetId);
                saveStateToStorage();
                renderTasks();
                showToast("Task deleted.", "error");
            }

            if (target.classList.contains('toggle-check')) {
                const foundTask = taskState.find(task => task.id === targetId);
                if (foundTask) {
                    foundTask.completed = target.checked;
                    saveStateToStorage();
                    renderTasks();
                    showToast(foundTask.completed ? "Task marked as completed!" : "Task marked as active.", "success");
                }
            }
        });
    }

    loadStateFromStorage();
    renderTasks();
}

function initGitHubLookup() {
    const searchInput = document.getElementById('github-username-input');
    const profileContainer = document.getElementById('github-profile-card');
    const searchBtn = document.getElementById('fetch-user-btn');

    if (!searchInput || !profileContainer) return;
    if (searchBtn) searchBtn.style.display = 'none';

    let currentController = null;

    async function handleContributorSearch(username) {
        const cleanUsername = username.trim();
        if (!cleanUsername) {
            profileContainer.style.display = 'none';
            profileContainer.innerHTML = '';
            return;
        }

        if (currentController) currentController.abort();
        currentController = new AbortController();

        profileContainer.style.display = "block";
        profileContainer.innerHTML = `<p style="text-align: center; color: #64748b;">Searching GitHub for "@${cleanUsername}"...</p>`;

        try {
            const result = await fetchGitHubUser(cleanUsername, currentController.signal);
            const profileData = result.data;
            
            profileContainer.innerHTML = `
                <div class="profile-card card" style="margin-top: 1rem; text-align: center; padding: 1.5rem;">
                    <img src="${profileData.avatar_url}" alt="Avatar" style="width: 100px; border-radius: 50%; margin-bottom: 1rem;">
                    <h3>${profileData.name || profileData.login}</h3>
                    <p style="color: #64748b;">@${profileData.login}</p>
                    <p>${profileData.bio || "No bio available."}</p>
                    <p><strong>Public Repos:</strong> ${profileData.public_repos} | <strong>Followers:</strong> ${profileData.followers}</p>
                    <a href="${profileData.html_url}" target="_blank" class="btn-primary" style="text-decoration: none; padding: 0.5rem 1rem; display: inline-block;">View Profile &rarr;</a>
                </div>
            `;
            showToast("GitHub profile updated!", "success");
        } catch (error) {
            if (error.name === 'AbortError') return;
            profileContainer.innerHTML = `<p style="text-align: center; color: #ef4444;">⚠️ ${error.message}</p>`;
            showToast(error.message, "error");
        }
    }

    if (!searchInput.dataset.lookupInitialized) {
        searchInput.dataset.lookupInitialized = 'true';
        searchInput.addEventListener('input', debounce((e) => handleContributorSearch(e.target.value), 500));
    }
}

function initDashboardView() {
    const dashboardContainer = document.getElementById('dashboard-container');
    const dashboardInput = document.getElementById('dashboard-username-input');
    const dashboardBtn = document.getElementById('fetch-dashboard-btn');

    if (!dashboardContainer || !dashboardInput || !dashboardBtn) return;

    dashboardBtn.addEventListener('click', async () => {
        const username = dashboardInput.value.trim();
        if (!username) return;

        dashboardContainer.innerHTML = `<p style="text-align: center; color: #64748b;">🚀 Loading dashboard components in parallel...</p>`;

        try {
            const { profile, recentRepos, recentFollowers } = await fetchDashboardData(username);
            let reposHTML = recentRepos.map(repo => `<li><a href="${repo.html_url}" target="_blank">${repo.name}</a> (⭐ ${repo.stargazers_count})</li>`).join('');
            let followersHTML = recentFollowers.map(f => `<img src="${f.avatar_url}" alt="${f.login}" width="32" style="border-radius: 50%; margin-right: 4px;" title="${f.login}">`).join('');

            dashboardContainer.innerHTML = `
                <div class="dashboard-card card" style="padding: 1.5rem; margin-top: 1rem; background: #fff; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${profile.avatar_url}" alt="Avatar" width="60" style="border-radius: 50%;">
                        <div>
                            <h3>${profile.name || profile.login}</h3>
                            <p style="color: #64748b;">${profile.bio || 'No bio available.'}</p>
                        </div>
                    </div>
                    <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #e5e7eb;">
                    <h4>Top Recent Repositories:</h4>
                    <ul>${reposHTML || '<li>No public repositories found.</li>'}</ul>
                    <h4 style="margin-top: 1rem;">Recent Followers:</h4>
                    <div>${followersHTML || '<span>No followers found.</span>'}</div>
                </div>
            `;
            showToast("Dashboard data loaded successfully!", "success");
        } catch (error) {
            dashboardContainer.innerHTML = `<p style="text-align: center; color: #ef4444;">⚠️ ${error.message}</p>`;
            showToast(error.message, "error");
        }
    });
}

function initWebSocketTerminal() {
    connectWebSocket();
    const wsInput = document.getElementById('ws-input');
    const wsSendBtn = document.getElementById('ws-send');

    if (wsSendBtn && wsInput && !wsSendBtn.dataset.wsBound) {
        wsSendBtn.dataset.wsBound = 'true';
        wsSendBtn.addEventListener('click', () => {
            const text = wsInput.value.trim();
            if (text === '') return;
            sendLiveMessage(text);
            wsInput.value = '';
        });
    }
}

function initServiceWorker() {
    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
        }
    });
}

function initMentorModal() {
    const modal = document.getElementById('mentor-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close-btn');
    const modalName = document.getElementById('modal-mentor-name');
    const modalRole = document.getElementById('modal-mentor-role');
    const modalDomain = document.getElementById('modal-mentor-domain');
    const modalSkillsList = document.getElementById('modal-mentor-skills-list');
    const modalLinkedin = document.getElementById('modal-mentor-linkedin');

    document.querySelectorAll('.explore-mentor-btn').forEach(button => {
        if (button.dataset.modalListenerAttached) return;
        button.dataset.modalListenerAttached = 'true';

        button.addEventListener('click', () => {
            if (modalName) modalName.textContent = button.getAttribute('data-name');
            if (modalRole) modalRole.textContent = button.getAttribute('data-role');
            if (modalDomain) modalDomain.textContent = button.getAttribute('data-domain');
            if (modalLinkedin) modalLinkedin.setAttribute('href', button.getAttribute('data-linkedin'));
            
            if (modalSkillsList) {
                modalSkillsList.innerHTML = '';
                const detailsAttr = button.getAttribute('data-details');
                if (detailsAttr) {
                    detailsAttr.split(';').forEach(point => {
                        if (point.trim().length > 0) {
                            const li = document.createElement('li');
                            li.textContent = point.trim();
                            modalSkillsList.appendChild(li);
                        }
                    });
                }
            }
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

const testimonials = [
    { name: "Harshit Singh", quote: "\"Synexus changed how I approach engineering. It's about logic, not just languages.\"" },
    { name: "Anant Sharma", quote: "\"Building production-grade projects here gave me the real-world confidence classrooms couldn't.\"" },
    { name: "Abhay Aditya R S", quote: "\"The design culture and fluid architectures we push here elevate every developer's portfolio.\"" },
    { name: "P V Pavitra", quote: "\"Operations is about removing friction and turning raw ambition into structured execution.\"" },
    { name: "K V Greeshma", quote: "\"Synexus is where I learned that mentorship and collaboration are as crucial as code itself.\"" }
];

function initTestimonials() {
    let currentTestimonialIndex = 0;
    const testimonialName = document.getElementById("testimonial-name");
    const testimonialQuote = document.getElementById("testimonial-quote");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    function updateTestimonial(index) {
        if (!testimonialName || !testimonialQuote) return;
        testimonialName.textContent = testimonials[index].name;
        testimonialQuote.textContent = testimonials[index].quote;
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length; updateTestimonial(currentTestimonialIndex); });
    if (prevBtn) prevBtn.addEventListener("click", () => { currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length; updateTestimonial(currentTestimonialIndex); });
}

function initSmoothScrollRouter() {
    const navLinks = document.querySelectorAll('.nav-links a, .nav-trigger-btn, .banner-btn');
    const panes = document.querySelectorAll('.section-pane');

    panes.forEach(pane => {
        pane.style.display = 'block';
        pane.classList.add('active-pane');
    });

    navLinks.forEach(link => {
        if (!link.dataset.scrollListener) {
            link.dataset.scrollListener = 'true';
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.replace('#', '');
                    const targetElement = document.getElementById(targetId) || document.getElementById(targetId + '-pane');
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }
    });
}

// --- NATIVE WEB COMPONENT: SYNEXUS CARD ---
class SynexusCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'description', 'badge', 'variant'];
    }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || 'Default Title';
        const description = this.getAttribute('description') || 'Default description text goes here.';
        const badge = this.getAttribute('badge') || 'Web Component';
        const variant = this.getAttribute('variant') || 'standard';

        this.shadowRoot.innerHTML = `
            <style>
                .card-wrapper {
                    background: var(--bg-card, #f8fafc);
                    border: 1px solid var(--border-color, #cbd5e1);
                    border-radius: 12px;
                    padding: 20px;
                    font-family: inherit;
                    color: var(--text-main, #0f172a);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    pointer-events: auto;
                }
                .card-wrapper:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .card-wrapper.featured {
                    border-color: #6366f1;
                    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
                }
                .badge {
                    display: inline-block;
                    background-color: rgba(79, 70, 229, 0.1);
                    color: #4f46e5;
                    font-weight: 700;
                    font-size: 0.75rem;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }
                .card-wrapper.featured .badge {
                    background: #6366f1;
                    color: #ffffff;
                }
                h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.25rem;
                }
                p {
                    margin: 0;
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
            </style>
            <div class="card-wrapper ${variant}">
                <span class="badge">${badge}</span>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;

        const wrapper = this.shadowRoot.querySelector('.card-wrapper');
        if (wrapper && !wrapper.dataset.listenerAttached) {
            wrapper.dataset.listenerAttached = 'true';
            wrapper.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('card-click', {
                    detail: { title },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }
}

customElements.define('synexus-card', SynexusCard);

// --- NATIVE WEB COMPONENT: UI CARD ---
class UICard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['badge', 'title-text', 'description'];
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('card-select', {
                detail: { title: this.getAttribute('title-text') },
                bubbles: true,
                composed: true
            }));
        });
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const badge = this.getAttribute('badge') || '';
        const title = this.getAttribute('title-text') || '';
        const desc = this.getAttribute('description') || '';

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }
                .card:hover {
                    transform: translateY(-2px);
                }
                .badge {
                    background: #ede9fe;
                    color: #6d28d9;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    display: inline-block;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                }
                h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.25rem;
                    color: #0f172a;
                }
                p {
                    margin: 0;
                    color: #475569;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
            </style>
            <div class="card">
                ${badge ? `<span class="badge">${badge}</span>` : ''}
                <h3>${title}</h3>
                <p>${desc}</p>
            </div>
        `;
    }
}

customElements.define('ui-card', UICard);

// Listen to component interactions globally
document.addEventListener('card-click', (e) => {
    showToast(`Clicked card: ${e.detail.title}`, 'info');
});

document.addEventListener('card-select', (e) => {
    showToast(`Selected UI Card: ${e.detail.title}`, 'info');
});

// --- WEB WORKER MULTITHREADING ---
const processBtn = document.getElementById('process-btn');
const terminateBtn = document.getElementById('terminate-btn');
const outputDisplay = document.getElementById('computation-output');

let backgroundWorker;
if (window.Worker) {
    backgroundWorker = new Worker('worker.js');
    backgroundWorker.onmessage = function(event) {
        const payload = event.data;
        if (payload.status === 'SUCCESS') {
            outputDisplay.innerHTML = `<p style="color: green;">✅ Math Complete: ${payload.data}</p>`;
            processBtn.disabled = false;
            processBtn.textContent = "Run Heavy Process";
        }
    };
}

if (processBtn) {
    processBtn.addEventListener('click', () => {
        outputDisplay.innerHTML = `<p class="loading-text">Processing 2 billion iterations in the background...</p>`;
        processBtn.disabled = true;
        processBtn.textContent = "Processing...";
        backgroundWorker.postMessage('START_COMPUTATION');
    });
}

if (terminateBtn && backgroundWorker) {
    terminateBtn.addEventListener('click', () => {
        backgroundWorker.terminate();
        outputDisplay.innerHTML = `<p style="color: red;">🛑 Process forcibly canceled by user.</p>`;
        processBtn.disabled = false;
        processBtn.textContent = "Run Heavy Process";
        backgroundWorker = new Worker('worker.js');
    });
}

// ==========================================
// DAY 43: GLOBAL STATE MANAGEMENT (PUB/SUB DEMO)
// ==========================================
function initGlobalStoreDemo() {
    // --- COMPONENT A: The Header/Display (The Subscriber) ---
    const cartCounterDisplay = document.getElementById('cart-count-display');

    if (cartCounterDisplay) {
        // Set the initial value on load from whatever the store currently holds
        cartCounterDisplay.textContent = `Items in Cart: ${globalStore.getState().cartCount}`;

        // We tell the store: "Hey, whenever ANY data changes, run this function!"
        globalStore.subscribe((currentState) => {
            // The UI automatically reacts to the new data
            cartCounterDisplay.textContent = `Items in Cart: ${currentState.cartCount}`;

            // Add a quick animation class to show it updated
            cartCounterDisplay.classList.add('flash-update');
            setTimeout(() => cartCounterDisplay.classList.remove('flash-update'), 300);
        });
    }

    // --- COMPONENT B: The Product Add Button (The Publisher) ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const currentData = globalStore.getState();

            // Dispatch state change incrementing the count
            globalStore.setState({
                cartCount: currentData.cartCount + 1
            });

            showToast(`Cart updated — ${currentData.cartCount + 1} item(s) now in cart!`, 'success');
        });
    }

    // --- COMPONENT C: The Product Remove Button (Rectified Fix) ---
    const removeFromCartBtn = document.getElementById('remove-from-cart-btn');

    if (removeFromCartBtn) {
        removeFromCartBtn.addEventListener('click', () => {
            const currentData = globalStore.getState();
            
            // Ensure cart count doesn't fall below 0
            const newCount = Math.max(0, currentData.cartCount - 1);

            globalStore.setState({
                cartCount: newCount
            });

            showToast(`Cart updated — ${newCount} item(s) now in cart!`, 'info');
        });
    }

    // --- COMPONENT D: Optional Reset Cart Button Support ---
    const resetCartBtn = document.getElementById('reset-cart-btn');

    if (resetCartBtn) {
        resetCartBtn.addEventListener('click', () => {
            globalStore.setState({
                cartCount: 0
            });

            showToast('Cart has been reset.', 'info');
        });
    }
}

function initApp() {
    console.log("Synexus Core ES6 Modular Architecture Initialized.");
    initThemeToggle();
    initMobileMenu();
    initInitiativesSearch();
    initKanbanBoard();
    initTaskTracker(); 
    initGitHubLookup();
    initDashboardView();
    initWebSocketTerminal();
    initServiceWorker(); 
    initMentorModal();
    initFormValidation();
    initProposalFormValidation(); 
    initAutoSyncListeners();
    initCrudOperations();
    initTestimonials();
    initSmoothScrollRouter();
    initGlobalStoreDemo(); // DAY 43
}

document.addEventListener('DOMContentLoaded', initApp);