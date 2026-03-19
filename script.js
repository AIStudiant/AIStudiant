let subjects = [
    { name: "Mathématiques", icon: "📐" },
    { name: "Physique", icon: "⚛️" },
    { name: "Science", icon: "🧪" }
];

const listElement = document.getElementById('subject-list');
const modal = document.getElementById('analysisModal');

// --- 1. FONCTION D'AFFICHAGE ---
function render(filter = "") {
    listElement.innerHTML = "";
    const filtered = subjects.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));

    filtered.forEach((sub, index) => {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <div style="flex:1" onclick="openAnalysis('${sub.name}')">
                <span>${sub.icon} ${sub.name}</span>
            </div>
            <i class="fas fa-trash" onclick="deleteSub(${index})"></i>
        `;
        listElement.appendChild(card);
    });
}

// --- 2. GESTION DE LA RECHERCHE ---
document.getElementById('searchInput').addEventListener('input', (e) => {
    render(e.target.value);
});

// --- 3. AJOUT D'UNE MATIÈRE ---
document.getElementById('addSubjectBtn').addEventListener('click', () => {
    const name = prompt("Nom de la nouvelle matière ?");
    if (name) {
        subjects.push({ name: name, icon: "📚" });
        render();
    }
});

// --- 4. OUVERTURE DE L'ANALYSE (MODAL) ---
function openAnalysis(name) {
    document.getElementById('modalTitle').innerText = name;
    modal.style.display = "block";
}

// Fermer la modal
document.querySelector('.close').onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// --- 5. ANALYSE ET QUIZ ---
document.getElementById('modalAnalyzeBtn').onclick = function() {
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse IA en cours...';
    setTimeout(() => {
        alert("Analyse réussie ! Quiz généré pour " + document.getElementById('modalTitle').innerText);
        this.innerHTML = '<i class="fas fa-brain"></i> Analyser et Créer Quiz';
        modal.style.display = "none";
    }, 2000);
};

function deleteSub(index) {
    subjects.splice(index, 1);
    render();
}

// Lancement initial
render();
