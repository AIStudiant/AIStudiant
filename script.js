const API_KEY = "VOTRE_CLE_GEMINI";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let db = JSON.parse(localStorage.getItem('studDB')) || {
    stockIA: 1000000,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 1000000, role: "admin", free: 0 },
        { id: "USER1", name: "Étudiant Test", tokens: 0, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique-Chimie", "SVT", "Anglais", "Philosophie"]
};

let user = null;
let pack = null;
let fileData = { base64: null, mime: null };

function save() { localStorage.setItem('studDB', JSON.stringify(db)); }

// CONNEXION
function handleAuth() {
    const code = document.getElementById('authInput').value.trim().toUpperCase();
    user = db.users.find(u => u.id === code);
    if(user) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        refreshUI();
    } else alert("Code Invalide !");
}

function refreshUI() {
    document.getElementById('uName').innerText = user.name;
    document.getElementById('uAvatar').innerText = user.name[0];
    document.getElementById('uTokens').innerText = user.tokens.toLocaleString();
    document.getElementById('uFree').innerText = user.free + "/3";
    
    let p = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = p + "%";
    document.getElementById('tokenLabel').innerText = `Stock IA: ${p.toFixed(1)}%`;

    if(user.role === 'admin') {
        document.getElementById('adminBtn').style.display = "block";
        document.getElementById('badge').innerText = db.requests.length;
    }
    renderSubjects();
}

function renderSubjects() {
    const grid = document.getElementById('subjectList');
    grid.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openAnalysis('${s}')">
            <i class="fas fa-book-open"></i><br><b>${s}</b>
        </div>
    `).join('');
}

// ANALYSE IA
function openAnalysis(s) {
    document.getElementById('activeSubject').innerText = s;
    document.getElementById('analysisModal').style.display = "flex";
    document.getElementById('stepUpload').style.display = "block";
    document.getElementById('stepResult').style.display = "none";
    document.getElementById('fileStatus').innerText = "";
}

async function onFileSelected() {
    const file = document.getElementById('fileInput').files[0];
    const status = document.getElementById('fileStatus');
    if(!file) return;

    for(let i=0; i<=100; i+=25) {
        status.innerText = `Chargement: ${i}%`;
        await new Promise(r => setTimeout(r, 100));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        fileData.base64 = e.target.result.split(',')[1];
        fileData.mime = file.type;
        status.innerHTML = `<b style="color:#10b981">✓ Fichier prêt</b>`;
        document.getElementById('analyzeBtn').style.display = "block";
    };
    reader.readAsDataURL(file);
}

async function runAnalysis() {
    // Verif Tokens (Admin passe toujours)
    if(user.role !== 'admin' && user.free >= 3 && user.tokens < 5000) return alert("Tokens insuffisants !");

    const status = document.getElementById('fileStatus');
    document.getElementById('analyzeBtn').disabled = true;

    try {
        status.innerText = "Analyse IA: 40% (Réflexion...)";
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{ parts: [
                    { text: "Fais un résumé structuré de ce document et crée un quiz QCM de 3 questions avec les réponses." },
                    { inline_data: { mime_type: fileData.mime, data: fileData.base64 } }
                ]}]
            })
        });

        status.innerText = "Analyse IA: 90% (Finalisation...)";
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        if(user.role !== 'admin') {
            if(user.free < 3) user.free++; else user.tokens -= 5000;
            save(); refreshUI();
        }

        displayResults(text);
    } catch(e) {
        alert("Erreur API Gemini. Vérifiez votre clé.");
        document.getElementById('analyzeBtn').disabled = false;
    }
}

function displayResults(text) {
    document.getElementById('stepUpload').style.display = "none";
    document.getElementById('stepResult').style.display = "block";
    const parts = text.split(/quiz/i);
    document.getElementById('resText').innerText = parts[0];
    document.getElementById('quizContainer').innerText = parts[1] || "Quiz non généré";
}

// BOUTIQUE & ADMIN
function showShop() { document.getElementById('shopModal').style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function selectPack(t, p, el) {
    pack = {t, p};
    document.querySelectorAll('.pack').forEach(x => x.style.borderColor = "#334155");
    el.style.borderColor = "#00d2ff";
    document.getElementById('confirmPay').disabled = false;
}

function sendPurchase() {
    const ref = document.getElementById('payRef').value;
    if(!ref) return alert("Référence manquante");
    db.requests.push({ id: Date.now(), uname: user.name, uid: user.id, t: pack.t, ref: ref });
    save(); refreshUI(); closeModal('shopModal');
    alert("Demande envoyée !");
}

function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    const list = document.getElementById('reqList');
    list.innerHTML = db.requests.map(r => `
        <div class="pack" style="text-align:left">
            ${r.uname} - ${r.t} tokens (REF: ${r.ref})
            <button onclick="approve(${r.id})" class="btn-main" style="padding:5px; margin-top:5px">Valider</button>
        </div>
    `).join('');
}

function approve(id) {
    const r = db.requests.find(x => x.id === id);
    const target = db.users.find(u => u.id === r.uid);
    target.tokens += r.t;
    db.stockIA -= r.t;
    db.requests = db.requests.filter(x => x.id !== id);
    save(); refreshUI(); showAdmin();
}
