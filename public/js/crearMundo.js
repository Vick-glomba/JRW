var socket = io();



const token = localStorage.getItem('token')


let dataToken;
let personaje;
let map;
const btnPersonajes = $('#btnPersonajes')
const btnCriaturas = $('#btnCriaturas')
const btnMapas = $('#btnMapas')
const btnUsuarios = $('#btnUsuarios')
const btnNPC = $('#btnNPC')
const solapaPersonajes = $('#solapaPersonajes')
const solapaCriaturas = $('#solapaCriaturas')
const solapaMapas = $('#solapaMapas')
const solapaUsuarios = $('#solapaUsuarios')
const solapaNPC = $('#solapaNPC')
const marcoMapa = $("#marcoMapa")
const inpUid = $('#inpUid');
const inpDesciptionID = $('#inpDesciptionID');
const inpImagen = $('#inpImagen');
const inpEnviromentID = $('#inpEnviromentID');
const inpItemsID = $('#inpItemsID');
const inpCriaturasID = $('#inpCriaturasID');
const inpNpcID = $('#inpNpcID');
const inpContainersID = $('#inpContainersID');
const inpAncho = $('#inpAncho')
const inpAlto = $('#inpAlto')
const CambiarTamaño = $('#CambiarTamaño')
const ObtenerUid = $('#ObtenerUid')
const Crear = $('#Crear')
const Actualizar = $('#Actualizar')
const Borrar = $('#Borrar')

const inpNuevaUbicacion = $('#inpNuevaUbicacion')
const CambiarUbicacion = $('#CambiarUbicacion')

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




//CREANDO EL MINIMAPA DEL MUNDO
const crearMapa = async () => {


    while (marcoMapa.firsChild) {
        marcoMapa.removeChild(marcoMapa.firsChild)
    }

    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        ancho = dimensiones.ancho
        alto = dimensiones.alto
        mapas = maps
        ecosistemas = enviroments
        //armar el mapa aca
        let imagen = "fondonegro.jpg"
        let htmlMapa = ""
        let cantidadMapas = 0
        const anchura = 100 / ancho
        const altura = anchura * 5
        const tamañoLetra = 180 / ancho


        for (let i = 0; i < alto; i++) {
            htmlMapa += `
            <div class="filaMapa" height="${altura}px">`
            for (let i = 0; i < ancho; i++) {
                cantidadMapas += 1
                let numeroMapa = cantidadMapas
                if (mapas[cantidadMapas]) {
                    if (ecosistemas[mapas[cantidadMapas].enviromentid]) {
                        imagen = ecosistemas[mapas[cantidadMapas].enviromentid].imagen
                    } else {
                        imagen = "fondonegro.jpg"
                    }
                } else {
                    imagen = "agua2.jpg"
                    numeroMapa = ""
                }
                htmlMapa += `
                <div style=" width:${anchura}%; height:${altura}px; border-color: rgb(0,0,0); border-width: 5px; border-style: double; background-color: rgba(130, 132, 17, 0.77);"><div style= "width:100%; height:100%; background-size: 10rem;background-repeat: no-repeat; background-image:url(../assets/images/enviroments/${imagen}); overload:visible "><p style="color: white;	-webkit-text-stroke: 1px #F8F8F7; text-shadow: 0px 1px 4px #23430C; margin:0%;padding-top: 15%; font-size: ${tamañoLetra}px; width:100%; height:100%; text-align: center; ">${numeroMapa}</p></div></div>`
            }
            htmlMapa += `
            </div>`
            //dejo la imagen de mapa por si la necesito
            //<img src="../assets/images/maps/${imagenMapa}" style="width:100%; height:100%; overflow: visible;">
        }

        //  console.log(htmlMapa)
        marcoMapa.html(htmlMapa)


        $('html').scrollTop(0)



    })
}



socket.on('connect', async function () {
    console.log('Conectado al servidor');

    if (!token) {
        localStorage.clear()
        //     window.location = 'index.html';
    }

    await verificar(token)

    if (!dataToken) {
        localStorage.clear()
        //  window.location = 'index.html';
    }


    crearMapa()
    $("#solapaMapas").height(0)



});







let abierto = false
btnPersonajes.on("click", () => {
    if (abierto) {
        solapaPersonajes.height(0)
        $('html').scrollTop(0)
        abierto = false
    } else {
        solapaPersonajes.height('100%')
        abierto = true
    }
})
let abierto1 = false
btnCriaturas.on("click", () => {
    if (abierto1) {
        solapaCriaturas.height(0)
        $('html').scrollTop(0)
        abierto1 = false
    } else {
        solapaCriaturas.height('100%')
        abierto1 = true
    }
})
let abierto2 = false
btnMapas.on("click", () => {

    if (abierto2) {
        solapaMapas.height(0)
        $('html').scrollTop(0)
        abierto2 = false
    } else {
        solapaMapas.height('100%')
        abierto2 = true
    }
})
let abierto3 = false
btnUsuarios.on("click", () => {
    if (abierto3) {
        solapaUsuarios.height(0)
        $('html').scrollTop(0)
        abierto3 = false
    } else {
        solapaUsuarios.height('100%')
        abierto3 = true
    }
})
let abierto4 = false
btnNPC.on("click", () => {
    if (abierto4) {
        solapaNPC.height(0)
        $('html').scrollTop(0)
        abierto4 = false
    } else {
        solapaNPC.height('100%px')
        abierto4 = true
    }
})

// inpAncho
// inpAlto
// inpUid
// inpDesciptionID
// inpImagen
// inpEnviromentID
// inpItemsID
// inpCriaturasID
// inpNpcID
// inpContainersID




CambiarUbicacion.on("click", () => {
  
    let viejaUid = inpUid.val()
    let nuevaUid = inpNuevaUbicacion.val()
    socket.emit('cambiarUbicacion',viejaUid ,nuevaUid, () => {
        crearMapa();
    })

})
CambiarTamaño.on("click", () => {
    let anchoNuevo = inpAncho.val()
    let altoNuevo = inpAlto.val()
    socket.emit('cambiarTamaño', anchoNuevo, altoNuevo, () => {
        crearMapa();
    })

})
ObtenerUid.on("click", () => {
    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        mapas = maps
        console.log(mapas[inpUid.val()])
        if (mapas[inpUid.val()]) {           
            inpDesciptionID.val(mapas[inpUid.val()].descripcionid)
            inpImagen.val(mapas[inpUid.val()].imagen)
            inpEnviromentID.val(mapas[inpUid.val()].enviromentid)
            inpItemsID.val(mapas[inpUid.val()].itemsid)
            inpCriaturasID.val(mapas[inpUid.val()].criaturasid)
            inpNpcID.val(mapas[inpUid.val()].npcid)
            inpContainersID.val(mapas[inpUid.val()].containersid)
        } else {

        }
    })
})
// Crear.on("click", () => {
//     if () {

//     } else {

//     }
// })
// Actualizar.on("click", () => {
//     if () {

//     } else {

//     }
// })
// Borrar.on("click", () => {
//     if () {

//     } else {

//     }
// })