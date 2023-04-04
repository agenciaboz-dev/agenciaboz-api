import sys, json, os
from pathlib import Path
sys.path.append(str(Path("src/gdrive").resolve()))
from gdrive import upload, mkdir

cadastros = '1wL5SVt2zJdqFgEd20SdYajdaPI-eTygu'

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

path = f"documents/sion/{data['unit']}"
if not os.path.exists(path):
    os.makedirs(path)

seller = data['seller']['name']
seller_folder = mkdir(cadastros, seller)

files = [file for file in Path(path).glob("*") if file.is_file()]
for file in files:
    print(os.path.join(Path(path), file.name))
    upload(seller_folder['id'], data['unit'], os.path.join(Path(path), file.name))