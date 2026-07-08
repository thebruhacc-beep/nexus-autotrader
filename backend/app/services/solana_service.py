from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair # type: ignore
from solders.pubkey import Pubkey # type: ignore
import base58
from app.core.config import settings

class SolanaService:
    def __init__(self):
        self.client = AsyncClient(settings.SOLANA_RPC_URL)
        if settings.PRIVATE_KEY:
            self.keypair = Keypair.from_bytes(base58.b58decode(settings.PRIVATE_KEY))
        else:
            self.keypair = None

    async def get_balance(self) -> float:
        """Haalt de balans op in SOL"""
        if not self.keypair:
            return 0.0
        
        response = await self.client.get_balance(self.keypair.pubkey())
        return response.value / 10**9

    async def get_token_balance(self, token_mint_address: str) -> float:
        """Checkt hoeveel memecoins we al hebben"""
        mint = Pubkey.from_string(token_mint_address)
        # Logica voor Token Account balans...
        return 0.0

    async def close(self):
        await self.client.close()
