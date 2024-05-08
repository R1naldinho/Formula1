const isAuthenticated = () => {
    const accessToken = localStorage.getItem('accessToken'); // Leggi il token di accesso dal localStorage
    return accessToken !== null; // Restituisce true se il token è presente, altrimenti false
};

// Reindirizza l'utente al login se non è autenticato
if (!isAuthenticated()) {
    window.location.href = '../admin.html';
}

const logout = () => {
    localStorage.removeItem('accessToken'); // Rimuovi il token di accesso dal localStorage
    window.location.href = '../admin.html'; // Reindirizza l'utente al login
};