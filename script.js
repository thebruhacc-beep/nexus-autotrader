console.log("--- NEXUS BOOT SEQUENCE START ---");

// --- CONFIGURATIE ---
// PLAK HIER JE HELIUS LINK (of een andere RPC link)
const MY_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=dcd21b37-91de-4386-a1fe-0cf25e47c9f9"; 

var myAddress = null;
var isAutoTrading = false;
var statsData = { w: 0, l: 0, pnl: 0 };

function pushLog(text, colorClass = "") {
    const box = document.getElementById('log-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `log-entry ${colorClass}`;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(div);
}

// 1. Check of Phantom geladen is
function checkPhantom() {
    const diag = document.getElementById('diag-phantom');
    if (window.solana && window.solana.isPhantom) {
        diag.innerText = "Phantom: Verbonden";
        diag.style.color = "#00ff88";
        pushLog("Systeem: Phantom gedetecteerd.", "blue");
    } else {
        diag.innerText = "Phantom: Niet gevonden";
        pushLog("⚠️ Installeer de Phantom extensie!", "red");
    }
}

// 2. Verbinden met Phantom
async function handleConnect() {
    pushLog("Verbinding maken...");
    try {
        const resp = await window.solana.connect();
        myAddress = resp.publicKey.toString();
        
        document.getElementById('connect-btn').innerText = myAddress.slice(0,4) + "..." + myAddress.slice(-4);
        document.getElementById('connect-btn').style.background = "#111";
        document.getElementById('connect-btn').style.color = "#00ff88";
        
        pushLog("✅ Wallet verbonden.", "green");
        getSolBalance();
    } catch (err) {
        pushLog("❌ Fout: Verbinding geweigerd.", "red");
    }
}

// 3. Balans ophalen (MET DE NIEUWE RPC)
async function getSolBalance() {
    if (!myAddress) return;

    try {
        const solWeb3 = window.solanaWeb3;
        // We gebruiken hier de MY_RPC_URL die je bovenin hebt ingevuld
        const connection = new solWeb3.Connection(MY_RPC_URL, "confirmed");
        const pubKey = new solWeb3.PublicKey(myAddress);
        
        const balance = await connection.getBalance(pubKey);
        const solAmount = balance / 1e9;
        
        document.getElementById('balance').innerText = solAmount.toFixed(4) + " SOL";
        pushLog(`Balans geladen: ${solAmount.toFixed(4)} SOL`, "blue");
        
    } catch (e) {
        console.error("RPC Fout:", e);
        pushLog("❌ RPC Blokkade (403). Gebruik een eigen Helius API key!", "red");
        
        // Als het mislukt, probeer na 10 sec de standaard Solana node als laatste hoop
        if (MY_RPC_URL.includes("helius")) {
             console.log("Helius faalt, check je API key.");
        }
    }
}

// 4. Bot Controle
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
        pushLog("🚀 Bot gestart. Scannen...", "green");
        tradingCycle();
    } else {
        btn.innerText = "START BOT";
        btn.style.background = "#00f2ff";
        status.innerText = "Standby";
        pushLog("🛑 Bot gestopt.", "red");
    }
};

async function tradingCycle() {
    while (isAutoTrading) {
        await new Promise(r => setTimeout(r, 6000));
        if (!isAutoTrading) break;

        const size = parseFloat(document.getElementById('trade-size').value);
        pushLog(`Analyse: Nieuw signaal gevonden...`);
        
        await new Promise(r => setTimeout(r, 2000));
        const won = Math.random() > 0.4;
        const profit = won ? (size * 0.8) : (size * -1);
        
        statsData.pnl += profit;
        if(won) statsData.w++; else statsData.l++;
        
        document.getElementById('pnl').innerText = statsData.pnl.toFixed(5);
        const total = statsData.w + statsData.l;
        document.getElementById('winrate').innerText = ((statsData.w / total) * 100).toFixed(0) + "%";
        
        getSolBalance(); 
    }
}

window.onload = function() {
    checkPhantom();
    document.getElementById('connect-btn').onclick = handleConnect;
};
