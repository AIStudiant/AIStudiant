// Initialisation de la base de données locale
let db = JSON.parse(localStorage.getItem('appDB')) || {
    stockIA: 1000000, 
    sales: 0,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique", "Science"]
};

let curr = null;
let selPack = null;

// Sauvegarde permanente
function save() { 
    localStorage.setItem('appDB', JSON.stringify(db)); 
}

// CONNEXION
function handleAuth() {
    const val = document.getElementById('authInput').value.toUpperCase();
    curr = db.users.find(u => u.id === val);
    if (curr) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        render();
    } else {
        alert("Code erroné. Utilisez ADMIN ou USER1");
    }
}

// MISE À JOUR DE L'INTERFACE
function render() {
    // Profil et Tokens
    document.getElementById('uName').innerText = curr.name;
    document.getElementById('uAvatar').innerText = curr.name[0];
    
    // Si Admin, on affiche le stock global, sinon les tokens personnels
    const tokenDisplay = (curr.role === 'admin') ? db.stockIA : curr.tokens;
    document.getElementById('uTokens').innerText = tokenDisplay.toLocaleString();
    
    document.getElementById('uFree').innerText = curr.free + "/3";
    
    // Barre de Stock IA
    const percentIA = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = percentIA + "%";
    document.getElementById('tokenLabel').innerText = "Stock IA: " + percentIA.toFixed(1) + "%";
    
    // Affichage spécifique Admin
    const adminBtn = document.getElementById('adminBtn');
    const badge = document.getElementById('badge');
    if (curr.role === 'admin') {
        adminBtn.style.display = "block";
        badge.innerText = db.requests.length;
        badge.style.display = db.requests.length > 0 ? "inline-block" : "none";
    } else {
        adminBtn.style.display = "none";
    }

    // Liste des matières
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openSubject('${s}')">
            <div style="font-size:30px">📚</div>
            <b>${s}</b>
        </div>
    `).join('');
}

// GESTION DE LA BOUTIQUE (USER)
function showShop() { 
    document.getElementById('shopModal').style.display = "flex"; 
}

function closeShop() { 
    document.getElementById('shopModal').style.display = "none"; 
}

function setPack(t, p) {
    selPack = { t, p };
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = false;
    
    // Mise en évidence visuelle du pack choisi
    document.querySelectorAll('.pack').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function sendReq() {
    const ref = document.getElementById('refId').value;
    const sendBtn = document.getElementById('sendBtn');

    if (!ref) {
        alert("Veuillez entrer la référence de votre transaction.");
        return;
    }

    // Ajouter la requête à la liste
    db.requests.push({ 
        id: Date.now(), 
        uid: curr.id, 
        uname: curr.name, 
        tokens: selPack.t, 
        price: selPack.p, 
        ref: ref 
    });
    
    save();
    
    // Animation du bouton et fermeture
    sendBtn.innerText = "Fini !";
    sendBtn.style.background = "#10b981"; // Vert succès

    setTimeout(() => {
        closeShop();
        render(); // Actualiser pour l'admin si besoin
        // Réinitialiser le bouton pour la prochaine fois
        sendBtn.innerText = "Envoyer";
        sendBtn.style.background = ""; 
        sendBtn.disabled = true;
        document.getElementById('refId').value = "";
    }, 1500);
}

// GESTION ADMIN
function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    document.getElementById('aStock').innerText = db.stockIA.toLocaleString();
    document.getElementById('aSales').innerText = db.sales.toLocaleString();
    
    const list = document.getElementById('reqList');
    if (db.requests.length === 0) {
        list.innerHTML = "<p style='color:gray'>Aucune requête en attente.</p>";
    } else {
        list.innerHTML = db.requests.map(r => `
            <div class="request-item" style="background:#0b0e14; padding:12px; margin:8px 0; border-radius:10px; border-left:4px solid #f59e0b">
                <div style="display:flex; justify-content:space-between">
                    <b>${r.uname}</b>
                    <span style="color:#10b981">+${r.tokens.toLocaleString()}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin:5px 0">Ref: ${r.ref} | Prix: ${r.price}Ar</div>
                <button onclick="approve(${r.id})" class="btn-approve" style="background:#10b981; color:white; border:none; width:100%; padding:8px; border-radius:5px; cursor:pointer">
                    Valider l'achat
                </button>
            </div>
        `).join('');
    }
}

function closeAdmin() { 
    document.getElementById('adminModal').style.display = "none"; 
}

function approve(rid) {
    const idx = db.requests.findIndex(r => r.id === rid);
    if (idx === -1) return;

    const req = db.requests[idx];
    const user = db.users.find(u => u.id === req.uid);

    if (user) {
        // Créditer l'utilisateur
        user.tokens += req.tokens;
        // Déduire du stock global IA
        db.stockIA -= req.tokens;
        // Augmenter le chiffre d'affaires
        db.sales += req.price;
        // Supprimer la requête traitée
        db.requests.splice(idx, 1);
        
        save();
        alert("Vente validée avec succès !");
        
        // Rafraîchir les deux interfaces
        showAdmin();
        render();
    }
}
