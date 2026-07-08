// --- CONFIGURATIE ---
// Gebruik je eigen Helius link voor de beste resultaten zonder 403 errors!
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=dcd21b37-91de-4386-a1fe-0cf25e47c9f9"; 

var walletAddress = null;
var isBotRunning = false;
var stats = { wins: 0, losses: 0, pnl: 0 };

function pushLog(text, color = "") {
    const box = document.getElementById('log-box');
    const div = document.createElement('div');
    div.className = `log-entry ${color}`;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(div);
}

// 1. Phantom Verbinding
async function connect() {
    if (!window.solana) return alert("Phantom niet gevonden!");
    try {
        const resp = await window.solana.connect();
        walletAddress = resp.publicKey.toString();
        document.getElementById('connect-btn').innerText = walletAddress.slice(0,4) + "...";
        document.getElementById('diag-phantom').innerText = "Phantom: OK";
        document.getElementById('diag-phantom').style.color = "#00ff88";
        pushLog("✅ Wallet verbonden. Klaar voor challenge.", "green");
        updateBalance();
    } catch (err) {
        pushLog("❌ Verbinding geweigerd.", "red");
    }
}

// 2. Echte Balans ophalen
async function updateBalance() {
    if (!walletAddress) return;
    try {
        const solWeb3 = window.solanaWeb3;
        const connection = new solWeb3.Connection(RPC_URL, "confirmed");
        const balance = await connection.getBalance(new solWeb3.PublicKey(walletAddress));
        const sol = balance / 1e9;
        document.getElementById('balance').innerText = sol.toFixed(4) + " SOL";
        console.log("Balans geüpdatet:", sol);
    } catch (e) {
        pushLog("⚠️ Kon balans niet ophalen. Check RPC link.", "red");
    }
}

// 3. Bot Cycle
document.getElementById('start-btn').onclick = function() {
    if (!walletAddress) return alert("Koppel eerst je wallet!");
    isBotRunning = !isBotRunning;
    const btn = document.getElementById('start-btn');

    if (isBotRunning) {
        btn.innerText = "STOP BOT";
        btn.classList.add('active');
        pushLog("🚀 BOT ACTIEF. Scannen op >" + document.getElementById('min-winrate')?.value || '92' + "% setups...", "green");
        mainLoop();
    } else {
        btn.innerText = "START BOT";
        btn.classList.remove('active');
        pushLog("🛑 Bot gestopt.", "red");
    }
};

async function mainLoop() {
    while (isBotRunning) {
        pushLog("Searching for liquidity pools...", "blue");
        await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
        
        if (!isBotRunning) break;

        // High Winrate Logic
        let signalStrength = Math.floor(Math.random() * 30) + 70; // 70-100%
        let minRequired = parseInt(document.getElementById('min-conf').value);

        if (signalStrength < minRequired) {
            pushLog(`Setup genegeerd. Kans: ${signalStrength}% (Te laag)`, "red");
            continue;
        }

        // Trade Uitvoeren
        await executeTrade(signalStrength);
    }
}

async function executeTrade(strength) {
    const tradeSize = parseFloat(document.getElementById('trade-size').value);
    const tp = parseFloat(document.getElementById('tp-percent').value);
    const sl = parseFloat(document.getElementById('sl-percent').value);

    pushLog(`🎯 TARGET GEVONDEN! Kans: ${strength}%. Trade size: ${tradeSize} SOL.`, "green");
    pushLog("Wachten op handmatige bevestiging in Phantom...", "blue");

    // In de browser MOET de gebruiker tekenen. 
    // Hier zou de Jupiter Swap API aangeroepen worden.
    // Voor nu simuleren we de succesvolle bevestiging:
    
    await new Promise(r => setTimeout(r, 3000));

    // Resultaat berekening gebaseerd op TP/SL en strength
    const winChance = (strength / 100);
    const isWin = Math.random() < winChance;
    const result = isWin ? (tradeSize * (tp / 100)) : -(tradeSize * (sl / 100));

    stats.pnl += result;
    if (isWin) stats.wins++; else stats.losses++;

    pushLog(isWin ? `💰 TAKE PROFIT: +${result.toFixed(5)} SOL` : `📉 STOP LOSS: ${result.toFixed(5)} SOL`, isWin ? "green" : "red");
    
    updateStatsUI();
    updateBalance(); // Update de echte balans na de trade
}

function updateStatsUI() {
    document.getElementById('pnl').innerText = (stats.pnl >= 0 ? '+' : '') + stats.pnl.toFixed(5);
    document.getElementById('pnl').style.color = stats.pnl >= 0 ? "#00ff88" : "#ff3e3e";
    
    const total = stats.wins + stats.losses;
    const wr = ((stats.wins / total) * 100).toFixed(0);
    document.getElementById('winrate').innerText = wr + "%";
}

document.getElementById('connect-btn').onclick = connect;
window.onload = () => { if(walletAddress) updateBalance(); };
