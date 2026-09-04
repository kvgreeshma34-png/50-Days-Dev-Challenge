/* ========================================== */
/* api.js: Parallel Network Requests & Auth   */
/* ========================================== */

import { fetchWithRetry } from './utils.js';

// 1. THE MEMORY BANK
const apiCache = new Map();

// 2. THE AUTHENTICATION UTILITY
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        throw new Error("Access Denied: No authentication token found. Please log in.");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- DAY 37: PARALLEL DASHBOARD FETCHING ---
export async function fetchDashboardData(username) {
    const safeUsername = username.trim().toLowerCase();
    
    if (!safeUsername) {
        throw new Error("Username cannot be empty.");
    }

    console.log(`📡 Dispatching parallel requests for [${safeUsername}]...`);

    try {
        // 1. SETUP THE PROMISES (No 'await' here to fire them simultaneously)
        const profileReq = fetchWithRetry(`https://api.github.com/users/${safeUsername}`);
        const reposReq = fetchWithRetry(`https://api.github.com/users/${safeUsername}/repos?sort=updated&per_page=3`);
        const followersReq = fetchWithRetry(`https://api.github.com/users/${safeUsername}/followers?per_page=5`);

        // 2. THE MASTER AWAIT (Wait for all requests to finish in parallel)
        const responses = await Promise.all([profileReq, reposReq, followersReq]);

        // Gatekeeping: Check standard HTTP responses
        responses.forEach(res => {
            if (!res.ok) throw new Error("A network request failed.");
        });

        // 3. PARSE IN PARALLEL USING PROMISE.ALL
        const parsedData = await Promise.all(responses.map(res => res.json()));

        // 4. ARRAY DESTRUCTURING
        const [profile, repos, followers] = parsedData;

        // 5. RETURN A UNIFIED PAYLOAD
        return {
            profile: profile,
            recentRepos: repos,
            recentFollowers: followers
        };

    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        throw error;
    }
}

export async function fetchGitHubUser(username, signal) {
    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername) {
        throw new Error("Username cannot be empty.");
    }

    // 3. THE CACHE INTERCEPT
    if (apiCache.has(cleanUsername)) {
        console.log(`⚡ Serving [${cleanUsername}] from local cache!`);
        return { 
            data: apiCache.get(cleanUsername), 
            fromCache: true 
        };
    }

    console.log(`📡 Fetching [${cleanUsername}] from external server with resilience wrapper...`);

    // 4. Use the resilient fetchWithRetry wrapper instead of raw fetch()
    const response = await fetchWithRetry(`https://api.github.com/users/${cleanUsername}`, { signal });

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

    // 5. SAVE TO MEMORY (Only on successful fetch)
    apiCache.set(cleanUsername, data);

    return { 
        data, 
        fromCache: false 
    };
}

export async function fetchPaginatedPosts(page, limit) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch data.");
    return await response.json();
}

// 6. THE SECURE DELETE FUNCTION
export async function secureDeleteResource(targetId) {
    try {
        console.log(`🔒 Initiating secure deletion for resource #${targetId}...`);

        const headers = getAuthHeaders();

        const response = await fetchWithRetry(`https://jsonplaceholder.typicode.com/posts/${targetId}`, {
            method: 'DELETE',
            headers: headers
        });

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            throw new Error("Unauthorized: Your session has expired. Please log in again.");
        }

        if (response.status === 403) {
            throw new Error("Forbidden: You do not have permission to delete this resource.");
        }

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        console.log(`✅ Resource #${targetId} securely deleted.`);
        return true;

    } catch (error) {
        console.error("Security/Network Error:", error);
        throw error;
    }
}

export async function deleteRecord(itemId) {
    const headers = getAuthHeaders();
    const response = await fetchWithRetry(`https://api.example.com/items/${itemId}`, {
        method: 'DELETE',
        headers: headers
    });
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error("Unauthorized: Session expired.");
    }
    if (!response.ok && response.status !== 404) {
        throw new Error("Failed to delete the item from server.");
    }
    return response;
}

export async function updateRecord(itemId, payload) {
    const headers = getAuthHeaders();
    const response = await fetchWithRetry(`https://api.example.com/items/${itemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
    });
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error("Unauthorized: Session expired.");
    }
    if (!response.ok && response.status !== 404) {
        throw new Error("Failed to update record.");
    }
    return response;
}