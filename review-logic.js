// Attach ImageViewer to window to ensure HTML access
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
    close() { 
        const viewer = document.getElementById('imageViewer');
        if(viewer) viewer.style.display = 'none'; 
    },
    reset() { this.scale = 1; this.rotate = 0; this.flip = 1; this.update(); },
    transform(action) {
        if (action === 'zoomIn') this.scale += 0.2;
        if (action === 'zoomOut') this.scale = Math.max(0.2, this.scale - 0.2);
        if (action === 'rotateR') this.rotate += 90;
        if (action === 'rotateL') this.rotate -= 90;
        if (action === 'flip') this.flip *= -1;
        this.update();
    },
    update() {
        const target = document.getElementById('viewer-img-target');
        if(target) {
            target.style.transform = `scale(${this.scale}) rotate(${this.rotate}deg) scaleX(${this.flip})`;
        }
    }
};

window.ReviewApp = {
    timerInterval: null,
    secondsElapsed: 0,
    tasksCompleted: 0,
    currentTargetForDrawer: '',
    queueName: '',
    
    init() {
        if(typeof Auth !== 'undefined') {
            const user = Auth.requireLogin();
            if(user) {
                const el = document.getElementById('reviewer-name');
                if(el) el.innerText = user.name;
            }
        }
        const urlParams = new URLSearchParams(window.location.search);
        this.queueName = urlParams.get('queue') || 'Review';
        const tenant = urlParams.get('tenant') || 'BP';
        
        const titleEl = document.getElementById('queue-title');
        if(titleEl) titleEl.innerText = `${tenant} ${this.queueName}`;

        this.renderViolations();
        this.loadNextTask();
        this.bindKeys();
    },

    bindKeys() {
        const defaults = { 
            'approve-content': '1', 
            'reject-content': '2', 
            'approve-text': '3', 
            'reject-text': '4', 
            'approve-all': 'Ctrl+1', 
            'reject-all': 'Ctrl+2', 
            'next': 'Enter' 
        };
        const binds = JSON.parse(localStorage.getItem('appKeybinds')) || defaults;

        const getPressedString = (e) => {
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return null;
            let keys = [];
            if (e.ctrlKey) keys.push('Ctrl');
            if (e.altKey) keys.push('Alt');
            if (e.shiftKey) keys.push('Shift');
            if (e.metaKey) keys.push('Meta');
            let char = e.key;
            if (char === ' ') char = 'Space';
            if (char.length === 1) char = char.toUpperCase();
            keys.push(char);
            return keys.join('+');
        };

        const isVisible = (id) => {
            const el = document.getElementById(id);
            return el && el.style.display !== 'none';
        };

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const viewer = document.getElementById('imageViewer');
                if(viewer && viewer.style.display === 'flex') { e.preventDefault(); window.ImageViewer.close(); return; }
                const drawer = document.getElementById('violationDrawer');
                if(drawer && drawer.classList.contains('open')) { e.preventDefault(); this.closeDrawer(); return; }
            }
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const pressed = getPressedString(e);
            if (!pressed) return;

            if (pressed === binds['approve-content']) { if (!isVisible('module-content')) return; e.preventDefault(); this.setStatus('content', 'approve'); }
            else if (pressed === binds['reject-content']) { if (!isVisible('module-content')) return; e.preventDefault(); this.openDrawer('content'); }
            else if (pressed === binds['approve-text']) { if (!isVisible('module-text')) return; e.preventDefault(); this.setStatus('text', 'approve'); }
            else if (pressed === binds['reject-text']) { if (!isVisible('module-text')) return; e.preventDefault(); this.openDrawer('text'); }
            else if (pressed === binds['approve-all']) { e.preventDefault(); if(isVisible('module-content')) this.setStatus('content', 'approve'); if(isVisible('module-text')) this.setStatus('text', 'approve'); }
            else if (pressed === binds['reject-all']) { e.preventDefault(); this.openDrawer('both'); }
            else if (pressed === binds['next']) { e.preventDefault(); this.nextTask(); }
        });
    },

    generateTask() {
        const id = Math.floor(Math.random() * 99999);
        const type = this.queueName.toLowerCase();
        let task = { id, type, userId: "720" + Math.floor(Math.random()*1000), images: [], video: null, textTop: "", textBottom: "" };

        if (type.includes('video')) {
            // --- VIDEO TASK ---
            // Use a sample video URL for demonstration
            task.video = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            task.textTop = "Dynamic Video Review"; 
            task.textBottom = "Please review the video content for policy violations."; 
        
        } else if (type.includes('image')) {
            // --- IMAGE TASK ---
            const imgCount = Math.floor(Math.random() * 3) + 1;
            for(let i=0; i<imgCount; i++) task.images.push(`https://picsum.photos/400/300?r=${Math.random()}`);
            task.textTop = "Check out this content!"; 
            task.textBottom = "Please like and subscribe to my channel."; 
        
        } else if (type.includes('avatar')) {
            // --- AVATAR TASK ---
            task.images.push(`https://i.pravatar.cc/300?u=${id}`);
        
        } else if (type.includes('nick') || type.includes('profile')) {
            // --- TEXT ONLY TASK ---
            task.images = []; 
            task.textTop = "Old_Nickname_123"; 
            task.textBottom = "New_Nickname_SUPER"; 
        }
        return task;
    },

    loadNextTask() {
        this.stopTimer(); 
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('workbench').style.display = 'none';
        this.resetUI(); 

        const task = this.generateTask();
        document.getElementById('content-id').innerText = task.id;
        document.getElementById('content-type').innerText = this.queueName;
        document.getElementById('sidebar-task-id').innerText = `Task-${task.id}`;

        const modContent = document.getElementById('module-content');
        const modText = document.getElementById('module-text');
        const imgContainer = document.getElementById('image-container');

        // --- CONTENT RENDERING LOGIC ---
        if (task.video) {
            // RENDER VIDEO PLAYER
            modContent.style.display = 'block';
            
            // Override alignment to LEFT for video
            imgContainer.style.justifyContent = 'flex-start';

            // Increased size: max-width 950px, max-height 800px
            imgContainer.innerHTML = `
                <div class="video-player-wrapper" style="width: 100%; max-width: 950px; background: #000; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <video controls style="width: 100%; display: block; max-height: 800px;">
                        <source src="${task.video}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        } else if (task.images.length > 0) {
            // RENDER IMAGE GRID
            modContent.style.display = 'block';
            
            // Reset alignment to CENTER (default) for images
            imgContainer.style.justifyContent = ''; 

            imgContainer.innerHTML = task.images.map(src => 
                `<div class="content-image-card"><img src="${src}" onclick="window.ImageViewer.open(this.src)"></div>`
            ).join('');
        } else {
            modContent.style.display = 'none'; 
        }

        if (task.textTop || task.textBottom) {
            modText.style.display = 'block';
            document.getElementById('text-top').innerText = task.textTop;
            document.getElementById('text-bottom').innerText = task.textBottom;
            
            const lblTop = document.getElementById('label-top');
            const lblBottom = document.getElementById('label-bottom');
            const slotTop = document.getElementById('text-top');

            if (this.queueName.toLowerCase().includes('nick') || this.queueName.toLowerCase().includes('profile')) {
                lblTop.innerText = "Current (Old)";
                slotTop.classList.add("read-only");
                lblBottom.innerText = "New Request";
            } else {
                lblTop.innerText = "Title/Context";
                slotTop.classList.remove("read-only");
                lblBottom.innerText = "Description";
            }
        } else {
            modText.style.display = 'none';
        }

        document.getElementById('loader').style.display = 'none';
        document.getElementById('workbench').style.display = 'flex';
        this.startTimer(); 
    },

    startTimer() {
        this.secondsElapsed = 0;
        const timerEl = document.getElementById('timer');
        if(timerEl) timerEl.innerText = "00:00:00";
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            const date = new Date(0);
            date.setSeconds(this.secondsElapsed);
            if(timerEl) timerEl.innerText = date.toISOString().substr(11, 8);
        }, 1000);
    },
    stopTimer() { clearInterval(this.timerInterval); },

    resetUI() {
        this.closeDrawer(); 
        ['content', 'text'].forEach(t => {
            const badge = document.getElementById(`status-${t}`);
            if(badge) badge.style.display = 'none';
            const container = document.getElementById(`module-${t}`);
            if(container) container.querySelectorAll('.btn-sm').forEach(b => b.classList.remove('active'));
        });
        this.clearAllHighlights();
    },

    setStatus(target, status, reason='', preserve=false) {
        const container = document.getElementById(`module-${target}`);
        if(!container) return; 
        
        container.querySelectorAll('.btn-sm').forEach(b => b.classList.remove('active'));
        if (!preserve && target === 'text') this.clearAllHighlights();

        if(status === 'approve') container.querySelector('.btn-approve-sm').classList.add('active');
        if(status === 'restrict') container.querySelector('.btn-restrict-sm').classList.add('active');
        if(status === 'reject') container.querySelector('.btn-reject-sm').classList.add('active');

        const badge = document.getElementById(`status-${target}`);
        if(badge) {
            badge.style.display = 'block';
            if(status === 'approve') { badge.innerText="✅ APPROVED"; badge.className="decision-badge score-perfect"; }
            else if(status === 'restrict') { badge.innerText="⚠️ RESTRICTED"; badge.className="decision-badge score-good"; }
            else { badge.innerText=`⛔ REJECTED: ${reason}`; badge.className="decision-badge score-bad"; }
        }
    },

    clearAllHighlights() {
        document.querySelectorAll('.text-context-box').forEach(box => {
            box.innerHTML = box.innerText;
        });
    },

    handleTextSelection(slot) {
        const box = document.getElementById(`text-${slot}`);
        if (!box) return;
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) return;
        if (!box.contains(selection.anchorNode) || !box.contains(selection.focusNode)) return;
        
        const range = selection.getRangeAt(0);

        try {
            const span = document.createElement('span');
            span.className = 'restricted-text';
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
            selection.removeAllRanges();
            this.setStatus('text', 'restrict', '', true);
        } catch (e) { console.error("Highlighting failed", e); }
    },

    renderViolations() {
        if (typeof Config === 'undefined' || !Config.violations) return;
        const list = document.getElementById('violationList');
        let h = '';
        for(let [c, s] of Object.entries(Config.violations)) {
            h += `<div class="violation-category"><div class="category-trigger" onclick="this.nextElementSibling.classList.toggle('active')">${c} ▼</div><div class="violation-submenu">${s.map(sub=>`<div class="violation-option" onclick="window.ReviewApp.confirmReject('${c}-${sub}')">${sub}</div>`).join('')}</div></div>`;
        }
        list.innerHTML = h;
    },

    openDrawer(t) { 
        this.currentTargetForDrawer = t; 
        document.getElementById('violationDrawer')?.classList.add('open'); 
    },

    closeDrawer() { document.getElementById('violationDrawer')?.classList.remove('open'); },
    confirmReject(r) { 
        if (this.currentTargetForDrawer === 'both') {
            const mc = document.getElementById('module-content');
            const mt = document.getElementById('module-text');
            if(mc && mc.style.display !== 'none') this.setStatus('content', 'reject', r);
            if(mt && mt.style.display !== 'none') this.setStatus('text', 'reject', r);
        } else {
            this.setStatus(this.currentTargetForDrawer, 'reject', r); 
        }
        this.closeDrawer(); 
    },

    validateSubmission() {
        const isVisible = (elem) => elem && elem.style.display !== 'none';
        const contentModule = document.getElementById('module-content');
        if (isVisible(contentModule) && !contentModule.querySelector('.btn-sm.active')) { alert("⚠️ Missing decision for CONTENT."); return false; }
        const textModule = document.getElementById('module-text');
        if (isVisible(textModule)) {
            const activeBtn = textModule.querySelector('.btn-sm.active');
            if (!activeBtn) { alert("⚠️ Missing decision for TEXT."); return false; }
            if (activeBtn.classList.contains('btn-restrict-sm') && textModule.querySelectorAll('.restricted-text').length === 0) {
                alert("⚠️ For Restriction, please highlight the specific words in the text.");
                return false;
            }
        }
        return true;
    },

    nextTask() {
        if (!this.validateSubmission()) return;
        const counter = document.getElementById('session-counter');
        if(counter) counter.innerText = ++this.tasksCompleted;
        this.loadNextTask();
    },

    submitAndExit() { if (!this.validateSubmission()) return; this.closeDrawer(); window.location.href = 'moderation.html'; }
};

document.addEventListener('DOMContentLoaded', () => { window.ReviewApp.init(); });
