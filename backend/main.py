from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import base64
import httpx
import os
from solders.keypair import Keypair # type: ignore
from solders.transaction import VersionedTransaction # type: ignore
from solana.rpc.async_api import AsyncClient
import base58

app = FastAPI()

# Toestaan dat je Vercel site praat met deze bot
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- CONFIGURATIE ---
# In productie zet je deze in Render Environment Variables!
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "JOUW_TEST_KEY") 
RPC_URL = "https://api.mainnet-beta.solana.com"

class NexusBot:
    def __init__(self):
        self.wallet = Keypair.from_bytes(base58.b58decode(PRIVATE_KEY))
        self.is_active = False
        self.stats = {"wins": 0, "losses": 0, "pnl": 0}

    async def get_balance(self):
        async with AsyncClient(RPC_URL) as client:
            res = await client.get_balance(self.wallet.pubkey())
            return res.value / 1e9

    async def auto_trade_logic(self, trade_size):
        """De kern van de bot: Scannen en Swappen"""
        while self.is_active:
            # 1. SCANNING (Simulatie van high-winrate scanner)
            await asyncio.sleep(10) # Wacht 10 sec tussen scans
            
            # 2. JUPITER QUOTE & SWAP
            # Hier gebruiken we de Jupiter API zoals in het vorige voorbeeld
            # De bot tekent hier AUTOMATISCH met self.wallet
            # Fees worden hier ook automatisch berekend
            print(f"Bot scant... Trade size: {trade_size} SOL")
            
            # Voor de challenge: we houden de stats bij
            # In een echte trade komt hier de verzending naar Solana

bot = NexusBot()

@app.get("/status")
async def get_status():
    balance = await bot.get_balance()
    return {"balance": balance, "isRunning": bot.is_active, "stats": bot.stats}

@app.post("/start")
async def start_bot(trade_size: float, background_tasks: BackgroundTasks):
    bot.is_active = True
    background_tasks.add_task(bot.auto_trade_logic, trade_size)
    return {"message": "Bot gestart"}

@app.post("/stop")
async def stop_bot():
    bot.is_active = False
    return {"message": "Bot gestopt"}
