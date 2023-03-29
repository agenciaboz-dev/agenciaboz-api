from PyPDF2 import PdfReader, PdfWriter
import io, os, sys, json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
sys.path.append(str(Path("src/gdrive").resolve()))
from gdrive import upload


def generate():
    global data, path, juridica

    def first_page():
        global data
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFont("Poppins", 16)
        
        # drawing client data
        can.drawRightString(540, 488, str(data['id']))
        can.drawRightString(540, 440, str(data['date']))
        
        can.drawRightString(540, 315, data['company'] if juridica else data['name'])
        can.drawRightString(540, 267, data['cnpj'] if juridica else data['cpf'])
        can.drawRightString(540, 219, data['category'] if juridica else data['rg'])
        can.drawRightString(540, 171, data['email'])
        can.drawRightString(540, 123, data['name'])
        can.drawRightString(540, 75, data['phone'])
        
        # save
        can.save()
        
        #move to the beginning of the StringIO buffer
        packet.seek(0)
        # create a new PDF with Reportlab
        new_pdf = PdfReader(packet)
        # add the "watermark" (which is the new pdf) on the existing page
        page = existing_pdf.pages[0]
        page.merge_page(new_pdf.pages[0])
        output.add_page(page)

    def second_page():
        global data
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFont("Poppins", 16)

        # drawing client data
        can.drawRightString(540, 555, str(data['address']))
        
        if juridica:
            can.drawRightString(540, 507, str(data['cnpj']))
            can.drawRightString(540, 459, data['unit'])
            can.drawString(160, 459, data['supplier'])
        else:
            can.drawRightString(540, 507, data['unit'])
            can.drawString(160, 507, data['supplier'])

            

        # can.drawCentredString(475, 280, 'R$ 99,90')
        # can.drawCentredString(300, 280, data['profit'])
        # can.drawCentredString(120, 280, data['discount'])

        # can.drawCentredString(410, 172, 'PIX')

        # save
        can.save()

        #move to the beginning of the StringIO buffer
        packet.seek(0)
        # create a new PDF with Reportlab
        new_pdf = PdfReader(packet)
        # add the "watermark" (which is the new pdf) on the existing page
        page = existing_pdf.pages[1]
        page.merge_page(new_pdf.pages[0])
        output.add_page(page)


    packet = io.BytesIO()
    pdfmetrics.registerFont(TTFont('Poppins', Path('src/fonts/Poppins-Regular.ttf')))
    
    # can.setFillColorRGB(0.86328, 0.8, 0.496)

    # read your existing PDF
    existing_pdf = PdfReader(open(Path(f"src/sion/contract_template_{data['pessoa']}.pdf"), "rb"))
    output = PdfWriter()
    
    first_page()
    second_page()

    for page in existing_pdf.pages[2:]:
        output.add_page(page)

    # finally, write "output" to a real file
        
    outputStream = open(os.path.join(Path(path), "contract.pdf"), "wb")
    output.write(outputStream)
    outputStream.close()
    
    return "contract.pdf"

data = sys.argv[1]
data = data.replace("'", '"')
data = json.loads(data)

juridica = data['pessoa'] == 'juridica'

path = f"documents/sion/{data['unit']}"
if not os.path.exists(path):
    os.makedirs(path)

generate()

