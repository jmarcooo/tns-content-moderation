window.ImageViewer = {
    scale: 1, rotate: 0, flip: 1,
    open(src) {
        const viewer = document.getElementById('imageViewer');
        const target = document.getElementById('viewer-img-target');
        if(viewer && target) {
            target.src = src;
            this.reset();
            viewer.style.display = 'flex';
        }
    },
    close() { document.getElementById('imageViewer').style.display = 'none'; },
    reset() { this.scale = 1; this.rotate = 0; this.flip = 1; this.update(); },
    update() {
        const target = document.getElementById('viewer-img-target');
        if(target) target.style.transform = `scale(${this.scale}) rotate(${this.rotate}deg) scaleX(${this.flip})`;
    }
};

window.LabelApp = {
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
            if(e.key === 'Escape') window.ImageViewer.close();
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
        const id = Math.floor(Math.random() * 999999999999).toString();
        const publishers = ['Creative_Studio', 'InnoLab', 'GamerPro', 'Tech_Insider', 'Artistic_Soul'];
        let task = { 
            id, source: "Organic Feed",
            publisher: publishers[Math.floor(Math.random() * publishers.length)],
            followers: Math.floor(Math.random() * 500000).toLocaleString(),
            publishTime: new Date().toLocaleString(),
            images: [], textTop: "", textBottom: ""
        };
        const imgCount = Math.floor(Math.random() * 3) + 1;
        for(let i=0; i<imgCount; i++) task.images.push(`https://picsum.photos/400/300?r=${Math.random()}`);
        
        const titles = ["Innovation!", "Check this out", "Healthy vibes", "New Project"];
        const descs = ["This is the latest trend happening now.", "Please subscribe for more content.", "Just a random thought of the day."];
        
        task.textTop = titles[Math.floor(Math.random() * titles.length)];
        task.textBottom = descs[Math.floor(Math.random() * descs.length)];
        
        return task;
    },

    loadNextTask() {
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('workbench').style.display = 'none';
        
        this.selectedLabels.clear();
        document.querySelectorAll('.btn-label').forEach(btn => btn.classList.remove('selected'));
        const remarkBox = document.getElementById('labelling-remarks');
        if(remarkBox) remarkBox.value = '';
        this.updateCounter();

        const task = this.generateTask();
        
        document.getElementById('info-id').innerText = task.id;
        document.getElementById('info-source').innerText = task.source;
        document.getElementById('info-time').innerText = task.publishTime;
        document.getElementById('info-user').innerText = task.publisher;
        document.getElementById('info-followers').innerText = task.followers;

        const imgContainer = document.getElementById('image-container');
        
        // Consistent Image Rendering
        imgContainer.innerHTML = task.images.map(src => 
            `<div class="content-image-card"><img src="${src}" onclick="window.ImageViewer.open(this.src)"></div>`
        ).join('');

        // Consistent Text Rendering (Split)
        document.getElementById('text-top').innerText = task.textTop;
        document.getElementById('text-bottom').innerText = task.textBottom;

        document.getElementById('loader').style.display = 'none';
        document.getElementById('workbench').style.display = 'flex';
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
        this.updateCounter();
    },

    updateCounter() {
        const el = document.getElementById('selected-count');
        if(el) el.innerText = this.selectedLabels.size;
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
        if(this.selectedLabels.size === 0) { alert("⚠️ Please select a label before submitting."); return; }
        const counter = document.getElementById('session-counter');
        if(counter) counter.innerText = ++this.tasksLabelled;
        this.loadNextTask();
    },

    skipTask() {
        this.loadNextTask();
    }
};

document.addEventListener('DOMContentLoaded', () => { window.LabelApp.init(); });
