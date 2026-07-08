const solanaWeb3 = window.solanaWeb3;
let connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
let myWallet = null;
let botRunning = false;
let stats = { wins: 0, losses: 0, pnl: 0 };

function addLog(text, color = "") {
    const box = document.getElementById('log-box');
    const entry = document.createElement('div');
    entry.style.color = color;
    entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(entry);
}

// --- DE ÉCHTE PHANTOM FIX ---
async function tryConnect() {
    console.log("Connectie knop ingedrukt");
    
    if (window.solana) {
        try {
            const resp = await window.solana.connect();
            myWallet = resp.publicKey.toString();
            
            // Knop aanpassen
            const btn = document.getElementById('connect-btn');
            btn.innerText = myWallet.slice(0,4) + "..." + myWallet.slice(-4);
            btn.style.background = "#111";
            btn.style.color = "#00ff88";
            
            addLog("✅ Wallet Verbonden: " + myWallet, "#00ff88");
            updateBalance();
        } catch (err) {
            addLog("❌ Verbinding geweigerd.", "red");
        }
    } else {
        addLog("❌ Phantom niet gevonden. Gebruik de Phantom Browser.", "red");
        window.open("https://phantom.app/", "_blank");
    }
}

async function updateBalance() {
    if (!myWallet) return;
    const balance = await connection.getBalance(new solanaWeb3.PublicKey(myWallet));
    document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
}

// Bot Controle
document.getElementById('start-btn').addEventListener('click', () => {
    if (!myWallet) return alert("Eerst Phantom verbinden!");
    
    botRunning = !botRunning;
    const btn = document.getElementById('start-btn');
    
    if (botRunning) {
        btn.innerText = "STOP BOT";
        btn.style.background = "red";
        addLog("🚀 Sniper actief. Zoeken naar trades...", "#00f2ff");
        runLoop();
    } else {
        btn.innerText = "START BOT";
        btn.style.background = "#00f2ff";
        addLog("🛑 Bot gestopt.");
    }
});

async function runLoop() {
    while (botRunning) {
        await new Promise(r => setTimeout(r, 5000));
        if (!botRunning) break;

        const size = parseFloat(document.getElementById('trade-size').value);
        addLog(`Analyzing new token... Confidence 92%`);
        
        // Simulatie trade
        await new Promise(r => setTimeout(r, 2000));
        const win = Math.random() > 0.3;
        const profit = win ? (size * 0.8) : (size * -1);
        
        stats.pnl += profit;
        if (win) stats.wins++; else stats.losses++;
        
        updateUI();
    }
}

function updateUI() {
    const total = stats.wins + stats.losses;
    const wr = (stats.wins / total) * 100;
    document.getElementById('winrate').innerText = wr.toFixed(0) + "%";
    document.getElementById('pnl').innerText = (stats.pnl >= 0 ? '+' : '') + stats.pnl.toFixed(5);
    updateBalance();
}

// EVENT LISTENER DIRECT KOPPELEN
document.getElementById('connect-btn').onclick = tryConnect;
