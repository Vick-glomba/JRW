const fs = require('fs');
const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require('mailersend');

const mailersend = new MailerSend({
    apiKey: "mlsn.9d67427dbde8c508cab30156f56f6e3dc383dc5d39f05357a2e3c31edc08624b",
});

//esta es general, podemos mandarle cualquier html que lo envia

const sendMail = async (data, html, attachs = []) => {
    const { from, to, fromName, toName, subject } = data;
    const sentFrom = new Sender(from, fromName);

    const recipients = [
        new Recipient(to, toName)
    ];

    // cuando mandemos un attachment debe ser asi [ { path: "C:/..../archivo.pdf", name: "archivo.pdf"}]
    const attachments = attachs.map(attach =>
        new Attachment(
            fs.readFileSync(attach.path, { encoding: 'base64' }),
            attach.name,
            attach.type || 'attachment',
            attach.id || ""
        )
    )
    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(subject)
        .setHtml(html)
        .setAttachments(attachments)

    await mailersend.email.send(emailParams);
}


//esta vamos a dejarla separada, dado que en la web se pueden crear ciertos templates y los usamos con un codigo y unas variables de reemplazo

const sendMailTemplate = async (data, template = '', personalization = {}, attachments = []) => {
    const { from, to, fromName, toName, subject } = data;
    const sentFrom = new Sender(from, fromName);
    const recipients = [
        new Recipient(to, toName)
    ];

    //cuando mandemos un attachment debe ser asi [ { path: "C:/..../archivo.pdf", name: "archivo.pdf"}]
    attachments = attachments.map(attach => [
        new Attachment(
            fs.readFileSync(attach.path, { encoding: 'base64' }),
            attach.name,
            'attachment'
        )
    ]

    )

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setTemplateId(template)
        .setPersonalization(personalization)
        .setAttachments(attachments)

    await mailersend.email.send(emailParams);

}



module.exports = {
    sendMail,
    sendMailTemplate,
}
