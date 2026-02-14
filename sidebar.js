document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // 1. GLOBAL THEME LOGIC
    // =========================================
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');

    window.toggleTheme = function() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('appTheme', isDark ? 'dark' : 'light');
        window.dispatchEvent(new Event('themeChanged'));
    };

    // =========================================
    // 2. GET CURRENT USER
    // =========================================
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || { 
        name: 'Guest', 
        username: 'guest', 
        email: 'guest@example.com', 
        role: 'Visitor',
        status: 'Online' 
    };

    const APP_LANG = localStorage.getItem('appLang') || 'en';
    const T = {
        en: { overview: "Overview", users: "User Management", mod: "Moderation", vidLabel: "Video Labelling", audit: "Quality Assurance", notifs: "Notifications", settings: "Settings", logout: "Logout" },
        zh: { overview: "总览", users: "用户管理", mod: "审核", vidLabel: "视频标注", audit: "质量保证", notifs: "通知中心", settings: "设置", logout: "退出登录" }
    }[APP_LANG];

    // =========================================
    // 3. ICONS
    // =========================================
    const ICONS = {
        brand: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>`,
        overview: `<svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
        users: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
        mod: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
        vid: `<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
        audit: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
        notifs: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>`,
        settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
        logout: `<svg class="logout-icon" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`
    };

    // =========================================
    // 4. ROLE-BASED NAVIGATION LOGIC (PERMISSIONS)
    // =========================================
    let navLinksHTML = '';
    let settingsHTML = '';

    if (currentUser.role === 'Moderator') {
        // --- MODERATOR VIEW ---
        // VISIBLE: Only "Moderation". 
        // HIDDEN: "Video Labelling" (removed from sidebar), Overview, Users, Settings.
        navLinksHTML = `
            <li><a href="moderation.html" id="link-mod">${ICONS.mod}<span>${T.mod}</span></a></li>
        `;
        settingsHTML = ''; // No Settings for Mods
    } else {
        // --- ADMIN / DEFAULT VIEW ---
        navLinksHTML = `
            <li><a href="home.html" id="link-home">${ICONS.overview}<span>${T.overview}</span></a></li>
            <li><a href="user-management.html" id="link-users">${ICONS.users}<span>${T.users}</span></a></li>
            <li><a href="moderation.html" id="link-mod">${ICONS.mod}<span>${T.mod}</span></a></li>
            <li><a href="quality-assurance.html" id="link-audit">${ICONS.audit}<span>${T.audit}</span></a></li>
            <li><a href="notifications.html" id="link-notifs">${ICONS.notifs}<span>${T.notifs}</span></a></li>
        `;
        settingsHTML = `
            <ul class="nav-links">
                <li><a href="settings.html" id="link-settings">${ICONS.settings}<span>${T.settings}</span></a></li>
            </ul>
        `;
    }

    // =========================================
    // 5. INJECT HTML
    // =========================================
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="brand">${ICONS.brand}<span>AdminPanel</span></div>
        
        <ul class="nav-links">
            ${navLinksHTML}
        </ul>

        <div class="sidebar-spacer"></div>

        ${settingsHTML}

        <div class="user-profile">
            <div class="profile-header">
                <div class="avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                <div class="profile-details">
                    <div class="profile-name">${currentUser.name}</div>
                    <div class="profile-email" title="${currentUser.email || ''}">${currentUser.email || ''}</div>
                    <div class="profile-role">${currentUser.role || 'User'}</div>
                </div>
            </div>

            <div class="status-dropdown">
                <div class="status-trigger" id="statusTrigger">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="currentDot" class="dot dot-${(currentUser.status || 'Offline').toLowerCase()}"></span>
                        <span id="currentStatusText">${currentUser.status || 'Offline'}</span>
                    </div>
                    <span style="font-size:0.7rem; opacity:0.7;">▼</span>
                </div>
                
                <ul class="status-menu" id="statusMenu">
                    <li data-status="Online"><span class="dot dot-online"></span> Online</li>
                    <li data-status="Break"><span class="dot dot-break"></span> Break</li>
                    <li data-status="Lunch"><span class="dot dot-lunch"></span> Lunch</li>
                    <li data-status="Meeting"><span class="dot dot-meeting"></span> Meeting</li>
                    <li data-status="Offline"><span class="dot dot-offline"></span> Offline</li>
                </ul>
            </div>

            <a href="#" id="btnLogout" class="logout-link">
                ${ICONS.logout} <span>${T.logout}</span>
            </a>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // =========================================
    // 6. ACTIVE LINK LOGIC
    // =========================================
    const path = window.location.pathname;
    
    // Admin Links Mapping
    const links = {
        'home.html': 'link-home',
        'user-management.html': 'link-users',
        'moderation.html': 'link-mod', 'content-moderation.html': 'link-mod', 'review.html': 'link-mod',
        'quality-assurance.html': 'link-audit', 'audit-queue.html': 'link-audit', 'audit-review.html': 'link-audit',
        'notifications.html': 'link-notifs',
        'settings.html': 'link-settings'
    };

    // Handle Active State
    if (currentUser.role === 'Moderator') {
        // For Moderators:
        // If they are on the Moderation dashboard OR inside Video Labelling, highlight "Moderation"
        if (path.includes('moderation.html') || 
            path.includes('content-moderation.html') || 
            path.includes('review.html') || 
            path.includes('video-labelling.html')) {
            
            document.getElementById('link-mod')?.classList.add('active');
        }
    } else {
        // For Admin
        for (const [key, id] of Object.entries(links)) {
            if (path.includes(key)) document.getElementById(id)?.classList.add('active');
        }
        // Special case: Admin viewing video-labelling highlights 'Moderation'
        if (path.includes('video-labelling.html')) {
            document.getElementById('link-mod')?.classList.add('active');
        }
    }

    // =========================================
    // 7. STATUS DROPDOWN & LOGOUT LOGIC
    // =========================================
    const trigger = document.getElementById('statusTrigger');
    const menu = document.getElementById('statusMenu');
    const dot = document.getElementById('currentDot');
    const text = document.getElementById('currentStatusText');

    if (trigger && menu) {
        trigger.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('active'); });
        document.addEventListener('click', () => menu.classList.remove('active'));
        menu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newStatus = item.getAttribute('data-status');
                text.innerText = newStatus;
                dot.className = `dot dot-${newStatus.toLowerCase()}`;
                menu.classList.remove('active');
                
                currentUser.status = newStatus;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

                try {
                    if (currentUser.id && currentUser.id !== 'guest') {
                        await fetch('/api/users', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: currentUser.id, status: newStatus, last_status_update: new Date().toISOString() })
                        });
                    }
                } catch (err) { console.error(err); }
            });
        });
    }

    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
});
