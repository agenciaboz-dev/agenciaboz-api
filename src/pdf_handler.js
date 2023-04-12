const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')
const fs = require('fs');

const fillForm = async (options) => {
    // Load the PDF document
    const pdfBuffer = await fs.promises.readFile(options.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.registerFontkit(fontkit)
    const fontBytes = fs.readFileSync(path.join(__dirname, `./fonts/${options.font}`))
    const customFont = await pdfDoc.embedFont(fontBytes)
    
    const form = pdfDoc.getForm()
    
    // Get all fields in the PDF by their names
    options.fields.map(async (field) => {
        const text_options = {
            font: field.font && pdfDoc.embedFont(field.font)
        }
        console.log(field.font && text_options)
        
        try {
            form.getTextField(field.name).setText(field.value.toString(), text_options)
            if (field.font) {
                const fontBytes = fs.readFileSync(path.join(__dirname, `./fonts/${field.font}`))
                const customFont = await pdfDoc.embedFont(fontBytes)
                form.getTextField(field.name).updateAppearances(customFont)
            } else {
                form.getTextField(field.name).updateAppearances(customFont)
            }
        } catch {}
    })

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save();
    await fs.promises.writeFile(options.outputPath, modifiedPdf);
}

const pdf = {
    fillForm
}

module.exports = pdf