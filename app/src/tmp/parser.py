import json
from bs4 import BeautifulSoup

with open("c:\\Users\\reban\\React_Applications\\web\\waypoint\\app\\src\\tmp\\data.txt", "r", encoding="utf-8") as file:
    html_content = file.read()

soup = BeautifulSoup(html_content, "html.parser")
entries = []

for item in soup.find_all("div", class_="fsConstituentItem"):
    name = item.find("h3", class_="fsFullName").get_text(strip=True)
    title = item.find("div", class_="fsTitles").get_text(strip=True).replace("Title:", "").strip()
    email = item.find("div", class_="fsEmail").find("a").get_text(strip=True)
    entries.append({"name": name, "title": title, "email": email})

output_path = "c:\\Users\\reban\\React_Applications\\web\\waypoint\\app\\src\\tmp\\data.json"
try:
    with open(output_path, "r", encoding="utf-8") as json_file:
        existing_data = json.load(json_file)
except FileNotFoundError:
    existing_data = []

existing_data.extend(entries)

with open(output_path, "w", encoding="utf-8") as json_file:
    json.dump(existing_data, json_file, indent=4)

print(f"Total number of entries: {len(existing_data)}")
