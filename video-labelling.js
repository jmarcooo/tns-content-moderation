window.VideoLabelApp = {
    timerInterval: null,
    secondsElapsed: 0,
    tasksLabelled: 0,
    selectedLabels: new Set(),

    init() {
        console.log("VideoLabelApp initializing...");
        try {
            if(typeof Auth !== 'undefined') Auth.requireLogin();
            this.loadNextTask();
            this.startTimer();
            this.bindKeys();
        } catch (error) {
            console.error("Init Error:", error);
            this.showError(error);
        }
    },

    bindKeys() {
        document.addEventListener('keydown', (e) => {
            // Shortcuts 1-4 for labels
            if (['1','2','3','4'].includes(e.key)) {
                const buttons = document.querySelectorAll('.btn-label');
                const idx = parseInt(e.key) - 1;
                if(buttons[idx]) buttons[idx].click();
            }
            // Enter to submit (unless typing in remarks)
            if (e.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
                this.submitLabels();
            }
        });
    },

    generateTask() {
        const id = Math.floor(Math.random() * 999999999).toString();
        const publishers = ['VidCreator_Pro', 'Daily_Vlogs', 'Tech_Reviewer', 'News_Now_Official', 'Edu_Channel'];
        
        let task = { 
            id, 
            publisher: publishers[Math.floor(Math.random() * publishers.length)],
            followers: Math.floor(Math.random() * 2000000).toLocaleString(),
            duration: "00:" + (Math.floor(Math.random() * 50) + 10).toString().padStart(2, '0'), // Random seconds
            videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            textTop: "", textBottom: ""
        };
        
        const titles = ["Amazing scenery from my trip!", "How to code in Python", "Breaking News: Tech Update", "Funny Cat Compilation 2026"];
        const descs = ["Don't forget to like and subscribe!", "Link in bio for more info.", "What do you think about this?", "Watch till the end!"];
        
        task.textTop = titles[Math.floor(Math.random() * titles.length)];
        task.textBottom = descs[Math.floor(Math.random() * descs.length)];
        
        return task;
    },

    loadNextTask() {
        console.log("Loading next task...");
        
        // Ensure elements exist before trying to style them
        const loader = document.getElementById('loader');
        const workbench = document.getElementById('workbench');
        
        if (loader) loader.style.display = 'flex';
        if (workbench) workbench.style.display = 'none';
        
        // Reset State
        this.selectedLabels.clear();
        document.querySelectorAll('.btn-label').forEach(btn => btn.classList.remove('selected'));
        const remarkBox = document.getElementById('labelling-remarks');
        if(remarkBox) remarkBox.value = '';

        try {
            const task = this.generateTask();
            
            // Safe Element Binding helper
            const setSafe = (id, val) => {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
                else console.warn(`Missing element: ${id}`);
            };

            // Bind Data
            setSafe('info-id', task.id);
            setSafe('info-duration', task.duration);
            setSafe('info-user', task.publisher);
            setSafe('info-followers', task.followers);

            // Set Video
            const videoEl = document.getElementById('main-video');
            if(videoEl) {
                videoEl.src = task.videoSrc;
                videoEl.load();
            } else {
                console.warn("Main video element missing");
            }

            // Set Text
            setSafe('text-top', task.textTop);
            setSafe('text-bottom', task.textBottom);

            // Show Workbench
            setTimeout(() => {
                if(loader) loader.style.display = 'none';
                if(workbench) workbench.style.display = 'flex';
                console.log("Task loaded successfully.");
            }, 500);

        } catch (e) {
            console.error("Error inside loadNextTask:", e);
            this.showError(e);
        }
    },

    toggleLabel(btn, labelKey) {
        // Single selection mode for categorization
        if(this.selectedLabels.has(labelKey)) {
            this.selectedLabels.clear();
            btn.classList.remove('selected');
        } else {
            this.selectedLabels.clear();
            document.querySelectorAll('.btn-label').forEach(b => b.classList.remove('selected'));
            this.selectedLabels.add(labelKey);
            btn.classList.add('selected');
        }
    },

    startTimer() {
        this.secondsElapsed = 0;
        const timerEl = document.getElementById('timer');
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            const date = new Date(0);
            date.setSeconds(this.secondsElapsed);
            if(timerEl) timerEl.innerText = date.toISOString().substr(11, 8);
        }, 1000);
    },

    submitLabels() {
        if(this.selectedLabels.size === 0) { alert("⚠️ Please select a category before submitting."); return; }
        const counter = document.getElementById('session-counter');
        if(counter) counter.innerText = ++this.tasksLabelled;
        this.loadNextTask();
    },

    skipTask() {
        this.loadNextTask();
    },

    // Helper to show errors on screen
    showError(err) {
        const loader = document.getElementById('loader');
        if(loader) {
            loader.innerHTML = `<div style="color: red; text-align: center;">
                <h3>⚠️ Error Loading Task</h3>
                <p>${err.message}</p>
                <button onclick="location.reload()" style="padding: 8px 16px; margin-top: 10px; cursor: pointer;">Retry</button>
            </div>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => { window.VideoLabelApp.init(); });
