// fileName: jmarcooo/tns-content-moderation/tns-content-moderation-764addffa1c2b5b5df3f12cfa95de572b7efee06/video-labelling-logic.js
window.VideoLabelApp = {
    timerInterval: null,
    secondsElapsed: 0,
    tasksLabelled: 0,
    selectedLabels: new Set(),

    init() {
        if(typeof Auth !== 'undefined') Auth.requireLogin();
        this.loadNextTask();
        this.startTimer();
        this.bindKeys();
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
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('workbench').style.display = 'none';
        
        // Reset State
        this.selectedLabels.clear();
        document.querySelectorAll('.btn-label').forEach(btn => btn.classList.remove('selected'));
        const remarkBox = document.getElementById('labelling-remarks');
        if(remarkBox) remarkBox.value = '';

        const task = this.generateTask();
        
        // Bind Data
        document.getElementById('info-id').innerText = task.id;
        document.getElementById('info-duration').innerText = task.duration;
        document.getElementById('info-user').innerText = task.publisher;
        document.getElementById('info-followers').innerText = task.followers;

        // Set Video
        const videoEl = document.getElementById('main-video');
        if(videoEl) {
            videoEl.src = task.videoSrc;
            videoEl.load();
        }

        // Set Text
        document.getElementById('text-top').innerText = task.textTop;
        document.getElementById('text-bottom').innerText = task.textBottom;

        // Show Workbench
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('workbench').style.display = 'flex';
        }, 500); // Small artificial delay for effect
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
    }
};

document.addEventListener('DOMContentLoaded', () => { window.VideoLabelApp.init(); });
