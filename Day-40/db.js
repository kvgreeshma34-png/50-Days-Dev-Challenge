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
                ...payload,
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