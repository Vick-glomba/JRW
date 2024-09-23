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
const fondo = $('#fondo')
const exito = $('#exito')
const fallo = $('#fallo')

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
        inpAncho.val(ancho)
        inpAlto.val(alto)

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
                    // numeroMapa = ""
                }
                htmlMapa += `
                <div style=" width:70px; height:50px; border-color: rgb(0,0,0); border-width: 5px; border-style: double; background-color: rgba(130, 132, 17, 0.77);"><div style= "width:60px; height:40px; background-size: 10rem;background-repeat: no-repeat; background-image:url(../assets/images/enviroments/${imagen}); overload:visible "><p style="color: white;	-webkit-text-stroke: 2px rgb(50,50,50); text-shadow: 2px 2px 2px rgb(0,0,0); margin:0%;padding-top: 15%; font-size: 1rem; width:100%; height:100%; text-align: center; ">${numeroMapa}</p></div></div>`
            }
            htmlMapa += `
            </div>`
            //dejo la imagen de mapa por si la necesito
            //<img src="../assets/images/maps/${imagenMapa}" style="width:100%; height:100%; overflow: visible;">
        }

        //  console.log(htmlMapa)
        marcoMapa.html(htmlMapa)


        // $('html').scrollTop(0)



    })
}



socket.on('connect', async function () {
    console.log('Conectado al servidor');

    if (!token) {
        localStorage.clear()
        window.location = 'index.html';
    }

    await verificar(token)

    if (!dataToken) {
        localStorage.clear()
        window.location = 'index.html';
    }


    crearMapa()
    $("#solapaMapas").height(0)



});







let abierto = false
btnPersonajes.on("click", () => {
    if (abierto) {
        solapaPersonajes.height(0)
        fondo.height('450px')
        $('html').scrollTop(0)
        abierto = false
    } else {
        solapaPersonajes.height('100%')
        fondo.height('0px')
        abierto = true
    }
})
let abierto1 = false
btnCriaturas.on("click", () => {
    if (abierto1) {
        solapaCriaturas.height(0)
        fondo.height('450px')
        $('html').scrollTop(0)
        abierto1 = false
    } else {
        solapaCriaturas.height('100%')
        fondo.height('0px')
        abierto1 = true
    }
})
let abierto2 = false
btnMapas.on("click", () => {

    if (abierto2) {
        solapaMapas.height(0)
        fondo.height('450px')
        $('html').scrollTop(0)
        abierto2 = false
    } else {
        solapaMapas.height('100%')
        fondo.height('0px')
        abierto2 = true
    }
})
let abierto3 = false
btnUsuarios.on("click", () => {
    if (abierto3) {
        solapaUsuarios.height(0)
        fondo.height('450px')
        $('html').scrollTop(0)
        abierto3 = false
    } else {
        solapaUsuarios.height('100%')
        fondo.height('0px')
        abierto3 = true
    }
})
let abierto4 = false
btnNPC.on("click", () => {
    if (abierto4) {
        solapaNPC.height(0)
        fondo.height('450px')
        $('html').scrollTop(0)
        abierto4 = false
    } else {
        solapaNPC.height('100%')
        fondo.height('0px')
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

    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        let mapas = maps
        if (!mapas[inpUid.val()]) {
            exito.text(" ")
            fallo.text("El mapa no existe")
        }else{

            if (!mapas[inpNuevaUbicacion.val()] ) {
                let viejaUid = inpUid.val()
                let nuevaUid = inpNuevaUbicacion.val()
                socket.emit('cambiarUbicacion', viejaUid, nuevaUid, () => {
                crearMapa();
                fallo.text(" ")
                exito.text("Exitoso")
            })
            
        } else {
            exito.text(" ")
            fallo.text("No se puede cambiar, el lugar esta ocupado")
        }
    }
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
        let mapas = maps
        if (mapas[inpUid.val()]) {
            inpDesciptionID.val(mapas[inpUid.val()].descripcionid)
            inpImagen.val(mapas[inpUid.val()].imagen)
            inpEnviromentID.val(mapas[inpUid.val()].enviromentid)
            inpItemsID.val(mapas[inpUid.val()].itemsid)
            inpCriaturasID.val(mapas[inpUid.val()].criaturasid)
            inpNpcID.val(mapas[inpUid.val()].npcid)
            inpContainersID.val(mapas[inpUid.val()].containersid)
            fallo.text(" ")
            exito.text("Exitoso")
        } else {
            exito.text(" ")
            fallo.text("El mapa no existe")
            console.log("El mapa no existe")
        }
    })
})
Actualizar.on("click", () => {
    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        let mapas = maps
        if (mapas[inpUid.val()]) {

            let mapaActualizado = mapas[inpUid.val()]

            mapaActualizado.descripcionid = Number(inpDesciptionID.val())
            mapaActualizado.imagen = inpImagen.val()
            mapaActualizado.enviromentid = inpEnviromentID.val().split(",")
            mapaActualizado.itemsid = inpItemsID.val().split(",")
            mapaActualizado.criaturasid = inpCriaturasID.val().split(",")
            mapaActualizado.npcid = inpNpcID.val().split(",")
            mapaActualizado.inpContainersID = inpUid.val().split(",")

            socket.emit('actualizarMapa', mapaActualizado, () => {
                crearMapa();
                fallo.text(" ")
                exito.text("Exitoso")
            })
        } else {
            exito.text(" ")
            fallo.text("El mapa no existe")
            console.log("no existe el mapa que queres actualizar")
        }
    })
})
Crear.on("click", () => {
    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        let mapas = maps
        if (!mapas[inpUid.val()]) {

            let mapaNuevo = {}

            mapaNuevo.uid = Number(inpUid.val())
            mapaNuevo.descripcionid = Number(inpDesciptionID.val())
            mapaNuevo.imagen = inpImagen.val()
            mapaNuevo.enviromentid = Number(inpEnviromentID.val())
            mapaNuevo.itemsid = Number(inpItemsID.val())
            mapaNuevo.criaturasid = Number(inpCriaturasID.val())
            mapaNuevo.npcid = Number(inpNpcID.val())
            mapaNuevo.inpContainersID = Number(inpUid.val())

            socket.emit('crearMapa', mapaNuevo, () => {
                crearMapa();
                fallo.text(" ")
                exito.text("Exitoso")
            })
        } else {
            exito.text(" ")
            fallo.text("El mapa ya existe")
            console.log("no se puede crear, el mapa ya existe")
        }
    })
})
Borrar.on("click", () => {
    socket.emit('obtenerMundo', function ({ dimensiones, maps, enviroments }) {
        let mapas = maps
        if (mapas[inpUid.val()]) {
            socket.emit('borrarMapa', inpUid.val(), () => {
                crearMapa();
                fallo.text(" ")
                exito.text("Exitoso")
            })
        } else {
            exito.text(" ")
            fallo.text("No se puede borrar, el mapa no existe")
            console.log("No se puede borrar, el mapa no existe")
        }
    })
})