// --- DONNÉES ET ÉLÉMENTS ---
let subjects = JSON.parse(localStorage.getItem('mySubjects')) || [
    { name: "Mathématiques", icon: "📐" },
    { name: "Physique", icon: "⚛️" }
];

let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedFile = null;

const listElement = document.getElementById('subject-list');
const modal = document.getElementById('analysisModal');
const quizScreen = document.getElementById('quizScreen');

// --- INITIALISATION ---
function render(filter = "") {
    listElement.innerHTML = "";
    subjects.filter(s => s.name.toLowerCase().includes(filter.toLowerCase())).forEach((sub, i) => {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `<div style="flex:1" onclick="openAnalysis('${sub.name}')"><span>${sub.icon} ${sub.name}</span></div>
                          <i class="fas fa-trash delete-icon" onclick="deleteSub(event, ${i})"></i>`;
        listElement.appendChild(card);
    });
}

// --- GESTION UPLOAD ---
document.getElementById('modalFileInput').onchange = (e) => {
    const file = e.target.files[0];
    const maxSize = 500 * 1024 * 1024; // 500 Mo

    if (file) {
        if (file.size > maxSize) {
            alert("⚠️ Fichier trop lourd (> 500 Mo).");
            e.target.value = "";
            return;
        }
        selectedFile = file;
        document.getElementById('uploadStatus').innerText = "✅ " + file.name;
        document.getElementById('uploadStatus').style.color = "#10b981";
    }
};

// --- PIPELINE ANALYSE IA ---
document.getElementById('modalAnalyzeBtn').onclick = function() {
    if (!selectedFile) return alert("Veuillez choisir un fichier.");

    this.style.display = "none";
    document.getElementById('progressContainer').style.display = "block";
    
    let progress = 0;
    let time = 4; // Temps simulé rapide

    const interval = setInterval(() => {
        progress += 5;
        let rem = Math.ceil(time - (progress/100 * time));
        document.getElementById('progressBar').style.width = progress + "%";
        document.getElementById('progressPercent').innerText = progress + "%";
        document.getElementById('timeLeft').innerText = `Temps estimé : ${rem}s`;

        if (progress >= 100) {
            clearInterval(interval);
            document.getElementById('viewQuizBtn').style.display = "flex";
            document.getElementById('progressLabel').innerText = "Analyse terminée !";
        }
    }, 200);
};

// --- LOGIQUE DU QUIZ ---
document.getElementById('viewQuizBtn').onclick = () => {
    modal.style.display = "none";
    quizScreen.style.display = "flex";
    
    // Simulation de l'unique appel IA (Pipeline Hybride)
    currentQuiz = [
        { q: "Quelle est la capitale de Madagascar ?", opts: ["Tamatave", "Antsirabe", "Antananarivo", "Majunga"], a: "Antananarivo" },
        { q: "Quel symbole représente l'atome d'Hydrogène ?", opts: ["He", "O", "H", "N"], a: "H" },
        { q: "Combien font 7 x 8 ?", opts: ["48", "56", "64", "54"], a: "56" },
        { q: "Quelle planète est surnommée la planète rouge ?", opts: ["Vénus", "Jupiter", "Mars", "Saturne"], a: "Mars" },
        { q: "Quel gaz est nécessaire à la respiration ?", opts: ["Azote", "Oxygène", "CO2", "Argon"], a: "Oxygène" }
    ];
    
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('quizBody').style.display = "block";
    document.getElementById('scoreScreen').style.display = "none";
    showQuestion();
};

function showQuestion() {
    const data = currentQuiz[currentQuestionIndex];
    document.getElementById('questionCounter').innerText = `${currentQuestionIndex + 1}/${currentQuiz.length}`;
    document.getElementById('quizStatusBar').style.width = ((currentQuestionIndex + 1) / currentQuiz.length) * 100 + "%";
    document.getElementById('questionText').innerText = data.q;
    
    const list = document.getElementById('optionsList');
    list.innerHTML = "";
    data.opts.forEach(o => {
        const b = document.createElement('button');
        b.className = "option-btn";
        b.innerText = o;
        b.onclick = () => {
            const btns = document.querySelectorAll('.option-btn');
            btns.forEach(btn => btn.disabled = true);
            if(o === data.a) { b.classList.add('correct'); score++; }
            else { b.classList.add('wrong'); btns.forEach(btn => { if(btn.innerText === data.a) btn.classList.add('correct'); }); }
            
            setTimeout(() => {
                currentQuestionIndex++;
                if(currentQuestionIndex < currentQuiz.length) showQuestion();
                else { document.getElementById('quizBody').style.display = "none"; 
                       document.getElementById('scoreScreen').style.display = "block";
                       document.getElementById('finalScore').innerText = `${score}/${currentQuiz.length}`; }
            }, 1200);
        };
        list.appendChild(b);
    });
}

// --- FONCTIONS SECONDAIRES ---
function openAnalysis(name) { document.getElementById('modalTitle').innerText = name; modal.style.display = "block"; }
function resetModal() { modal.style.display = "none"; location.reload(); }
document.getElementById('closeModal').onclick = resetModal;
document.getElementById('closeQuiz').onclick = () => { if(confirm("Quitter ?")) location.reload(); };

document.getElementById('addSubjectBtn').onclick = () => {
    const n = prompt("Nom de la matière ?");
    if(n) { subjects.push({name:n, icon:"📚"}); localStorage.setItem('mySubjects', JSON.stringify(subjects)); render(); }
};
document.getElementById('searchInput').oninput = (e) => render(e.target.value);
function deleteSub(e, i) { e.stopPropagation(); if(confirm("Supprimer ?")) { subjects.splice(i,1); localStorage.setItem('mySubjects', JSON.stringify(subjects)); render(); } }

render();
