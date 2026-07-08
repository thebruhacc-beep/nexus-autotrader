console.log("--- NEXUS BOOT SEQUENCE START ---");

var myAddress = null;
var isAutoTrading = false;
var statsData = { w: 0, l: 0, pnl: 0 };

// LIJST MET BACK-UP SERVERS (RPC's)
const RPC_ENDPOINTS = [
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.rpc.extrnode.com",
    "https://api.mainnet-beta.solana.com"
];
let currentRpcIndex = 0;

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
        
        getSolBalance();
    } catch (err) {
        pushLog("❌ Fout: " + err.message, "red");
    }
}

async function getSolBalance() {
    if (!myAddress) return;

    const activeRpc = RPC_ENDPOINTS[currentRpcIndex];
    console.log("Proberen balans op te halen via:", activeRpc);

    try {
        const solWeb3 = window.solanaWeb3;
        const connection = new solWeb3.Connection(activeRpc, "confirmed");
        const pubKey = new solWeb3.PublicKey(myAddress);
        
        const balance = await connection.getBalance(pubKey);
        const solAmount = balance / 1e9;
        
        document.getElementById('balance').innerText = solAmount.toFixed(4) + " SOL";
        pushLog(`Balans geladen via Node ${currentRpcIndex + 1}`, "blue");
        
    } catch (e) {
        console.error(`Fout op Node ${currentRpcIndex + 1}:`, e.message);
        
        // Schakel over naar de volgende RPC in de lijst
        currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
        
        pushLog(`⚠️ Node fout. Schakelen naar Backup Server...`, "red");
        
        // Probeer het over 3 seconden opnieuw met de volgende node
        setTimeout(getSolBalance, 3000);
    }
}

// BOT LOGICA (SIMULATIE)
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
        pushLog(`Analyse: Nieuwe memecoin gevonden. Win-kans: 88%...`);
        
        await new Promise(r => setTimeout(r, 2000));
        const won = Math.random() > 0.35;
        const profit = won ? (size * 0.75) : (size * -1);
        
        statsData.pnl += profit;
        if(won) statsData.w++; else statsData.l++;
        
        document.getElementById('pnl').innerText = statsData.pnl.toFixed(5);
        const total = statsData.w + statsData.l;
        document.getElementById('winrate').innerText = ((statsData.w / total) * 100).toFixed(0) + "%";
        
        getSolBalance(); // Update balans na elke trade
        pushLog(won ? "💰 PROFIT: + " + profit.toFixed(5) : "📉 LOSS: " + profit.toFixed(5), won ? "green" : "red");
    }
}

window.onload = function() {
    checkPhantom();
    document.getElementById('connect-btn').onclick = handleConnect;
};
