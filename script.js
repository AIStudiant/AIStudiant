document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('analyzeBtn');
    btn.innerHTML = "Analyse en cours...";
    
    // Simulation de l'appel IA (On connectera l'API plus tard)
    setTimeout(() => {
        alert("Analyse terminée ! Quiz généré avec succès.");
        btn.innerHTML = '<i class="fas fa-brain"></i> Analyser les données';
    }, 2000);
});
