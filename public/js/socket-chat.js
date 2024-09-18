//cargar todas las peticiones aca

var socket = io();



const token = localStorage.getItem('token')
const tokenPJ = localStorage.getItem('tokenPJ')
let dataToken;
let personaje;
let map;




const verificar = async (token) => {


    await fetch('/api/verifyToken', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
    }).then(resp => resp.json())
        .then(resp => {
            if (resp.token) {

                dataToken = resp.token

            }

        })

}



socket.on('connect', async function () {
    console.log('Conectado al servidor');

    if (!token) {
        localStorage.clear()
        window.location = 'index.html';
    }

    await verificar(tokenPJ)

    if (!dataToken) {
        localStorage.clear()
        window.location = 'index.html';
    }


    socket.emit('obtenerPersonaje', dataToken.personajeID, function ({pj, barras, inventario}) {
        if (!pj || !barras || !inventario) {
            window.location = 'index.html';
        }

        personaje = pj
        personaje.barras = barras
        personaje.inventario = inventario
        
        console.log("personaje", pj)

        var usuario = {
            nombre: personaje.nombre,
            sala: personaje.mapid,
            img: personaje.imagen,
            token
        }

        socket.emit('entrarChat', usuario, function (resp) {
            renderizarUsuarios(resp);
        });


    })











});

// escuchar
socket.on('disconnect', function () {

    console.log('Perdimos conexión con el servidor');

});


// Escuchar información
socket.on('crearMensaje', function (mensaje) {

    renderizarMensajes(mensaje, false, false);
    scrollBottom();
});

// Escuchar cambios de usuarios
// cuando un usuario entra o sale del chat
socket.on('listaPersona', function (personas) {
    renderizarUsuarios(personas);
});



// Mensajes privados
socket.on('mensajePrivado', function (mensaje) {
    renderizarMensajes(mensaje, false, true);
    scrollBottom();
    console.log('Mensaje Privado:', mensaje);

});