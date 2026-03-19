// On initialise la base de données avec le stock de Google (1M)
let db = JSON.parse(localStorage.getItem('appDB')) || {
    adminStock: 1000000, // Ton stock Google AI
    users: [
        { id: "ADMIN", name: "Administrateur", tokens: 0, role: "admin" },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user" }
    ],
    globalStats: { totalFreeServed: 12500, totalPaidSold: 505000 }
};

function updateUI() {
    // Calcul du pourcentage
    let percent = (db.adminStock / 1000000) * 100;
    
    // Mise à jour de l'affichage Admin
    const adminTotalDisplay = document.getElementById('adminTotalTokens');
    if(adminTotalDisplay) {
        adminTotalDisplay.innerText = db.adminStock.toLocaleString();
        document.getElementById('tokenBar').style.width = percent + "%";
        document.getElementById('tokenPercent').innerText = percent.toFixed(1) + "% disponible";
        
        // Changer de couleur si le stock baisse
        if(percent < 20) document.getElementById('tokenBar').style.background = "#ef4444";
    }
}

// SIMULATION D'UNE CONSOMMATION
function consumeTokens(amount) {
    if (db.adminStock >= amount) {
        db.adminStock -= amount; // On déduit du million de départ
        saveDB();
        updateUI();
        console.log(`Consommation de ${amount}. Nouveau stock : ${db.adminStock}`);
    } else {
        alert("Stock de tokens IA épuisé !");
    }
}

// Exemple : Si tu veux tester une réduction de 1000 tokens manuellement
// consumeTokens(1000); 

function saveDB() { localStorage.setItem('appDB', JSON.stringify(db)); }
updateUI();
