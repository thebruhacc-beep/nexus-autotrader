const solanaWeb3 = window.solanaWeb3;
let connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
let wallet = null;
let isBotActive = false;
let stats = { win: 0, loss: 0, pnl: 0 };

// 1. PHANTOM FIX: Wacht tot provider geladen is
const getProvider = () => {
    if ('solana' in window) {
        const provider = window.solana;
        if (provider.isPhantom) return provider;
    }
    return null;
};

async function connectWallet() {
    const provider = getProvider();
    if (provider) {
        try {
            const resp = await provider.connect();
            wallet = resp.publicKey.toString();
            document.getElementById('connect-btn').innerHTML = `<span>${wallet.slice(0,4)}...${wallet.slice(-4)}</span>`;
            document.getElementById('connect-btn').style.background = "#00ff8820";
            document.getElementById('connect-btn').style.color = "#00ff88";
            addLog("✅ Wallet Succesvol Gekoppeld", "text-success");
            updateBalance();
        } catch (err) {
            addLog("❌ Verbinding geweigerd", "text-red");
        }
    } else {
        addLog("❌ Phantom niet gevonden! Installeer de extensie.", "text-red");
        window.open("https://phantom.app/", "_blank");
    }
}

// 2. Balans Check
async function updateBalance() {
    if (!wallet) return;
    const balance = await connection.getBalance(new solanaWeb3.PublicKey(wallet));
    document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
}

// 3. De "Automatische" Sniper Loop
document.getElementById('start-btn').addEventListener('click', () => {
    if (!wallet) return alert("Koppel eerst Phantom!");
    isBotActive = !isBotActive;
    
    const btn = document.getElementById('start-btn');
    if (isBotActive) {
        btn.innerText = "STOP SNIPER";
        btn.classList.add('active');
        addLog("🚀 Auto-Trader geactiveerd. Scannen voor high-probability setups...", "text-success");
        runScanner();
    } else {
        btn.innerText = "START AUTO-TRADER";
        btn.classList.remove('active');
        addLog("🛑 Sniper gestopt.");
    }
});

async function runScanner() {
    while (isBotActive) {
        addLog("Scannen naar tokens met >" + document.getElementById('min-win').value + "% winrate...");
        
        // Simulatie van scannen (in realiteit gebruik je hier Pump.fun websockets)
        await new Promise(r => setTimeout(r, 8000));
        
        if (!isBotActive) break;

        // Trade simulatie logica voor 0.01 SOL challenge
        const tradeAmount = parseFloat(document.getElementById('trade-size').value);
        addLog(`🎯 Signaal gedetecteerd! Uitvoeren trade: ${tradeAmount} SOL...`);
        
        // Hier roepen we de Jupiter Swap aan (stap 4 in volgende deel)
        await simulateTrade(tradeAmount);
    }
}

async function simulateTrade(amount) {
    addLog("Wachten op blockchain bevestiging...", "system-msg");
    await new Promise(r => setTimeout(r, 3000));
    
    const isWin = Math.random() > 0.2; // 80% Winrate simulatie
    const profit = isWin ? amount * 0.5 : -amount;
    
    stats.pnl += profit;
    if (isWin) stats.win++; else stats.loss++;
    
    updateUI();
}

function updateUI() {
    const total = stats.win + stats.loss;
    const wr = (stats.win / total) * 100;
    document.getElementById('winrate').innerText = wr.toFixed(0) + "%";
    document.getElementById('winrate-fill').style.width = wr + "%";
    document.getElementById('total-pnl').innerText = (stats.pnl >= 0 ? '+' : '') + stats.pnl.toFixed(4) + " SOL";
    document.getElementById('total-pnl').className = "value " + (stats.pnl >= 0 ? 'text-success' : 'text-red');
    updateBalance();
}

function addLog(msg, color = "") {
    const log = document.getElementById('log-container');
    const div = document.createElement('div');
    div.className = "log-entry " + color;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.prepend(div);
}

// Event Listeners
document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('min-win').oninput = function() {
    document.getElementById('win-val').innerText = this.value + "%";
};
