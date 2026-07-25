// ==========================================================================
// 1. DARK MODE TOGGLE LOGIC
// ==========================================================================
const toggleBtn = document.getElementById('theme-toggle');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

// ==========================================================================
// 2. DYNAMIC MENTOR MODAL LOGIC
// ==========================================================================
const modal = document.getElementById('mentor-modal');
const closeBtn = document.querySelector('.modal-close-btn');
const modalName = document.getElementById('modal-mentor-name');
const modalRole = document.getElementById('modal-mentor-role');
const modalDomain = document.getElementById('modal-mentor-domain');
const modalSkillsList = document.getElementById('modal-mentor-skills-list');
const modalLinkedin = document.getElementById('modal-mentor-linkedin');

// Attach Click Listeners to all Mentor "Explore Role" Buttons
document.querySelectorAll('.explore-mentor-btn').forEach(button => {
    button.addEventListener('click', () => {
        modalName.textContent = button.getAttribute('data-name');
        modalRole.textContent = button.getAttribute('data-role');
        modalDomain.textContent = button.getAttribute('data-domain');
        modalLinkedin.setAttribute('href', button.getAttribute('data-linkedin'));
        
        // Clear previous bullet points
        modalSkillsList.innerHTML = '';
        
        // Parse semicolon-separated details and append as list items
        const structuralPoints = button.getAttribute('data-details').split(';');
        structuralPoints.forEach(point => {
            if (point.trim().length > 0) {
                const li = document.createElement('li');
                li.textContent = point.trim();
                modalSkillsList.appendChild(li);
            }
        });
        
        // Show modal and move focus for accessibility
        modal.classList.add('active');
        if (closeBtn) closeBtn.focus();
    });
});

// Close Modal Event Listeners
if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
}

// Close when clicking backdrop outside modal box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Close on Escape Key press
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
    }
});