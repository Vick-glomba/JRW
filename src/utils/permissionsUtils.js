const permissions = require('../consts/permissions.json')

const controlAccess = async(fnAsociada, role) => {
    if (permissions[fnAsociada]) {
        const funcion = permissions[fnAsociada]
        if (funcion.find(rol => rol === role)) {
            return true;
        } else {
            return false;
        }

    }
}


module.exports = {
    controlAccess
}