// SIMULATION BASE DE DONNÉES (MongoDB simulé dans le navigateur)
let db = JSON.parse(localStorage.getItem('appDB')) || {
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, freeUsed: 0, role: "admin" },
        { id: "USER1", name: "Jean Dupont", tokens: 1000, freeUsed: 1, role: "user" }
    ],
    globalStats: { totalFreeServed: 12500, totalPaidSold: 500000 }
};

let currentUser = null;

function saveDB() { localStorage.setItem('appDB', JSON.stringify(db)); }

// --- AUTHENTIFICATION ---
function handleAuth() {
    const input = document.getElementById('authInput').value.toUpperCase();
    const user = db.users.find(u => u.id === input);

    if (user) {
        currentUser = user;
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        updateUI();
    } else {
        alert("Code inconnu. Essayez ADMIN ou USER1");
    }
}

function updateUI() {
    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userTokens').innerText = currentUser.tokens.toLocaleString();
    document.getElementById('dailyFree').innerText = `${currentUser.freeUsed}/3`;
    
    // Si Admin, montrer le bouton vers le panel
    if (currentUser.role === "admin") {
        document.getElementById('goToAdmin').style.display = "block";
    }
}

// --- BOUTIQUE ET ACHAT SIMULÉ ---
function showShop() { document.getElementById('shopSection').style.display = "flex"; }
function hideShop() { document.getElementById('shopSection').style.display = "none"; }

function simulatePurchase(amount, price) {
    if(confirm(`Confirmer l'achat de ${amount} tokens pour ${price} USD ?`)) {
        currentUser.tokens += amount;
        db.globalStats.totalPaidSold += amount;
        saveDB();
        updateUI();
        hideShop();
        alert("Achat réussi ! Vos tokens ont été ajoutés.");
    }
}

// --- PANEL ADMIN ---
document.getElementById('goToAdmin').onclick = () => {
    document.getElementById('adminScreen').style.display = "flex";
    document.getElementById('adminFreeTotal').innerText = db.globalStats.totalFreeServed.toLocaleString();
    document.getElementById('adminPaidTotal').innerText = db.globalStats.totalPaidSold.toLocaleString();
    
    const list = document.getElementById('adminUserList');
    list.innerHTML = db.users.map(u => `
        <div class="user-item">
            <span>${u.name} (${u.id})</span>
            <span>${u.tokens} tokens</span>
        </div>
    `).join('');
};

function hideAdmin() { document.getElementById('adminScreen').style.display = "none"; }

// --- LOGIQUE D'ANALYSE (MISE À JOUR AVEC TOKENS) ---
// Remplace ton ancienne fonction d'analyse par celle-ci :
function processAnalysis(tokensNeeded) {
    if (currentUser.freeUsed < 3) {
        currentUser.freeUsed++;
        db.globalStats.totalFreeServed += tokensNeeded;
        alert("Utilisation du quota GRATUIT journalier.");
    } else if (currentUser.tokens >= tokensNeeded) {
        currentUser.tokens -= tokensNeeded;
        alert(`Consommation de ${tokensNeeded} tokens de votre crédit.`);
    } else {
        alert("Plus de tokens ! Veuillez passer à la boutique.");
        return false;
    }
    saveDB();
    updateUI();
    return true;
}
