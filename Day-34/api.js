// ==========================================
// API & NETWORK MODULE (Day 34: Resilient Networks)
// ==========================================

import { fetchWithRetry } from './utils.js';

// 1. THE MEMORY BANK
const apiCache = new Map();

export async function fetchGitHubUser(username, signal) {
    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername) {
        throw new Error("Username cannot be empty.");
    }

    // 2. THE CACHE INTERCEPT
    if (apiCache.has(cleanUsername)) {
        console.log(`⚡ Serving [${cleanUsername}] from local cache!`);
        return { 
            data: apiCache.get(cleanUsername), 
            fromCache: true 
        };
    }

    console.log(`📡 Fetching [${cleanUsername}] from external server with resilience wrapper...`);

    // 3. Use the resilient fetchWithRetry wrapper instead of raw fetch()
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

    // 4. SAVE TO MEMORY (Only on successful fetch)
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

export async function deleteRecord(itemId) {
    const response = await fetch(`https://api.example.com/items/${itemId}`, {
        method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
        throw new Error("Failed to delete the item from server.");
    }
    return response;
}

export async function updateRecord(itemId, payload) {
    const response = await fetch(`https://api.example.com/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok && response.status !== 404) {
        throw new Error("Failed to update record.");
    }
    return response;
}