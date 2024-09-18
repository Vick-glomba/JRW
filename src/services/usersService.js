const DAL = require('../DAL/usersDAL.js');
const joiWrapper = require('../middlewares/joiWrapper.js');
const joi = require('joi');
const EXCEPTIONS = require('../consts/exceptions.json');
const { hashUTF8, checkHash, encrypt, decrypt } = require('../middlewares/cryptWrapper.js');
const jwtWrapper = require('../middlewares/jwtWrapper.js');
const moment = require('moment');
const { generateRandomString } = require('../utils/randomGeneratorUtils.js');
const path = require('path');
const fsextra = require('fs-extra')

const { sendMailTemplate } = require('../middlewares/sendgridWrapper.js');
const string = require('joi/lib/types/string/index.js');



// Constantes exclusivas
const numberFields = ['id']

const formatData = (data) => {
    for (const key in data) {
        if (data[key] === null) {
            data[key] = '';
        }
        if (numberFields.includes(key)) {
            data[key] = Number(data[key])
        }
    }
    return data;
};

const joiDataValidator = async (item, schema) => {
    let joiValidation = await joiWrapper.validateData(item, schema);
    joiValidation = JSON.parse(JSON.stringify(joiValidation));
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    } else {
        return {};
    }
};

//Obtiene usuarios
const get = async () => {
    let result;
    try {
        result = await DAL.get();
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: "OK", result }
};

