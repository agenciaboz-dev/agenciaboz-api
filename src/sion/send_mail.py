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
    return f"""
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de senha - SBOP</title>
    <style>
        @font-face {{
            font-family: Montserrats;
            src: url("/static/fonts/Montserrat-Regular.otf");
        }}

        @font-face {{
            font-family: Montserrats;
            src: url("/static/fonts/Montserrat-Bold.otf");
            font-weight: bold;
        }}

        * {{
            box-sizing: border-box;
            font-family: Montserrats;
        }}

        .main-container {{
            height: min-content;
            width: 90%;
            background-color: white;
            border-radius: 2vw;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            margin: 4vw;
            padding: 2vw;
            outline: #0C6397 solid 0.4vw;
            word-wrap: break-word;
        }}

        img {{
            height: 100px;
            width: auto;
            margin: -20px 0;
            pointer-events: none;
        }}

        h1 {{
            color: #0C6397;
            margin: 1vw 0;
        }}

        h2 {{
            color: #6B6B6B;
        }}

        a {{
            color: #0C6397;
        }}
    </style>
</head>

<body>
    <div class="main-container">
        <img src="https://sbop.com.br/wp-content/uploads/2020/08/SBOP-LOGO-AZUL-1x1-PNG.png" alt="">
        <h1>Redefinição de senha - Sistema SBOP</h1>
        <h2>Nome de usuário: {nome}</h2>
        <p>Clique no link para redefinir sua senha: <a href="{link}">Clique aqui</a>
        </p>
    </div>
</body>

</html>
"""

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

html_mail = mailTemplate(data)
sendMail(data['email'], "Sion - Contrato", html=html_mail, attachment={'filename': 'contract.pdf', 'path': f'documents/sion/{data["unit"]}/contract.pdf'})
