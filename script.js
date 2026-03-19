let API_KEY = "";
let subjects = JSON.parse(localStorage.getItem('edu_data')) || [];
let currentIdx = null;
let extractedText = "";

// 1. Initialisation
function unlockApp() {
    API_KEY = document.getElementById('api-key').value;
    if (API_KEY.length > 10) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        renderSubjects();
    }
}

// 2. Gestion des matières
function addSubject() {
    const name = prompt("Nom de la nouvelle matière :");
    if (name) {
        subjects.push({ name, files: [], results: "" });
        updateStorage();
    }
}

function renderSubjects() {
    const container = document.getElementById('subject-list');
    container.innerHTML = subjects.map((s, i) => `
        <div class="subject-card" onclick="openSubject(${i})">
            <span>📚 ${s.name}</span>
            <button onclick="deleteSubject(${i}, event)">🗑️</button>
        </div>
    `).join('');
}

function openSubject(i) {
    currentIdx = i;
    document.getElementById('subject-details').classList.remove('hidden');
    document.getElementById('current-title').innerText = subjects[i].name;
    document.getElementById('ai-output').innerHTML = subjects[i].results || "Aucun résumé.";
}

// 3. Lecture Fichier + Progression
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progBar = document.getElementById('progress-fill');
    document.getElementById('upload-progress').classList.remove('hidden');

    // Simulation visuelle de l'upload
    for (let p = 0; p <= 100; p += 20) {
        progBar.style.width = p + "%";
        progBar.innerText = p + "%";
        await new Promise(r => setTimeout(r, 200));
    }

    // Extraction réelle du texte (Simplement support TXT pour cet exemple, PDF nécessite pdf.js)
    extractedText = await file.text(); 
    subjects[currentIdx].files.push(file.name);
    document.getElementById('analyze-btn').classList.remove('hidden');
    updateStorage();
}

// 4. Analyse AI (Gemini)
async function runAIAnalysis() {
    const outputDiv = document.getElementById('ai-output');
    outputDiv.innerHTML = "🤖 L'IA analyse votre document...";

    const prompt = `Analyse ce texte. Fais un résumé pédagogique long et crée un quiz de 5 questions QCM. 
    Formatte le tout proprement en HTML (utilisant h3, p, ul). Texte : ${extractedText}`;

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await resp.json();
        const finalHTML = data.candidates[0].content.parts[0].text;
        
        subjects[currentIdx].results = finalHTML;
        outputDiv.innerHTML = finalHTML;
        updateStorage();
    } catch (e) {
        outputDiv.innerHTML = "❌ Erreur API. Vérifiez votre clé.";
    }
}

function updateStorage() {
    localStorage.setItem('edu_data', JSON.stringify(subjects));
    renderSubjects();
}

function closeDetails() {
    document.getElementById('subject-details').classList.add('hidden');
}

function deleteSubject(i, e) {
    e.stopPropagation();
    subjects.splice(i, 1);
    updateStorage();
}
