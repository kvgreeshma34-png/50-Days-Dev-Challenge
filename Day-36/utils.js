// ==========================================
// UTILITY MODULE
// ==========================================

export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function showToast(message, type = 'success') {
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

// ==========================================
// DAY 34: NETWORK RESILIENCE WRAPPER
// ==========================================

export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    // Optional Bonus: Check for hard offline states first
    if (!navigator.onLine) {
        throw new Error("No internet connection detected.");
    }

    for (let i = 0; i < retries; i++) {
        try {
            // Attempt the network request
            const response = await fetch(url, options);
            
            // If it's a 400-level error (like 404 Not Found), don't retry. It's a client error!
            if (response.status >= 400 && response.status < 500) {
                return response; 
            }
            
            // If it fails with a 500 (Server Error) or network drop, throw to trigger catch
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            // Return the raw response object on success
            return response;

        } catch (error) {
            // If we are on the very last loop iteration, give up and throw error
            if (i === retries - 1) {
                console.error(`Fetch completely failed after ${retries} attempts.`);
                throw error;
            }

            console.warn(`⚠️ Network attempt ${i + 1} failed. Retrying in ${backoff}ms...`);
            
            // Pause execution using a Promise-wrapped timeout
            await new Promise(resolve => setTimeout(resolve, backoff));
            
            // Exponential math: double the wait time for the next loop attempt
            backoff *= 2; 
        }
    }
}