const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const fillForm = async (options) => {
    // Load the PDF document
    const pdfBuffer = await fs.promises.readFile(options.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const form = pdfDoc.getForm()

    // Get all fields in the PDF by their names
    options.fields.map(field => {
        try {
            form.getTextField(field.name).setText(field.value)
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