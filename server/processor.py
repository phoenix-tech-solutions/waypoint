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

faiss_index_path = "faiss_index"

if os.path.exists(faiss_index_path):
    # if FAISS index exists, load it
    
    embeddings = MistralAIEmbeddings()
    vector_store = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)
else:
    # if FAISS index does not exist, create it
    
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

    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    if not docs:
        raise ValueError("No text chunks were created after splitting. Verify your data and splitter settings.")

    embeddings = MistralAIEmbeddings()
    vector_store = FAISS.from_documents(docs, embeddings)
    vector_store.save_local(faiss_index_path)

retriever = vector_store.as_retriever()

llm = ChatMistralAI(model="mistral-large-latest", temperature=0.2)

qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)

question = input()
answer = qa_chain.invoke(question)
print(answer['result'])