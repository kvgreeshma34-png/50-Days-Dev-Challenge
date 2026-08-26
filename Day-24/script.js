document.addEventListener('DOMContentLoaded', () => {

    /* ========================================== */
    /* 1. DAY 24: ROUTE DEFINITIONS              */
    /* ========================================== */

    const routes = {
        404: `
            <div class="view-container text-center" style="text-align: center; padding: 4rem 1rem;">
                <h1 style="font-size: 4rem; color: #ef4444; margin-bottom: 0.5rem;">404</h1>
                <h2 style="margin-bottom: 1rem; color: #1e293b;">Page Not Found</h2>
                <p style="color: #64748b; margin-bottom: 2rem;">You strayed from the path. The requested route does not exist.</p>
                <a href="/" class="nav-link btn-primary" style="padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 8px;">Return to Home</a>
            </div>
        `,
        "/": `
            <section class="hero-section view-container" style="text-align: center; padding: 3rem 1rem;">
                <h1 style="font-size: 2.5rem; color: #0f172a; margin-bottom: 1rem;">Welcome to Synexus Core</h1>
                <p style="font-size: 1.15rem; color: #475569; max-width: 600px; margin: 0 auto 2rem auto;">
                    Standard, not a trend. The logic, not a language. Powered by zero-reload Single Page Application routing.
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <a href="/initiatives" class="nav-link btn-primary" style="padding: 0.75rem 1.25rem; text-decoration: none; border-radius: 6px;">Explore Initiatives</a>
                    <a href="/kanban" class="nav-link" style="padding: 0.75rem 1.25rem; text-decoration: none; border: 1px solid #cbd5e1; border-radius: 6px; color: #334155;">View Kanban Board</a>
                </div>
            </section>
        `,
        "/initiatives": `
            <section class="initiatives-section view-container">
                <h2 class="section-title">Active Initiatives</h2>
                <div class="search-container" style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem;">
                    <input type="text" id="search-projects" placeholder="Search initiatives..." style="flex: 1; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px;">
                    <button id="clear-search" style="display: none; padding: 0.6rem 1rem; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">Clear</button>
                </div>
                <div id="dynamic-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;"></div>
            </section>

            <section class="task-tracker-container view-container" style="margin-top: 3rem;">
                <h2>Roadmap Task Tracker</h2>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <input type="text" id="task-input" placeholder="Add a new milestone..." style="flex: 1; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px;">
                    <button id="add-task-btn" class="btn-primary" style="padding: 0.6rem 1.2rem;">Add</button>
                </div>
                <ul id="task-list" style="list-style: none; padding: 0;"></ul>
            </section>
        `,
        "/kanban": `
            <section class="kanban-section view-container">
                <h2 class="section-title">Project Kanban Board</h2>
                <div class="kanban-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                    <div class="kanban-column" id="todo-col">
                        <h3>To Do <span class="column-count">0</span></h3>
                        <div class="task-list">
                            <div class="task-card" draggable="true">Project StoreLane</div>
                            <div class="task-card" draggable="true">AI Code Reviewer Engine</div>
                        </div>
                    </div>
                    <div class="kanban-column" id="progress-col">
                        <h3>In Progress <span class="column-count">0</span></h3>
                        <div class="task-list">
                            <div class="task-card" draggable="true">QR Attendance Tracker</div>
                            <div class="task-card" draggable="true">Smart Energy Monitor</div>
                        </div>
                    </div>
                    <div class="kanban-column" id="done-col">
                        <h3>Done <span class="column-count">0</span></h3>
                        <div class="task-list">
                            <div class="task-card" draggable="true">Logistics Management System</div>
                            <div class="task-card" draggable="true">Campus Event Portal</div>
                        </div>
                    </div>
                </div>
            </section>
        `
    };

    /* ========================================== */
    /* 2. SPA ROUTER ENGINE                      */
    /* ========================================== */

    function getNormalizedPath() {
        let rawPath = window.location.pathname;
        
        // Strip repository subpaths or index.html for local/GitHub Pages compatibility
        if (rawPath.includes('/Day-24')) rawPath = rawPath.replace(/.*\/Day-24/, '');
        if (rawPath.includes('/index.html')) rawPath = rawPath.replace('/index.html', '');
        
        // Clean up trailing slash and empty paths
        if (rawPath === '' || rawPath === '/') return '/';
        return rawPath.replace(/\/$/, '');
    }

    function router() {
        const appRoot = document.getElementById('app-root');
        if (!appRoot) return;

        const path = getNormalizedPath();
        const viewHTML = routes[path] || routes[404];

        // Inject dynamic UI view
        appRoot.innerHTML = viewHTML;

        // Re-initialize dynamic module listeners attached to newly injected DOM elements
        reinitializeRouteModules(path);
    }

    /* ========================================== */
    /* 3. EVENT DELEGATION & NAVIGATION INTERCEPT */
    /* ========================================== */

    document.body.addEventListener('click', e => {
        const link = e.target.closest('.nav-link');
        
        if (link) {
            e.preventDefault();
            
            const targetHref = link.getAttribute('href');
            window.history.pushState({}, "", targetHref);
            router();
        }
    });

    window.addEventListener('popstate', router);

    /* ========================================== */
    /* 4. MODULE INITIALIZERS ON ROUTE SWAP       */
    /* ========================================== */

    function reinitializeRouteModules(path) {
        if (path === '/initiatives') {
            initInitiativesModule();
            initTaskTrackerModule();
        } else if (path === '/kanban') {
            initKanbanBoard();
        }
        observeElements();
    }

    /* ========================================== */
    /* 5. MODULE: KANBAN BOARD                   */
    /* ========================================== */

    function initKanbanBoard() {
        const taskCards = document.querySelectorAll('.kanban-board .task-card');
        const kanbanColumns = document.querySelectorAll('.kanban-column');

        function updateColumnCounts() {
            kanbanColumns.forEach(column => {
                const countBadge = column.querySelector('.column-count');
                const taskList = column.querySelector('.task-list');
                const count = taskList ? taskList.querySelectorAll('.task-card').length : 0;
                if (countBadge) countBadge.textContent = count;
            });
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.task-card:not(.is-dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        taskCards.forEach(card => {
            card.addEventListener('dragstart', () => card.classList.add('is-dragging'));
            card.addEventListener('dragend', () => {
                card.classList.remove('is-dragging');
                updateColumnCounts();
            });
        });

        kanbanColumns.forEach(column => {
            const taskList = column.querySelector('.task-list');
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
                const draggedCard = document.querySelector('.is-dragging');
                if (!draggedCard || !taskList) return;
                const afterElement = getDragAfterElement(taskList, e.clientY);
                if (afterElement == null) {
                    taskList.appendChild(draggedCard);
                } else {
                    taskList.insertBefore(draggedCard, afterElement);
                }
            });
            column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
            column.addEventListener('drop', () => {
                column.classList.remove('drag-over');
                updateColumnCounts();
            });
        });

        updateColumnCounts();
    }

    /* ========================================== */
    /* 6. MODULE: INITIATIVES DATA & SEARCH       */
    /* ========================================== */

    const initiativesData = [
        { id: 'storelane', title: "Project StoreLane", description: "A phygital hyperlocal commerce platform.", status: "ACTIVE" },
        { id: 'qr-attendance', title: "QR Attendance Tracker", description: "Automated student attendance system.", status: "ACTIVE" },
        { id: 'logistics', title: "Logistics Management System", description: "Desktop architecture for shipment tracking.", status: "COMPLETED" },
        { id: 'ai-code-reviewer', title: "AI Code Reviewer Engine", description: "Automated PR analysis tool.", status: "ACTIVE" }
    ];

    function initInitiativesModule() {
        const dynamicGrid = document.getElementById('dynamic-grid');
        const searchInput = document.getElementById('search-projects');
        const clearSearchBtn = document.getElementById('clear-search');

        function renderItems(items) {
            if (!dynamicGrid) return;
            dynamicGrid.innerHTML = items.map(item => `
                <div class="card initiative-card hidden" style="padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3>${item.title}</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">${item.description}</p>
                    <span style="display: inline-block; margin-top: 1rem; font-size: 0.75rem; font-weight: bold; color: ${item.status === 'ACTIVE' ? '#059669' : '#475569'};">${item.status}</span>
                </div>
            `).join('');
            observeElements();
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (clearSearchBtn) clearSearchBtn.style.display = query ? 'block' : 'none';
                const filtered = initiativesData.filter(i => i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query));
                renderItems(filtered);
            });
        }

        if (clearSearchBtn && searchInput) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                renderItems(initiativesData);
            });
        }

        renderItems(initiativesData);
    }

    /* ========================================== */
    /* 7. MODULE: ROADMAP TASK TRACKER           */
    /* ========================================== */

    let taskState = JSON.parse(localStorage.getItem('synexus_taskState') || '[]');

    function initTaskTrackerModule() {
        const taskInput = document.getElementById('task-input');
        const addTaskBtn = document.getElementById('add-task-btn');
        const taskListContainer = document.getElementById('task-list');

        function renderTasks() {
            if (!taskListContainer) return;
            if (taskState.length === 0) {
                taskListContainer.innerHTML = `<li style="color: #94a3b8; font-size: 0.9rem;">No milestones yet.</li>`;
                return;
            }
            taskListContainer.innerHTML = taskState.map(t => `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;">
                    <span style="${t.completed ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${t.text}</span>
                    <button class="delete-btn" data-id="${t.id}" style="background: none; border: none; color: #ef4444; cursor: pointer;">&times;</button>
                </li>
            `).join('');
        }

        if (addTaskBtn && taskInput) {
            addTaskBtn.addEventListener('click', () => {
                const text = taskInput.value.trim();
                if (!text) return;
                taskState.push({ id: Date.now(), text, completed: false });
                localStorage.setItem('synexus_taskState', JSON.stringify(taskState));
                taskInput.value = '';
                renderTasks();
            });
        }

        if (taskListContainer) {
            taskListContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    const id = Number(e.target.getAttribute('data-id'));
                    taskState = taskState.filter(t => t.id !== id);
                    localStorage.setItem('synexus_taskState', JSON.stringify(taskState));
                    renderTasks();
                }
            });
        }

        renderTasks();
    }

    /* ========================================== */
    /* 8. INTERSECTION OBSERVER                  */
    /* ========================================== */

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    function observeElements() {
        document.querySelectorAll('.hidden').forEach(el => scrollObserver.observe(el));
    }

    // INITIAL ROUTE BOOTSTRAP
    router();
});

