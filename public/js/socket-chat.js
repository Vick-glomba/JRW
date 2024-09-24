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
let contador = 10
const contadorPj = () =>{

    setTimeout(() => {

        setInterval(() => {
            if(contador === 11){
                contador= 10
            }else if(contador >= 0 && contador < 11){
                accionP.text("")
                contadorP.text(contador)
                contador -= 1
            }else{
                accionP.text(accion?accion.slice(1):"Nada..")
                contadorP.text("")
                contador = 11
                accion = ""
                
                
            }
            
        }, 1000);

    }, 2000);
    }

socket.on('connect', async function () {
    console.log('Conectado al servidor');

    if (!token) {
        localStorage.clear()
   //     window.location = 'index.html';
    }

    await verificar(tokenPJ)

    if (!dataToken) {
        localStorage.clear()
      //  window.location = 'index.html';
    }


    socket.emit('obtenerPersonaje', dataToken.personajeID, function ({ pj }) {
        if (!pj) { window.location = "index.html" }
        personaje = pj
    
        

        socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
            ancho = dimensiones.ancho
            alto = dimensiones.alto
            mapas = maps
            ecosistemas = enviroments
            //armar el mapa aca
            let imagen = "fondonegro.jpg"
            let htmlMapa = ""
            let cantidadMapas = 0
            const anchura= 100/ancho
            const altura= anchura*5
            const tamañoLetra= altura*0.5
            

            for (let i = 0; i < alto; i++) {                
                htmlMapa += `
                <div class="filaMapa" height="${altura}px">`
                for (let i = 0; i < ancho; i++) {
                    cantidadMapas += 1
                    let numeroMapa= cantidadMapas
                    if(mapas[cantidadMapas] ){
                        if(ecosistemas[mapas[cantidadMapas].enviromentid]){
                            imagen = ecosistemas[mapas[cantidadMapas].enviromentid].imagen        
                        } else {
                            imagen = "fondonegro.jpg"
                        }
                    } else {
                        imagen = "agua2.jpg"
                        numeroMapa= ""
                    }
                    htmlMapa += `
                    <div style=" width:${anchura}%; height:${altura}px; border-color: rgb(0,0,0); border-width: 5px; border-style: double; background-color: rgba(130, 132, 17, 0.77);"><div style= "width:100%; height:100%; background-size: 10rem;background-repeat: no-repeat; background-image:url(../assets/images/enviroments/${imagen}); overload:visible "><p style="color: white;	-webkit-text-stroke: 1px #F8F8F7; text-shadow: 0px 1px 4px #23430C; margin:0%;padding-top:15%; font-size: 0.8rem; width:100%; height:100%; text-align: center; ">${numeroMapa}</p></div></div>`
                }
                htmlMapa += `
                </div>`
                //dejo la imagen de mapa por si la necesito
                //<img src="../assets/images/maps/${imagenMapa}" style="width:100%; height:100%; overflow: visible;">
            }
          
          //  console.log(htmlMapa)
            $("#marcoMapa").html(htmlMapa)
            cabecera.height(0)
            
            $('html').scrollTop(0)

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

            contadorPj();

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