// On récupère les données sauvegardées ou on met une liste par défaut
let subjects = JSON.parse(localStorage.getItem('mySubjects')) || [
    { name: "Mathématiques", icon: "📐" },
    { name: "Physique", icon: "⚛️" },
    { name: "Science", icon: "🧪" }
];

const listElement = document.getElementById('subject-list');
const modal = document.getElementById('analysisModal');

// Sauvegarder dans le navigateur
function save() {
    localStorage.setItem('mySubjects', JSON.stringify(subjects));
    render();
}

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
            <i class="fas fa-trash delete-icon" onclick="deleteSub(event, ${index})"></i>
        `;
        listElement.appendChild(card);
    });
}

// Fonction pour AJOUTER
document.getElementById('addSubjectBtn').onclick = () => {
    const name = prompt("Nom de la matière ?");
    if (name) {
        subjects.push({ name: name, icon: "📚" });
        save();
    }
};

// Fonction pour RECHERCHER
document.getElementById('searchInput').oninput = (e) => {
    render(e.target.value);
};

// Gérer la fenêtre d'analyse
function openAnalysis(name) {
    document.getElementById('modalTitle').innerText = name;
    modal.style.display = "block";
}

document.querySelector('.close').onclick = () => modal.style.display = "none";

function deleteSub(event, index) {
    event.stopPropagation(); // Empêche d'ouvrir la modal en supprimant
    if(confirm("Supprimer cette matière ?")) {
        subjects.splice(index, 1);
        save();
    }
}

// Lancement au démarrage
render();
