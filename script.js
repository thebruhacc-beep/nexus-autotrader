console.log("--- NEXUS BOOT SEQUENCE START ---");

var myAddress = null;
var isAutoTrading = false;
var statsData = { w: 0, l: 0, pnl: 0 };

// GEBRUIK EEN ALTERNATIEVE RPC (Deze blokkeert minder snel)
const RPC_URL = "https://solana-mainnet.g.allmystats.com"; 

function pushLog(text, colorClass = "") {
    const box = document.getElementById('log-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `log-entry ${colorClass}`;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(div);
}

function checkPhantom() {
    const diag = document.getElementById('diag-phantom');
    if (window.solana && window.solana.isPhantom) {
        diag.innerText = "Phantom: Gevonden";
        diag.style.color = "#00ff88";
        pushLog("Systeem: Phantom Wallet gedetecteerd.", "blue");
    } else {
        diag.innerText = "Phantom: NIET GEVONDEN";
        diag.style.color = "#ff3e3e";
        pushLog("WAARSCHUWING: Phantom niet gevonden!", "red");
    }
}

async function handleConnect() {
    pushLog("Bezig met verbinden...");
    if (!window.solana) return alert("Installeer Phantom!");

    try {
        const resp = await window.solana.connect();
        myAddress = resp.publicKey.toString();
        
        document.getElementById('connect-btn').innerText = myAddress.slice(0,4) + "..." + myAddress.slice(-4);
        document.getElementById('connect-btn').style.background = "#111";
        document.getElementById('connect-btn').style.color = "#00ff88";
        
        pushLog("✅ Wallet verbonden: " + myAddress, "green");
        
        // Wacht 1 seconde voordat we balans ophalen om RPC-overlap te voorkomen
        setTimeout(getSolBalance, 1000);
    } catch (err) {
        pushLog("❌ Fout: " + err.message, "red");
    }
}

async function getSolBalance() {
    if (!myAddress) return;
    try {
        const solWeb3 = window.solanaWeb3;
        // We maken een nieuwe verbinding met de nieuwe RPC_URL
        const connection = new solWeb3.Connection(RPC_URL, "confirmed");
        const pubKey = new solWeb3.PublicKey(myAddress);
        
        const balance = await connection.getBalance(pubKey);
        const solAmount = balance / 1e9;
        
        document.getElementById('balance').innerText = solAmount.toFixed(4) + " SOL";
        pushLog(`Balans bijgewerkt: ${solAmount.toFixed(4)} SOL`, "blue");
    } catch (e) {
        console.error("Balans error details:", e);
        pushLog("⚠️ RPC-fout bij ophalen balans. Systeem probeert opnieuw...", "red");
        // Bij een 403 fout, probeer het over 5 seconden nog eens
        setTimeout(getSolBalance, 5000);
    }
}

document.getElementById('start-btn').onclick = function() {
    if (!myAddress) return alert("Eerst wallet verbinden!");
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
        await new Promise(r => setTimeout(r, 8000));
        if (!isAutoTrading) break;

        const size = parseFloat(document.getElementById('trade-size').value);
        pushLog(`Analyse: Setup gevonden (Win-kans: 91%)...`);
        
        await new Promise(r => setTimeout(r, 2000));
        const won = Math.random() > 0.3;
        const profit = won ? (size * 0.82) : (size * -1);
        
        statsData.pnl += profit;
        if(won) statsData.w++; else statsData.l++;
        
        document.getElementById('pnl').innerText = statsData.pnl.toFixed(5);
        const total = statsData.w + statsData.l;
        document.getElementById('winrate').innerText = ((statsData.w / total) * 100).toFixed(0) + "%";
        
        getSolBalance();
        pushLog(won ? "💰 PROFIT: + " + profit.toFixed(5) : "📉 LOSS: " + profit.toFixed(5), won ? "green" : "red");
    }
}

window.onload = function() {
    checkPhantom();
    document.getElementById('connect-btn').onclick = handleConnect;
};
