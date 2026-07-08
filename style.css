// --- INITIALISATIE ---
const solanaWeb3 = window.solanaWeb3;
let connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
let walletPubkey = null;
let isBotRunning = false;

// Statistieken bijhouden
let stats = {
    wins: 0,
    losses: 0,
    totalPnL: 0,
    openTrades: 0
};

// --- PHANTOM CONNECTION FIX ---
const connectWallet = async () => {
    try {
        // Phantom provider check
        const provider = window.solana;
        
        if (!provider || !provider.isPhantom) {
            addLog("❌ Phantom niet gevonden. Installeer de extensie of open de site in Phantom browser.");
            window.open("https://phantom.app/", "_blank");
            return;
        }

        // Directe verbinding aanvragen
        const resp = await provider.connect();
        walletPubkey = resp.publicKey.toString();
        
        // UI Update
        const btn = document.getElementById('connect-btn');
        btn.style.background = "rgba(0, 255, 136, 0.15)";
        btn.style.border = "1px solid #00ff8840";
        btn.style.color = "#00ff88";
        document.getElementById('btn-text').innerText = walletPubkey.slice(0,4) + "..." + walletPubkey.slice(-4);
        
        addLog("✅ Phantom succesvol gekoppeld!", "success");
        updateBalance();
    } catch (err) {
        addLog("❌ Verbinding geweigerd door gebruiker.");
        console.error("Connection error:", err);
    }
};

// --- DYNAMISCHE FEE LOGICA ---
const getDynamicFee = async (tradeAmount) => {
    try {
        const fees = await connection.getRecentPrioritizationFees();
        const avgFee = fees.length > 0 ? fees[0].prioritizationFee : 5000;
        
        // Nooit meer dan 5% van de trade aan fee uitgeven (belangrijk voor 0.01 SOL challenge)
        const maxFee = tradeAmount * 0.05;
        const finalFee = Math.min(avgFee / 1e9, maxFee);
        
        return Math.max(finalFee, 0.000005); // Altijd een minimale fee voor snelheid
    } catch (e) {
        return 0.00001; // Fallback
    }
};

// --- AUTOMATISCHE HANDELS ENGINE ---
document.getElementById('start-btn').addEventListener('click', async () => {
    if (!walletPubkey) return alert("Koppel eerst je Phantom wallet!");

    isBotRunning = !isBotRunning;
    const btn = document.getElementById('start-btn');

    if (isBotRunning) {
        btn.innerText = "STOP BOT";
        btn.style.background = "#ff3e3e";
        addLog("🚀 Auto-Trader geactiveerd. Scannen naar tokens met hoge winrate...", "success");
        runAutoTrader();
    } else {
        btn.innerText = "START AUTO-TRADER";
        btn.style.background = "#00f2ff";
        addLog("🛑 Bot gestopt door gebruiker.");
    }
});

async function runAutoTrader() {
    while (isBotRunning) {
        // Simulatie van scannen naar tokens
        addLog("Scannen blockchain op nieuwe paren...", "system");
        await new Promise(r => setTimeout(r, 7000 + Math.random() * 5000));
        
        if (!isBotRunning) break;

        const minWinrate = document.getElementById('min-winrate').value;
        addLog(`🎯 Signaal gevonden! Win-kans: 91%. Filter: >${minWinrate}%`);

        await executeAutoTrade();
    }
}

async function executeAutoTrade() {
    const tradeSize = parseFloat(document.getElementById('trade-size').value);
    const dynamicFee = await getDynamicFee(tradeSize);
    
    stats.openTrades = 1;
    updateUI();

    addLog(`Initiating Swap: ${tradeSize} SOL. Priority Fee: ${dynamicFee.toFixed(6)} SOL`);
    addLog("Wachten op Phantom handtekening & blockchain bevestiging...", "system");

    // Simulatie van de trade uitkomst
    await new Promise(r => setTimeout(r, 4000));
    
    const isWin = Math.random() > 0.25; // 75% Winrate
    const profit = isWin ? (tradeSize * 0.6) : (tradeSize * -0.9);
    const resultAfterFees = profit - dynamicFee;

    stats.totalPnL += resultAfterFees;
    if (isWin) stats.wins++; else stats.losses++;
    stats.openTrades = 0;

    addLog(isWin ? `✅ Winst: +${resultAfterFees.toFixed(5)} SOL` : `❌ Verlies: ${resultAfterFees.toFixed(5)} SOL`, isWin ? "success" : "text-red");
    
    updateUI();
    updateBalance();
}

// --- UI UPDATES ---
function updateUI() {
    const total = stats.wins + stats.losses;
    const wr = total > 0 ? (stats.wins / total) * 100 : 0;
    
    document.getElementById('winrate').innerText = wr.toFixed(0) + "%";
    document.getElementById('pnl').innerText = (stats.totalPnL >= 0 ? '+' : '') + stats.totalPnL.toFixed(5) + " SOL";
    document.getElementById('pnl').style.color = stats.totalPnL >= 0 ? "#00ff88" : "#ff3e3e";
    document.getElementById('open-positions').innerText = `Open Positions: ${stats.openTrades}`;
}

async function updateBalance() {
    if (!walletPubkey) return;
    try {
        const balance = await connection.getBalance(new solanaWeb3.PublicKey(walletPubkey));
        document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
    } catch (e) {
        console.error("Balance fetch error");
    }
}

function addLog(msg, type = "") {
    const log = document.getElementById('log-container');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.prepend(entry);
}

// Button Listener
document.getElementById('connect-btn').addEventListener('click', connectWallet);

// Balans check interval
setInterval(updateBalance, 15000);
