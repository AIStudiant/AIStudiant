// Données de test et stockage
let db = JSON.parse(localStorage.getItem('appDB')) || {
    stockIA: 1000000, 
    sales: 0,
    users: [
        { id: "ADMIN", name: "Admin", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: []
};

let curr = null;
let selPack = null;

function save() { localStorage.setItem('appDB', JSON.stringify(db)); }

// CONNEXION RÉPARÉE
function handleAuth() {
    const val = document.getElementById('authInput').value.toUpperCase();
    curr = db.users.find(u => u.id === val);
    if (curr) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        render(); // Mise à jour immédiate
    } else alert("Code invalide");
}

function render() {
    // Mise à jour des tokens et stock IA
    document.getElementById('uTokens').innerText = (curr.role === 'admin' ? db.stockIA : curr.tokens).toLocaleString();
    document.getElementById('tokenBar').style.width = (db.stockIA / 1000000 * 100) + "%";
    
    // LOGIQUE DU BADGE ADMIN
    const adminBtn = document.getElementById('adminBtn');
    const badge = document.getElementById('badge');
    
    if (curr.role === 'admin') {
        adminBtn.style.display = "block";
        if (db.requests.length > 0) {
            badge.innerText = db.requests.length;
            badge.style.display = "inline-block";
        } else {
            badge.style.display = "none";
        }
    } else {
        adminBtn.style.display = "none";
    }
}

// BOUTIQUE : ENVOYER ET FERMER
function sendReq() {
    const ref = document.getElementById('refId').value;
    const btn = document.getElementById('sendBtn');
    
    if (!ref) return alert("Entrez la référence !");

    // Ajouter la requête
    db.requests.push({
        id: Date.now(),
        uid: curr.id,
        uname: curr.name,
        tokens: selPack.t,
        price: selPack.p,
        ref: ref
    });

    save();

    // Animation de succès
    btn.innerText = "Fini !";
    btn.style.background = "#10b981";

    setTimeout(() => {
        document.getElementById('shopModal').style.display = "none"; // Fermeture auto
        btn.innerText = "Envoyer";
        btn.style.background = "";
        btn.disabled = true;
        document.getElementById('refId').value = "";
        render();
    }, 1500);
}

// VALIDATION ADMIN
function approve(rid) {
    const idx = db.requests.findIndex(r => r.id === rid);
    const r = db.requests[idx];
    const user = db.users.find(u => u.id === r.uid);

    if (user) {
        user.tokens += r.tokens; // Crédite l'user
        db.stockIA -= r.tokens;  // Baisse le stock IA
        db.sales += r.price;     // Augmente les ventes
        db.requests.splice(idx, 1); // Supprime la requête
        
        save();
        alert("Paiement validé !");
        showAdmin(); // Rafraîchit le panel admin
        render();    // Rafraîchit le badge
    }
}
