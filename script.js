// --- CONFIGURATIE ---
const MY_RPC_URL = "JOUW_HELIUS_LINK_HIER"; 

var myAddress = null;
var isAutoTrading = false;

// Challenge Data
var challengeData = {
    balance: 0.01, // Start van de challenge
    pnl: 0,
    wins: 0,
    losses: 0
};

const solWeb3 = window.solanaWeb3;

function pushLog(text, colorClass = "") {
    const box = document.getElementById('log-box');
    const div = document.createElement('div');
    div.className = `log-entry ${colorClass}`;
    div.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
    box.prepend(div);
}

// 1. Phantom Check
function checkPhantom() {
    const diag = document.getElementById('diag-phantom');
    if (window.solana && window.solana.isPhantom) {
        diag.innerText = "Phantom: OK";
        diag.style.color = "#00ff88";
        pushLog("Systeem: Scanner geladen en klaar.", "blue");
    }
}

// 2. Verbinden
async function handleConnect() {
    try {
        const resp = await window.solana.connect();
        myAddress = resp.publicKey.toString();
        document.getElementById('connect-btn').innerText = myAddress.slice(0,4) + "...";
        pushLog("✅ Wallet gekoppeld. Challenge gestart op 0.01 SOL.", "green");
        getRealBalance();
    } catch (err) {
        pushLog("❌ Verbinding geweigerd.", "red");
    }
}

// 3. Echte Balans ophalen (Referentie)
async function getRealBalance() {
    if (!myAddress) return;
    try {
        const connection = new solWeb3.Connection(MY_RPC_URL, "confirmed");
        const balance = await connection.getBalance(new solWeb3.PublicKey(myAddress));
        document.getElementById('balance').innerText = (balance / 1e9).toFixed(4);
    } catch (e) {
        console.error("RPC Error");
    }
}

// 4. De Trading Engine
document.getElementById('start-btn').onclick = function() {
    if (!myAddress) return alert("Koppel eerst je wallet!");
    isAutoTrading = !isAutoTrading;
    const btn = document.getElementById('start-btn');

    if (isAutoTrading) {
        btn.innerText = "STOP SNIPER";
        btn.style.background = "#ff3e3e";
        pushLog("🚀 AUTO-SNIPER ACTIEF. Zoeken naar high-confidence tokens...", "green");
        tradingEngine();
    } else {
        btn.innerText = "START AUTO-SNIPER";
        btn.style.background = "#00f2ff";
        pushLog("🛑 Sniper gepauzeerd.", "red");
    }
};

async function tradingEngine() {
    while (isAutoTrading) {
        // Stap 1: Scannen (duurt even)
        pushLog("Scannen blockchain op nieuwe liquiditeit...", "blue");
        await new Promise(r => setTimeout(r, 4000 + Math.random() * 4000));
        
        if (!isAutoTrading) break;

        // Stap 2: Filteren op hoge winrate (Simulatie van analyse)
        let confidence = Math.floor(Math.random() * (100 - 60) + 60);
        let minConf = document.getElementById('min-conf').value;

        if (confidence < minConf) {
            pushLog(`Skipping token: Confidence (${confidence}%) te laag.`, "red");
            continue;
        }

        // Stap 3: Trade Uitvoeren
        const tradeSize = parseFloat(document.getElementById('trade-size').value);
        const tp = parseFloat(document.getElementById('tp-percent').value);
        const sl = parseFloat(document.getElementById('sl-percent').value);

        pushLog(`🎯 ENTRY: Token gevonden! Confidence: ${confidence}%. Trading ${tradeSize} SOL...`, "green");
        
        // Simulatie van trade duur (memecoins zijn snel)
        await new Promise(r => setTimeout(r, 3000));

        // Stap 4: Resultaat bepalen gebaseerd op TP/SL en Confidence
        // Hogere confidence = hogere win kans
        let winChance = confidence / 100; 
        let isWin = Math.random() < winChance;

        let profit;
        if (isWin) {
            profit = tradeSize * (tp / 100);
            challengeData.wins++;
            pushLog(`💰 TAKE PROFIT: +${profit.toFixed(5)} SOL geraakt!`, "green");
        } else {
            profit = -(tradeSize * (sl / 100));
            challengeData.losses++;
            pushLog(`📉 STOP LOSS: -${Math.abs(profit).toFixed(5)} SOL geraakt.`, "red");
        }

        // Stap 5: Data Updaten
        challengeData.balance += profit;
        challengeData.pnl += profit;
        
        updateDashboard();
        getRealBalance(); // Altijd echte balans checken als referentie
    }
}

function updateDashboard() {
    // Balans en PnL tonen
    document.getElementById('chall-balance').innerText = challengeData.balance.toFixed(5);
    document.getElementById('pnl').innerText = (challengeData.pnl >= 0 ? '+' : '') + challengeData.pnl.toFixed(5);
    document.getElementById('pnl').style.color = challengeData.pnl >= 0 ? "#00ff88" : "#ff3e3e";

    // Winrate Berekening
    const total = challengeData.wins + challengeData.losses;
    const wr = ((challengeData.wins / total) * 100).toFixed(0);
    document.getElementById('winrate').innerText = wr + "%";
}

window.onload = function() {
    checkPhantom();
    document.getElementById('connect-btn').onclick = handleConnect;
};
