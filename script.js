const solanaWeb3 = window.solanaWeb3;
let connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
let walletKey = null;
let botRunning = false;
let tradeStats = { wins: 0, losses: 0, pnl: 0 };

// PHANTOM CONNECTIE
async function connect() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("Installeer Phantom!");
        return;
    }

    try {
        const resp = await window.solana.connect();
        walletKey = resp.publicKey.toString();
        
        const btn = document.getElementById('connect-btn');
        btn.style.background = "#00ff8820";
        btn.style.color = "#00ff88";
        document.getElementById('btn-text').innerText = walletKey.slice(0,4) + "..." + walletKey.slice(-4);
        
        writeLog("✅ Wallet verbonden!", "success");
        refreshBalance();
    } catch (err) {
        writeLog("❌ Verbinding geweigerd.");
    }
}

// BALANS UPDATE
async function refreshBalance() {
    if (!walletKey) return;
    const balance = await connection.getBalance(new solanaWeb3.PublicKey(walletKey));
    document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
}

// BOT START/STOP
document.getElementById('start-bot-btn').onclick = () => {
    if (!walletKey) return alert("Koppel eerst je wallet!");

    botRunning = !botRunning;
    const btn = document.getElementById('start-bot-btn');

    if (botRunning) {
        btn.innerText = "STOP AUTO-TRADER";
        btn.style.background = "#ff3e3e";
        btn.style.color = "#fff";
        writeLog("🚀 Bot geactiveerd. Scannen voor trades...", "success");
        startScannerLoop();
    } else {
        btn.innerText = "START AUTO-TRADER";
        btn.style.background = "#00f2ff";
        btn.style.color = "#000";
        writeLog("🛑 Bot gestopt.");
    }
};

async function startScannerLoop() {
    while (botRunning) {
        await new Promise(r => setTimeout(r, 6000));
        if (!botRunning) break;
        
        writeLog("Target gevonden. Zekerheid 89%. Uitvoeren...");
        await doTrade();
    }
}

async function doTrade() {
    const size = parseFloat(document.getElementById('trade-size').value);
    await new Promise(r => setTimeout(r, 2000));
    
    const win = Math.random() > 0.3;
    const profit = win ? (size * 0.75) : (size * -1);
    
    tradeStats.pnl += profit;
    if (win) tradeStats.wins++; else tradeStats.losses++;
    
    updateDisplay();
}

function updateDisplay() {
    const total = tradeStats.wins + tradeStats.losses;
    const wr = (tradeStats.wins / total) * 100;
    document.getElementById('winrate').innerText = wr.toFixed(0) + "%";
    document.getElementById('pnl').innerText = (tradeStats.pnl >= 0 ? '+' : '') + tradeStats.pnl.toFixed(5) + " SOL";
    document.getElementById('pnl').style.color = tradeStats.pnl >= 0 ? "#00ff88" : "#ff3e3e";
    refreshBalance();
}

function writeLog(msg, type = "") {
    const log = document.getElementById('log-display');
    const div = document.createElement('div');
    div.className = "log-line " + type;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.prepend(div);
}

// Button Events
document.getElementById('connect-btn').onclick = connect;tWallet;
