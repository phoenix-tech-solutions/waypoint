import json
from bs4 import BeautifulSoup
import markdown

def clean_json_item(json_item):
    cleaned_texts = []
    
    text_content = json_item.get('text', '')
    markdown_content = json_item.get('markdown', '')
    
    if markdown_content:
        html_content = markdown.markdown(markdown_content)
        clean_body = BeautifulSoup(html_content, "html.parser").get_text()
    elif text_content:
        clean_body = text_content.strip() if text_content else ''
    else:
        clean_body = ''
    
    cleaned_texts.append(clean_body)
    
    json_item["cleaned_text"] = cleaned_texts
    
    return json_item

def process_json_file(input_file_path, output_file_path):
    with open(input_file_path, 'r', encoding='utf-8') as infile:
        json_data = json.load(infile)

    if isinstance(json_data, list):
        cleaned_json_data = [clean_json_item(item) for item in json_data]
        cleaned_json_data = [item for item in cleaned_json_data if item.get('cleaned_text') and any(text.strip() for text in item['cleaned_text'])]
    else:
        cleaned_json_data = clean_json_item(json_data)
        if not (cleaned_json_data.get('cleaned_text') and any(text.strip() for text in cleaned_json_data['cleaned_text'])):
            cleaned_json_data = None
    
    if cleaned_json_data:
        with open(output_file_path, 'w', encoding='utf-8') as outfile:
            json.dump(cleaned_json_data, outfile, ensure_ascii=False, indent=4)
        print(f"Cleaned JSON has been saved to {output_file_path}")
    else:
        print("No valid data found after cleaning.")

input_file = 'IA_data.json'
output_file = 'cleaned_output.json'

process_json_file(input_file, output_file)