import json
from langchain.text_splitter import TokenTextSplitter
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")

# Function to count tokens in text
def count_tokens(text: str) -> int:
    return len(encoding.encode(text))

def split_text_by_tokens(text: str, max_tokens: int = 2000):
    tokens = encoding.encode(text)
    chunks = []
    chunk = []
    chunk_token_count = 0
    
    for token in tokens:
        if chunk_token_count + 1 <= max_tokens:
            chunk.append(token)
            chunk_token_count += 1
        else:
            chunks.append(encoding.decode(chunk))
            chunk = [token]
            chunk_token_count = 1
    
    if chunk:
        chunks.append(encoding.decode(chunk))
    
    return chunks

def chunk_text(json_data, max_tokens=10):
    text_splitter = TokenTextSplitter(chunk_size=max_tokens, chunk_overlap=2)
    
    total_text = 0
    total_tokens = 0
    total_chunks = 0
    
    for item in json_data:
        cleaned_text = item.get('cleaned_text', [])
        
        if cleaned_text:
            full_text = " ".join(cleaned_text)
            text_length = len(full_text)
            total_text += text_length
            
            text_tokens = count_tokens(full_text)
            total_tokens += text_tokens
            
            chunks = split_text_by_tokens(full_text, max_tokens)
            total_chunks += len(chunks)
            
            item['chunks'] = chunks
            
            print(f"Processing URL: {item['url']}")
            print(f"  - Cleaned text length: {text_length} characters")
            print(f"  - Token count before chunking: {text_tokens}")
            print(f"  - Number of chunks: {len(chunks)}")
    
    print("\n--- Chunking Summary ---")
    print(f"Total text length processed: {total_text} characters")
    print(f"Total tokens processed: {total_tokens}")
    print(f"Total number of chunks created: {total_chunks}")
    
    return json_data

input_file = 'cleaned_output.json'
output_file = 'chunked_output.json'

with open(input_file, 'r', encoding='utf-8') as infile:
    cleaned_json_data = json.load(infile)

chunked_json_data = chunk_text(cleaned_json_data, max_tokens=2000)

with open(output_file, 'w', encoding='utf-8') as outfile:
    json.dump(chunked_json_data, outfile, ensure_ascii=False, indent=4)

print(f"\nChunked JSON has been saved to {output_file}")