/* ========================================== */
/* DAY 24: VANILLA JS SPA ROUTER ENGINE       */
/* ========================================== */

(function initSPARouter() {
    // 1. SPA Route Definitions (All navbar routes defined)
    const spaRoutes = {
        404: `
            <div class="spa-view spa-404-container">
                <div class="spa-404-title">404</div>
                <h2 class="spa-404-subtitle">Route Not Found</h2>
                <p class="spa-404-text">The path you navigated to does not exist in the Synexus Core route registry.</p>
                <a href="/" class="btn-primary nav-link" style="text-decoration: none; padding: 0.75rem 1.5rem; display: inline-block;">Return Home</a>
            </div>
        `,
        "/about": `
            <section class="spa-view">
                <h2 class="section-title">About Synexus Core</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Peer-to-peer engineering community building production-grade applications.</p>
            </section>
        `,
        "/mentors": `
            <section class="spa-view">
                <h2 class="section-title">Engineering Mentors</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Learn directly from senior student leads and industry advisors.</p>
            </section>
        `,
        "/initiatives": `
            <section class="spa-view">
                <h2 class="section-title">Community Initiatives</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Explore our active open-source projects and developer pipelines.</p>
            </section>
        `,
        "/kanban": `
            <section class="spa-view">
                <h2 class="section-title">Project Kanban Board</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Active Sprint Kanban Board & Task Pipelines.</p>
            </section>
        `,
        "/faq": `
            <section class="spa-view">
                <h2 class="section-title">Frequently Asked Questions</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Find answers regarding membership, stack focus, and team roles.</p>
            </section>
        `,
        "/team": `
            <section class="spa-view">
                <h2 class="section-title">Team Synergia</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Meet the core committee driving developer initiatives.</p>
            </section>
        `,
        "/join": `
            <section class="spa-view">
                <h2 class="section-title">Join Synexus Core</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 2rem;">Submit your membership application to start building with us.</p>
            </section>
        `
    };

    // 2. Normalize Current Browser Path
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

    // 3. Main Route Execution Engine
    function renderRoute() {
        const appRoot = document.getElementById('app-root');
        const currentPath = getCleanPath();

        // Update Nav Active State Indicators
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Home Route: Render static sections
        if (currentPath === '/') {
            if (appRoot) appRoot.innerHTML = '';
            toggleStaticSections(true);
        } 
        // Dynamic Routes: Render matching view and hide home static sections
        else if (spaRoutes[currentPath]) {
            if (appRoot) appRoot.innerHTML = spaRoutes[currentPath];
            toggleStaticSections(false);
        } 
        // Fallback: 404 Route
        else {
            if (appRoot) appRoot.innerHTML = spaRoutes[404];
            toggleStaticSections(false);
        }
    }

    // Helper: Toggle visibility of landing page static sections
    function toggleStaticSections(visible) {
        const sections = document.querySelectorAll('.main-content > section, .main-content > hr');
        sections.forEach(sec => {
            sec.style.display = visible ? '' : 'none';
        });
    }

    // 4. Intercept Clicks on Nav Links for Client-Side Navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        const targetHref = link.getAttribute('href');

        if (targetHref && !targetHref.startsWith('#') && !targetHref.startsWith('http')) {
            e.preventDefault();
            window.history.pushState({}, '', targetHref);
            renderRoute();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 5. Handle Browser Back/Forward Buttons
    window.addEventListener('popstate', renderRoute);

    // Initial load route initialization
    document.addEventListener('DOMContentLoaded', renderRoute);
})();