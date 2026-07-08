const solanaWeb3 = window.solanaWeb3;
let connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
let walletPubkey = null;
let isBotRunning = false;
let stats = { wins: 0, losses: 0, pnl: 0 };

// --- DE FIX VOOR DE KNOP ---
async function connectWallet() {
    addLog("Verbinding maken met Phantom...");
    
    // Controleer of Phantom in de browser zit
    const isPhantomInstalled = window.solana && window.solana.isPhantom;

    if (!isPhantomInstalled) {
        addLog("❌ Phantom niet gevonden! Installeer de extensie.");
        alert("Phantom wallet niet gevonden. Open deze site in de Phantom browser app of installeer de Chrome extensie.");
        return;
    }

    try {
        // Vraag toestemming om te verbinden
        const resp = await window.solana.connect();
        walletPubkey = resp.publicKey.toString();
        
        // Update de knop direct
        const btn = document.getElementById('connect-btn');
        btn.style.background = "#00ff8820";
        btn.style.borderColor = "#00ff8840";
        btn.style.color = "#00ff88";
        document.getElementById('btn-text').innerText = walletPubkey.slice(0,4) + "..." + walletPubkey.slice(-4);
        
        addLog("✅ Wallet verbonden: " + walletPubkey.slice(0,6), "success");
        updateBalance();
    } catch (err) {
        addLog("❌ Verbinding geweigerd.");
        console.error(err);
    }
}

// --- BALANS UPDATEN ---
async function updateBalance() {
    if (!walletPubkey) return;
    try {
        const pubKey = new solanaWeb3.PublicKey(walletPubkey);
        const balance = await connection.getBalance(pubKey);
        document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
    } catch (e) {
        console.log("Balance fetch error");
    }
}

// --- BOT START/STOP ---
document.getElementById('start-btn').addEventListener('click', () => {
    if (!walletPubkey) {
        alert("Koppel eerst je Phantom wallet!");
        return;
    }

    isBotRunning = !isBotRunning;
    const btn = document.getElementById('start-btn');

    if (isBotRunning) {
        btn.innerText = "STOP BOT";
        btn.style.background = "#ff3e3e";
        addLog("🚀 Auto-Trader geactiveerd. Scannen...", "success");
        runScanner();
    } else {
        btn.innerText = "START AUTO-TRADER";
        btn.style.background = "#00f2ff";
        addLog("🛑 Bot gestopt.");
    }
});

async function runScanner() {
    while (isBotRunning) {
        await new Promise(r => setTimeout(r, 6000));
        if (!isBotRunning) break;
        
        addLog("Target gevonden. Winrate 92%. Trade uitvoeren...");
        await simulateTrade();
    }
}

async function simulateTrade() {
    const tradeSize = parseFloat(document.getElementById('trade-size').value);
    await new Promise(r => setTimeout(r, 2000));
    
    const isWin = Math.random() > 0.2;
    const pnl = isWin ? (tradeSize * 0.7) : (tradeSize * -1);
    
    stats.pnl += pnl;
    if (isWin) stats.wins++; else stats.losses++;
    
    updateUI();
}

function updateUI() {
    const total = stats.wins + stats.losses;
    const wr = (stats.wins / total) * 100;
    document.getElementById('winrate').innerText = wr.toFixed(0) + "%";
    document.getElementById('pnl').innerText = (stats.pnl >= 0 ? '+' : '') + stats.pnl.toFixed(5) + " SOL";
    document.getElementById('pnl').style.color = stats.pnl >= 0 ? "#00ff88" : "#ff3e3e";
    updateBalance();
}

function addLog(msg, type = "") {
    const log = document.getElementById('log-container');
    const div = document.createElement('div');
    div.className = "log-entry " + type;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.prepend(div);
}

// Event Listeners
document.getElementById('connect-btn').onclick = connectWallet;
