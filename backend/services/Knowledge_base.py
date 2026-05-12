from langchain_community.vectorstores.faiss import FAISS
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from core.config import settings
import os
import requests

embeddings = NVIDIAEmbeddings(
    model="nvidia/nv-embedqa-e5-v5",
    nvidia_api_key=settings.NVIDIA_API_KEY
)

def fetch_job_descriptions(query: str, results: int = 50) -> list:
    url = f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={settings.ADZUNA_APP_ID}&app_key={settings.ADZUNA_APP_KEY}&results_per_page={results}&what={query}"
    response = requests.get(url)
    if response.ok:
        data = response.json()
        descriptions = []
        for job in data.get("results", []):
            title = job.get("title", "")
            description = job.get("description", "")
            company = job.get("company", {}).get("display_name", "")
            if description:
                descriptions.append(f"Job Title: {title}\nCompany: {company}\nDescription: {description}")
        return descriptions
    else:
        print(f"Error fetching job descriptions: {response.status_code}")
        return []

def fill_knowledge_base():
    queries = [
    # Software Engineering
    "software engineer",
    "backend developer",
    "frontend developer",
    "full stack developer",
    "mobile developer",
    "iOS developer",
    "Android developer",
    
    # Data & AI
    "data scientist",
    "data engineer",
    "machine learning engineer",
    "AI engineer",
    "data analyst",
    "business intelligence analyst",
    
    # Infrastructure & DevOps
    "DevOps engineer",
    "cloud engineer",
    "site reliability engineer",
    "systems administrator",
    "network engineer",
    "cybersecurity engineer",
    
    # Product & Design
    "product manager",
    "UX designer",
    "UI designer",
    "product designer",
    
    # Other Engineering
    "mechanical engineer",
    "electrical engineer",
    "civil engineer",
    "chemical engineer",
    
    # Finance
    "financial analyst",
    "investment banker",
    "accountant",
    
    # Healthcare
    "nurse",
    "physician",
    "pharmacist",
    
    # Marketing
    "digital marketing manager",
    "content strategist",
    "SEO specialist",
]
    
    all_descriptions = []
    
    for query in queries:
        print(f"Fetching: {query}")
        descriptions = fetch_job_descriptions(query)
        all_descriptions.extend(descriptions)
        print(f"Got {len(descriptions)} descriptions for {query}")
    
    print(f"Total descriptions: {len(all_descriptions)}")
    print("Building FAISS index...")
    
    vectorstore = FAISS.from_texts(all_descriptions, embeddings)
    
    os.makedirs("cache", exist_ok=True)
    vectorstore.save_local("cache/knowledge_base")
    
    print("Knowledge base saved successfully")
    return vectorstore


def search_knowledge_base(query: str, k: int = 5) -> list:
    try:
        vectorstore = FAISS.load_local("cache/knowledge_base", embeddings, allow_dangerous_deserialization=True)
        results = vectorstore.similarity_search(query, k=k)
        
        # Extract just the text from the document objects
        return [doc.page_content for doc in results]
    
    except Exception as e:
        print(f"Error searching knowledge base: {e}")
        return []
