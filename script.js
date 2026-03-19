// INITIALISATION DE LA BASE DE DONNÉES SIMULÉE
let db = JSON.parse(localStorage.getItem('appDB')) || {
    adminStock: 1000000,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", freeUsed: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", freeUsed: 1 }
    ],
    globalStats: { totalFreeServed: 12500, totalPaidSold: 505000 }
};

let currentUser = null;

// FONCTION DE CONNEXION
function handleAuth() {
    const code = document.getElementById('authInput').value.toUpperCase();
    const userFound = db.users.find(u => u.id === code);

    if (userFound) {
        currentUser = userFound;
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        updateInterface();
    } else {
        alert("Code invalide ! Utilisez ADMIN ou USER1");
    }
}

function updateInterface() {
    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userAvatar').innerText = currentUser.name[0];
    document.getElementById('dailyFree').innerText = `${currentUser.freeUsed}/3`;

    // Gestion du stock de tokens IA (Le million)
    let percent = (db.adminStock / 1000000) * 100;
    document.getElementById('adminTotalTokens').innerText = db.adminStock.toLocaleString();
    document.getElementById('tokenBar').style.width = percent + "%";
    document.getElementById('tokenPercent').innerText = percent.toFixed(1) + "% disponible";

    // Afficher bouton Admin seulement si c'est l'admin
    if (currentUser.role === "admin") {
        document.getElementById('goToAdmin').style.display = "block";
    }
}

// SIMULATION CONSOMMATION (Exemple)
function useTokens(amount) {
    if (db.adminStock >= amount) {
        db.adminStock -= amount;
        saveDB();
        updateInterface();
    }
}

// GESTION ADMIN
document.getElementById('goToAdmin').onclick = () => {
    document.getElementById('adminScreen').style.display = "flex";
    document.getElementById('adminFreeTotal').innerText = db.globalStats.totalFreeServed.toLocaleString();
    document.getElementById('adminPaidTotal').innerText = db.globalStats.totalPaidSold.toLocaleString();
    
    const list = document.getElementById('adminUserList');
    list.innerHTML = db.users.map(u => `
        <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #222;">
            <span style="color:#94a3b8">${u.name}</span>
            <span style="color:#10b981">${u.tokens} tokens</span>
        </div>
    `).join('');
};

function hideAdmin() { document.getElementById('adminScreen').style.display = "none"; }
function saveDB() { localStorage.setItem('appDB', JSON.stringify(db)); }

// Lancer au chargement
window.onload = () => {
    // Force l'affichage du login au début
    document.getElementById('authScreen').style.display = "flex";
    document.getElementById('mainApp').style.display = "none";
};
