/* ========================================== */
/* DAY 25: PHASE 2 CAPSTONE ENGINE            */
/* ========================================== */

// ==========================================
// 1. GLOBAL UI MODULES (Run once on load)
// ==========================================

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Set initial theme state from LocalStorage
    const currentTheme = localStorage.getItem('synexus_theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.setAttribute('aria-pressed', 'true');
        themeToggleBtn.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
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
// 2. VIEW-SPECIFIC MODULES (Run on route)
// ==========================================

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
            return;
        }

        // Save submitted profile data to LocalStorage
        const applicantData = {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            submittedAt: new Date().toISOString()
        };
        localStorage.setItem('synexus_applicant', JSON.stringify(applicantData));
    });
}

function initScrollObserver() {
    const hiddenElements = document.querySelectorAll('.hidden');
    if (hiddenElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });

    hiddenElements.forEach((el) => observer.observe(el));
}

function initKanbanBoard() {
    const kanbanBoard = document.querySelector('.kanban-board');
    if (!kanbanBoard) return;

    const taskLists = document.querySelectorAll('.task-list');
    const tasks = document.querySelectorAll('.task-card');

    // Load saved Kanban state from LocalStorage if available
    const savedState = localStorage.getItem('synexus_kanban_state');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            Object.keys(parsedState).forEach((columnId) => {
                const column = document.getElementById(columnId);
                if (column) {
                    const taskList = column.querySelector('.task-list');
                    if (taskList) {
                        taskList.innerHTML = parsedState[columnId];
                    }
                }
            });
        } catch (e) {
            console.error('Failed to parse Kanban state:', e);
        }
    }

    // Re-attach Drag and Drop events
    document.querySelectorAll('.task-card').forEach(task => {
        task.setAttribute('draggable', 'true');
        task.addEventListener('dragstart', () => task.classList.add('dragging'));
        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
            saveKanbanState();
        });
    });

    taskLists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            if (draggingTask) list.appendChild(draggingTask);
        });
    });

    function saveKanbanState() {
        const state = {};
        document.querySelectorAll('.kanban-column').forEach(col => {
            const list = col.querySelector('.task-list');
            if (list) state[col.id] = list.innerHTML;
        });
        localStorage.setItem('synexus_kanban_state', JSON.stringify(state));
    }
}

// ==========================================
// 3. THE SPA ROUTER (The Orchestrator)
// ==========================================

