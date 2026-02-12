window.VideoLabelApp = {
    timerInterval: null,
    secondsElapsed: 0,
    tasksLabelled: 0,
    selectedLabels: new Set(),

    init() {
        console.log("App Init Started");
        try {
            // Safe Auth Check
            if(typeof Auth !== 'undefined' && Auth.requireLogin) {
                Auth.requireLogin();
            } else {
                console.warn("Auth module missing or offline mode.");
            }
            
            this.loadNextTask();
            this.startTimer();
            this.bindKeys();
        } catch (err) {
            console.error("Critical Init Error:", err);
            alert("Error starting app: " + err.message);
        }
    },

    bindKeys() {
        document.addEventListener('keydown', (e) => {
            if (['1','2','3','4'].includes(e.key)) {
                const buttons = document.querySelectorAll('.btn-label');
                const idx = parseInt(e.key) - 1;
                if(buttons[idx]) buttons[idx].click();
            }
            if (e.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
                this.submitLabels();
            }
        });
    },

    generateTask() {
        const id = Math.floor(Math.random() * 999999).toString();
        const publishers = ['VidCreator', 'DailyVlogs', 'TechReview', 'NewsNow', 'EduChannel'];
        
        let task = { 
            id, 
            publisher: publishers[Math.floor(Math.random() * publishers.length)],
            followers: Math.floor(Math.random() * 2000000).toLocaleString(),
            duration: "00:" + (Math.floor(Math.random() * 50) + 10).toString().padStart(2, '0'),
            // Using a standard, reliable MP4 link
            videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            textTop: "Video Title " + id, 
            textBottom: "This is a sample description for video " + id
        };
        return task;
    },

    loadNextTask() {
        // Show Loader
        const loader = document.getElementById('loader');
        const workbench = document.getElementById('workbench');
        if(loader) loader.style.display = 'flex';
        if(workbench) workbench.style.display = 'none';

        // Reset UI
        this.selectedLabels.clear();
        document.querySelectorAll('.btn-label').forEach(btn => btn.classList.remove('selected'));
        const remarkBox = document.getElementById('labelling-remarks');
        if(remarkBox) remarkBox.value = '';

        // Generate Data
        const task = this.generateTask();

        // Bind Data Safe Check
        const setTxt = (id, val) => { 
            const el = document.getElementById(id); 
            if(el) el.innerText = val; 
        };

        setTxt('info-id', task.id);
        setTxt('info-duration', task.duration);
        setTxt('info-user', task.publisher);
        setTxt('info-followers', task.followers);
        setTxt('text-top', task.textTop);
        setTxt('text-bottom', task.textBottom);

        // Load Video
        const videoEl = document.getElementById('main-video');
        if(videoEl) {
            videoEl.src = task.videoSrc;
            // NOTE: Removed videoEl.load() to prevent browser blocking issues
        }

        // Hide Loader (Simulate network delay then show)
        setTimeout(() => {
            if(loader) loader.style.display = 'none';
            if(workbench) workbench.style.display = 'flex';
            console.log("Task Loaded");
        }, 500);
    },

    toggleLabel(btn, labelKey) {
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
        if(this.selectedLabels.size === 0) { alert("⚠️ Please select a category."); return; }
        const counter = document.getElementById('session-counter');
        if(counter) counter.innerText = ++this.tasksLabelled;
        this.loadNextTask();
    },

    skipTask() {
        this.loadNextTask();
    }
};

// Wait for window load to ensure all scripts (auth, config) are ready
window.addEventListener('load', () => { window.VideoLabelApp.init(); });
