let db = JSON.parse(localStorage.getItem('studDB')) || {
    stockIA: 1000000, sales: 0,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique", "SVT", "Anglais"]
};

let user = null;
let pack = null;

function save() { localStorage.setItem('studDB', JSON.stringify(db)); }

// CONNEXION
function handleAuth() {
    const code = document.getElementById('authInput').value.toUpperCase();
    user = db.users.find(u => u.id === code);
    if(user) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        refreshUI();
    } else alert("Code erroné !");
}

function refreshUI() {
    document.getElementById('uName').innerText = user.name;
    document.getElementById('uAvatar').innerText = user.name[0];
    
    // Si Admin, on affiche le stock globale
    document.getElementById('uTokens').innerText = (user.role === 'admin' ? db.stockIA : user.tokens).toLocaleString();
    
    // Barre de stock
    let p = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = p + "%";
    document.getElementById('tokenLabel').innerText = `Stock IA: ${p.toFixed(1)}%`;

    // Visibilité Admin
    if(user.role === 'admin') {
        document.getElementById('adminBtn').style.display = "block";
        document.getElementById('badge').innerText = db.requests.length;
        document.getElementById('userTools').style.display = "none";
    } else {
        document.getElementById('uFree').innerText = user.free + "/3";
        document.getElementById('userTools').style.display = "block";
        renderSubjects();
    }
}

function renderSubjects() {
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openAnalysis('${s}')">📚<br>${s}</div>
    `).join('');
}

// BOUTIQUE
function showShop() { document.getElementById('shopModal').style.display = "flex"; }
function selectPack(t, p, id) {
    pack = { t, p };
    document.querySelectorAll('.pack').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('sendBtn').disabled = false;
}

function sendPurchase() {
    const ref = document.getElementById('refId').value;
    if(!ref) return alert("Réf manquante");
    
    db.requests.push({ id: Date.now(), uid: user.id, uname: user.name, t: pack.t, p: pack.p, ref: ref });
    save();
    
    const btn = document.getElementById('sendBtn');
    btn.innerText = "Transmis !";
    setTimeout(() => {
        closeModal('shopModal');
        btn.innerText = "Envoyer";
        refreshUI();
    }, 1200);
}

// ADMIN PANEL
function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    document.getElementById('aStock').innerText = db.stockIA.toLocaleString();
    document.getElementById('aSales').innerText = db.sales.toLocaleString() + " Ar";
    
    const list = document.getElementById('reqList');
    list.innerHTML = db.requests.map(r => `
        <div class="pack">
            <b>${r.uname}</b>: ${r.p} Ar (REF: ${r.ref})
            <button class="btn-main" onclick="approveReq(${r.id})">Valider</button>
        </div>
    `).join('');
}

function approveReq(id) {
    const idx = db.requests.findIndex(r => r.id === id);
    const r = db.requests[idx];
    const target = db.users.find(u => u.id === r.uid);
    
    target.tokens += r.t;
    db.stockIA -= r.t;
    db.sales += r.p;
    db.requests.splice(idx, 1);
    
    save();
    showAdmin();
    refreshUI();
}

// ANALYSE & QUIZ
function openAnalysis(s) {
    document.getElementById('activeSubject').innerText = s;
    document.getElementById('analysisModal').style.display = "flex";
}

function onFileSelected() {
    const f = document.getElementById('fileInput').files[0];
    if(f) {
        document.getElementById('fileStatus').innerText = "Fichier prêt: " + f.name;
        document.getElementById('analyzeBtn').style.display = "block";
    }
}

function runAnalysis() {
    if(user.free < 3 || user.tokens >= 5000) {
        if(user.free < 3) user.free++; else user.tokens -= 5000;
        save();
        refreshUI();

        document.getElementById('analyzeBtn').innerText = "IA en cours...";
        
        setTimeout(() => {
            document.getElementById('analyzeBtn').style.display = "none";
            document.getElementById('analysisResult').style.display = "block";
            document.getElementById('resText').innerText = "Ce cours explique les bases de la matière. Les points clés incluent les définitions théoriques et les formules essentielles à mémoriser pour l'examen.";
            document.getElementById('quizContainer').innerHTML = `
                <div class="box">
                    <p>1. Quelle est la règle principale ?</p>
                    <button class="btn-main" onclick="alert('Bonne réponse !')">Réponse A</button>
                </div>
            `;
        }, 2000);
    } else alert("Tokens insuffisants !");
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }
