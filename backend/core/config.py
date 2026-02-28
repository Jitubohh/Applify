# Configuration settings

from dotenv import load_dotenv
import os 

# Load environment variables from .env file
load_dotenv()

#Class to hold configuration settings
class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

#Instance of class Settings
settings = Settings()