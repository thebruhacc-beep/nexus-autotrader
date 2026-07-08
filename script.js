const logBox = document.getElementById('log-box');
const signalList = document.getElementById('signal-list');

// Simulatie van tokens om te laten zien hoe het werkt
const MOCK_TOKENS = [
    { name: "SOLARIS", symbol: "SOLR", ca: "DeZf...7dqP", safety: 98, liq: "Locked", mint: "Disabled" },
    { name: "NEON CAT", symbol: "NCAT", ca: "4k3D...jS8a", safety: 94, liq: "Burned", mint: "Disabled" },
    { name: "PUMP MASTER", symbol: "PUMP", ca: "6nMY...u9Xz", safety: 91, liq: "90% Locked", mint: "Disabled" }
];

function pushLog(message, color = "#888") {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.style.color = color;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
    logBox.prepend(div);
}

function createSignalCard(token) {
    const card = document.createElement('div');
    card.className = 'signal-card';
    card.innerHTML = `
        <div class="signal-header">
            <span class="badge badge-safe">Score: ${token.safety}/100</span>
            <span style="font-size: 10px; color: #555;">Just Now</span>
        </div>
        <div class="token-info">
            <h2>$${token.symbol}</h2>
            <p>${token.name}</p>
        </div>
        <div class="ca-box">
            <span class="ca-text">${token.ca}</span>
            <button class="copy-btn" onclick="copyCA('${token.ca}')">COPY</button>
        </div>
        <div class="safety-checks">
            <div class="check-item"><span class="check-icon">🔥</span> LP ${token.liq}</div>
            <div class="check-item"><span class="check-icon">🚫</span> Mint Renounced</div>
            <div class="check-item"><span class="check-icon">✅</span> Top 10 Safe</div>
            <div class="check-item"><span class="check-icon">💎</span> High Liquidity</div>
        </div>
    `;
    signalList.prepend(card);
}

function copyCA(text) {
    navigator.clipboard.writeText(text);
    pushLog(`📋 CA Gekopieerd naar klembord: ${text}`, "var(--accent)");
}

// De "Scan" Loop
async function startScanner() {
    while (true) {
        let delay = Math.random() * 5000 + 3000;
        await new Promise(r => setTimeout(r, delay));

        pushLog("Scanning new Raydium Liquidity Pools...");
        
        // Simuleer het vinden van een "onveilige" token die we negeren
        if (Math.random() > 0.7) {
            pushLog("⚠️ Token gedetecteerd maar afgewezen: LP not burned.", "var(--danger)");
        }

        // Simuleer het vinden van een "Alpha" token
        if (Math.random() > 0.85) {
            const token = MOCK_TOKENS[Math.floor(Math.random() * MOCK_TOKENS.length)];
            pushLog(`🚀 ALPHA GEVONDEN: $${token.symbol} voldoet aan alle veiligheidseisen!`, "var(--success)");
            createSignalCard(token);
        }

        // Update block height simulatie
        document.getElementById('block-height').innerText = `BLOCK: ${Math.floor(Math.random() * 1000000 + 274000000)}`;
    }
}

window.onload = startScanner;
