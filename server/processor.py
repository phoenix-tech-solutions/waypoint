import os
import dotenv
import json
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings

dotenv.load_dotenv()
mistral_key = os.getenv("MISTRAL_API_KEY")

# Define the path for the FAISS index
faiss_index_path = "faiss_index"

# Step 1: Load and parse the JSON file
with open('../IA_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

documents = []
for record in data:
    content = (record.get('text') or '').strip()
    if not content:
        continue
    metadata = {key: value for key, value in record.items() if key != 'text'}
    documents.append(Document(page_content=content, metadata=metadata))

if not documents:
    raise ValueError("No documents found with valid content. Check your JSON file structure.")

# Optional: Split documents into smaller chunks
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = text_splitter.split_documents(documents)

if not docs:
    raise ValueError("No text chunks were created after splitting. Verify your data and splitter settings.")

# Step 2: Load or create the FAISS vector store
embeddings = MistralAIEmbeddings()

if os.path.exists(faiss_index_path):
    # Load the existing FAISS index
    vector_store = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)
else:
    # Create a new FAISS index
    vector_store = FAISS.from_documents(docs, embeddings)
    vector_store.save_local(faiss_index_path)

# Step 3: Create a retriever from the vector store
retriever = vector_store.as_retriever()

# Initialize the Mistral AI chat model
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.2)
# print("Initialized Mistral AI chat model.")

# Step 4: Set up the RetrievalQA chain
qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
# print("Created RetrievalQA chain.")

# Step 5: Ask a question related to the school info system
question = input()
answer = qa_chain.invoke(question)
print(answer['result'])
# print("Processing complete.")