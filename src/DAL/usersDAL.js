const db = require('./db');
const path = require('path');
const fs = require('fs')

const get = async () => {

    try {
        const sql = `SELECT 
        id,
        username,
        ,
        mail,
        avatar,
        case WHEN role = 'E' THEN 'Empleador'
        WHEN role = 'A' THEN 'Administrador'
        WHEN role = 'C' THEN 'Cliente'
        end  as "roleString",
        isverified as "isVerified",
        isactive as "isActive" 
        FROM users 
        ORDER BY username ASC`

        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};


const add = async ({ username, password, mail, avatar }) => {

    const sql = `INSERT INTO users (
     username,
     password,
     personaje1, 
     personaje2, 
     personaje3,
     mail,
     avatar,
     role,
     isActive,
     isVerified)
    VALUES(
     '${username}',
     '${password}',
     null,
     null,
     null,
     '${mail}',
     '${avatar || ''}',
    'C',
      true,
      false)`
    try {
        const result = await db.query(sql);
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};


const crearPersonaje = async ({ userID, nombre, imagen, descripcion, mapID }) => {

    const sql = `INSERT INTO personajes (
        userid,
        nombre,
        imagen,
        descripcion,
        nivel,
        monedas,
        hechizosid,
        habilidadesid,
        reputacion,
        precomandos,
        mapID)
    VALUES(
     ${userID},
     '${nombre}',
     '${imagen}',
     '${descripcion}',
     1,
     10,
     ARRAY[1,2,3],
     ARRAY[1,2],
     1000,
     ARRAY['/ir','/comerciar','/hablar','/agarrar','/tirar','/equipar','1','2','3','4','5'],
     ${mapID})`
    try {
        const result = await db.query(sql);
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};


const updateAdmin = async ({ username, mail, avatar, id }) => {

    const sql = `UPDATE users SET
    username = '${username}',
    mail = '${mail}',
    avatar = '${avatar || ''}'
     WHERE id = ${id} and
     users.role = 'C' OR users.role = 'E' ;`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateEmpleado = async ({ username, mail, avatar, id }) => {

    const sql = `UPDATE users SET
    username = '${username}',
    mail = '${mail}',
    avatar = '${avatar || ''}'
     WHERE id = ${id} and
     users.role = 'C';`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateCliente = async ({ username, password, mail, avatar, id }) => {

    const sql = `UPDATE users SET
    username = '${username}',
    password = '${password}',
    mail = '${mail}',
    avatar = '${avatar || ''}'
     WHERE id = ${id} and
     users.role = "C";`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updatePassword = async (mail, password) => {

    const sql = `UPDATE users SET
    password = '${password}'
    WHERE
    mail = '${mail}';`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateVerify = async (mail, boolean) => {

    const sql = `UPDATE users SET
    isVerified = '${boolean}'
    WHERE
    mail = '${mail}';`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const removeAdmin = async ({ id }) => {
    try {
        const sql = `DELETE FROM users WHERE id = ${id}`
        const result = await db.query(sql);

        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const removeClienteEmpleado = async ({ id }) => {
    try {
        const sql = `DELETE FROM users WHERE id = ${id} and users.role = "C"`
        const result = await db.query(sql);

        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getUsuarioByName = async ({ username }) => {

    try {
        const sql = `SELECT 
        users.id,
        users.username,
        users.password,
        case WHEN users.role = 'E' THEN 'Empleador'
         WHEN role = 'A' THEN 'Administrador'
         WHEN role = 'C' THEN 'Cliente'
         end  as "roleString",
         personaje1,
         personaje2,
         personaje3,
        avatar,
        mail,
        role,
        isverified as "isVerified",
        isactive as "isActive"
        FROM users 
        WHERE
        username = '${username}' 
        and users.isActive= true`

        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getPersonajeByNombre = async ( nombre ) => {

    try {
        const sql = `SELECT 
        *
        FROM personajes
        WHERE
        nombre = '${nombre}'`

        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateValueToUser = async (campo = "", value, userID = 0 ) => {
 

    const sql = `UPDATE users SET
    ${campo}= ${value}
     WHERE id = ${userID} ;`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getUsuarioByMail = async (mail) => {

    try {
        const sql = `SELECT 
         id,
         username,
         mail
         FROM users 
         WHERE
          mail = '${mail}'`

        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getUsuarioByID = async (id) => {

    try {
        const sql = `SELECT 
        users.id,
        users.username,
        users.password,
        case WHEN users.role = 'E' THEN 'Empleador'
         WHEN role = 'A' THEN 'Administrador'
         WHEN role = 'C' THEN 'Cliente'
         end  as "roleString",
         personaje1,
         personaje2,
         personaje3,
        avatar,
        mail,
        role,
        isverified as "isVerified",
        isactive as "isActive"
        FROM users 
        WHERE
        users.id = ${id} 
        and users.isActive= true`

        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getPersonajeByID = async (personajeID) => {

    try {
        const sql = ` SELECT
            id,
            userid,
            nombre,
            imagen,
            descripcion,
            nivel,
            monedas,
            hechizosid, 
            habilidadesid,
            reputacion,
            precomandos,
            mapid
        FROM personajes 
        WHERE
        personajes.id = ${personajeID};`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const getMapByID = async (mapID) => {

    try {
        const sql = ` SELECT
            *
        FROM maps 
        WHERE
        maps.id = ${mapID};`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const getTabla = async (tabla) => {

    try {
        const sql = ` SELECT
            *
        FROM ${tabla}
        ORDER BY id ASC
        `
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const getBarrasByID = async (personajeID) => {

    try {
        const sql = ` SELECT
            *
        FROM barras 
        WHERE
        barras.personajeid = ${personajeID};`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const getInventarioByID = async (personajeID) => {

    try {
        const sql = ` SELECT
            *
        FROM inventario 
        WHERE
        inventario.personajeid = ${personajeID};`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const userIsVerified = async (id) => {

    try {
        const sql = `SELECT 
        isverified
        FROM users 
        WHERE
        id = ${id} and
        isverified = true`

        const result = await db.query(sql);
        if(result.rows[0]) {
            return true
        }
        return false;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateStatus = async ({ disabled, id }) => {

    const sql = `UPDATE users SET
    isActive = '${disabled}'
     WHERE id = ${id};`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const updateRole = async ({ role, id }) => {

    const sql = `UPDATE users SET
     role = '${role}'
      WHERE id = ${id};`

    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getGallery = async () => {

    try {
        const directorio = path.join(__dirname, '../../public/gallery/avatars')
        result = fs.readdirSync(directorio);

        return result;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};


const existeAvatar = async (src) => {
    try {
        const sql = `SELECT * 
        FROM users 
        WHERE UPPER(avatar) = '${src}'`
        const result = await db.query(sql);
        return result.rowCount
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const checkRecoveryMail = async (id) => {
    try {
        const sql = `SELECT 
        userid,
        done
        FROM recoverymails
        WHERE
        userid = ${id}`

        const result = await db.query(sql);
        if (result.rows[0]) {
            return result.rows[0]
        }
        return false;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const updateRecoveryMail = async (userID, done) => {

    const sql = `UPDATE recoverymails SET
     done = '${done}'
      WHERE userid = ${userID};`
    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const addRecoveryMail = async (userID) => {

    const sql = `INSERT INTO recoverymails (
    userid,
    done)
    VALUES(
    ${userID},
    false)`
    try {
        const result = await db.query(sql);
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

module.exports = {
    get,
    add,
    crearPersonaje,
    updateAdmin,
    updateEmpleado,
    updateCliente,
    updatePassword,
    updateVerify,
    removeAdmin,
    removeClienteEmpleado,
    getUsuarioByName,
    getUsuarioByMail,
    getUsuarioByID,
    getPersonajeByID,
    updateStatus,
    updateRole,
    getGallery,
    existeAvatar,
    checkRecoveryMail,
    updateRecoveryMail,
    addRecoveryMail,
    userIsVerified,
    getPersonajeByNombre,
    updateValueToUser,
    getMapByID,
    getBarrasByID,
    getInventarioByID,
    getTabla
};
