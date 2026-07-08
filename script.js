let walletAddress = null;
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

// 1. Connect Phantom Wallet
document.getElementById('connect-btn').addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            walletAddress = response.publicKey.toString();
            document.getElementById('connect-btn').innerText = "Connected";
            addLog("Wallet verbonden: " + walletAddress.slice(0,6) + "...");
            updateBalance();
        } catch (err) {
            addLog("Error: Verbinding geweigerd.");
        }
    } else {
        alert("Installeer de Phantom Wallet extensie!");
    }
});

// 2. Balans ophalen
async function updateBalance() {
    if (!walletAddress) return;
    const pubKey = new solanaWeb3.PublicKey(walletAddress);
    const balance = await connection.getBalance(pubKey);
    document.getElementById('balance').innerText = (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4) + " SOL";
}

// 3. Snipe Functie via Jupiter API
document.getElementById('snipe-btn').addEventListener('click', async () => {
    const mint = document.getElementById('mint-address').value;
    if (!mint) return alert("Vul een Mint adres in!");
    if (!walletAddress) return alert("Koppel eerst je wallet!");

    addLog("🚀 Quote ophalen bij Jupiter voor 0.005 SOL...");
    
    try {
        // We vragen Jupiter om een quote van SOL naar de nieuwe token
        const quoteResponse = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${