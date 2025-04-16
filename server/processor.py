# This file must be run with your current working directory set to `./server` relative to the repository’s root; it cannot be run from the root directory of the project.

import os
import dotenv
import json
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import logging
from langchain_google_genai import ChatGoogleGenerativeAI

logging.basicConfig(
    filename='retrieved_documents.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger()

dotenv.load_dotenv()

faiss_index_path = os.path.abspath("./faiss_index")
data_path = os.path.abspath("./data.json")

embeddings = MistralAIEmbeddings()

def documentify(record):
    return Document(
        page_content=record.get('text').strip(),
        metadata={key: value for key, value in record.items() if key != 'text'}
    )

if os.path.exists(faiss_index_path):
    vector_store = FAISS.load_local(faiss_index_path, embeddings, allow_dangerous_deserialization=True)
else:
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    records = filter(lambda record: record.get('text'), data)
    documents = list(map(documentify, records))

    if not documents:
        raise ValueError("No documents found with valid content.")

    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    if not docs:
        raise ValueError("No text chunks created.")

    vector_store = FAISS.from_documents(docs, embeddings)
    vector_store.save_local(faiss_index_path)

retriever = vector_store.as_retriever()

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)

qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)

question = input()
retrieved_docs = retriever.get_relevant_documents(question)
for i, doc in enumerate(retrieved_docs, 1):
    logger.debug("Document %d:\n%s\n", i, doc.page_content)
answer = qa_chain.invoke(question)
print(answer['result'])