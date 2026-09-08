/* ========================================== */
/* worker.js: The Isolated CPU Thread         */
/* ========================================== */

// Listen for messages coming from the main.js file
self.onmessage = function(event) {
    console.log("⚙️ [Worker] Message received from Main Thread:", event.data);
    
    const command = event.data;

    if (command === 'START_COMPUTATION') {
        console.log("⚙️ [Worker] Starting heavy CPU task...");
        
        let complexResult = 0;
        
        // A loop this big would normally freeze the entire browser window!
        for (let i = 0; i < 2000000000; i++) {
            complexResult += i;
        }

        console.log("⚙️ [Worker] Task complete. Sending data back.");
        
        // Send the final result back to the main thread
        self.postMessage({
            status: 'SUCCESS',
            data: complexResult
        });
    }
};

// Optional Error Handling inside the thread
self.onerror = function(error) {
    console.error("⚙️ [Worker] Thread Error:", error.message);
};