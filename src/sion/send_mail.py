import sys, json
from redmail import EmailSender
from pathlib import Path


def sendMail(destination, subject, message = None, attachment = None, html = None):
    email = EmailSender(
        host="mail.sbop.com.br",
        port=25,
        username="noreply@sbop.com.br",
        password="oht#yoYNO^R2"
    )

    email.send(
        sender="noreply@sbop.com.br",
        receivers=[destination],
        subject=subject,
        text=message,
        html=html,
        attachments = {
            attachment['filename']: Path(attachment['path'])
        } if attachment else None
    )

def mailTemplate(data):
    lead = f"""
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinição de senha - SBOP</title>
            <style>

            </style>
        </head>

        <body>
            <div class="main-container">
                <h1>novo lead</h1>
                <h2>vendedor: {data['seller_name']}</h2>
                <h3>cliente: {data['company'] or data['name']}
                <p>unidade: {data['unit']}
                </p>
            </div>
        </body>

        </html>
        """
    
    contract = f"""
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinição de senha - SBOP</title>
            <style>

            </style>
        </head>

        <body>
            <div class="main-container">
                <h1>contrato</h1>
                <h2>vendedor: {data['seller_name']}</h2>
                <h3>cliente: {data['company'] or data['name']}
                <p>unidade: {data['unit']}
                </p>
            </div>
        </body>

        </html>
    """

    return {'lead': lead, 'contract': contract}

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

print(data)
print(mailTemplate(data['template']))

html_mail = mailTemplate(data['template'])
sendMail(data['email'], "Sion - Contrato", html=html_mail, attachment={'filename': 'contract.pdf', 'path': f'documents/sion/{data["unit"]}/contract.pdf'} if data['template'] == 'contract' else None)
