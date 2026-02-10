document.addEventListener("DOMContentLoaded", () => {
    // 1. GET CURRENT USER DATA
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Fallback if no user is logged in (e.g., direct access without login page)
    if (!currentUser) {
        currentUser = { id: 'guest', name: 'Guest User', username: 'guest', status: 'Offline' };
        // Optional: Redirect to login if strictly required
        // window.location.href = 'login.html'; 
    }

    // Determine initial status color
    const statusColors = {
        'Online': '#238636', // Green
        'Away': '#d29922',   // Orange
        'Busy': '#da3633',   // Red
        'Offline': '#6e7681' // Gray
    };
    let currentColor = statusColors[currentUser.status] || statusColors['Offline'];


    // 2. DEFINE SIDEBAR HTML WITH USER DATA PLACEHOLDERS
    const sidebarHTML = `
    <div class="sidebar">
        <div class="brand">
            <span style="font-size: 1.5rem;">🛡️</span>
            <span style="font-weight: 600;">Admin Portal</span>
        </div>
        
        <ul class="menu">
            <li><a href="home.html" class="${isActive('home.html')}"><i class="fas fa-home"></i> Dashboard</a></li>
            <li><a href="user-management.html" class="${isActive('user-management.html')}"><i class="fas fa-users"></i> User Management</a></li>
            <li><a href="content-moderation.html" class="${isActive('content-moderation.html')}"><i class="fas fa-shield-alt"></i> Moderation Queue</a></li>
            <li><a href="reports.html" class="${isActive('reports.html')}"><i class="fas fa-flag"></i> Reports</a></li>
            <li><a href="settings.html" class="${isActive('settings.html')}"><i class="fas fa-cog"></i> Settings</a></li>
        </ul>
        
        <div class="user-profile" style="position: relative;">
            <div class="user-info" id="userDropdownTrigger" style="cursor: pointer;">
                <div class="avatar">
                    <span id="currentStatusDot" style="position:absolute; bottom:2px; right:2px; width:10px; height:10px; background:${currentColor}; border-radius:50%; border:2px solid var(--bg-card);"></span>
                    <img src="https://github.com/shadcn.png" alt="User" style="width:100%; border-radius:50%;">
                </div>
                <div class="user-details">
                    <div class="user-name">${currentUser.name}</div>
                    <div class="user-handle">@${currentUser.username}</div>
                </div>
                <i class="fas fa-chevron-up" style="font-size: 0.8rem; color: var(--text-muted); margin-left: auto;"></i>
            </div>

            <div class="dropdown-menu" id="statusDropdown">
                <a href="#" data-status="Online"><span class="status-dot dot-green"></span> Online</a>
                <a href="#" data-status="Away"><span class="status-dot dot-orange"></span> Away</a>
                <a href="#" data-status="Busy"><span class="status-dot dot-red"></span> Do Not Disturb</a>
                <div class="dropdown-divider"></div>
                <a href="#" data-status="Offline"><span class="status-dot dot-gray"></span> Appear Offline</a>
                <div class="dropdown-divider"></div>
                <a href="#" id="btnLogout" style="color: var(--accent-red);"><i class="fas fa-sign-out-alt"></i> Log Out</a>
            </div>
        </div>
    </div>
    `;

    // 3. INJECT HTML
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // 4. HANDLE DROPDOWN TOGGLE
    const trigger = document.getElementById('userDropdownTrigger');
    const dropdown = document.getElementById('statusDropdown');
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });

    // 5. HANDLE STATUS CHANGES (API CALL)
    document.querySelectorAll('#statusDropdown a[data-status]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const newStatus = e.target.closest('a').getAttribute('data-status');
            const dot = document.getElementById('currentStatusDot');
            
            // Optimistic UI update (change color immediately)
            dot.style.backgroundColor = statusColors[newStatus];

            try {
                // Call API to update Database
                const response = await fetch('/api/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: currentUser.id,
                        status: newStatus,
                        last_status_update: new Date().toISOString()
                    })
                });

                if (!response.ok) throw new Error('Failed to update status in DB');

                // Update LocalStorage so it persists on refresh
                currentUser.status = newStatus;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log(`Status updated to: ${newStatus}`);

            } catch (error) {
                console.error("Status update failed:", error);
                // Revert UI on failure if necessary
                dot.style.backgroundColor = statusColors[currentUser.status]; 
                alert("Failed to change status. Please check connection.");
            }
        });
    });

    // 6. HANDLE LOGOUT
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    function isActive(path) {
        return window.location.pathname.includes(path) ? 'active' : '';
    }
});
