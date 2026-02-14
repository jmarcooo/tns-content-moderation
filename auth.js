const Auth = {
    requireLogin: () => {
        // CHANGED: Use sessionStorage so session dies when browser closes
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    },

    login: async (username, password) => {
        try {
            // Fetch from API
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('DB Connection Failed');
            
            const users = await res.json();
            const user = users.find(u => u.username === username);
            
            if (user && user.password === password) { 
                const safeUser = { ...user };
                delete safeUser.password; 
                // CHANGED: Save to sessionStorage
                sessionStorage.setItem('currentUser', JSON.stringify(safeUser));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login Error:", err);
            return false;
        }
    },

    logout: () => {
        // CHANGED: Remove from sessionStorage
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
};
