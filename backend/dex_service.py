import httpx
from typing import Dict, Any

class DexService:
    def __init__(self):
        self.jupiter_quote_url = "https://quote-api.jup.ag/v6/quote"
        self.jupiter_swap_url = "https://quote-api.jup.ag/v6/swap"

    async def get_quote(self, input_mint: str, output_mint: str, amount_sol: float) -> Dict[str, Any]:
        """Vraagt de beste prijs op bij Jupiter"""
        amount_lamports = int(amount_sol * 10**9)
        params = {
            "inputMint": input_mint,
            "outputMint": output_mint,
            "amount": amount_lamports,
            "slippageBps": 100 # 1% slippage
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jupiter_quote_url, params=params)
            return response.json()

    async def create_swap_transaction(self, quote_response: Dict[str, Any], user_pubkey: str) -> str:
        """Maakt de base64 transactie aan om te versturen"""
        payload = {
            "quoteResponse": quote_response,
            "userPublicKey": user_pubkey,
            "wrapAndUnwrapSol": True,
            # Prioriteit instellen voor lage fees
            "dynamicComputeUnitLimit": True,
            "prioritizationFeeLamports": 5000 
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.jupiter_swap_url, json=payload)
            return response.json().get("swapTransaction")
