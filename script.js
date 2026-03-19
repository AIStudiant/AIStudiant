// Liste initiale de matières
let subjects = ["📐 Mathématiques", "⚛️ Physique", "🧪 Science"];

// Fonction pour afficher les matières
function renderSubjects() {
    const list = document.getElementById('subject-list');
    list.innerHTML = ""; // On vide la liste

    subjects.forEach((sub, index) => {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <span>${sub}</span>
            <i class="fas fa-trash" onclick="deleteSubject(${index})"></i>
        `;
        list.appendChild(card);
    });
}

// Supprimer une matière
function deleteSubject(index) {
    subjects.splice(index, 1);
    renderSubjects();
}

// Gérer l'analyse IA
const analyzeBtn = document.getElementById('analyzeBtn');

analyzeBtn.addEventListener('click', () => {
    // 1. On change l'apparence du bouton pendant le chargement
    analyzeBtn.disabled = true;
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse IA...';

    // 2. Simulation de l'appel vers une API d'Intelligence Artificielle
    // Dans le futur, tu pourras utiliser Fetch() ici pour appeler OpenAI ou Gemini
    setTimeout(() => {
        alert("Félicitations ! Votre quiz de 5 questions est prêt.");
        
        // On remet le bouton à zéro
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
    }, 2500);
});

// Gérer l'upload de fichier
document.getElementById('fileInput').addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name;
    if (fileName) {
        alert("Fichier sélectionné : " + fileName);
    }
});

// Premier affichage au chargement
renderSubjects();
