// --- LOGIQUE UTILISATEUR ---
function sendPurchaseRequest() {
    const provider = document.getElementById('paymentProvider').value;
    const ref = document.getElementById('transactionID').value;

    if (!ref || ref.length < 5) {
        alert("Veuillez entrer une référence de transaction valide.");
        return;
    }

    db.pendingRequests.push({
        ...selectedPackage,
        id: Date.now(),
        provider: provider,
        reference: ref,
        date: new Date().toLocaleString()
    });

    saveDB();
    closeShop();
    alert(`Requête ${provider} envoyée ! L'admin validera après vérification.`);
}

// --- LOGIQUE ADMIN (Mise à jour de l'affichage) ---
function refreshAdminPanel() {
    const list = document.getElementById('adminRequestList');
    if (db.pendingRequests.length === 0) {
        list.innerHTML = "<p style='color:gray; font-size:12px; text-align:center;'>Aucune vente en attente.</p>";
        return;
    }

    list.innerHTML = db.pendingRequests.map(req => `
        <div class="request-item">
            <div style="display:flex; justify-content:space-between;">
                <b>${req.userName}</b>
                <span class="price">${req.price} Ar</span>
            </div>
            <div class="req-info">
                Mode: ${req.provider} | <span class="req-ref">REF: ${req.reference}</span>
            </div>
            <button class="btn-approve" style="width:100%; margin-top:5px;" onclick="approveRequest(${req.id})">
                Vérifié & Valider le Token
            </button>
        </div>
    `).join('');
}
