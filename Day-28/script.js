/* ========================================== */
/* DAY 25, 26 & 27: TRADITIONAL SCROLLING LANDING PAGE */
/* ========================================== */

// ==========================================
// 1. GLOBAL UI MODULES (Run once on load)
// ==========================================

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

// ==========================================
// 2. COMPONENT MODULES
// ==========================================

// ⚡ INITIATIVES DATA & REAL-TIME SEARCH MODULE
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
                    <h3 style="color: #4f46e5; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">${item.title}</h3>
                    <p style="color: #4b5563; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;">${item.desc}</p>
                </div>
                <div class="card-footer" style="margin-top: auto; display: flex; align-items: center; width: 100%;">
                    <span class="status-badge" style="background-color: ${item.badgeBg}; color: ${item.badgeColor}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;">${item.status}</span>
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
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('emailAddress');

        if (!nameInput || !emailInput) return;

        if (!nameInput.value.trim() || !emailInput.value.trim()) {
            e.preventDefault();
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
    });
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

// ==========================================
// DAY 28: REAL-TIME DEBOUNCED GITHUB LOOKUP
// ==========================================

function initGitHubLookup() {
    const searchInput = document.getElementById('github-username-input');
    const profileContainer = document.getElementById('github-profile-card');
    const searchBtn = document.getElementById('fetch-user-btn');

    if (!searchInput || !profileContainer) return;

    // 1. Hide the manual search button since we are going real-time
    if (searchBtn) {
        searchBtn.style.display = 'none';
    }

    let currentController = null; // Used for AbortController to prevent race conditions

    // 2. Debounce Utility (500ms delay)
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    async function fetchContributor(username) {
        const cleanUsername = username.trim();
        
        if (!cleanUsername) {
            profileContainer.style.display = 'none';
            profileContainer.innerHTML = '';
            return;
        }

        // Abort any ongoing previous fetch request
        if (currentController) {
            currentController.abort();
        }
        currentController = new AbortController();

        profileContainer.style.display = "block";
        profileContainer.innerHTML = `<p style="text-align: center; color: #64748b;">Searching GitHub for "@${cleanUsername}"...</p>`;

        try {
            const response = await fetch(`https://api.github.com/users/${cleanUsername}`, {
                signal: currentController.signal
            });

            // 3. Handle rate limits and errors explicitly
            if (response.status === 403 || response.status === 429) {
                throw new Error("GitHub API rate limit exceeded. Please wait a moment and try again.");
            }
            if (response.status === 404) {
                throw new Error("No developer matches that GitHub handle.");
            }
            if (!response.ok) {
                throw new Error("User not found. Please check the username.");
            }

            const data = await response.json();
            profileContainer.innerHTML = `
                <div class="profile-card card" style="margin-top: 1rem; text-align: center; padding: 1.5rem;">
                    <img src="${data.avatar_url}" alt="Avatar" style="width: 100px; border-radius: 50%; margin-bottom: 1rem;">
                    <h3>${data.name || data.login}</h3>
                    <p style="color: #64748b;">@${data.login}</p>
                    <p>${data.bio || "No bio available."}</p>
                    <p><strong>Public Repos:</strong> ${data.public_repos} | <strong>Followers:</strong> ${data.followers}</p>
                    <a href="${data.html_url}" target="_blank" class="btn-primary" style="text-decoration: none; padding: 0.5rem 1rem; display: inline-block;">View Profile &rarr;</a>
                </div>
            `;
            showToast("GitHub profile updated!", "success");

        } catch (error) {
            if (error.name === 'AbortError') {
                return; // Request cancelled due to newer typing input — ignore silently
            }
            profileContainer.innerHTML = `<p style="text-align: center; color: #ef4444;">⚠️ ${error.message}</p>`;
            showToast(error.message, "error");
        }
    }

    // 4. Attach debounced input listener if not already initialized
    if (!searchInput.dataset.lookupInitialized) {
        searchInput.dataset.lookupInitialized = 'true';

        const debouncedSearch = debounce((e) => {
            fetchContributor(e.target.value);
        }, 500);

        searchInput.addEventListener('input', debouncedSearch);
    }
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

    if (closeBtn && !closeBtn.dataset.listenerAttached) {
        closeBtn.dataset.listenerAttached = 'true';
        closeBtn.addEventListener('click', closeModal);
    }

    if (!window.modalGlobalListenersAttached) {
        window.modalGlobalListenersAttached = true;
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
}

// ==========================================
// 3. TESTIMONIALS CAROUSEL MODULE
// ==========================================

const testimonials = [
    {
        name: "Harshit Singh",
        quote: "\"Synexus changed how I approach engineering. It's about logic, not just languages.\""
    },
    {
        name: "Anant Sharma",
        quote: "\"Building production-grade projects here gave me the real-world confidence classrooms couldn't.\""
    },
    {
        name: "Abhay Aditya R S",
        quote: "\"The design culture and fluid architectures we push here elevate every developer's portfolio.\""
    },
    {
        name: "P V Pavitra",
        quote: "\"Operations is about removing friction and turning raw ambition into structured, execution-ready engineering roadmaps.\""
    },
    {
        name: "K V Greeshma",
        quote: "\"Synexus is where I learned that mentorship and collaboration are as crucial as code itself.\""
    }
];

function initTestimonials() {
    let currentTestimonialIndex = 0;
    let autoSlideInterval;

    const testimonialName = document.getElementById("testimonial-name");
    const testimonialQuote = document.getElementById("testimonial-quote");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    function updateTestimonial(index) {
        if (!testimonialName || !testimonialQuote) return;
        testimonialName.textContent = testimonials[index].name;
        testimonialQuote.textContent = testimonials[index].quote;
    }

    function nextTestimonial() {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        updateTestimonial(currentTestimonialIndex);
    }

    function prevTestimonial() {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        updateTestimonial(currentTestimonialIndex);
    }

    function resetTimer() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextTestimonial, 3000);
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextTestimonial();
            resetTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevTestimonial();
            resetTimer();
        });
    }

    autoSlideInterval = setInterval(nextTestimonial, 3000);
}

// ==========================================
// 4. SMOOTH SCROLL ROUTER & INITIALIZATION
// ==========================================

function initSmoothScrollRouter() {
    const navLinks = document.querySelectorAll('.nav-links a, .nav-trigger-btn, .banner-btn');
    const panes = document.querySelectorAll('.section-pane');

    // Ensure all sections are visible for traditional scrolling layout
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
                        window.history.pushState(null, null, href);
                    }

                    const menuToggle = document.querySelector('.menu-toggle');
                    const navMenu = document.querySelector('.nav-links');
                    if (menuToggle && navMenu && navMenu.classList.contains('nav-active')) {
                        menuToggle.setAttribute('aria-expanded', 'false');
                        navMenu.classList.remove('nav-active');
                    }
                }
            });
        }
    });
}

function initApp() {
    console.log("Synexus Core Traditional Scrolling Engine Initialized.");
    initThemeToggle();
    initMobileMenu();
    initInitiativesSearch();
    initKanbanBoard();
    initTaskTracker(); 
    initGitHubLookup();
    initMentorModal();
    initFormValidation();
    initTestimonials();
    initSmoothScrollRouter();
}

document.addEventListener('DOMContentLoaded', initApp);

// ==========================================
// TOAST NOTIFICATION MODULE (Day 27)
// ==========================================

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const bgColor = type === 'error' ? '#ef4444' : '#10b981';
    
    toast.style.cssText = `
        background-color: ${bgColor};
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 0.95rem;
        font-family: inherit;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}