//Agrega usuarios
const add = async (data, ip) => {

    const joiValidation = await joiDataValidator(data, {
        username: joi.string().min(4).max(20).required(),
        password: joi.string().min(4).max(20).required()
            .regex(/([A-Za-z0-9])/),
        mail: joi.string().min(4).max(100).required()
            .regex(/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/),
        avatar: joi.string().max(254).required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    //comprueba si el nombre del avatar se encuentra en la galeria de avatars
    // const pathImage = path.join(__dirname, '../../public/gallery/avatars/', data.avatar)
    // if (!fsextra.existsSync(pathImage)) {
    //     return { status: EXCEPTIONS.invalidData }
    // }


    //comprueba si hay alguien con ese nombre o correo
    const existeNombre = await DAL.getUsuarioByName(data);
    const existeMail = await DAL.getUsuarioByMail(data.mail);
    if (existeNombre[0] || existeMail[0]) {
        return { status: EXCEPTIONS.duplicatedData }
    }


    let result;
    try {
        // hasheo password antes de guardarla
        data.password = await hashUTF8(data.password)
        result = await DAL.add(data);
        result = await DAL.getUsuarioByMail(data.mail)
        if (result[0]) {
            const clientIp = ip
            const dateUTC = moment().utc().format('YYYY-MM-DD HH:mm:ss')
            let verifyCode = {
                date: dateUTC,
                mail: result[0].mail,
                id: result[0].id,
                ip: clientIp,
                type: 'verify'
            }
            verifyCode = encrypt(verifyCode);
            const dataMail = {
                from: "no-reply@trial-k68zxl2o1zmgj905.mlsender.net",
                fromName: "JRW",
                to: result[0].mail,
                toName: result[0].username,
                subject: "Verificacion"
            };
            const template = 'pq3enl6ve78g2vwr';
            const personalization = [{
                email: result[0].mail,
                data: {
                    backend_url: "localhost",
                    button_link: `localhost/api/user/verify/?verifyCode=${verifyCode}`,
                    support_email: "JRW@no-reply.com"
                }
            }];
            //se me acabo el trial de correo
            //await sendMailTemplate(dataMail, template, personalization);
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
const crearPersonaje = async (data) => {

    const joiValidation = await joiDataValidator(data, {
        userID: joi.number().min(1).required(),
        nombre: joi.string().min(4).max(20).required(),
        imagen: joi.string().max(254).required(),
        descripcion: joi.string().max(254).required(),
        mapID: joi.number().min(1).required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    //comprueba si el nombre del avatar se encuentra en la galeria de avatars
    // const pathImage = path.join(__dirname, '../../public/gallery/avatars/', data.avatar)
    // if (!fsextra.existsSync(pathImage)) {
    //     return { status: EXCEPTIONS.invalidData }
    // }

    //Compruebo si existe el userID solo por seguridad
    const existID = await DAL.getUsuarioByID(Number(data.userID));
    if (!existID[0]) {
        return {
            status: EXCEPTIONS.duplicatedData,
            msg: `el userID ${data.userID} no existe`
        }
    }
    //si ya tiene los slots llenos no puede crear personaje
    if (existID[0].personaje1 && existID[0].personaje2 && existID[0].personaje3) {
        return { status: EXCEPTIONS.sinSlots, msg: `Solo puedes tener 3 personajes` }
    }

    //comprueba si hay alguien con ese nombre
    const existeNombre = await DAL.getPersonajeByNombre(data.nombre);
    if (existeNombre[0]) {
        return { status: EXCEPTIONS.duplicatedData }
    }

    let result;
    try {
        result = await DAL.crearPersonaje(data);
        if (result) {
            const personaje = await DAL.getPersonajeByNombre(data.nombre);
            const user = await DAL.getUsuarioByID(data.userID)
            //verificar que slot esta vacio
            
            let slotlibre = "sincampo" ;
            if(user[0].personaje1 === null){
                slotlibre = "personaje1"
            } else if (user[0].personaje2 === null){
                slotlibre = "personaje2"
            } else {
                slotlibre = "personaje3"
            }
            //actualizo el slot del user con el id de personaje creado
            const slot = await DAL.updateValueToUser(slotlibre, personaje[0].id,
                 data.userID )
            return { 
                status: "OK", result:
                {userID: `${data.userID}`,
                slot: `${slotlibre}`,
                nombre: `${data.nombre}`,
                personajeID: `${personaje[0].id}`,
                mapaID : `${data.mapID}`}
              }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

//Actualiza usuarios
const update = async (data, token, ip) => {

    let objetoJoi = {
        username: joi.string().min(4).max(20).required(),
        name: joi.string().min(4).max(100).required(),
        mail: joi.string().min(4).max(100).required()
            .regex(/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/),
        birthdate: joi.date().iso().required(),
        avatar: joi.string().max(254).required(),
        id: joi.number().required()
    }
    if (token.role === "C") {
        objetoJoi.password = joi.string().min(4).max(20).required()
            .regex(/([A-Za-z0-9])/)
    }

    let joiValidation = await joiDataValidator(data, objetoJoi);

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    //comprueba si el nombre del avatar se encuentra en la galeria de avatars
    const pathImage = path.join(__dirname, '../../public/gallery/avatars/', data.avatar)
    if (!fsextra.existsSync(pathImage)) {
        return { status: EXCEPTIONS.invalidData }
    }

    formatData(data);
    //comprueba si hay alguien con ese nombre o correo que no sea el id ingresado
    const existeNombre = await DAL.getUsuarioByName(data);
    if (existeNombre[0]) {
        if (existeNombre[0].id !== data.id) {
            return { status: EXCEPTIONS.duplicatedData }
        }
    }
    const existeMail = await DAL.getUsuarioByMail(data.mail);
    if (existeMail[0]) {
        if (existeMail[0].id !== data.id) {
            return { status: EXCEPTIONS.duplicatedData }
        }
    }


    let result;
    try {
        if (token.role === "A") {
            result = await DAL.updateAdmin(data);
        }
        if (token.role === "E") {
            result = await DAL.updateEmpleado(data);
        }
        if (token.role === "C" && token.id === data.id) {
            data.password = await hashUTF8(data.password)
            result = await DAL.updateCliente(data);
        }
        if (result) {
            result = await DAL.getUsuarioByMail(data.mail)
            if (!existeMail[0]) {
                const clientIp = ip;
                const dateUTC = moment().utc().format('YYYY-MM-DD HH:mm:ss')
                let verifyCode = {
                    date: dateUTC,
                    mail: result[0].mail,
                    id: result[0].id,
                    ip: clientIp,
                    type: 'verify'
                }
                await DAL.updateVerify(result[0].mail, false)
                verifyCode = encrypt(verifyCode);
                const dataMail = {
                    from: "no-reply@trial-k68zxl2o1zmgj905.mlsender.net",
                    fromName: "JRW",
                    to: result[0].mail,
                    toName: result[0].username,
                    subject: "Verificacion"
                };
                const template = 'pq3enl6ve78g2vwr';
                const personalization = [{
                    email: result[0].mail,
                    data: {
                        backend_url: "localhost",
                        button_link: `localhost/api/user/verify/?verifyCode=${verifyCode}`,
                        support_email: "JRW-glomba@no-reply.com"
                    }
                }];
                await sendMailTemplate(dataMail, template, personalization);
                return { status: "OK" }
            }
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
//Borra usuarios
const remove = async (data, token) => {

    const joiValidation = await joiDataValidator(data, {
        id: joi.number().required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    formatData(data)

    let result;
    try {
        if (token.role === "A") {
            result = await DAL.removeAdmin(data);
        }
        if (token.role === "E") {
            result = await DAL.removeClienteEmpleado(data);
        }
        if (token.role === "C" && token.id === data.id) {
            result = await DAL.removeClienteEmpleado(data);
        }
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const login = async (data) => {

    const joiValidation = await joiDataValidator(data, {
        username: joi.string().min(1).max(20).required(),
        password: joi.string().min(1).max(20).required()
            .regex(/([A-Za-z0.9])/)
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }
    
    let result;
    try {
        result = await DAL.getUsuarioByName(data);
        if (result[0]) {
            
            let userData = {
                userID: result[0].id,
                username: result[0].username,
                role: result[0].role,
                avatar: result[0].avatar,
                isActive: result[0].isActive,
            }
            
            let hash = await checkHash(data.password, result[0].password)
            if (hash) {
                let resp = {
                    "userID": result[0].id,
                    "username": result[0].username,
                    "role": result[0].role,
                    "avatar": result[0].avatar,
                    "email": result[0].mail
                }
                const token = jwtWrapper.signToken(resp)
                 return { status: "OK", userData, token }
            }

        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }

};
const loginPersonaje = async (data) => {

    const joiValidation = await joiDataValidator(data, {
        personajeID: joi.string().required()
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }
    
    let result;
    try {
        result = await DAL.getPersonajeByID(data.personajeID);
        if (result[0]) {
           
            let userData = {
                "userID": result[0].userid,
                "personajeID": result[0].id
            }

                const token = jwtWrapper.signToken(userData)
                 return { status: "OK", userData, token }
            

        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }

};

//Obtiene usuario segun el id
const getUser = async (id, token) => {
    let result;
    try {
        result = await DAL.getUsuarioByID(Number(id));
        if (result[0]) {
            if (token.role === "C") {
                if (token.userID === Number(id)) {
                    delete result[0].password
                } else {
                    result = {
                        "username": result[0].username,
                        "avatar": result[0].avatar,
                        "role": result[0].roleString
                    }
                }
            } else if (token.role === "E" || token.role === "A") {
                delete result[0].password
            }
            return { status: "OK", user: result[0] }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
const getPersonajeByID = async (id, token) => {
    let result;
    try {
        result = await DAL.getPersonajeByID(Number(id));
        if (result[0] && result[0].userid === token.userID) {
            return { status: "OK", personaje: result[0] }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
const getMapByID = async (id) => {
    let result;
    try {
        result = await DAL.getMapByID(Number(id));
        if (result[0]) {
            return { status: "OK", map: result[0] }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
const getAll = async (tabla) => {
    let result;
    try {
        result = await DAL.getTabla(tabla);

            return { status: "OK",  result }
      
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
   
};
const getBarrasByID = async (id) => {
    let result;
    try {
        result = await DAL.getBarrasByID(Number(id));
        if (result[0]) {
            return { status: "OK", barras: result[0] }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
const getInventarioByID = async (id) => {
    let result;
    try {
        result = await DAL.getInventarioByID(Number(id));
        if (result[0]) {
            return { status: "OK", inventario: result[0] }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const updateStatus = async (data, token) => {

    let joiValidation = await joiDataValidator(data, {
        disabled: joi.boolean().required(),
        id: joi.number().required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    formatData(data)

    let result;
    try {
        const user = await DAL.getUsuarioByID(data.id)
        if (user[0]) {
            if (token.role === "C" && token.userID !== data.id) {
                return { status: EXCEPTIONS.unAuthorized }
            }
            if (token.role === "E") {
                if (user[0].roleString !== "Cliente") {
                    return { status: EXCEPTIONS.unAuthorized }
                }
            }
        }
        result = await DAL.updateStatus(data);
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const updateRole = async (data) => {

    let joiValidation = await joiDataValidator(data, {
        role: joi.string().max(1).required().allow("A", "E", "C"),
        id: joi.number().required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    formatData(data);

    let result;
    try {
        result = await DAL.updateRole(data);
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const getGallery = async () => {
    let result;
    try {
        result = await DAL.getGallery()
        if (result.length > 0) {
            return { status: "OK", "data": result }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

//Agrega usuarios
const addGallery = async (data) => {


    const joiValidation = await joiDataValidator(data, {
        file: joi.array().required(),
        name: joi.string().required()
    });
    //si no viene el file o el array esta vacio, invalid_data
    if (!data.file || !data.file.length) {
        return ({ status: EXCEPTIONS.invalidData });
    }
    if (joiValidation.hasOwnProperty('status')) {
        //si no viene name y viene el Filename de file, borrar el archivo temporal creado
        if (!data.name && data.file[0].filename) {
            let pathdelete = path.join(__dirname, '../../private/temps/', data.file[0].filename);
            fsextra.removeSync(pathdelete)
        }
        return joiValidation;
    }

    const extensionArchivo = data.file[0].originalFilename.split('.')[1]
    const archivoDB = data.name + "." + extensionArchivo
    const archivoTemp = data.file[0].filename
    const pathTemp = path.join(__dirname, '../../private/temps/', archivoTemp);
    const directorio = path.join(__dirname, '../../public/gallery/avatars/', archivoDB)
    let result;
    try {
        //compruebo si no existe como avatar configurado en los usuarios
        result = await DAL.existeAvatar(archivoDB.toUpperCase())
        //si existe como avatar configurado no puedo agregarlo y borro archivo temporal
        if (result) {
            fsextra.removeSync(pathTemp)
            return { status: EXCEPTIONS.inUse }
        }
        //guardo el archivo sobrescribiendo de ser necesario
        fsextra.moveSync(pathTemp, directorio, { overwrite: true });
        //compruebo si existe el archivo despues de guardarlo
        if (fsextra.existsSync(directorio)) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const removeGallery = async (data) => {
    const joiValidation = await joiDataValidator(data, {
        name: joi.string().required()
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }
    const directorio = path.join(__dirname, '../../public/gallery/avatars/', data.name)
    let result;
    try {
        //compruebo si no existe como avatar configurado en los usuarios
        result = await DAL.existeAvatar(data.name.toUpperCase())
        //si existe como avatar configurado no puedo eliminarlo
        if (result) {
            return { status: EXCEPTIONS.inUse }
        }
        //si existe el archivo lo elimino
        if (fsextra.existsSync(directorio)) {
            fsextra.removeSync(directorio)
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

const recovery = async (data, ip) => {
    const joiValidation = await joiDataValidator(data, {
        mail: joi.string().min(4).max(100).required()
            .regex(/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/)
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    let result;
    try {
        result = await DAL.getUsuarioByMail(data.mail);
        if (result[0]) {
            // compruebo si ya esta existe el registro en la tabla
            const existeRecovery = await DAL.checkRecoveryMail(result[0].id)
            if (existeRecovery) {
                // si existe y done = "false" salgo del recovery con error
                if (existeRecovery.done) {
                    //si existe y done = "true" lo actualizo a false
                    await DAL.updateRecoveryMail(result[0].id, false)
                }
            } else {
                //si no existe el registro lo creo y pongo done = "false"
                await DAL.addRecoveryMail(result[0].id)
            }
            const clientIp = ip;
            const dateUTC = moment().utc().format('YYYY-MM-DD HH:mm:ss')
            let recoveryCode = {
                date: dateUTC,
                mail: result[0].mail,
                id: result[0].id,
                ip: clientIp,
                type: 'recovery'
            };
            recoveryCode = encrypt(recoveryCode);
            const dataMail = {
                from: "no-reply@trial-k68zxl2o1zmgj905.mlsender.net",
                fromName: "JRW",
                to: result[0].mail,
                toName: result[0].username,
                subject: "Olvide mi password"
            };
            const template = 'o65qngk6j5o4wr12';
            const personalization = [{
                email: result[0].mail,
                data: {
                    name: result[0].name,
                    backend_url: "localhost",
                    button_link: `localhost/api/user/changePassword/?recoveryCode=${recoveryCode}`,
                    support_email: "JRW@no-reply.com"
                }
            }];
            await sendMailTemplate(dataMail, template, personalization);
            return { status: "OK" }
        }

    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: "OK", recoveryCode: null }

};

const changePassword = async (query) => {
    const joiValidation = await joiDataValidator(query, {
        recoveryCode: joi.string().required()
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    let result;
    try {
        result = await decrypt(query.recoveryCode)
        if (result && result.type === "recovery") {
            // compruebo si existe el registro en la tabla recoveryMails
            const existeRecovery = await DAL.checkRecoveryMail(result.id)
            //si no existe el registro, o existe y done = true
            if (!existeRecovery || existeRecovery.done) {
                return { status: EXCEPTIONS.recoveryInvalid }
            }
            const newPassword = generateRandomString(6);
            const passwordHasheada = await hashUTF8(newPassword)
            let cambio = await DAL.updatePassword(result.mail, passwordHasheada)
            if (!cambio) {
                return { status: EXCEPTIONS.invalidData }
            }
            const actualizo = await DAL.updateRecoveryMail(result.id, true)
            if (!actualizo) {
                return { status: "NO ACTUALIZO RECOVERYMAIL" }
            }
            return { status: "OK", newPassword }
        }

    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }

};

const verify = async (query) => {
    const joiValidation = await joiDataValidator(query, {
        verifyCode: joi.string().required()
    });
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    let result;
    try {
        result = await decrypt(query.verifyCode)
        if (result && result.type === "verify") {
            const userIsVerified = await DAL.userIsVerified(result.id)
            if (userIsVerified) {
                return { status: EXCEPTIONS.invalidData }
            }
            let cambio = await DAL.updateVerify(result.mail, true)
            if (cambio) {
                return { status: "OK" }
            }
        }

    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }

};

module.exports = {
    get,
    add,
    update,
    remove,
    login,
    crearPersonaje,
    getUser,
    getPersonajeByID,
    updateStatus,
    updateRole,
    getGallery,
    addGallery,
    removeGallery,
    recovery,
    changePassword,
    verify,
    loginPersonaje,
    getMapByID,
    getBarrasByID,
    getInventarioByID,
    getAll
};