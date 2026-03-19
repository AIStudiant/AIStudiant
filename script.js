// Remplacez votre fonction actuelle par celle-ci pour activer le clic
function renderSubjects() {
    const list = document.getElementById('subjectList');
    // On ajoute l'attribut onclick="openAnalysis('${s}')" qui manquait
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openAnalysis('${s}')">
            <i class="fas fa-book-open" style="font-size:24px; color:#58a6ff; margin-bottom:10px;"></i><br>
            <b>${s}</b>
        </div>
    `).join('');
}

// Ouvrir la fenêtre d'analyse
function openAnalysis(s) {
    document.getElementById('activeSubject').innerText = s;
    document.getElementById('analysisModal').style.display = "flex";
    
    // Réinitialisation de l'état
    document.getElementById('uploadStep').style.display = "block";
    document.getElementById('analysisResult').style.display = "none";
    document.getElementById('fileStatus').innerText = "";
    document.getElementById('analyzeBtn').style.display = "none";
}

// Gérer la sélection du fichier et l'affichage de la progression
async function onFileSelected() {
    const file = document.getElementById('fileInput').files[0];
    const status = document.getElementById('fileStatus');
    
    if (!file) return;

    // Simulation visuelle de l'upload en %
    status.style.display = "block";
    for (let i = 0; i <= 100; i += 20) {
        status.innerText = `Chargement du fichier : ${i}%`;
        await new Promise(r => setTimeout(r, 100));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Stockage des données pour l'API
        fileData.base64 = e.target.result.split(',')[1];
        fileData.mime = file.type;
        status.innerHTML = `<b style="color:#238636">✓ ${file.name} prêt (100%)</b>`;
        document.getElementById('analyzeBtn').style.display = "block"; // Affiche le bouton d'analyse
    };
    reader.readAsDataURL(file);
}
