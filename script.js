const GEMINI_API_KEY = "TON_API_KEY_ICI"; // ⚠️ À REMPLACER
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let db = JSON.parse(localStorage.getItem('studDB')) || {
    stockIA: 1000000, sales: 0,
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique", "SVT", "Philosophie"]
};

let user = null;

// --- FONCTIONS DE CONNEXION & UI ---
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
    document.getElementById('uTokens').innerText = (user.role === 'admin' ? db.stockIA : user.tokens).toLocaleString();
    if(user.role !== 'admin') document.getElementById('uFree').innerText = user.free + "/3";
    renderSubjects();
}

function renderSubjects() {
    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `<div class="subject-card" onclick="openAnalysis('${s}')">📚<br>${s}</div>`).join('');
}

// --- LOGIQUE GEMINI & ANALYSE ---

let selectedFileBase64 = null;
let selectedFileType = null;

function openAnalysis(s) {
    document.getElementById('activeSubject').innerText = s;
    document.getElementById('analysisModal').style.display = "flex";
    resetAnalysisUI();
}

function resetAnalysisUI() {
    document.getElementById('fileStatus').innerHTML = "";
    document.getElementById('analyzeBtn').style.display = "none";
    document.getElementById('analysisResult').style.display = "none";
}

async function onFileSelected() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return;

    // Simulation Upload %
    const status = document.getElementById('fileStatus');
    status.innerHTML = "Upload: 0%";
    
    for (let i = 0; i <= 100; i += 20) {
        status.innerHTML = `Upload: ${i}%`;
        await new Promise(r => setTimeout(r, 100));
    }

    // Conversion en Base64 pour Gemini
    const reader = new FileReader();
    reader.onload = (e) => {
        selectedFileBase64 = e.target.result.split(',')[1];
        selectedFileType = file.type;
        status.innerHTML = `<b style="color:#238636">✓ ${file.name} chargé (100%)</b>`;
        document.getElementById('analyzeBtn').style.display = "block";
    };
    reader.readAsDataURL(file);
}

async function runAnalysis() {
    // Vérification tokens
    if (user.free >= 3 && user.tokens < 5000) return alert("Tokens insuffisants !");

    const btn = document.getElementById('analyzeBtn');
    const status = document.getElementById('fileStatus');
    btn.disabled = true;

    try {
        status.innerHTML = "Analyse IA: 15% (Extraction...)";
        if (user.free < 3) user.free++; else user.tokens -= 5000;
        localStorage.setItem('studDB', JSON.stringify(db));
        refreshUI();

        // Requête Gemini
        status.innerHTML = "Analyse IA: 45% (Génération Résumé...)";
        
        const prompt = `Agis comme un professeur. Analyse ce document. 
        1. Fais un résumé structuré et clair.
        2. Crée un quiz de 3 questions à choix multiples (QCM) avec les réponses. 
        Réponds au format texte clair.`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: selectedFileType, data: selectedFileBase64 } }
                    ]
                }]
            })
        });

        status.innerHTML = "Analyse IA: 80% (Mise en page...)";
        const data = await response.json();
        const output = data.candidates[0].content.parts[0].text;

        // Affichage des résultats
        displayResults(output);
        
        status.innerHTML = "Analyse IA: 100% Terminé !";
    } catch (error) {
        console.error(error);
        alert("Erreur lors de l'appel à l'IA. Vérifie ta clé API.");
        btn.disabled = false;
    }
}

function displayResults(text) {
    document.getElementById('analysisResult').style.display = "block";
    
    // On sépare grossièrement le résumé du quiz (Gemini renvoie souvent du Markdown)
    const parts = text.split(/quiz|questionnaire/i);
    
    document.getElementById('resText').innerHTML = parts[0].replace(/\n/g, "<br>");
    
    if (parts[1]) {
        document.getElementById('quizContainer').innerHTML = `<div class="box">${parts[1].replace(/\n/g, "<br>")}</div>`;
    }
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }
