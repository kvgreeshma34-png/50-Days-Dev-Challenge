document.addEventListener('DOMContentLoaded', () => {

    /* ========================================== */
    /* 1. DAY 23: KANBAN BOARD (DRAG AND DROP)    */
    /* ========================================== */

    function initKanbanBoard() {
        const taskCards = document.querySelectorAll('.kanban-board .task-card');
        const kanbanColumns = document.querySelectorAll('.kanban-column');

        // Update task count badges dynamically
        function updateColumnCounts() {
            kanbanColumns.forEach(column => {
                const countBadge = column.querySelector('.column-count');
                const taskList = column.querySelector('.task-list');
                const count = taskList ? taskList.querySelectorAll('.task-card').length : 0;
                if (countBadge) {
                    countBadge.textContent = count;
                }
            });
        }

        // Calculate drop position relative to cursor Y-coordinate
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.task-card:not(.is-dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2; // Distance from card center
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        // Configure Card Drag Events
        taskCards.forEach(card => {
            card.addEventListener('dragstart', () => {
                card.classList.add('is-dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('is-dragging');
                updateColumnCounts();
            });
        });

        // Configure Column Drop Zone Events
        kanbanColumns.forEach(column => {
            const taskList = column.querySelector('.task-list');

            column.addEventListener('dragover', (e) => {
                e.preventDefault(); // Unlocks drop zone
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

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', () => {
                column.classList.remove('drag-over');
                updateColumnCounts();
            });
        });

        // Initial count sync
        updateColumnCounts();
    }


    /* ========================================== */
    /* 2. DAY 22: INTERSECTION OBSERVER API      */
    /* ========================================== */

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    function observeElements() {
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((element) => {
            scrollObserver.observe(element);
        });
    }


    /* ========================================== */
    /* 3. DAY 21: DEBOUNCE UTILITY (CLOSURE)      */
    /* ========================================== */

    function debounce(func, delay = 300) {
        let timeoutId;

        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }


    /* ========================================== */
    /* 4. ACTIVE INITIATIVES & DEBOUNCED SEARCH   */
    /* ========================================== */

    const initiativesData = [
        {
            id: 'storelane',
            title: "Project StoreLane",
            description: "A phygital hyperlocal commerce platform designed to digitize small local vendors.",
            status: "ACTIVE",
            lead: "Anant Sharma",
            stack: ["React", "Node.js", "MongoDB", "Express", "Tailwind"],
            fullDetails: "StoreLane bridges offline local retail with online availability. It features real-time inventory synchronization, vendor dashboard management, and localized delivery routing for small business owners."
        },
        {
            id: 'qr-attendance',
            title: "QR Attendance Tracker",
            description: "Automated student attendance system utilizing progressive web app (PWA) tech and real-time scanning.",
            status: "ACTIVE",
            lead: "Harshit Singh",
            stack: ["PWA", "Java", "MySQL", "ZXing Library"],
            fullDetails: "Eliminates physical attendance registers by utilizing time-expiring dynamic QR codes generated per lecture slot. Features offline queue caching and automated attendance reports for faculty."
        },
        {
            id: 'logistics',
            title: "Logistics Management System",
            description: "Desktop architecture built for tracking shipments and driver status in real-time.",
            status: "COMPLETED",
            lead: "Synergia Core",
            stack: ["Java Swing", "PostgreSQL", "REST APIs"],
            fullDetails: "A high-performance desktop management console capable of monitoring fleet routes, driver shift logs, and package lifecycle milestones with real-time database state triggers."
        },
        {
            id: 'ai-code-reviewer',
            title: "AI Code Reviewer Engine",
            description: "Automated pull request analysis tool that detects syntax bugs and performance bottlenecks.",
            status: "ACTIVE",
            lead: "Anant Sharma",
            stack: ["Python", "FastAPI", "OpenAI API", "GitHub Actions"],
            fullDetails: "Integrates with GitHub webhooks to run automated static code analysis on every Pull Request. Generates inline code suggestions, security alert badges, and complexity breakdown summaries."
        },
        {
            id: 'campus-event',
            title: "Campus Event Portal",
            description: "Centralized university platform for RSVP tracking, ticket generation, and venue scheduling.",
            status: "COMPLETED",
            lead: "P V Pavitra",
            stack: ["MERN Stack", "Razorpay API", "Nodemailer"],
            fullDetails: "Central hub for managing institutional hackathons, technical workshops, and cultural events. Includes automated QR-coded ticket PDF generation and instant email registration confirmations."
        },
        {
            id: 'smart-energy',
            title: "Smart Energy Monitor",
            description: "IoT dashboard providing real-time power consumption metrics and predictive outage alerts.",
            status: "ACTIVE",
            lead: "Abhay Aditya R S",
            stack: ["ESP32", "MQTT", "React", "Chart.js"],
            fullDetails: "Monitors electrical grid telemetry across university labs using ESP32 microcontrollers. Displays live power usage graphs and issues predictive outage alerts based on voltage spikes."
        }
    ];

    const dynamicGrid = document.getElementById('dynamic-grid');
    const searchInput = document.getElementById('search-projects');
    const clearSearchBtn = document.getElementById('clear-search');

    const modalOverlay = document.getElementById('initiative-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function renderInitiatives(items) {
        if (!dynamicGrid) return;
        dynamicGrid.innerHTML = '';

        if (items.length === 0) {
            dynamicGrid.innerHTML = `<p style="text-align: center; color: var(--text-muted, #64748b); grid-column: 1 / -1; padding: 2rem 0;">No matching initiatives found.</p>`;
            return;
        }

        items.forEach(item => {
            const isActive = item.status === 'ACTIVE';
            const card = document.createElement('div');
            card.className = 'card initiative-card hidden';
            
            if (isActive) {
                card.style.borderColor = '#10b981';
            }

            card.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
                    <span class="status-tag" style="
                        padding: 0.35rem 0.75rem; 
                        border-radius: 20px; 
                        font-size: 0.75rem; 
                        font-weight: 700; 
                        background-color: ${isActive ? '#d1fae5' : '#e2e8f0'}; 
                        color: ${isActive ? '#065f46' : '#475569'};
                    ">${item.status}</span>
                    <button class="btn-primary view-details-btn" data-id="${item.id}" style="padding: 0.45rem 0.9rem; font-size: 0.85rem;">View Details</button>
                </div>
            `;
            dynamicGrid.appendChild(card);
        });

        observeElements();
    }

    function executeHeavySearch(e) {
        const query = e.target.value.toLowerCase().trim();
        console.log(`📡 [Network Simulation] Fetching filtered results for: "${query}"...`);
        
        const filtered = initiativesData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
        renderInitiatives(filtered);
    }

    function toggleClearButton() {
        if (clearSearchBtn && searchInput) {
            clearSearchBtn.style.display = searchInput.value.trim() !== '' ? 'block' : 'none';
        }
    }

    if (searchInput) {
        const debouncedSearch = debounce(executeHeavySearch, 300);

        searchInput.addEventListener('input', (e) => {
            toggleClearButton();
            debouncedSearch(e);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            toggleClearButton();
            renderInitiatives(initiativesData);
        });
    }

    renderInitiatives(initiativesData);


    /* ========================================== */
    /* 5. MODAL POPUP SYSTEM                      */
    /* ========================================== */

    function openModal(initiative) {
        if (!modalOverlay || !modalContent) return;

        const stackTags = initiative.stack.map(tech => `<span class="modal-tech-tag">${tech}</span>`).join('');

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <h2 style="margin: 0; font-size: 1.5rem; color: #1e293b;">${initiative.title}</h2>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;"><strong>Project Lead:</strong> ${initiative.lead}</p>
            <p style="line-height: 1.6; color: #334155; margin-bottom: 1.25rem;">${initiative.fullDetails}</p>
            <div style="margin-bottom: 1rem;">
                <strong style="font-size: 0.85rem; color: #475569; display: block; margin-bottom: 0.3rem;">Tech Stack:</strong>
                <div>${stackTags}</div>
            </div>
        `;

        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
    }

    if (dynamicGrid) {
        dynamicGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-details-btn');
            if (btn) {
                const targetId = btn.getAttribute('data-id');
                const selectedProject = initiativesData.find(item => item.id === targetId);
                if (selectedProject) openModal(selectedProject);
            }
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });


    /* ========================================== */
    /* 6. STATEFUL ROADMAP TASK TRACKER           */
    /* ========================================== */
    
    let taskState = [];

    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.getElementById('task-list');

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
        if (!taskListContainer) return;
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
        if (!taskInput) return;
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
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', handleAddTask);
    if (taskInput) {
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAddTask();
        });
    }

    if (taskListContainer) {
        taskListContainer.addEventListener('click', (e) => {
            const targetId = Number(e.target.getAttribute('data-id'));
            if (!targetId) return;

            if (e.target.classList.contains('delete-btn')) {
                taskState = taskState.filter(task => task.id !== targetId);
                saveStateToStorage();
            }

            if (e.target.classList.contains('toggle-check')) {
                const foundTask = taskState.find(task => task.id === targetId);
                if (foundTask) {
                    foundTask.completed = !foundTask.completed;
                    saveStateToStorage();
                }
            }

            renderTasks();
        });
    }

    // Initialize all modules
    initKanbanBoard();
    loadStateFromStorage();
    renderTasks();
    observeElements();
});