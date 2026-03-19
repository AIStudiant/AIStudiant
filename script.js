let db = JSON.parse(localStorage.getItem('appDB')) || {
    stockIA: 1000000, sales: 0,
    users: [
        { id: "ADMIN", name: "Admin", tokens: 0, role: "admin", free: 0 },
        { id: "USER1", name: "Jean Dupont", tokens: 6000, role: "user", free: 0 }
    ],
    requests: [],
    subjects: ["Mathématiques", "Physique", "Science"]
};

let curr = null;
let selPack = null;

function save() { localStorage.setItem('appDB', JSON.stringify(db)); }

// AUTH
function handleAuth() {
    const val = document.getElementById('authInput').value.toUpperCase();
    curr = db.users.find(u => u.id === val);
    if (curr) {
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('mainApp').style.display = "block";
        render();
    } else alert("Code erroné");
}

function render() {
    document.getElementById('uName').innerText = curr.name;
    document.getElementById('uAvatar').innerText = curr.name[0];
    document.getElementById('uTokens').innerText = (curr.role==='admin' ? db.stockIA : curr.tokens).toLocaleString();
    document.getElementById('uFree').innerText = curr.free + "/3";
    document.getElementById('tokenBar').style.width = (db.stockIA/1000000*100) + "%";
    document.getElementById('tokenLabel').innerText = "Stock IA: " + (db.stockIA/1000000*100).toFixed(1) + "%";
    
    if(curr.role==='admin') {
        document.getElementById('adminBtn').style.display = "block";
        document.getElementById('badge').innerText = db.requests.length;
    }

    const list = document.getElementById('subjectList');
    list.innerHTML = db.subjects.map(s => `
        <div class="subject-card" onclick="openSubject('${s}')">
            <div style="font-size:30px">📚</div>
            <b>${s}</b>
        </div>
    `).join('');
}

// SHOP
function showShop() { document.getElementById('shopModal').style.display = "flex"; }
function closeShop() { document.getElementById('shopModal').style.display = "none"; }
function setPack(t, p) {
    selPack = {t, p};
    document.getElementById('sendBtn').disabled = false;
    document.querySelectorAll('.pack').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
}
function sendReq() {
    const ref = document.getElementById('refId').value;
    if(!ref) return alert("Entrez la référence");
    db.requests.push({ id: Date.now(), uid: curr.id, uname: curr.name, tokens: selPack.t, price: selPack.p, ref: ref });
    save();
    document.getElementById('sendBtn').innerText = "Fini !";
    setTimeout(() => { closeShop(); render(); document.getElementById('sendBtn').innerText = "Envoyer"; }, 1000);
}

// ADMIN
function showAdmin() {
    document.getElementById('adminModal').style.display = "flex";
    document.getElementById('aStock').innerText = db.stockIA.toLocaleString();
    document.getElementById('aSales').innerText = db.sales.toLocaleString();
    const list = document.getElementById('reqList');
    list.innerHTML = db.requests.map(r => `
        <div style="background:#0b0e14; padding:10px; margin:5px; border-radius:8px; text-align:left; font-size:12px">
            <b>${r.uname}</b> - ${r.price}Ar<br>REF: ${r.ref}
            <button onclick="approve(${r.id})" style="background:#10b981; color:#fff; border:none; padding:5px; width:100%; margin-top:5px; border-radius:5px">Valider</button>
        </div>
    `).join('');
}
function closeAdmin() { document.getElementById('adminModal').style.display = "none"; }
function approve(rid) {
    const idx = db.requests.findIndex(r => r.id === rid);
    const r = db.requests[idx];
    const user = db.users.find(u => u.id === r.uid);
    user.tokens += r.tokens;
    db.stockIA -= r.tokens;
    db.sales += r.price;
    db.requests.splice(idx, 1);
    save();
    showAdmin();
    render();
}

// ANALYSE
let activeSub = "";
function openSubject(s) {
    activeSub = s;
    document.getElementById('modalTitle').innerText = s;
    document.getElementById('analysisModal').style.display = "block";
}
function closeModal() { 
    document.getElementById('analysisModal').style.display = "none"; 
    document.getElementById('results').style.display = "none";
}
function handleFileUpload() {
    const file = document.getElementById('fileInput').files[0];
    if(file) {
        document.getElementById('fileInfo').innerText = "Fichier: " + file.name;
        document.getElementById('analyzeBtn').style.display = "block";
    }
}
function startAnalysis() {
    if(curr.free < 3 || curr.tokens >= 5000) {
        if(curr.free < 3) curr.free++; else curr.tokens -= 5000;
        save();
        render();
        document.getElementById('analyzeBtn').style.display = "none";
        document.getElementById('results').style.display = "block";
        document.getElementById('summaryText').innerText = "Analyse du cours sur " + activeSub + "... Le réchauffement climatique impacte la biodiversité via la hausse des températures.";
        document.getElementById('quizBox').innerHTML = `
            <div class="summary-box">
                <b>Question 1:</b> Quelle est la cause principale ?<br>
                <button class="btn-main" style="background:#333">CO2</button>
                <button class="btn-main" style="background:#333">Oxygène</button>
            </div>
        `;
    } else alert("Tokens insuffisants");
}
