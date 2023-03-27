from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
from datetime import datetime
import sys

def download(user):
    def getUserFile(backup_list):
        for file in backup_list:
            if file['title'].split('.tar')[0] == user:
                return file

    folder_id = '12URAbEpT-96N1XOH9Vaco9cOJwu9aTyL'

    str = "\'" + folder_id + "\'" + " in parents and trashed=false"
    file_list = drive.ListFile({'q': str}).GetList()[0]


    backup_str = "\'" + file_list['id'] + "\'" + " in parents and trashed=false"
    backup_list = drive.ListFile({'q': backup_str}).GetList()
    
    file = getUserFile(backup_list)
    print(f"downloading {file['title']}")
    
    file.GetContentFile(file['title'])


    

def upload(root: str, folder: str, file_path: str):
    parent_folder = root

    file_metadata = {
    'title': folder,
    'parents': [{'id': parent_folder}],
    'mimeType': 'application/vnd.google-apps.folder'
    }

    folder = drive.ListFile({'q': f"title = '{folder}' and trashed=false"}).GetList()
    if not folder:

        folder = drive.CreateFile(file_metadata)
        folder.Upload()
        print(f"folder id: {folder['id']}")
        
    else:
        folder = folder[0]

    file = drive.CreateFile({'parents': [{'id': folder['id']}], 'title': file_path.split('/')[-1]})
    file.SetContentFile(f"{file_path}")
    file.Upload()
    print(f"uploaded {file_path}")

def mkdir(root_id: str, folder: str):
    parent_folder = root_id

    file_metadata = {
    'title': folder,
    'parents': [{'id': parent_folder}],
    'mimeType': 'application/vnd.google-apps.folder'
    }

    folder = drive.ListFile({'q': f"title = '{folder}' and trashed=false"}).GetList()
    if not folder:
        folder = drive.CreateFile(file_metadata)
        folder.Upload()
        print(f"folder id: {folder['id']}")
    else:
        folder = folder[0]

    return folder

gauth = GoogleAuth()   

# Try to load saved client credentials
gauth.LoadCredentialsFile("mycreds.txt")

if gauth.credentials is None:
    # Authenticate if they're not there

    # This is what solved the issues:
    gauth.GetFlow()
    gauth.flow.params.update({'access_type': 'offline'})
    gauth.flow.params.update({'approval_prompt': 'force'})

    gauth.LocalWebserverAuth()

elif gauth.access_token_expired:

    # Refresh them if expired

    gauth.Refresh()
else:

    # Initialize the saved creds

    gauth.Authorize()

# Save the current credentials to a file
gauth.SaveCredentialsFile("mycreds.txt")  

drive = GoogleDrive(gauth)

if __name__ == '__main__':
    globals()[sys.argv[1]](sys.argv[2])