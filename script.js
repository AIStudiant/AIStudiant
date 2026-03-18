// ==========================================
// CONFIG OPENAI
// ==========================================
let OPENAI_API_KEY = localStorage.getItem('openai_api_key');
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

let extractedText = "";
let cache = {};

// ==========================================
// CLÉ API
// ==========================================
window.askNewKey = () => {
    const key = prompt("🔑 Collez votre clé OpenAI (sk-...)");
    if (key && key.startsWith("sk-")) {
        localStorage.setItem('openai_api_key', key.trim());
        alert("✅ Clé enregistrée !");
        location.reload();
    }
};

if (!OPENAI_API_KEY) {
    setTimeout(() => {
        if (!localStorage.getItem('openai_api_key')) askNewKey();
    }, 1500);
}

// ==========================================
// BAR PROGRESSION
// ==========================================
function updateBar(id, percId, value) {
    document.getElementById(id).style.width = value + "%";
    document.getElementById(percId).innerText = value + "%";
}

// ==========================================
// UPLOAD FICHIER
// ==========================================
window.handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('label-text').innerText = "📄 " + file.name;

    document.getElementById('upload-status-container').classList.remove('hidden');
    updateBar('upload-fill', 'upload-perc', 10);

    try {
        if (file.name.toLowerCase().endsWith('.pdf')) {
            extractedText = await extractPDF(file);
        } else {
            extractedText = await extractWord(file);
        }

        updateBar('upload-fill', 'upload-perc', 100);

        const btn = document.getElementById('btn-ai');
        btn.disabled = false;
        btn.innerText = "🚀 ANALYSER LE COURS";
        btn.style.background = "#6366f1";

    } catch {
        alert("Erreur lecture fichier");
    }
};

// ==========================================
// ANALYSE IA (QUIZ 30 + EXP)
// ==========================================
window.processCourse = async () => {

    if (!extractedText) return;
    if (!OPENAI_API_KEY) return askNewKey();

    // CACHE
    if (cache[extractedText]) {
        renderResults(cache[extractedText]);
        showResults();
        return;
    }

    document.getElementById('ia-detail-container').classList.remove('hidden');
    document.getElementById('btn-ai').classList.add('hidden');

    let progress = 0;
    const timer = setInterval(() => {
        if (progress < 95) {
            progress++;
            updateBar('ia-fill', 'ia-perc', progress);
        }
    }, 150);

    const prompt = `
Tu es un professeur expert.

1. Donne un titre
2. Résume le cours en sections simples
3. Crée un quiz de 30 questions (QCM)

Chaque question doit contenir :
- 1 bonne réponse
- 3 mauvaises réponses
- 1 explication

Format JSON uniquement :

{
"titre":"",
"sections":[{"n":"","c":""}],
"quiz":[{"q":"","correct":"","wrong":[],"explication":""}]
}

Cours :
${extractedText.substring(0, 8000)}
`;

    try {

        const res = await fetch(OPENAI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + OPENAI_API_KEY
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                max_tokens: 1500
            })
        });

        const data = await res.json();
        clearInterval(timer);

        if (data.error) throw new Error(data.error.message);

        updateBar('ia-fill', 'ia-perc', 100);

        const text = data.choices[0].message.content;

        const json = JSON.parse(
            text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
        );

        cache[extractedText] = json;

        renderResults(json);
        showResults();

    } catch (err) {
        clearInterval(timer);
        alert("Erreur OpenAI: " + err.message);
        document.getElementById('btn-ai').classList.remove('hidden');
    }
};

// ==========================================
// CHAT AVEC PDF
// ==========================================
window.askQuestion = async () => {

    const question = document.getElementById("chat-input").value;
    if (!question) return;

    const output = document.getElementById("chat-output");

    output.innerHTML += `<p><b>❓ ${question}</b></p>`;

    const res = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [{
                role: "user",
                content: `Cours:\n${extractedText.substring(0, 6000)}\n\nQuestion:${question}`
            }],
            temperature: 0.3,
            max_tokens: 800
        })
    });

    const data = await res.json();

    output.innerHTML += `<p>🤖 ${data.choices[0].message.content}</p>`;
};

// ==========================================
// EXTRACTION PDF / WORD
// ==========================================
async function extractPDF(file) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(i => i.str).join(" ") + " ";
    }

    return text;
}

async function extractWord(file) {
    const ab = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: ab });
    return result.value;
}

// ==========================================
// UI
// ==========================================
window.switchTab = (type) => {
    const sum = type === 'sum';

    document.getElementById('summary-content').classList.toggle('hidden', !sum);
    document.getElementById('quiz-content').classList.toggle('hidden', sum);

    document.getElementById('tab-sum').style.background = sum ? '#6366f1' : '#334155';
    document.getElementById('tab-quiz').style.background = sum ? '#334155' : '#6366f1';
};

function renderResults(data) {

    let html = `<h2 style="color:#4ade80;">${data.titre}</h2>`;

    data.sections.forEach(s => {
        html += `<div class="summary-chapter">
        <b>📍 ${s.n}</b>
        <p>${s.c}</p>
        </div>`;
    });

    document.getElementById('summary-result').innerHTML = html;

    let quizHTML = "";

    data.quiz.forEach((q, i) => {
        quizHTML += `
        <div class="quiz-card">
            <p><b>Q${i + 1}: ${q.q}</b></p>

            <div class="option correct">✅ ${q.correct}</div>
            ${q.wrong.map(w => `<div class="option">❌ ${w}</div>`).join("")}

            <p style="margin-top:10px;color:#facc15;">
            💡 ${q.explication}
            </p>
        </div>`;
    });

    document.getElementById('quiz-result').innerHTML = quizHTML;
}

window.showResults = () => {
    document.getElementById('results-container').classList.remove('hidden');
};
