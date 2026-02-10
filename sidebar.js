// ===========================================
// 1. SIDEBAR CONFIG & HTML
// ===========================================
const APP_LANG = localStorage.getItem('appLang') || 'en';

const TRANSLATIONS = {
    // UPDATED: Renamed audit to "Quality Assurance", Removed appeal key (merged)
    en: { brand: "AdminPanel", overview: "Overview", users: "User Management", mod: "Moderation", audit: "Quality Assurance", notifs: "Notifications", settings: "Settings", logout: "Logout", online: "Online", offline: "Offline" },
    zh: { brand: "管理后台", overview: "总览", users: "用户管理", mod: "审核", audit: "质量保证", notifs: "通知中心", settings: "设置", logout: "退出登录", online: "在线", offline: "离线" }
};
const T = TRANSLATIONS[APP_LANG];

const ICONS = {
    brand: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>`,
    overview: `<svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
    users: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    mod: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
    audit: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    notifs: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    logout: `<svg class="logout-icon" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`
};

const sidebarContent = `
<nav class="sidebar">
    <div class="brand">${ICONS.brand}<span>${T.brand}</span></div>
    
    <ul class="nav-links">
        <li><a href="home.html" id="link-home">${ICONS.overview}<span>${T.overview}</span></a></li>
        <li><a href="user-management.html" id="link-users">${ICONS.users}<span>${T.users}</span></a></li>
        <li><a href="moderation.html" id="link-mod">${ICONS.mod}<span>${T.mod}</span></a></li>
        <li><a href="quality-assurance.html" id="link-audit">${ICONS.audit}<span>${T.audit}</span></a></li>
        <li><a href="notifications.html" id="link-notifs">${ICONS.notifs}<span>${T.notifs}</span></a></li>
    </ul>

    <div class="sidebar-spacer"></div>

    <ul class="nav-links">
        <li><a href="settings.html" id="link-settings">${ICONS.settings}<span>${T.settings}</span></a></li>
    </ul>

    <div class="user-profile">
        <div class="avatar">A</div>
        <div class="profile-info">
            <div class="profile-name">Admin</div>
            <div class="profile-status" id="status-trigger">
                <span id="current-dot" class="dot dot-online"></span>
                <span id="current-text">${T.online}</span>
                <span class="status-caret">▼</span>
            </div>
            <a href="javascript:Auth.logout()" class="logout-link">
                ${ICONS.logout}
                <span>${T.logout}</span>
            </a>
        </div>
        
        <ul id="status-menu" class="status-menu">
            <li data-status="online" data-label="Online"><span class="dot dot-online"></span> Online</li>
            <li data-status="break" data-label="Break"><span class="dot dot-break"></span> Break</li>
            <li data-status="lunch" data-label="Lunch"><span class="dot dot-lunch"></span> Lunch</li>
            <li data-status="meeting" data-label="Meeting"><span class="dot dot-meeting"></span> Meeting</li>
            <li data-status="offline" data-label="Offline"><span class="dot dot-offline"></span> Offline</li>
        </ul>
    </div>
</nav>
`;

// Inject Sidebar
document.body.insertAdjacentHTML('afterbegin', sidebarContent);

// ===========================================
// 2. LOGIC INITIALIZATION
// ===========================================
setTimeout(() => {
    // --- Active Link Logic ---
    const path = window.location.pathname;
    if (path.includes('home.html')) document.getElementById('link-home')?.classList.add('active');
    if (path.includes('user-management.html')) document.getElementById('link-users')?.classList.add('active');
    if (path.includes('moderation.html') || path.includes('content-moderation.html') || path.includes('content-labelling.html') || path.includes('moderation-history.html')) {
        document.getElementById('link-mod')?.classList.add('active');
    }
    
    // UPDATED: Check for all Quality Assurance sub-pages
    if (path.includes('quality-assurance.html') || path.includes('audit-queue.html') || path.includes('appeal-center.html') || path.includes('audit-history.html')) {
        document.getElementById('link-audit')?.classList.add('active');
    }

    if (path.includes('notifications.html')) document.getElementById('link-notifs')?.classList.add('active');
    if (path.includes('settings.html')) document.getElementById('link-settings')?.classList.add('active');

    // --- Status Dropdown Logic ---
    const statusTrigger = document.getElementById('status-trigger');
    const statusMenu = document.getElementById('status-menu');
    const currentLabel = document.getElementById('current-text');
    const currentDot = document.getElementById('current-dot');

    if (statusTrigger && statusMenu) {
        statusTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            statusMenu.classList.toggle('active');
        });

        statusMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = item.getAttribute('data-status');
                const label = item.getAttribute('data-label');
                currentLabel.innerText = label;
                currentDot.className = `dot dot-${type}`;
                statusMenu.classList.remove('active');
                localStorage.setItem('userStatus', JSON.stringify({ type, label }));
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (statusMenu && statusMenu.classList.contains('active')) {
            statusMenu.classList.remove('active');
        }
    });

    const savedStatus = JSON.parse(localStorage.getItem('userStatus'));
    if (savedStatus && currentLabel && currentDot) {
        currentLabel.innerText = savedStatus.label;
        currentDot.className = `dot dot-${savedStatus.type}`;
    }

}, 100);

const savedTheme = localStorage.getItem('appTheme') || 'light';
if (savedTheme === 'dark') document.body.classList.add('dark-mode');

window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('appTheme', isDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChanged'));
};

if (typeof Auth === 'undefined') {
    window.Auth = { logout: () => { window.location.href='login.html'; } };
}
