from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus Solana Autotrader"
    
    # Solana Instellingen
    # Gebruik een snelle RPC voor memecoins (Helius/Quicknode)
    SOLANA_RPC_URL: str = "https://api.mainnet-beta.solana.com"
    SOLANA_WSS_URL: str = "wss://api.mainnet-beta.solana.com"
    
    # De "Hot Wallet" van de bot (waarmee hij echt koopt/verkoopt)
    # Zorg dat hier alleen geld op staat dat je bereid bent te gebruiken voor de bot
    TRADER_PRIVATE_KEY: Optional[str] = None 
    
    # Risico Management
    MAX_TRADE_SIZE_SOL: float = 0.1
    STOP_LOSS_PERCENT: float = 15.0
    TAKE_PROFIT_PERCENT: float = 50.0

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
