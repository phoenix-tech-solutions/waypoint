import os
import dotenv
import json
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI


dotenv.load_dotenv()

faiss_index_path = "faiss_index"

embeddings = MistralAIEmbeddings() # load MistralAI embeddings

def documentify(record):
    return Document(
        page_content=record.get('text').strip(),
        metadata={key: value for key, value in record.items() if key != 'text'}
    )

if os.path.exists(faiss_index_path):
    # if FAISS index exists, load it
    
    vector_store = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)
else:
    # if FAISS index does not exist, create it
    
    with open('../IA_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    records = filter(lambda record: record.get('text'), data) # filter out records without text
    
    documents = list(map(
        documentify,
        records
    ))
    
    if not documents:
        raise ValueError("No documents found with valid content. Check your JSON file structure.")

    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    if not docs:
        raise ValueError("No text chunks were created after splitting. Verify your data and splitter settings.")

    vector_store = FAISS.from_documents(docs, embeddings) # create FAISS index from documents
    
    vector_store.save_local(faiss_index_path) # save it so next time we can load it directly

# create a retriever from the vector store
retriever = vector_store.as_retriever()

# instantiate a connection to a Gemini 2.0 Flash model
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)

qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)

question = input()
answer = qa_chain.invoke(question)
print(answer['result'])