const routes = {
    404: `
        <div class="spa-view spa-404-container" style="text-align: center; padding: 4rem 1rem;">
            <h1 style="font-size: 4rem; color: #ef4444; margin: 0;">404</h1>
            <h2>Route Not Found</h2>
            <p>The path you navigated to does not exist in the Synexus Core registry.</p>
            <a href="/" class="nav-link btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Return Home</a>
        </div>
    `,
    "/": `
        <section class="hero-container hidden">
            <div class="hero-card card">
                <span class="tech-badge">UI Component Architecture</span>
                <h1>Architecting The <br><span class="gradient-text">Next Generation</span> of Devs</h1>
                <p>Welcome to Synexus Core. We are a high-performance ecosystem building production-grade projects.</p>
                <div class="hero-buttons">
                    <a href="/team" class="nav-link btn-primary">Explore Team Synergia</a>
                    <a href="/initiatives" class="nav-link btn-primary">Learn Our Stack</a>
                </div>
            </div>
        </section>
        <hr class="section-divider">
        <section class="info-card-section hidden">
            <h2 class="section-title">Our Mission</h2>
            <div class="card info-card-body">
                <p>Synexus is a peer-to-peer engineering community focused on bridging theoretical knowledge and production-grade software engineering.</p>
            </div>
        </section>
    `,
    "/about": `
        <section class="info-card-section hidden">
            <h2 class="section-title">About Synexus Core</h2>
            <div class="card info-card-body">
                <p>Operating as a student-led engineering collective, we design scalable software pipelines, conduct open workshops, and deliver production systems.</p>
            </div>
        </section>
    `,
    "/mentors": `
        <section class="info-card-section hidden">
            <h2 class="section-title">Engineering Mentors</h2>
            <p style="text-align: center; color: #64748b;">Guidance provided by senior core architects and external tech advisors.</p>
        </section>
    `,
    "/initiatives": `
        <section class="info-card-section hidden">
            <h2 class="section-title">Active Community Initiatives</h2>
            <p style="text-align: center; color: #64748b;">Explore our developer pipelines and ongoing ecosystem projects.</p>
        </section>
    `,
    "/kanban": `
        <section class="kanban-section">
            <h2 class="section-title">Project Kanban Board</h2>
            <div class="kanban-board">
                <div class="kanban-column" id="todo-col">
                    <h3>To Do</h3>
                    <div class="task-list">
                        <div class="task-card" draggable="true">StoreLane E-Commerce System</div>
                        <div class="task-card" draggable="true">AI Code Reviewer Engine</div>
                    </div>
                </div>
                <div class="kanban-column" id="progress-col">
                    <h3>In Progress</h3>
                    <div class="task-list">
                        <div class="task-card" draggable="true">QR Attendance Tracker</div>
                        <div class="task-card" draggable="true">Smart Energy Monitor</div>
                    </div>
                </div>
                <div class="kanban-column" id="done-col">
                    <h3>Done</h3>
                    <div class="task-list">
                        <div class="task-card" draggable="true">Campus Event Portal</div>
                    </div>
                </div>
            </div>
        </section>
    `,
    "/faq": `
        <section class="info-card-section hidden">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <div class="faq-container card">
                <details class="faq-item">
                    <summary>Who can join Synexus Core?</summary>
                    <p>Any passionate developer interested in building software systems.</p>
                </details>
            </div>
        </section>
    `,
    "/team": `
        <section class="team-section hidden">
            <h2 class="section-title">Leadership Team</h2>
            <div class="team-grid">
                <div class="card profile-card">
                    <img src="greeshma.jpg" alt="K V Greeshma">
                    <h3>K V Greeshma</h3>
                    <p class="role-subtitle">Core Member, Team-Synergia</p>
                </div>
                <div class="card profile-card">
                    <img src="rithika.jpg" alt="Rithika M">
                    <h3>Rithika M</h3>
                    <p class="role-subtitle">Core Member, Team-Synergia</p>
                </div>
            </div>
        </section>
    `,
    "/join": `
        <section class="info-card-section">
            <h2 class="section-title">Join The Engineering Community</h2>
            <div class="join-card card">
                <form class="membership-form" action="https://formsubmit.co/2944f6bba7fb9bedad8fd4af7cfe7f3f" method="POST">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="fullName">Full Name *</label>
                        <input type="text" id="fullName" name="fullName" placeholder="Jane Doe" required style="width: 100%; padding: 0.5rem;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="emailAddress">Student Email *</label>
                        <input type="email" id="emailAddress" name="emailAddress" placeholder="jane@student.edu" required style="width: 100%; padding: 0.5rem;">
                    </div>
                    <button type="submit" class="btn-primary" style="padding: 0.75rem 1.5rem; cursor: pointer;">Submit Application</button>
                </form>
            </div>
        </section>
    `
};

function getCleanPath() {
    let path = window.location.pathname;
    if (path.includes('/50-Days-Dev-Challenge')) {
        path = path.replace(/.*\/50-Days-Dev-Challenge/, '');
    }
    if (path.endsWith('index.html')) {
        path = path.replace('index.html', '');
    }
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path || '/';
}

function router() {
    const currentPath = getCleanPath();
    const appRoot = document.getElementById('app-root');
    const viewHTML = routes[currentPath] || routes[404];

    if (appRoot) {
        appRoot.innerHTML = viewHTML;
    }

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ⚡ ROUTER LIFECYCLE HOOKS: Execute local initializers after view injection
    if (currentPath === '/' || currentPath === '/about' || currentPath === '/team' || currentPath === '/faq') {
        initScrollObserver();
    } else if (currentPath === '/join') {
        initFormValidation();
    } else if (currentPath === '/kanban') {
        initKanbanBoard();
    }
}

// ==========================================
// 4. ENGINE INITIALIZATION
// ==========================================

function initApp() {
    console.log("Synexus Core Application Engine: Online.");

    // 1. Initialize persistent global features
    initThemeToggle();
    initMobileMenu();

    // 2. Intercept navigation for client-side routing
    document.body.addEventListener('click', e => {
        const link = e.target.closest('.nav-link');
        if (link) {
            const targetHref = link.getAttribute('href');
            if (targetHref && !targetHref.startsWith('#') && !targetHref.startsWith('http')) {
                e.preventDefault();
                window.history.pushState(null, "", targetHref);
                router();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Handle browser back/forward history navigation
    window.addEventListener('popstate', router);

    // 3. Execute initial route render
    router();
}

// Ensure the HTML DOM tree is ready before starting the engine
document.addEventListener('DOMContentLoaded', initApp);