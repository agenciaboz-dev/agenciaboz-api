const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')
const path = require('path')
const fs = require('fs');
const ILovePDFApi = require("@ilovepdf/ilovepdf-nodejs")

const api = new ILovePDFApi(
    "project_public_b8d1c4357e8b02e980b17b3d4d0399b7_ipGERaa8e091e59a6cc2127cb8a443ba0b982",
    "secret_key_5f630c8f52e223d4a2c5f887bc24617a_Eykek4fdcde4a15208c6ee7ad4021f9502887"
)

const updateImage = async (options) => {
    const pdfBuffer = await fs.promises.readFile(options.pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const form = pdfDoc.getForm()
    const imageBytes = options.image && fs.readFileSync(path.join(__dirname, `./${options.image}`))
    const image = await pdfDoc.embedPng(options.base64 || imageBytes)

    try {
        form.getButton(options.field).setImage(image)
        console.log("image updated")
    } catch (error) {
        console.log(error)
    }

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save()
    await fs.promises.writeFile(options.outputPath, modifiedPdf)
}

const fillForm = async (options) => {
    // Load the PDF document
    const pdfBuffer = await fs.promises.readFile(options.pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    pdfDoc.registerFontkit(fontkit)
    const fontRegularBytes = fs.readFileSync(path.join(__dirname, `./fonts/${options.font.regular}`))
    const fontBoldBytes = fs.readFileSync(path.join(__dirname, `./fonts/${options.font.bold}`))

    const customFontRegular = await pdfDoc.embedFont(fontRegularBytes)
    const customFontBold = await pdfDoc.embedFont(fontBoldBytes)

    const form = pdfDoc.getForm()

    // Get all fields in the PDF by their names
    options.fields.map((field) => {
        try {
            form.getTextField(field.name).setText(field.value.toString())
            form.getTextField(field.name).updateAppearances(field.bold ? customFontBold : customFontRegular)
        } catch {}
    })

    // Save the modified PDF document to a file
    const modifiedPdf = await pdfDoc.save()
    await fs.promises.writeFile(options.outputPath, modifiedPdf)

    form.flatten()
    const flattenedPdf = await pdfDoc.save()
    const flattenedSplited = options.outputPath.split(".pdf")
    const flattenedFile = `${flattenedSplited[0]}.flattened.pdf`
    await fs.promises.writeFile(flattenedFile, flattenedPdf)

    const task = ilovepdf.newTask("compress")

    task.start()
        .then(() => {
            return task.addFile(flattenedFile)
        })
        .then(() => {
            return task.process()
        })
        .then(() => {
            return task.download()
        })
        .then((data) => {
            fs.writeFileSync(flattenedFile, data)
        })
}

const pdf = {
    fillForm,
    updateImage
}

module.exports = pdf