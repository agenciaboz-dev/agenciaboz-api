const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')
const path = require('path')
const fs = require('fs');

const rasterize = async (options) => {
    const pdfBuffer = await fs.promises.readFile(options.inputPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const newPdfDoc = await PDFDocument.create();

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const [width, height] = page.getSize();
        const pngImage = await pdfDoc.embedPageAsPNG(i);
        const imageWidth = height * (pngImage.width / pngImage.height);
        const imageHeight = height;
        const newPage = newPdfDoc.addPage([width, height]);
        newPage.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: imageWidth,
          height: imageHeight,
        });
      }

    const newPdfBytes = await newPdfDoc.save();
    fs.writeFileSync(options.outputPath, newPdfBytes);
}

const updateImage = async (options) => {
    const pdfBuffer = await fs.promises.readFile(options.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm()
    const imageBytes = options.image && fs.readFileSync(path.join(__dirname, `./${options.image}`))
    const image = await pdfDoc.embedPng(options.base64 || imageBytes)

    try {
        form.getButton(options.field).setImage(image)
        console.log('image updated')
    } catch(error) { console.log(error) }

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save();
    await fs.promises.writeFile(options.outputPath.split('.pdf')[0]+'.dev.pdf', modifiedPdf);
    rasterize({inputPath: options.pdfPath, outputPath: options.outputPath})
    
}

const fillForm = async (options) => {
    // Load the PDF document
    const pdfBuffer = await fs.promises.readFile(options.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.registerFontkit(fontkit)
    const fontRegularBytes = fs.readFileSync(path.join(__dirname, `./fonts/${options.font.regular}`))
    const fontBoldBytes = fs.readFileSync(path.join(__dirname, `./fonts/${options.font.bold}`))
    
    const customFontRegular = await pdfDoc.embedFont(fontRegularBytes)
    const customFontBold = await pdfDoc.embedFont(fontBoldBytes)
    
    const form = pdfDoc.getForm()
    
    // Get all fields in the PDF by their names
    options.fields.map(field => {
        try {
            form.getTextField(field.name).setText(field.value.toString())
            form.getTextField(field.name).updateAppearances(field.bold ? customFontBold : customFontRegular)
        } catch {}
    })

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save();
    await fs.promises.writeFile(options.outputPath.split('.pdf')[0]+'.dev.pdf', modifiedPdf);
    rasterize({inputPath: options.pdfPath, outputPath: options.outputPath})
}

const pdf = {
    fillForm,
    updateImage
}

module.exports = pdf