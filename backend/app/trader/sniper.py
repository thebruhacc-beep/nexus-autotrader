import asyncio
from app.services.solana_service import SolanaService
from app.services.dex_service import DexService
from app.core.config import settings
import base64
from solders.transaction import VersionedTransaction # type: ignore

class SniperEngine:
    def __init__(self, solana_service: SolanaService, dex_service: DexService):
        self.solana = solana_service
        self.dex = dex_service
        self.is_running = False

    async def execute_snipe(self, token_mint: str):
        """
        Voert een volledige kooptransactie uit voor 0.005 SOL (helft van budget)
        """
        print(f"🚀 Sniper gestart voor token: {token_mint}")
        
        # 1. Haal de beste prijs (Quote) op
        quote = await self.dex.get_quote(
            input_mint="So11111111111111111111111111111111111111112", # WSOL
            output_mint=token_mint,
            amount_sol=settings.DEFAULT_TRADE_AMOUNT_SOL
        )

        if not quote or "outAmount" not in quote:
            print("❌ Kon geen quote krijgen van Jupiter.")
            return

        # 2. Maak de transactie aan
        swap_tx_base64 = await self.dex.create_swap_transaction(
            quote, 
            str(self.solana.keypair.pubkey())
        )

        # 3. Signeren en Verzenden
        raw_tx = base64.b64decode(swap_tx_base64)
        tx = VersionedTransaction.from_bytes(raw_tx)
        
        # Signeer met de Hot Wallet key
        signature = self.solana.keypair.sign_message(tx.message_data())
        signed_tx = VersionedTransaction.populate(tx.message, [signature])

        # Verzend naar de blockchain
        try:
            res = await self.solana.client.send_raw_transaction(bytes(signed_tx))
            print(f"✅ Transactie verzonden! Signature: {res.value}")
            return str(res.value)
        except Exception as e:
            print(f"❌ Transactie mislukt: {e}")
            return None
