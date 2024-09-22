//lado SERVIDOR

const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')
const { crearMensaje } = require('../utilidades/utilidades');


const usuarios = new Usuarios();

usuarios.cargarMundo()


io.on('connection', (client) => {

    client.on('actualizarPersonaje', (personajeID, mapaVa) => {
        usuarios.actualizarPersonaje(personajeID, mapaVa)

        let personaBorrada = usuarios.borrarPersona(client.id)
        if (personaBorrada) {
            client.leave(personaBorrada.sala)
            client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `Alguien se aleja...`))
            client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
        }
    

    })

    client.on('obtenerMundo', (callback) => {
        return callback(usuarios.obtenerMundo())
    })

    client.on('cambiarTamaño', (anchoNuevo,altoNuevo,callback) => {
         return callback(usuarios.cambiarTamaño(anchoNuevo,altoNuevo))
    })
    client.on('cambiarUbicacion', (viejaUid,nuevaUid,callback) => {
         return callback(usuarios.cambiarUbicacion(viejaUid,nuevaUid))
    })

    client.on('obtenerPersonaje', async (uid, callback) => {
        let pj
        let barras
        pj = usuarios.obtener("personajes", uid)
        barras = usuarios.obtener("barras", uid)
        inventario = usuarios.obtener("inventario", uid)

        return callback({ pj, barras, inventario })
    })
    client.on('obtenerInterface', async (sala, callback) => {
        const items = usuarios.obtenerTabla("items")
        const maps = usuarios.obtenerTabla("maps")
        const description = usuarios.obtenerTabla("description")
        const personasMapa = usuarios.getPersonasPorSala(sala)
        return callback({ items, maps, description, personasMapa })

    })

    client.on('entrarChat', (data, callback) => {

        if (!data.token || !data.nombre || !data.sala) {
            return callback({
                error: true,
                msg: 'no tiene token, o nombre o sala'
            })
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `Alguien se acerca...`))
        callback(usuarios.getPersonasPorSala(data.sala));


    })

    client.on('busqueda', (data) => {
        let personasEnSala = usuarios.getPersonasPorSala(data.sala)
        let personasFiltradas = personasEnSala.filter(persona => {
            let contiene = persona.nombre.includes(data.filtro);
            if (contiene) {
                return persona;
            }
        })

        client.emit('listaPersona', personasFiltradas)
    });

    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)

        callback(mensaje);

    })

    client.on('mensajePrivado', (data, callback) => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        callback(mensaje)
    })


    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id)
        if (personaBorrada) {
            client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `Alguien se aleja...`))
            client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
        }
    })

});


