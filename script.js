let API_KEY = "";

function saveConfig() {
    const key = document.getElementById('api-key').value;
    if (key) {
        API_KEY = key;
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
    } else {
        alert("Veuillez entrer une clé API.");
    }
}

async function processContent() {
    const text = document.getElementById('input-text').value;
    if (!text) return alert("Le texte est vide !");

    document.getElementById('loader').classList.remove('hidden');
    
    const prompt = `Analyse le texte suivant. 
    1. Fais un résumé long et détaillé. 
    2. Génère entre 5 et 10 questions QCM simples et pédagogiques. 
    Chaque question doit avoir 1 bonne réponse et 3 mauvaises réponses plausibles. 
    Réponds au format JSON: { "resume": "...", "quiz": [ {"question": "...", "options": ["...", "..."], "answer": "..."} ] }
    Texte : ${text}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const output = data.candidates[0].content.parts[0].text;
        
        // Extraction du JSON de la réponse (simplifiée pour l'exemple)
        displayResults(output);
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de l'appel à l'API Gemini.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
}

function displayResults(rawText) {
    // Note : En production, on parserait le JSON. Ici on affiche brut pour l'exemple.
    document.getElementById('summary-content').innerText = "Analyse terminée. Vérifiez la console pour le format structuré.";
    console.log(rawText);
}
