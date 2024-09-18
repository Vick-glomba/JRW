const db = require('./db');
const tabla = '' //ingresar nombre de la tabla aca

const get = async () => {
    try {
        const sql = `SELECT * FROM ${tabla} ORDER BY id ASC`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const add = async ({ }) => {
    const sql = `INSERT INTO ${tabla} () VALUES()`
    try {
        const result = await db.query(sql);
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const update = async ({ id }) => {
    const sql = `UPDATE ${tabla} SET

     WHERE id = '${id}';`
    try {
        const result = await db.query(sql)
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const remove = async (id) => {
    try {
        const sql = `DELETE FROM ${tabla} WHERE id = '${id}'`
        const result = await db.query(sql);
        return result.rowCount;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};

const getByName = async ({ name }) => {
    try {
        const sql = `SELECT *
         FROM ${tabla} 
         WHERE
          name = '${name}'`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};
const getByID = async (id) => {
    try {
        const sql = `SELECT *
        FROM ${tabla} 
        WHERE
        id = '${id}'`
        const result = await db.query(sql);
        return result.rows;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
};


module.exports = {
    get,
    add,
    update,
    remove,
    getByName,
    getByID,
};