const controllerName = "users"
const Service = require('../services/usersService.js');
const EXCEPTIONS = require('../consts/exceptions.json');
const permissionsUtils = require('../utils/permissionsUtils.js');
const requestIp = require('request-ip');
const multer = require('multer');
const mime = require('mime');
const path = require('path');
const randomGeneratorUtils = require('../utils/randomGeneratorUtils.js');
const { response } = require('express');

const MIME_FILE_VALIDAS = ['image/jpeg', 'image/bmp', 'image/png'];

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let pathToStore = path.resolve(__dirname, '../../private/temps');
        callback(null, pathToStore);
    },
    filename: function (req, file, callback) {
        // Seteo una variable con la extension del archivo de la imagen que envio el usuario 
        req.EXTENSION = mime.getExtension(file.mimetype);
        let name = file.originalname.split('.')[0];
        callback(null, name + '_' + new Date().getTime() + "-" + randomGeneratorUtils.generateRandomString(6) + '.' + mime.getExtension(file.mimetype));
    }
});


// Funcion para generar los pdfs del usuario que se va guardar en una ruta
function uploadFiles(req, res, allowEmptyFiles = true) {

    return new Promise((resolve, reject) => {
        const uploadedData = multer({ storage: storage }).fields([
            { name: 'file' }
        ]);
        // LLamo a la funcion para generar subir los pdf
        uploadedData(req, res, function (err) {
            if (err) {
                console.error("ERR009", { err });
            }
            if (req.files) {
                if (req.files['file']) {
                    let invalidFiles = [];
                    let originalNames = [];
                    let validFiles = [];

                    for (let i = 0; i < req.files['file'].length; i++) {
                        if (!MIME_FILE_VALIDAS.includes(req.files['file'][i].mimetype)) {
                            invalidFiles.push(req.files['file'][i].filename);
                            originalNames.push(req.files['file'][i].originalname);
                        } else {
                            req.files['file'][i].category = 'file';
                            validFiles.push(req.files['file'][i]);
                        }
                    }

                    let filesNames = validFiles.map(file => {
                        !req.body.file ? req.body.file = [] : null;
                        !req.body.image ? req.body.image = [] : null;
                        if (file.category === 'file') {
                            req.body.file.push({ filename: file.filename, originalFilename: file.originalname, size: (file.size / (1024 * 1024)).toFixed(2) });
                        }
                        return file.filename;
                    });
                    if (invalidFiles.length > 0) {
                        ClearTemps(invalidFiles);
                        ClearTemps(filesNames);
                        reject({ status: EXCEPTIONS.validationError, error: "INVALID_EXTENSION", invalidFiles: originalNames });
                        return;
                    }


                    resolve(req);
                    return;

                } else {
                    if (allowEmptyFiles) {
                        !req.body.file ? req.body.file = [] : null;
                        !req.body.image ? req.body.image = [] : null;
                        resolve(req);
                        return;
                    }
                    reject({ status: EXCEPTIONS.validationError, error: "INVALID_FILES" });
                    return;
                }
            } else {
                if (allowEmptyFiles) {
                    !req.body.file ? req.body.file = [] : null;
                    !req.body.image ? req.body.image = [] : null;
                    resolve(req);
                    return;
                }
                reject({ status: EXCEPTIONS.validationError, error: "INVALID_FILES" });
                return;
            }
            // Devuelvo el req una vez que se creo la imagen 
        });
    });
}

const ClearTemps = (files) => {
    if (files.length > 0) {
        let pathToStore = path.resolve(__dirname, '../../private/temps');
        for (let i = 0; i < files.length; i++) {
            let ruta = pathToStore + "/" + files[i];
            if (fs.existsSync(ruta)) {
                fs.unlinkSync(ruta);
            }

        }
    }
}


const verifyToken = async (req, res, next) => {
    const fnAsociada = 'verifyToken';
    try {
        res.status(200).json({ status: "OK", token: req.token })
        
    } catch (error) {
        res.status(401).json({ status: EXCEPTIONS.unAuthorized })
    }
};

const get = async (req, res, next) => {
    const fnAsociada = 'getUsers';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.get(req.query);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};


