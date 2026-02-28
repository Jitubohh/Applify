# Supabase database client
from supabase import create_client, Client
from core.config import settings

def get_supabase_client():
    connection = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return connection