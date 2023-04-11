const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const replaceText = async (options) => {
    // Load the PDF document
    const pdfBuffer = await fs.promises.readFile(options.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Find all occurrences of the findText and replace them with the replaceText
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const text = page.getText();
        const newText = text.replace(new RegExp(options.findText, 'g'), options.replaceText);
        page.setText(newText);
    }

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save();
    await fs.promises.writeFile(options.outputPath, modifiedPdf);
}

const pdf = {
    replaceText
}

module.exports = pdf