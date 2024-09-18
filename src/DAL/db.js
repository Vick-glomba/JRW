const { Pool } = require('pg');

const { host, port, user, password, database } = require('../../private/environment.json');

// Armo objeto de configuracion para el driver Hana
const configDb = { host, port, user, password, database, 
    ssl: true,
    max : 5, // max number of clients in the pool
connectionTimeoutMillis : 10000, // 10 segundos timeout si no responde la db
idleTimeoutMillis : 1000000 // 60 seg tiempo de inactividad si no hay peticiones
 };

let postgresqlClient;

//funcion para instanciar el pool de conexion con la db
function instantiate() {
    try {
        // Preparo conexion y creo pool
        postgresqlClient = new Pool(configDb);
        // Eventos del pool de conexion -PREGUNTAR
        postgresqlClient.on('poolError', err => {
            logger.log('error', 'PostgreSQL (pool): Error en el pool de base de datos!', false, err);
        });
        // Intento conectar
        postgresqlClient.connect()
            .then(() => {
                console.log(' PostgreSQL: ¡Conexión exitosa a la base de datos!');
                // Me fijo si hay schemas en la base de datos
                try {
                    const sqlTablesQuantity = 'SELECT COUNT(schema_name) AS "schema_count" FROM information_schema.schemata';
                    query(sqlTablesQuantity).then(tablesQuantity => {
                        if (tablesQuantity.rows[0].schema_count == 0) {
                            console.error(' PostgreSQL: ¡No hay schemas en la base de datos!');
                        }
                    }).catch(err => {
                        console.error(' PostgreSQL: Error al realizar consulta inicial en la base de datos: ', err);
                    });
                } catch (err) {
                    console.error(' PostgreSQL: Error al realizar consulta principal en la base de datos: ', err);
                }
            })
            .catch(err => {
                console.error(' PostgreSQL: No se pudo conectar a la base de datos: ', err);
            });
    } catch (err) {
        console.error("Error de conexion con la base de datos", err)
    }
}

//funcion para ejecutar una query utilizando el pool de conexion
function query(queryData) {
    return new Promise((resolve, reject) => {
        postgresqlClient.connect().then(conn => {
            conn.query(queryData).then(result => {
                conn.release();
                resolve(result);
            }).catch(err => {
                conn.release();
                reject(err);
            })
        }).catch(er => {
            reject(er);
        });
    });
}

module.exports = {
    query,
    instantiate,
};