const controllerName = "base" //cambiar
const Service = require('../services/baseService.js'); //cambiar
const EXCEPTIONS = require('../consts/exceptions.json');
const permissionsUtils = require('../utils/permissionsUtils.js');



const get = async (req, res, next) => {
    const fnAsociada = 'getBase';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
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
    const fnAsociada = 'addBase';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.add(req.body);
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
    const fnAsociada = 'updateBase';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.update(req.body, req.token);
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

const remove = async (req, res, next) => {
    const fnAsociada = 'removeBase';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido!!\n`,
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


// const getByName = async (req, res, next) => {
//     const fnAsociada = 'getByIDBase';
//     let permisoAcceso;
//     const userRole = req.token.role;
//     if (userRole) {
//         permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
//     }
//     if (!permisoAcceso) {
//         console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
//         res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
//         return;
//     }
//     try {
//         const serviceResponse = await Service.getByName(req.query.name, req.token);
//         switch (serviceResponse.status) {
//             case 'OK':
//                 res.status(200).json(serviceResponse); // Codigo HTTP 200: OK
//                 break;
//             case EXCEPTIONS.invalidData:
//                 res.status(422).json(serviceResponse); // Codigo HTTP 422: INVALIDDATA
//                 break;
//             default:
//                 res.sendStatus(500); // Codigo HTTP 500: Error en el servidor
//         }
//         next();
//     } catch (err) {
//         console.error(`Ha ocurrido un error! Controller "${controllerName}" Metodo "${fnAsociada}"`);
//         res.sendStatus(500) && next(err); // Codigo HTTP 500: Error en el servidor
//     }
// };
const getByID = async (req, res, next) => {
    const fnAsociada = 'getByIDBase';
    let permisoAcceso;
    const userRole = req.token.role;
    if (userRole) {
        permisoAcceso = await permissionsUtils.controlAccess(fnAsociada, userRole);
    }
    if (!permisoAcceso) {
        console.error(`Un usuario intento "${fnAsociada}" con un rol no permitido! Controller "${controllerName}" Metodo "${fnAsociada}"`, req.token);
        res.status(401).json({ status: EXCEPTIONS.unAuthorized }) && next();
        return;
    }
    try {
        const serviceResponse = await Service.getByID(req.query.id, req.token);
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
    update,
    remove,
 //   getByName,
    getByID

};