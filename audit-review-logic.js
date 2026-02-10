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

window.AuditApp = {
    timerInterval: null,
    secondsElapsed: 0,
    tasksAudited: 0,
    queueName: '',
    currentTaskState: null, 

    init() {
        if(typeof Auth !== 'undefined') Auth.requireLogin();
        const urlParams = new URLSearchParams(window.location.search);
        this.queueName = urlParams.get('queue') || 'Audit';
        const tenant = urlParams.get('tenant') || 'Community';
        document.getElementById('queue-title').innerText = `${tenant} - ${this.queueName}`;
        this.loadNextTask();
        this.bindKeys();
    },

    bindKeys() {
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') { window.ImageViewer.close(); this.closeDrawer(); }
        });
    },

    generateAuditTask() {
        const id = Math.floor(Math.random() * 999999999999).toString();
        const type = this.queueName.toLowerCase();
        
        const decisions = ['Approve', 'Reject'];
        const modDecision = decisions[Math.floor(Math.random() * decisions.length)];
        let modReason = null;

        if (modDecision === 'Reject') {
            if (typeof Config !== 'undefined' && Config.violations) {
                const categories = Object.keys(Config.violations);
                const randCat = categories[Math.floor(Math.random() * categories.length)];
                const subReasons = Config.violations[randCat];
                modReason = subReasons[Math.floor(Math.random() * subReasons.length)]; 
            } else {
                modReason = "Violence - General";
            }
        }

        const modNames = ['kenneth.cortes', 'liezl.tejero', 'mark.villanueva', 'jon.odono'];
        const accountTypes = ['Normal User', 'Verified User', 'Influencer', 'New Account'];
        const publishers = ['User_7723', 'GamerPro', 'Anna_Banana', 'Test_Account'];

        let task = { 
            id, type, tenant: "BP/GP/Community",
            publisher: publishers[Math.floor(Math.random() * publishers.length)],
            accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
            publishTime: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toLocaleString(),
            images: [], textTop: "", textBottom: "",
            modDecision, modReason, 
            modName: modNames[Math.floor(Math.random() * modNames.length)],
            modTime: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toLocaleString(),
            userId: "User-" + Math.floor(Math.random() * 10000),
            level: "Lvl " + Math.floor(Math.random() * 50),
            violations: Math.floor(Math.random() * 5),
            taskId: "Task-" + id
        };

        if (type.includes('image') || type.includes('video')) {
             task.images.push(`https://picsum.photos/400/300?r=${Math.random()}`);
             task.textTop = "Check out this content!";
             task.textBottom = "Please like and subscribe to my channel.";
        } else if (type.includes('avatar')) {
             task.images.push(`https://i.pravatar.cc/300?u=${id}`);
        } else if (type.includes('nick') || type.includes('profile')) {
             task.textTop = "Old_Nickname_123";
             task.textBottom = "Super_Gamer_Profile";
        }
        return task;
    },

    loadNextTask() {
        this.stopTimer();
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('workbench').style.display = 'none';
        this.closeDrawer();
        
        const task = this.generateAuditTask();
        this.currentTaskState = task; 
        
        document.getElementById('info-tenant').innerText = task.tenant;
        document.getElementById('info-id').innerText = task.id;
        document.getElementById('info-publisher').innerText = task.publisher;
        document.getElementById('info-account').innerText = task.accountType;
        document.getElementById('info-time').innerText = task.publishTime;
        document.getElementById('info-userid').innerText = task.userId;
        document.getElementById('info-level').innerText = task.level;
        document.getElementById('info-violations').innerText = task.violations;
        document.getElementById('info-taskid').innerText = task.taskId;
        document.getElementById('mod-name').innerText = task.modName;
        document.getElementById('mod-time').innerText = task.modTime;

        const imgContainer = document.getElementById('image-container');
        const imgModule = document.getElementById('module-content');
        const txtModule = document.getElementById('module-text');

        // Images
        if (task.images.length > 0) {
            imgModule.style.display = 'block';
            // Use the consistent class .content-image-card for layout
            imgContainer.innerHTML = task.images.map(src => 
                `<div class="content-image-card"><img src="${src}" onclick="window.ImageViewer.open(this.src)"></div>`
            ).join('');
            this.updateInlineStatus('images', task.modDecision, task.modReason);
        } else {
            imgModule.style.display = 'none';
        }

        // Text (Split)
        if (task.textTop || task.textBottom) {
            txtModule.style.display = 'block';
            document.getElementById('text-top').innerText = task.textTop;
            document.getElementById('text-bottom').innerText = task.textBottom;
            this.updateInlineStatus('text', task.modDecision, task.modReason);
        } else {
            txtModule.style.display = 'none';
        }

        document.getElementById('loader').style.display = 'none';
        document.getElementById('workbench').style.display = 'flex';
        this.startTimer();
    },

    updateInlineStatus(type, decision, reason) {
        const el = document.getElementById(`mod-val-${type}`);
        const wrap = document.getElementById(`status-display-${type}`);
        if(el && wrap) {
            wrap.classList.remove('mod-approve', 'mod-reject');
            if (decision === 'Approve') {
                el.innerText = "Approve";
                wrap.classList.add('mod-approve');
            } else {
                const reasonText = reason ? `: ${reason}` : "";
                el.innerText = `Reject${reasonText}`; 
                wrap.classList.add('mod-reject');
            }
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
    stopTimer() { clearInterval(this.timerInterval); },

    openErrorDrawer() {
        const d = document.getElementById('violationDrawer');
        const c = document.getElementById('errorList');
        if(!this.currentTaskState) return;
        document.querySelector('.drawer-header span').innerText = "Audit Correction";
        d.classList.add('open');
        this.renderStep1_ErrorType(c);
    },

    closeDrawer() { document.getElementById('violationDrawer').classList.remove('open'); },

    renderStep1_ErrorType(container) {
        const initial = this.currentTaskState.modDecision;
        let validErrors = [];
        if(initial === 'Reject') {
            validErrors = [
                { id: 'false_pos', label: 'False Positive', sub: 'Content is safe, should be Approved' },
                { id: 'wrong_reason', label: 'Wrong Violation Reason', sub: 'Content is bad, but reason is wrong' },
                { id: 'wrong_scope', label: 'Wrong Scope', sub: 'Restriction scope incorrect' }
            ];
        } else {
            validErrors = [
                { id: 'false_neg', label: 'False Negative', sub: 'Content violates policy, should be Rejected' },
                { id: 'policy_miss', label: 'Policy Misinterpretation', sub: 'Applied policy incorrectly' }
            ];
        }
        let html = `<div style="padding: 20px;"><div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px; text-transform:uppercase; font-weight:700;">1. Select Error Type</div>`;
        validErrors.forEach(err => {
            html += `<div class="violation-category" onclick="AuditApp.renderStep2_Decision('${err.id}', '${err.label}')" style="cursor:pointer; padding:15px; border:1px solid var(--border-color); margin-bottom:10px; border-radius:6px; background:var(--bg-body);"><div style="font-weight:600; color:var(--text-header);">${err.label}</div><div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${err.sub}</div></div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    renderStep2_Decision(errorId, errorLabel) {
        const container = document.getElementById('errorList');
        document.querySelector('.drawer-header span').innerText = "Correct Decision";
        let html = `<div style="padding: 20px;"><div style="margin-bottom:20px; font-size:0.9rem; padding:10px; background:var(--hover-bg); border-radius:6px;"><span style="color:var(--text-muted);">Selected Error:</span> <strong>${errorLabel}</strong> <a href="#" onclick="AuditApp.openErrorDrawer()" style="color:#0969da; font-size:0.8rem; margin-left:10px; text-decoration:none;">(Change)</a></div><div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px; text-transform:uppercase; font-weight:700;">2. Select Correct Audit Decision</div>`;

        if (errorId === 'false_pos') {
            html += `<button class="btn-primary" style="width:100%; padding:12px; font-size:1rem;" onclick="AuditApp.submitCorrection('Approve', '${errorLabel}')">Set Decision to <strong>Approve</strong></button>`;
        } else {
            if (typeof Config !== 'undefined' && Config.violations) {
                for(let [cat, subs] of Object.entries(Config.violations)) {
                    html += `<div class="violation-category"><div class="category-trigger" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">${cat} ▼</div><div class="violation-submenu" style="display:none;">${subs.map(s => `<div class="violation-option" onclick="AuditApp.submitCorrection('Reject', '${errorLabel}', '${cat} - ${s}')">${s}</div>`).join('')}</div></div>`;
                }
            }
        }
        html += `</div>`;
        container.innerHTML = html;
    },

    submitCorrection(newDecision, errorType, violationReason = '') {
        const counter = document.getElementById('session-counter');
        if(counter) counter.innerText = ++this.tasksAudited;
        this.closeDrawer();
        this.loadNextTask();
    },

    submitAudit(decision) {
        if(decision === 'agree') {
            const counter = document.getElementById('session-counter');
            if(counter) counter.innerText = ++this.tasksAudited;
            this.loadNextTask();
        }
    },

    exit() { window.location.href = 'audit-queue.html'; }
};

document.addEventListener('DOMContentLoaded', () => { window.AuditApp.init(); });
