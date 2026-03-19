const GEMINI_API_KEY = "AIzaSyAD4rQPXvIZr4ypzMOT43rXs1zqXRbrpVw"; // Obtenir sur aistudio.google.com
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let db = JSON.parse(localStorage.getItem('studDB')) || {
    stockIA: 1000000,
    sales: 0,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique", "SVT", "Histoire"]
};

let currentUser = null;
let selectedPack = null;
let fileData = { base64: null, mime: null };

function save() { localStorage.setItem('studDB', JSON.stringify(db)); }

// AUTHENTIFICATION
function handleAuth() {
    const code = document.getElementById('authInput').value.toUpperCase();
    currentUser = db.users.find(u => u.id === code);
    if (currentUser) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        refreshUI();
    } else { alert("Code invalide"); }
}

function refreshUI() {
    // Mise à jour Tokens
    const tokenDisplay = currentUser.role === 'admin' ? db.stockIA : currentUser.tokens;
    document.getElementById('uTokens').innerText = tokenDisplay.toLocaleString();
    document.getElementById('uName').innerText = currentUser.name;
    document.getElementById('uAvatar').innerText = currentUser.name[0];
    
    // Barre de Stock IA
    const p = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = p + "%";
    document.getElementById('tokenLabel').innerText = `Stock IA: ${p.toFixed(1)}%`;

    // Mode Admin vs User
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn').style.display = "block";
        document.getElementById('userActionBar').style.display = "none";
        document.getElementById('badge').innerText = db.requests.length;
        document.getElementById('badge').style.display = db.requests.length > 0 ? "block" : "none";
    } else {
        document.getElementById('adminBtn').style.display = "none";
        document.getElementById('userActionBar').style.display = "block";
        document.getElementById('uFree').innerText = currentUser.free + "/3";
    }
    renderSubjects();
}

function renderSubjects() {
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openAnalysis('${s}')">📚<br><b>${s}</b></div>
    `).join('');
}

// GESTION BOUTIQUE
function selectPack(t, p, id) {
    selectedPack = { t, p };
    document.querySelectorAll('.pack').forEach(e => e.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('sendBtn').disabled = false;
}

function sendPurchase() {
    const ref = document.getElementById('refId').value;
    if (!ref) return alert("Référence obligatoire");
    
    db.requests.push({ id: Date.now(), uid: currentUser.id, uname: currentUser.name, t: selectedPack.t, p: selectedPack.p, ref: ref });
    save();
    
    const btn = document.getElementById('sendBtn');
    btn.innerText = "Transmis !";
    setTimeout(() => { closeModal('shopModal'); refreshUI(); }, 1500);
}

// ANALYSE GEMINI AVEC PROGRESSION %
async function onFileSelected() {
    const file = document.getElementById('fileInput').files[0];
    const status = document.getElementById('fileStatus');
    
    // Simulation Upload %
    for (let i = 0; i <= 100; i += 25) {
        status.innerText = `Upload: ${i}%`;
        await new Promise(r => setTimeout(r, 150));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        fileData.base64 = e.target.result.split(',')[1];
        fileData.mime = file.type;
        status.innerHTML = `<span style="color:var(--green)">✓ ${file.name} (100%)</span>`;
        document.getElementById('analyzeBtn').style.display = "block";
    };
    reader.readAsDataURL(file);
}

async function runAnalysis() {
    if (currentUser.free >= 3 && currentUser.tokens < 5000) return alert("Tokens insuffisants");

    const status = document.getElementById('fileStatus');
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;

    try {
        status.innerText = "Analyse IA: 30% (Lecture...)";
        
        const prompt = "Analyse ce document. Fais un résumé pédagogique et crée un quiz de 3 questions QCM avec les réponses à la fin.";
        
        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: fileData.mime, data: fileData.base64 } }] }]
            })
        });

        status.innerText = "Analyse IA: 75% (Rédaction...)";
        const data = await response.json();
        const output = data.candidates[0].content.parts[0].text;

        // Déduction
        if (currentUser.free < 3) currentUser.free++; else currentUser.tokens -= 5000;
        save();

        status.innerText = "Analyse IA: 100% Terminé";
        displayAIResults(output);
    } catch (e) {
        alert("Erreur API. Vérifiez votre clé.");
        btn.disabled = false;
    }
}

function displayAIResults(text) {
    document.getElementById('analysisResult').style.display = "block";
    const parts = text.split(/quiz/i);
    document.getElementById('resText').innerHTML = parts[0].replace(/\n/g, "<br>");
    if (parts[1]) document.getElementById('quizContainer').innerHTML = parts[1].replace(/\n/g, "<br>");
}

// ADMIN FUNCTIONS
function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    document.getElementById('aStock').innerText = db.stockIA.toLocaleString();
    document.getElementById('aSales').innerText = db.sales.toLocaleString() + " Ar";
    const list = document.getElementById('reqList');
    list.innerHTML = db.requests.map(r => `
        <div class="result-box">
            <b>${r.uname}</b> - ${r.t.toLocaleString()} tokens (${r.p} Ar)<br>
            <small>REF: ${r.ref}</small>
            <button class="btn-main" onclick="approveReq(${r.id})">Valider</button>
        </div>
    `).join('');
}

function approveReq(id) {
    const idx = db.requests.findIndex(r => r.id === id);
    const r = db.requests[idx];
    const u = db.users.find(user => user.id === r.uid);
    u.tokens += r.t;
    db.stockIA -= r.t;
    db.sales += r.p;
    db.requests.splice(idx, 1);
    save(); refreshUI(); showAdmin();
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }
function closeAnalysis() { closeModal('analysisModal'); document.getElementById('analysisResult').style.display = "none"; }
