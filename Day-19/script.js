/* ========================================================================== */
/* DAY 19: SEARCH, FILTER, EVENT DELEGATION & DYNAMIC MODALS                 */
/* ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DATA PAYLOAD
    const projectsData = [
        {
            title: "Project StoreLane",
            description: "A phygital hyperlocal commerce platform designed to digitize small local vendors.",
            status: "Active"
        },
        {
            title: "QR Attendance Tracker",
            description: "Automated student attendance system utilizing progressive web app (PWA) tech and real-time scanning.",
            status: "Active"
        },
        {
            title: "Logistics Management System",
            description: "Desktop architecture built for tracking shipments and driver status in real-time.",
            status: "Completed"
        },
        {
            title: "AI Code Reviewer Engine",
            description: "Automated pull request analysis tool that detects syntax bugs and performance bottlenecks.",
            status: "Active"
        },
        {
            title: "Campus Event Portal",
            description: "Centralized university platform for RSVP tracking, ticket generation, and venue scheduling.",
            status: "Completed"
        },
        {
            title: "Smart Energy Monitor",
            description: "IoT dashboard providing real-time power consumption metrics and predictive outage alerts.",
            status: "Active"
        }
    ];

    // Selectors
    const gridContainer = document.getElementById('dynamic-grid') || 
                          document.querySelector('.initiatives-grid') || 
                          document.querySelector('.projects-grid');
                          
    const searchInput = document.getElementById('search-projects');
    const clearBtn = document.getElementById('clear-search');
    const projectModal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal');

    // Helpers
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(text, term) {
        if (!term) return text;
        const escapedTerm = escapeRegExp(term);
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        return text.replace(regex, '<mark class="highlight">$1</mark>');
    }

    // Render Function
    function renderProjects(dataArray, searchTerm = '') {
        if (!gridContainer) return;

        gridContainer.innerHTML = '';

        if (dataArray.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-results-message">
                    <p>🔍 No initiatives match your search for "${searchTerm}".</p>
                </div>
            `;
            return;
        }

        dataArray.forEach(project => {
            const statusClass = project.status === "Active" ? "status-active" : "status-completed";
            const highlightedTitle = highlightText(project.title, searchTerm);
            const highlightedDesc = highlightText(project.description, searchTerm);

            const cardHTML = `
                <div class="initiative-card card ${statusClass}">
                    <div>
                        <h3>${highlightedTitle}</h3>
                        <p>${highlightedDesc}</p>
                    </div>
                    <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span class="card-status-badge">${project.status}</span>
                        <button class="view-btn" data-title="${project.title}">View Details</button>
                    </div>
                </div>
            `;

            gridContainer.innerHTML += cardHTML;
        });
    }

    // Initial Render
    renderProjects(projectsData);

    // Search & Clear Listeners
    if (searchInput && clearBtn) {
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.trim();
            const normalizedTerm = searchTerm.toLowerCase();

            if (searchTerm.length > 0) {
                clearBtn.classList.add('show');
            } else {
                clearBtn.classList.remove('show');
            }

            const filteredProjects = projectsData.filter(project => {
                const titleMatch = project.title.toLowerCase().includes(normalizedTerm);
                const descMatch = project.description.toLowerCase().includes(normalizedTerm);
                return titleMatch || descMatch;
            });

            renderProjects(filteredProjects, searchTerm);
        });

        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.classList.remove('show');
            searchInput.focus();
            renderProjects(projectsData);
        });
    }

    // Day 19: Event Delegation
    if (gridContainer) {
        gridContainer.addEventListener('click', function(e) {
            const clickedButton = e.target.closest('.view-btn');
            if (!clickedButton) return;

            const projectTitle = clickedButton.getAttribute('data-title');
            if (modalTitle) modalTitle.textContent = projectTitle;
            if (projectModal) projectModal.style.display = 'flex';
        });
    }

    // Modal Closing Controls
    const closeModal = () => {
        if (projectModal) projectModal.style.display = 'none';
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (projectModal) {
        projectModal.addEventListener('click', function(e) {
            if (e.target === projectModal) closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && projectModal && projectModal.style.display === 'flex') {
            closeModal();
        }
    });
});