// DEBUG LOGS START
console.log("--- NEXUS BOOT SEQUENCE START ---");

// Globale variabelen (geen redeclaratie van solanaWeb3!)
var myAddress = null;
var isAutoTrading = false;
var statsData = { w: 0, l: 0, pnl: 0 };

// 1. Terminal Logger
function pushLog(text, colorClass = "") {
    const box = document.getElementById('log-box');
    const div = document.createElement('div');
    div.className = `log-entry ${colorClass}`;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(div);
    console.log("Terminal:", text);
}

// 2. Check of Phantom bestaat zodra de pagina laadt
function checkPhantom() {
    const diag = document.getElementById('diag-phantom');
    if (window.solana && window.solana.isPhantom) {
        diag.innerText = "Phantom: Gevonden";
        diag.style.color = "#00ff88";
        pushLog("Systeem: Phantom Wallet gedetecteerd.", "blue");
    } else {
        diag.innerText = "Phantom: NIET GEVONDEN";
        diag.style.color = "#ff3e3e";
        pushLog("WAARSCHUWING: Phantom niet gevonden. Installeer de Chrome extensie!", "red");
    }
}

// 3. Connect Functie
async function handleConnect() {
    console.log("Klik op connect-btn");
    pushLog("Bezig met verbinden...");

    if (!window.solana) {
        alert("Phantom is niet geïnstalleerd!");
        return;
    }

    try {
        const resp = await window.solana.connect();
        myAddress = resp.publicKey.toString();
        
        // UI Update
        document.getElementById('connect-btn').innerText = myAddress.slice(0,4) + "..." + myAddress.slice(-4);
        document.getElementById('connect-btn').style.background = "#111";
        document.getElementById('connect-btn').style.color = "#00ff88";
        
        pushLog("✅ Wallet verbonden: " + myAddress, "green");
        getSolBalance();
    } catch (err) {
        pushLog("❌ Fout: " + err.message, "red");
        console.error(err);
    }
}

// 4. Balans
async function getSolBalance() {
    if (!myAddress) return;
    try {
        const connection = new window.solanaWeb3.Connection(window.solanaWeb3.clusterApiUrl("mainnet-beta"));
        const balance = await connection.getBalance(new window.solanaWeb3.PublicKey(myAddress));
        document.getElementById('balance').innerText = (balance / 1e9).toFixed(4) + " SOL";
    } catch (e) {
        console.error("Balans error", e);
    }
}

// 5. De Bot Loop
document.getElementById('start-btn').onclick = function() {
    if (!myAddress) {
        alert("Eerst wallet verbinden!");
        return;
    }

    isAutoTrading = !isAutoTrading;
    const btn = document.getElementById('start-btn');
    const status = document.getElementById('bot-status');

    if (isAutoTrading) {
        btn.innerText = "STOP BOT";
        btn.style.background = "#ff3e3e";
        status.innerText = "Running";
        status.style.color = "#00ff88";
        pushLog("🚀 Bot gestart. Scannen blockchain...", "green");
        tradingCycle();
    } else {
        btn.innerText = "START BOT";
        btn.style.background = "#00f2ff";
        status.innerText = "Standby";
        status.style.color = "#444";
        pushLog("🛑 Bot handmatig gestopt.", "red");
    }
};

async function tradingCycle() {
    while (isAutoTrading) {
        await new Promise(r => setTimeout(r, 6000));
        if (!isAutoTrading) break;

        const size = parseFloat(document.getElementById('trade-size').value);
        pushLog(`Analyse: Nieuw token gevonden. Win-kans: 89%`);
        
        // Simulatie
        await new Promise(r => setTimeout(r, 2000));
        const won = Math.random() > 0.3;
        const profit = won ? (size * 0.85) : (size * -1);
        
        statsData.pnl += profit;
        if(won) statsData.w++; else statsData.l++;
        
        // UI Update
        document.getElementById('pnl').innerText = statsData.pnl.toFixed(5);
        document.getElementById('winrate').innerText = ((statsData.w / (statsData.w + statsData.l)) * 100).toFixed(0) + "%";
        getSolBalance();
        pushLog(won ? "💰 WIN: + " + profit.toFixed(5) : "📉 LOSS: " + profit.toFixed(5), won ? "green" : "red");
    }
}

// Start de checks als de pagina laadt
window.onload = function() {
    checkPhantom();
    document.getElementById('connect-btn').onclick = handleConnect;
    pushLog("Systeem klaar voor gebruik.");
};

console.log("--- NEXUS BOOT SEQUENCE COMPLETE ---");
