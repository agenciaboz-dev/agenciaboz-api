import sys, json
from pathlib import Path
sys.path.append(str(Path("src/gdrive").resolve()))
from gdrive import mkdir

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

root_id = '1wL5SVt2zJdqFgEd20SdYajdaPI-eTygu'

seller_folder = mkdir(root_id, data['seller'])
unit_folder = mkdir(seller_folder['id'], data['unit'])