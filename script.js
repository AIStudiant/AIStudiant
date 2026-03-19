let db = JSON.parse(localStorage.getItem('appDB')) || {
    stockIA: 1000000, sales: 0,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo"]
};

let curr = null;
let selPack = null;

function save() { localStorage.setItem('appDB', JSON.stringify(db)); }

// CONNEXION
function handleAuth() {
    const val = document.getElementById('authInput').value.toUpperCase();
    curr = db.users.find(u => u.id === val);
    if (curr) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        render();
    } else alert("Code erroné !");
}

function render() {
    document.getElementById('uName').innerText = curr.name;
    document.getElementById('uAvatar').innerText = curr.name[0];
    
    // DIFFÉRENCIATION ADMIN / USER
    if (curr.role === 'admin') {
        document.getElementById('uTokens').innerText = db.stockIA.toLocaleString();
        document.getElementById('adminBtn').style.display = "block";
        document.getElementById('userActionBar').style.display = "none"; // Admin n'achète pas
        document.getElementById('badge').innerText = db.requests.length;
        document.getElementById('badge').style.display = db.requests.length > 0 ? "inline-block" : "none";
    } else {
        document.getElementById('uTokens').innerText = curr.tokens.toLocaleString();
        document.getElementById('adminBtn').style.display = "none";
        document.getElementById('userActionBar').style.display = "flex";
        document.getElementById('uFree').innerText = curr.free + "/3";
    }

    // Barre de stock global
    const percentIA = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = percentIA + "%";
    document.getElementById('tokenLabel').innerText = `Stock IA: ${percentIA.toFixed(1)}%`;

    // Liste des matières
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openSubject('${s}')">
            <i class="fas fa-book-open" style="font-size:24px; color:#3b82f6; margin-bottom:10px;"></i><br>
            <b>${s}</b>
        </div>
    `).join('');
}

// GESTION BOUTIQUE
function showShop() { document.getElementById('shopModal').style.display = "flex"; }
function closeShop() { document.getElementById('shopModal').style.display = "none"; }

function setPack(t, p, id) {
    selPack = {t, p};
    document.getElementById('sendBtn').disabled = false;
    document.querySelectorAll('.pack').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function sendReq() {
    const ref = document.getElementById('refId').value;
    if(!ref) return alert("Entrez la référence de transaction !");
    
    db.requests.push({ id: Date.now(), uid: curr.id, uname: curr.name, tokens: selPack.t, price: selPack.p, ref: ref });
    save();
    
    const btn = document.getElementById('sendBtn');
    btn.innerText = "Transmis !";
    btn.style.background = "#10b981";
    
    setTimeout(() => {
        closeShop();
        btn.innerText = "Envoyer";
        btn.style.background = "";
        btn.disabled = true;
        document.getElementById('refId').value = "";
        render();
    }, 1500);
}

// GESTION ADMIN
function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    document.getElementById('aStock').innerText = db.stockIA.toLocaleString();
    document.getElementById('aSales').innerText = db.sales.toLocaleString();
    
    const list = document.getElementById('reqList');
    list.innerHTML = db.requests.length === 0 ? "<p>Aucune demande</p>" : 
        db.requests.map(r => `
            <div style="background:#0f172a; padding:15px; margin:10px 0; border-radius:12px; text-align:left;">
                <b>${r.uname}</b> • ${r.price} Ar<br>
                <small style="color:var(--warn)">REF: ${r.ref}</small>
                <button onclick="approve(${r.id})" style="background:var(--green); color:white; border:none; width:100%; padding:8px; border-radius:8px; margin-top:10px; cursor:pointer;">Valider l'achat</button>
            </div>
        `).join('');
}

function approve(rid) {
    const idx = db.requests.findIndex(r => r.id === rid);
    const r = db.requests[idx];
    const user = db.users.find(u => u.id === r.uid);
    
    user.tokens += r.tokens;
    db.stockIA -= r.tokens;
    db.sales += r.price;
    db.requests.splice(idx, 1);
    
    save();
    showAdmin();
    render();
}

// GESTION ANALYSE
let activeSub = "";
function openSubject(s) {
    activeSub = s;
    document.getElementById('modalTitle').innerText = s;
    document.getElementById('analysisModal').style.display = "block";
}

function handleFileSelect() {
    const file = document.getElementById('fileInput').files[0];
    if(file) {
        document.getElementById('fileInfo').innerHTML = `<div style="margin:10px; color:#10b981"><i class="fas fa-check-circle"></i> ${file.name} prêt</div>`;
        document.getElementById('analyzeBtn').style.display = "block";
    }
}

function startAnalysis() {
    if(curr.free < 3 || curr.tokens >= 5000) {
        // Consommation
        if(curr.free < 3) curr.free++; 
        else curr.tokens -= 5000;
        
        save();
        render();
        
        const btn = document.getElementById('analyzeBtn');
        btn.innerText = "Analyse en cours...";
        btn.disabled = true;

        setTimeout(() => {
            btn.style.display = "none";
            document.getElementById('results').style.display = "block";
            document.getElementById('summaryTxt').innerText = `L'IA a analysé votre document de ${activeSub}. Ce cours traite des principes fondamentaux et des applications pratiques du sujet.`;
            document.getElementById('quizArea').innerHTML = `
                <div class="summary-box" style="border-left-color:var(--green)">
                    <h4>Quiz d'auto-évaluation</h4>
                    <p>1. Quelle est la définition principale vue dans ce cours ?</p>
                    <button class="btn-main" style="background:#1e293b">Voir la réponse</button>
                </div>
            `;
        }, 2000);
    } else alert("Tokens insuffisants ! Veuillez recharger votre compte.");
}

function closeAnalysis() { 
    document.getElementById('analysisModal').style.display = "none"; 
    document.getElementById('results').style.display = "none";
    document.getElementById('analyzeBtn').innerText = "Lancer l'Analyse (-5000 tokens)";
    document.getElementById('analyzeBtn').disabled = false;
    document.getElementById('fileInfo').innerHTML = "";
}

function closeAdmin() { document.getElementById('adminModal').style.display = "none"; }
