/* ========================================== */
/* db.js: IndexedDB Client-Side Database      */
/* ========================================== */

const DB_NAME = 'PlatformDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_proposals';

// 1. INITIALIZE THE DATABASE (Wrapped in a Promise)
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log(`🗄️ Database Store '${STORE_NAME}' created.`);
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error("IndexedDB Error:", event.target.errorCode);
            reject("Failed to open database.");
        };
    });
}

// 2. WRITE DATA (The POST Intercept)
export async function saveOfflineData(payload) {
    try {
        const db = await initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.add({
                payload, // Preserves structure expected by api.js sync loop
                savedAt: Date.now()
            });

            request.onsuccess = () => {
                console.log("💾 Data safely stored in IndexedDB for future sync.");
                resolve(true);
            };

            request.onerror = (error) => {
                console.error("Failed to save data:", error);
                reject(error);
            };
        });
    } catch (error) {
        console.error("DB Write Error:", error);
    }
}

// 3. READ DATA (Retrieve all pending offline proposals)
export async function getOfflineData() {
    try {
        const db = await initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (error) => {
                console.error("Failed to retrieve offline data:", error);
                reject(error);
            };
        });
    } catch (error) {
        console.error("DB Read Error:", error);
        return [];
    }
}

// 4. CLEAR DATA (Wipe offline queue after successful sync)
export async function clearOfflineData() {
    try {
        const db = await initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log("🧹 Offline queue successfully cleared.");
                resolve(true);
            };

            request.onerror = (error) => {
                console.error("Failed to clear offline data:", error);
                reject(error);
            };
        });
    } catch (error) {
        console.error("DB Clear Error:", error);
    }
}