// Configuratie & State
let walletAddress = null;
let isBotRunning = false;
let stats = { wins: 0, losses: 0, pnl: 0, openPositions: 0 };
const solanaWeb3 = window.solanaWeb3;
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

// 1. Phantom Koppeling Fix
async function connectWallet() {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
        try {
            const response = await provider.connect();
            walletAddress = response.publicKey.toString();
            document.getElementById('connect-btn').classList.add('hidden');
            document.getElementById('wallet-info').classList.remove('hidden');
            document.getElementById('wallet-info').innerText = `ID: ${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}`;
            addLog("✅ Phantom verbonden.", "text-green");
            updateBalance();
        } catch (err) {
            addLog("❌ Verbinding geweigerd.", "text-red");
        }
    } else {
        window.open("https://phantom.app/", "_blank");
    }
}

// 2. Balans update
async function updateBalance() {
    if (!walletAddress) return;
    try {
        const balance = await connection.getBalance(new solanaWeb3.PublicKey(walletAddress));
        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
        document.getElementById('balance').innerText = solBalance.toFixed(4) + " SOL";
    } catch (e) {
        console.error("Balans error", e);
    }
}

// 3. Bot Start/Stop
document.getElementById('start-btn').addEventListener('click', () => {
    if (!walletAddress) return alert("Koppel eerst je Phantom wallet!");
    
    isBotRunning = !isBotRunning;
    const btn = document.getElementById('start-btn');
    const status = document.getElementById('bot-status');

    if (isBotRunning) {
        btn.innerText = "STOP AUTO-TRADER";
        btn.classList.add('active');
        status.innerText = "Status: Scannen...";
        addLog("🚀 Auto-Trader Geactiveerd. Zoeken naar high-probability trades...", "text-green");
        startScanning();
    } else {
        btn.innerText = "START AUTO-TRADER";
        btn.classList.remove('active');
        status.innerText = "Status: Standby";
        addLog("🛑 Bot gestopt door gebruiker.", "text-red");
    }
});

// 4. De "Scanner" Engine (Simulatie van high winrate trades)
async function startScanning() {
    while (isBotRunning) {
        // In een echte bot zou hier een websocket naar Pump.fun of Jupiter zitten
        // Voor de challenge simuleren we een veilige trade-kans per 10-30 seconden
        addLog("Scanning blockchain voor nieuwe tokens...", "system-msg");
        
        await new Promise(r => setTimeout(r, Math.random() * 10000 + 5000));
        
        if (!isBotRunning) break;

        // Simulatie van een 'gevonden' token met hoge zekerheid
        const fakeToken = "H5f...7p9" + Math.floor(Math.random()*100);
        addLog(`🎯 Target gevonden: ${fakeToken} | Zekerheid: 88%`, "text-green");
        
        await executeTrade(fakeToken);
    }
}

// 5. Transactie Executie
async function executeTrade(tokenMint) {
    const tradeSize = document.getElementById('trade-size').value;
    addLog(`Initiating trade: ${tradeSize} SOL op ${tokenMint}`);
    
    // Omdat we 0.01 SOL doen, moet de gebruiker hier elke trade goedkeuren in Phantom
    // Voor volledige automatisering is een private key nodig (maar dat is stap 2)
    try {
        addLog("Wachten op Phantom goedkeuring...", "system-msg");
        
        // HIER KOMT DE JUPITER SWAP LOGICA (zoals in vorig bericht)
        // Voor nu simuleren we de winrate tracking:
        setTimeout(() => {
            if (isBotRunning) updateStats(true, 0.0015); // Fake win
        }, 3000);

    } catch (err) {
        addLog("Transactie mislukt of geweigerd.");
    }
}

function updateStats(isWin, amount) {
    if(isWin) {
        stats.wins++;
        stats.pnl += amount;
    } else {
        stats.losses++;
        stats.pnl -= amount;
    }
    
    const total = stats.wins + stats.losses;
    const winrate = (stats.wins / total) * 100;
    
    document.getElementById('winrate').innerText = winrate.toFixed(0) + "%";
    document.getElementById('total-pnl').innerText = stats.pnl.toFixed(4) + " SOL";
    
    addLog(`PnL Update: ${isWin ? '+' : '-'}${amount} SOL`, isWin ? "text-green" : "text-red");
}

function addLog(msg, colorClass = "") {
    const container = document.getElementById('log-container');
    const entry = document.createElement('div');
    entry.className = `log-entry ${colorClass}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    container.prepend(entry);
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
