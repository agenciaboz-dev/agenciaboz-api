root = '1wL5SVt2zJdqFgEd20SdYajdaPI-eTygu'

files = [file for file in Path(path).glob("*") if file.is_file()]
for file in files:
    upload(data['id'], os.path.join(Path(path), file.name))