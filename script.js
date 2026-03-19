const GEMINI_API_KEY = "VOTRE_CLE_API"; 
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Initialisation de la base de données locale
let db = JSON.parse(localStorage.getItem('studDB')) || {
    stockIA: 1000000,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 1000000, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    subjects: ["Mathématiques", "Physique", "SVT", "Anglais"]
};

let currentUser = null;
let fileData = { base64: null, mime: null };

function save() { localStorage.setItem('studDB', JSON.stringify(db)); }

// 1. CONNEXION (Correction du bouton bloqué)
function handleAuth() {
    const input = document.getElementById('authInput').value.trim().toUpperCase();
    currentUser = db.users.find(u => u.id === input);

    if (currentUser) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        refreshUI();
    } else {
        alert("Code incorrect. Utilisez ADMIN ou USER1");
    }
}

function refreshUI() {
    document.getElementById('uName').innerText = currentUser.name;
    document.getElementById('uTokens').innerText = currentUser.tokens.toLocaleString();
    document.getElementById('uFree').innerText = currentUser.free + "/3";
    
    // Mise à jour barre de stock
    let p = (db.stockIA / 1000000) * 100;
    document.getElementById('tokenBar').style.width = p + "%";
    document.getElementById('tokenLabel').innerText = `Stock IA: ${p.toFixed(1)}%`;

    renderSubjects();
}

// 2. RENDU DES MATIERES (Correction du clic)
function renderSubjects() {
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openAnalysis('${s}')">
            <i class="fas fa-book"></i><br><b>${s}</b>
        </div>
    `).join('');
}

// 3. GESTION GEMINI & ANALYSE
function openAnalysis(s) {
    document.getElementById('activeSubject').innerText = s;
    document.getElementById('analysisModal').style.display = "flex";
    document.getElementById('uploadStep').style.display = "block";
    document.getElementById('analysisResult').style.display = "none";
}

async function onFileSelected() {
    const file = document.getElementById('fileInput').files[0];
    const status = document.getElementById('fileStatus');
    if (!file) return;

    // Simulation de progression upload
    for (let i = 0; i <= 100; i += 25) {
        status.innerText = `Upload: ${i}%`;
        await new Promise(r => setTimeout(r, 100));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        fileData.base64 = e.target.result.split(',')[1];
        fileData.mime = file.type;
        status.innerHTML = `<b style="color:#238636">✓ Fichier prêt</b>`;
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
        status.innerText = "Analyse IA: 35% (Lecture...)";
        
        const prompt = "Analyse ce document. Fais un résumé court et crée un quiz de 3 questions QCM avec les réponses.";
        
        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: fileData.mime, data: fileData.base64 } }] }]
            })
        });

        status.innerText = "Analyse IA: 80% (Rédaction...)";
        const data = await response.json();
        const output = data.candidates[0].content.parts[0].text;

        // Consommation tokens/essais
        if (currentUser.free < 3) currentUser.free++; else currentUser.tokens -= 5000;
        save();
        refreshUI();

        status.innerText = "Analyse IA: 100% Terminé";
        displayResults(output);
    } catch (e) {
        alert("Erreur API : Vérifiez votre clé.");
        btn.disabled = false;
    }
}

function displayResults(text) {
    document.getElementById('uploadStep').style.display = "none";
    document.getElementById('analysisResult').style.display = "block";
    
    const parts = text.split(/quiz/i);
    document.getElementById('resText').innerHTML = parts[0].replace(/\n/g, "<br>");
    if (parts[1]) document.getElementById('quizContainer').innerHTML = parts[1].replace(/\n/g, "<br>");
}

function closeAnalysis() { document.getElementById('analysisModal').style.display = "none"; }
