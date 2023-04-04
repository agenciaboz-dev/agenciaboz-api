import sys, json
from redmail import EmailSender
from pathlib import Path


def sendMail(destination, subject, message = None, attachment = None, html = None):
    email = EmailSender(
        host="mail.cooperativasion.com.br",
        port=25,
        username="noreply@cooperativasion.com.br",
        password=",2Fc2K[TXT?C"
    )

    email.send(
        sender="noreply@cooperativasion.com.br",
        receivers=destination,
        subject=subject,
        text=message,
        html=html,
        attachments = {
            attachment['filename']: Path(attachment['path'])
        } if attachment else None
    )

def mailTemplate(data):
    templates = {
        'lead': f"""
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sion</title>
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
        """,

        'contract': f"""
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-mail - Assinatura</title>
    <style>
        @font-face {{
            font-family: Poppins;
            src: url('../../fonts/Poppins-Regular.ttf');
            }}

        * {{
            font-family: Poppins;
        }}

        .main-container {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}

        .logo-container, .footer {{
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #384974;
            height: 40vw;
            width: 100vw;
        }}

        .logo {{
            width: 70vw;
            height: fit-content;
        }}

        h1, .who-signs {{
            color: #384974;
            text-align: center;
            font-size: 6vw;
            font-weight: 600;
        }}

        p {{
            color: #333333;
            text-align: center;
            font-size: 5vw;
            margin: 0;
        }}

        button {{
            border: none;
            color: white;
            background-color: #384974;
            font-size: 5vw;
            font-weight: 700;
            padding: 2vw 0;
            width: 90vw;
            margin-top: 5vw;
        }}

        hr {{
            width: 90vw;
            margin: 5vw 0;
        }}

        .limit-date {{
            color: #999999;
        }}

        .limit-date {{
            margin-bottom: 5vw;
        }}

        .footer {{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding-left: 10vw;
        }}
        
        .footer-title {{
            color: white;
            font-size: 4vw;
            font-weight: 600;
            text-align: start;
        }}
        
        .footer p {{
            color: white;
            font-size: 3.5vw;
            text-align: start;
            word-wrap: normal;
            width: 90vw;
        }}
    </style>
</head>
<body>
    <div class="main-container">
        <div class="logo-container">
            <img src="logo_branco.svg" class="logo" alt="">
        </div>
        <h1>Solicitação de Assinatura da Cooperativa Sion</h1>
        <p>Segue contrato em anexo para revisão</p>
        <button>Assinar</button>
        <hr>
        <p>Contrato_{data['name']}_{data['date']}.pdf</p>
        <hr>
        <p class="who-signs">Estará assinando:</p>
        <p>{data['email']}</p>
        <hr>
        <p class="limit-date">Data limite de assinatura:<br>{data['sign_limit']}</p>
        <div class="footer">
            <p class="footer-title">Não compartilhe este e-mail:</p>
            <p>Para sua segurança, não encaminhe este e-mail para ninguém.</p>
        </div>
    </div>
</body>
</html>
    """
    }
    

    return templates

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

print(data)

html_mail = mailTemplate(data)[data['template']]
sendMail(data['mail_list'], "Sion - Contrato", html=html_mail, attachment={'filename': 'contract.pdf', 'path': f'documents/sion/{data["unit"]}/contract.pdf'} if data['template'] == 'contract' else None)
