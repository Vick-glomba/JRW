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


    socket.emit('obtenerPersonaje', dataToken.personajeID, function ({ pj }) {
        if (!pj) { window.location = "index.html" }
        personaje = pj

        socket.emit('obtenerMundo', function ({ dimensiones, maps }) {
            ancho = dimensiones.ancho
            alto = dimensiones.alto
            mapas = maps
            //armar el mapa aca
            let imagenMapa = "fondonegro.jpg"
            let htmlMapa = ""
            let cantidadMapas = 0
            const altura= 35
            const anchura= 100/ancho
            for (let i = 0; i < alto; i++) {
                
                htmlMapa += `
                <div class="filaMapa" height="${altura}px">`
                for (let i = 0; i < ancho; i++) {
                    cantidadMapas += 1
                    if(mapas[cantidadMapas] && mapas[cantidadMapas].imagen){
                        imagenMapa = mapas[cantidadMapas].imagen
                    } else {
                        imagenMapa = "fondonegro.jpg"
                    }
                    htmlMapa += `
                    <div style="width:${anchura}%; height:${altura}px; border-color: rgb(206, 216, 166); border-width: 5px; border-style: double; background-color: blueviolet;"><img src="../assets/images/maps/${imagenMapa}" style="width:100%; height:100%"></div>`
                }
                htmlMapa += `
                </div>`

            }
            console.log(cantidadMapas)
          //  console.log(htmlMapa)
            $("#marcoMapa").html(htmlMapa)
            cabecera.height(0)
            $(html).scrollTop(0)

            var usuario = {
                nombre: personaje.nombre,
                sala: personaje.mapid,
                token
            }
            // cargo los inputs que tenia el usuario
            inp1.val(personaje.precomandos[0])
            inp2.val(personaje.precomandos[1])
            inp3.val(personaje.precomandos[2])
            inp4.val(personaje.precomandos[3])
            inp5.val(personaje.precomandos[4])
            inp6.val(personaje.precomandos[5])
            inp7.val(personaje.precomandos[6])
            inp8.val(personaje.precomandos[7])
            inp9.val(personaje.precomandos[8])
            inp10.val(personaje.precomandos[9])
            inp11.val(personaje.precomandos[10])
            inp12.val(personaje.precomandos[11])
            socket.emit('entrarChat', usuario, function (resp) {
                renderizarUsuarios(resp);
            });
        })
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