import sys, json
from pathlib import Path
sys.path.append(str(Path("src/gdrive").resolve()))
from gdrive import mkdir

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

root = '1wL5SVt2zJdqFgEd20SdYajdaPI-eTygu'
folder = data['seller']

mkdir(root, folder)
mkdir(folder, data['unit'])