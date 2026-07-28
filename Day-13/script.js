// ==========================================================================
// DAY 12: MOBILE MENU TOGGLE LOGIC
// ==========================================================================
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
        // 1. Toggle the mobile navigation utility class
        navLinksContainer.classList.toggle('nav-active');

        // 2. Accessibility & Morph Toggle (☰ -> ✕)
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        menuToggle.textContent = !isExpanded ? '✕' : '☰';
    });

    // Close menu automatically when clicking any nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('nav-active')) {
                navLinksContainer.classList.remove('nav-active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.textContent = '☰';
            }
        });
    });
}

// ==========================================================================
// DAY 11: DOM FUNDAMENTALS & HERO INTERACTION
// ==========================================================================
console.log("Synexus Engine Initialized. Ready for logic.");

// 1. DOM SELECTION
const heroHeadline = document.querySelector('.hero-card h1');
const heroButton = document.querySelector('.hero-buttons .btn-primary');

// 2. EVENT LISTENER & DOM MANIPULATION
if (heroButton && heroHeadline) {
    heroButton.addEventListener('click', function(e) {
        // Prevent default anchor jump navigation for smooth demonstration
        e.preventDefault();

        // 3. DOM MANIPULATION (Toggle Text Content)
        if (heroHeadline.textContent.includes("Welcome to Synexus Core!")) {
            heroHeadline.innerHTML = 'Architecting The <br><span class="gradient-text">Next Generation</span> of Devs';
        } else {
            heroHeadline.textContent = "Welcome to Synexus Core!";
        }

        // Bonus Challenge: Toggle active CSS state class
        heroHeadline.classList.toggle('active-state');
    });
}

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

// ==========================================================================
// DAY 13: CLIENT-SIDE FORM VALIDATION LOGIC
// ==========================================================================
const membershipForm = document.querySelector('.membership-form');
const nameInput = document.getElementById('fullName');
const emailInput = document.getElementById('emailAddress');
const motivationInput = document.getElementById('motivation');

if (membershipForm && nameInput && emailInput) {

    // Helper: Clear old error messages and red borders
    function clearValidationState() {
        document.querySelectorAll('.error-text, .form-success-banner').forEach(el => el.remove());
        nameInput.classList.remove('input-error');
        emailInput.classList.remove('input-error');
    }

    // Helper: Inject dynamic inline error message below invalid field
    function showError(inputElement, message) {
        inputElement.classList.add('input-error');
        
        const errorText = document.createElement('p');
        errorText.className = 'error-text';
        errorText.textContent = message;
        
        inputElement.insertAdjacentElement('afterend', errorText);
    }

    // Intercept form submission
    membershipForm.addEventListener('submit', function(e) {
        // 1. Stop default page reload / instant FormSubmit redirect
        e.preventDefault();

        // 2. Clear previous error state
        clearValidationState();

        // 3. Extract and sanitize input values
        const nameValue = nameInput.value.trim();
        const emailValue = emailInput.value.trim();
        const motivationValue = motivationInput ? motivationInput.value.trim() : '';
        let isValid = true;

        // 4. Gatekeeper Conditional Validation Logic
        if (nameValue === "") {
            showError(nameInput, "Full Name is required.");
            isValid = false;
        }

        if (emailValue === "") {
            showError(emailInput, "Student Email is required.");
            isValid = false;
        } else if (!emailValue.includes('@') || !emailValue.includes('.')) {
            showError(emailInput, "Please enter a valid email address (e.g. name@student.edu).");
            isValid = false;
        }

        // 5. Success Execution
        if (isValid) {
            console.log("Success! Clean Application Data:", {
                fullName: nameValue,
                email: emailValue,
                motivation: motivationValue
            });

            // Show success banner
            const successBanner = document.createElement('div');
            successBanner.className = 'form-success-banner';
            successBanner.textContent = "🎉 Application validated successfully!";
            membershipForm.appendChild(successBanner);

            // Reset input fields
            membershipForm.reset();

            // NOTE: If you want FormSubmit.co to actually send the email after JS validation passes,
            // you can trigger a programmatic submit after a short delay:
            // setTimeout(() => membershipForm.submit(), 1500);
        }
    });
}