const html_to_pdf = require('html-pdf-node');
const path = require('path');



const htmlToPdf = async (html, name) => {
    let file = { content: html };

    let pathDir = path.join(__dirname, '../../private/temps',)
    const pathPdf = path.join(pathDir, name + '.pdf')

    let options = { format: 'A4', path: pathPdf };

    html_to_pdf.generatePdf(file, options);
    return { path: pathPdf, name: `${name}.pdf` }

}




module.exports = {
    htmlToPdf
}