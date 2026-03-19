let db = JSON.parse(localStorage.getItem('appDB')) || {
    adminStock: 1000000,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", freeUsed: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 5000, role: "user", freeUsed: 0 }
    ],
    pendingRequests: [],
    totalAr: 0
};

let currentUser = null;
let selectedPackage = null;

function saveDB() { localStorage.setItem('appDB', JSON.stringify(db)); }

// CONNEXION
function handleAuth() {
    const code = document.getElementById('authInput').value.toUpperCase();
    const user = db.users.find(u => u.id === code);
    if (user) {
        currentUser = user;
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        updateUI();
    } else { alert("Code invalide !"); }
}

function updateUI() {
    document.getElementById('userName').innerText = currentUser.name;
    document.getElementById('userTokenCount').innerText = (currentUser.role === 'admin' ? db.adminStock : currentUser.tokens).toLocaleString();
    document.getElementById('dailyFree').innerText = `${currentUser.freeUsed}/3`;
    
    // Barre de progression (Stock IA)
    let percent = (db.adminStock / 1000000) * 100;
    document.getElementById('tokenBar').style.width = percent + "%";
    document.getElementById('tokenPercent').innerText = percent.toFixed(1) + "% stock IA";

    if (currentUser.role === "admin") {
        document.getElementById('goToAdmin').style.display = "block";
        if(db.pendingRequests.length > 0) document.getElementById('notifBadge').style.display = "block";
    }
}

// BOUTIQUE
function showShop() { document.getElementById('shopOverlay').style.display = "flex"; }
function closeShop() { document.getElementById('shopOverlay').style.display = "none"; }

function selectPack(tokens, price) {
    selectedPackage = { tokens, price };
    document.querySelectorAll('.package').forEach(p => p.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('sendRequestBtn').disabled = false;
}

function sendPurchaseRequest() {
    const ref = document.getElementById('transactionID').value;
    const prov = document.getElementById('paymentProvider').value;
    if(!ref) return alert("Entrez la référence du transfert !");

    db.pendingRequests.push({
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        tokens: selectedPackage.tokens,
        price: selectedPackage.price,
        provider: prov,
        ref: ref
    });
    saveDB();
    closeShop();
    alert("Requête envoyée. Attendez la validation de l'Admin.");
    updateUI();
}

// ADMIN
document.getElementById('goToAdmin').onclick = () => {
    document.getElementById('adminScreen').style.display = "flex";
    document.getElementById('adminStockDisplay').innerText = db.adminStock.toLocaleString();
    document.getElementById('adminSalesDisplay').innerText = db.totalAr.toLocaleString() + " Ar";
    
    const list = document.getElementById('adminRequestList');
    list.innerHTML = db.pendingRequests.length === 0 ? "Aucune requête." : 
        db.pendingRequests.map(r => `
            <div class="request-item">
                <b>${r.userName}</b> - ${r.price} Ar<br>
                <small>${r.provider} REF: ${r.ref}</small>
                <button class="btn-approve" onclick="approve(${r.id})">Valider le Paiement</button>
            </div>
        `).join('');
};

function approve(id) {
    const idx = db.pendingRequests.findIndex(r => r.id === id);
    const req = db.pendingRequests[idx];
    const user = db.users.find(u => u.id === req.userId);
    
    if(user && db.adminStock >= req.tokens) {
        user.tokens += req.tokens;
        db.adminStock -= req.tokens; // Le stock Admin diminue
        db.totalAr += req.price;
        db.pendingRequests.splice(idx, 1);
        saveDB();
        alert("Paiement validé !");
        location.reload();
    } else { alert("Stock IA insuffisant !"); }
}

function hideAdmin() { document.getElementById('adminScreen').style.display = "none"; }
