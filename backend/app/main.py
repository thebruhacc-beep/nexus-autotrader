from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.services.solana_service import SolanaService
from app.services.dex_service import DexService
from app.trader.sniper import SniperEngine

app = FastAPI(title="Nexus SOL Sniper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

solana = SolanaService()
dex = DexService()
sniper = SniperEngine(solana, dex)

@app.get("/api/v1/status")
async def get_status():
    balance = await solana.get_balance()
    return {
        "wallet": str(solana.keypair.pubkey()) if solana.keypair else "Geen key",
        "balance_sol": balance,
        "is_running": sniper.is_running
    }

@app.post("/api/v1/snipe/{mint_address}")
async def start_snipe(mint_address: str, background_tasks: BackgroundTasks):
    # We voeren de snipe uit in de achtergrond zodat de API snel reageert
    background_tasks.add_task(sniper.execute_snipe, mint_address)
    return {"message": "Snipe order geplaatst", "token": mint_address}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
