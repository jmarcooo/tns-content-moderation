const Auth = {
    requireLogin: () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    },

    login: async (username, password) => {
        try {
            const res = await fetch('users.json');
            const users = await res.json();
            const user = users.find(u => u.username === username);
            
            if (user && user.password === password) { 
                const safeUser = { ...user };
                delete safeUser.password; 
                localStorage.setItem('currentUser', JSON.stringify(safeUser));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login Error:", err);
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
};