const add = async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    const fnAsociada = 'addUsers';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.add(req.body, clientIp);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.duplicatedData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const crearPersonaje = async (req, res, next) => {
    const fnAsociada = 'crearPersonaje';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.crearPersonaje(req.body);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.duplicatedData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.sinSlots:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const update = async (req, res, next) => {
    const fnAsociada = 'updateUsers';
    const clientIp = requestIp.getClientIp(req);
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.update(req.body, req.token, clientIp);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.unAuthorized:
                res.status(401).json(serviceResponse); // Codigo HTTP 401: UNAUTHORIZED
                break;
            case EXCEPTIONS.duplicatedData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const remove = async (req, res, next) => {
    const fnAsociada = 'removeUsers';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos!\n`,
            `Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.remove(req.body, req.token);

        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.unAuthorized:
                console.error(`Un usuario intento borrar con roles no permitidos!\n`,
                    `Controller "${controllerName}" Metodo "${fnAsociada}",\n`,
                    `Nombre: ${req.token.name} , Role: ${req.token.role}`);
                res.status(401).json(serviceResponse); // Codigo HTTP 401: UNAUTHORIZED
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const login = async (req, res = response, next) => {
   
    const fnAsociada = 'login';
    try {
        const serviceResponse = await Service.login(req.body);
        switch (serviceResponse.status) {
            case 'OK':      
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};
const loginPersonaje = async (req, res = response, next) => {
    const fnAsociada = 'loginPersonaje';
    try {
        const serviceResponse = await Service.loginPersonaje(req.body);
        switch (serviceResponse.status) {
            case 'OK':  
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const getUser = async (req, res, next) => {
    const fnAsociada = 'getUser';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento obtener user con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getUser(req.query.id, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};
const getPersonajeByID = async (req, res, next) => {
    const fnAsociada = 'getPersonajeByID';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento obtener user con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getPersonajeByID(req.query.id, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};
const getMapByID = async (req, res, next) => {
    const fnAsociada = 'getMapByID';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento obtener user con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getMapByID(req.query.id, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};
const getBarrasByID = async (req, res, next) => {
    const fnAsociada = 'getMapByID';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento obtener user con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getBarrasByID(req.query.id, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};
const getInventarioByID = async (req, res, next) => {
    const fnAsociada = 'getInventarioByID';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento obtener user con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getInventarioByID(req.query.id, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const updateStatus = async (req, res, next) => {
    const fnAsociada = 'updateStatus';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento actualizar status con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.updateStatus(req.body, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.unAuthorized:
                res.status(401).json(serviceResponse); // Codigo HTTP 401: UNAUTHORIZED
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const updateRole = async (req, res, next) => {
    const fnAsociada = 'updateRole';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento actualizar role con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.updateRole(req.body, req.token);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.unAuthorized:
                res.status(401).json(serviceResponse); // Codigo HTTP 401: UNAUTHORIZED
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const register = async (req, res, next) => {
    const fnAsociada = 'register';
    const clientIp = requestIp.getClientIp(req);
    try {
        const serviceResponse = await Service.add(req.body, clientIp);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.duplicatedData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const getGallery = async (req, res, next) => {
    const fnAsociada = 'getGallery';

    try {
        const serviceResponse = await Service.getGallery();
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                console.error(`La carpeta se encuentra vacia! Controller "${controllerName}" Metodo "${fnAsociada}"`);
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const addGallery = async (req, res, next) => {
    const fnAsociada = 'addGallery';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    let newBody;
    try {
        // Intento subir los pdfs
        const nuevoReq = await uploadFiles(req, res, true);
        newBody = nuevoReq.body;
    } catch (err) {
        // Si entre aca, tuve un error al subir la imagen, ya sea por la imagen, no existe el directorio, etc.
        // Aviso al usuario 
        res.status(422).json(err) && next();
        // Termino la funcion aca 
        return;
    }

    try {
        const serviceResponse = await Service.addGallery(newBody);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.duplicatedData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.inUse:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const removeGallery = async (req, res, next) => {
    const fnAsociada = 'removeGallery';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento acceder con roles no permitidos! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }

    try {
        const serviceResponse = await Service.removeGallery(req.body);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.inUse:
                res.status(422).json(serviceResponse);  // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const recovery = async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    const fnAsociada = 'recovery';
    try {
        const serviceResponse = await Service.recovery(req.body, clientIp);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const changePassword = async (req, res, next) => {
    const fnAsociada = 'changePassword';
    try {
        const serviceResponse = await Service.changePassword(req.query);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            case EXCEPTIONS.recoveryInvalid:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

const verify = async (req, res, next) => {
    const fnAsociada = 'verify';
    try {
        const serviceResponse = await Service.verify(req.query);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.validationError:
                console.error(
                    `Se recibieron parametros invalidos.`,
                    `\nController "${controllerName}" Metodo "${fnAsociada}": \n`,
                    req.body);
                res.status(422).json(serviceResponse); // Codigo HTTP 422: VALIDATIONERROR
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};

//cargar mundo

const getTablas = async (req, res, next) => {

    const fnAsociada = 'getTablas';

    try {
        const serviceResponse = await Service.getAll(req.query.tabla);
        switch (serviceResponse.status) {
            case 'OK':
                res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
                break;
            case EXCEPTIONS.invalidData:
                res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
                break;
            default:
                res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
        }
        next();
    } catch (err) {
        console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
        res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
    }
};



module.exports = {
    get,
    add,
    crearPersonaje,
    update,
    remove,
    login,
    getUser,
    getPersonajeByID,
    updateStatus,
    updateRole,
    register,
    getGallery,
    addGallery,
    recovery,
    changePassword,
    verify,
    removeGallery,
    verifyToken,
    loginPersonaje,
    getMapByID,
    getBarrasByID,
    getInventarioByID,
    getTablas,
  
};