
//ya tengo acceso a todo loq ue se este usando en socket-chat
const pathImgUsers = "assets/images/users/"
const pathImgMaps = "assets/images/maps/"
const pathImgItems = "assets/images/items/"
let nombre;
let sala;
const interface = async () => {

    socket.emit('obtenerInterface', personaje.mapid, ({ items, maps, description, personasMapa }) => {
        

        //cargo imagen de mapa
        mapa.attr("src", pathImgMaps + maps[personaje.mapid].imagen)
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
        imgPJ.attr("src", pathImgUsers + personaje.imagen)
        nombrePJ.text(personaje.nombre)
        nivelPJ.text(personaje.nivel)
        exp.text(personaje.barras.experiencia)
        expTotal.text(personaje.barras.experienciatotal)
        nombre = personaje.nombre
        sala = `${personaje.mapid}`



        if (items[personaje.inventario.slot1 - 1] !== undefined) {
            slot1.attr('src', pathImgItems + items[personaje.inventario.slot1 - 1].imagen)
        }
        if (items[personaje.inventario.slot2 - 1] !== undefined) {
            slot2.attr('src', pathImgItems + items[personaje.inventario.slot2 - 1].imagen)
        }
        if (items[personaje.inventario.slot3 - 1] !== undefined) {
            slot3.attr('src', pathImgItems + items[personaje.inventario.slot3 - 1].imagen)
        }
        if (items[personaje.inventario.slot4 - 1] !== undefined) {
            slot4.attr('src', pathImgItems + items[personaje.inventario.slot4 - 1].imagen)
        }
        if (items[personaje.inventario.slot5 - 1] !== undefined) {
            slot5.attr('src', pathImgItems + items[personaje.inventario.slot5 - 1].imagen)
        }
        if (items[personaje.inventario.slot6 - 1] !== undefined) {
            slot6.attr('src', pathImgItems + items[personaje.inventario.slot6 - 1].imagen)
        }
        if (items[personaje.inventario.slot7 - 1] !== undefined) {
            slot7.attr('src', pathImgItems + items[personaje.inventario.slot7 - 1].imagen)
        }
        if (items[personaje.inventario.slot8 - 1] !== undefined) {
            slot8.attr('src', pathImgItems + items[personaje.inventario.slot8 - 1].imagen)
        }
        if (items[personaje.inventario.slot9 - 1] !== undefined) {
            slot9.attr('src', pathImgItems + items[personaje.inventario.slot9 - 1].imagen)
        }
        if (items[personaje.inventario.slot10 - 1] !== undefined) {
            slot10.attr('src', pathImgItems + items[personaje.inventario.slot10 - 1].imagen)
        }
        if (items[personaje.inventario.slot11 - 1] !== undefined) {
            slot11.attr('src', pathImgItems + items[personaje.inventario.slot11 - 1].imagen)
        }
        if (items[personaje.inventario.slot12 - 1] !== undefined) {
            slot12.attr('src', pathImgItems + items[personaje.inventario.slot12 - 1].imagen)
        }

        if (items[personaje.inventario.manoizq - 1] !== undefined) {
            manoizq.attr('src', pathImgItems + items[personaje.inventario.manoizq - 1].imagen)
        }
        if (items[personaje.inventario.cabeza - 1] !== undefined) {
            cabeza.attr('src', pathImgItems + items[personaje.inventario.cabeza - 1].imagen)
        }
        if (items[personaje.inventario.torso - 1] !== undefined) {
            torso.attr('src', pathImgItems + items[personaje.inventario.torso - 1].imagen)
        }
        if (items[personaje.inventario.manoder - 1] !== undefined) {
            manoder.attr('src', pathImgItems + items[personaje.inventario.manoder - 1].imagen)
        }

        var htmlSala = '<h2 class="text-warning">Mapa <small>' + sala + '</small></h3>';

        nombreSala.html(htmlSala);
        let itemsEnMapa = [];
        for (let i = 0; i < maps[personaje.mapid -1].itemsid.length; i++) {
            itemsEnMapa.push( items[maps[personaje.mapid -1].itemsid[i] -1].nombre)
            
        }
       
        itemsEnMapa = itemsEnMapa.join(', ')
        itemsEnMapa = itemsEnMapa.length>0? ". Puedes ver algunos objetos por el lugar: "+ itemsEnMapa+ "." : "" 
        let result = personasMapa.length;
        console.log(result) 
        let personasEnMapa = ""
        if(result <= 3){
            personasEnMapa = "hay pocas personas a tu alrededor"
        }
        else if (result <= 6){
            personasEnMapa = "hay muchas personas a tu alrededor"
        } else if(result >= 7){
             personasEnMapa = "hay una multitud a tu alrededor"
        }
  
                    console.log(result,personasEnMapa)

            console.log("id del mapa del personaje :",maps[personaje.mapid -1])
         let criaturasEnMapa = maps[personaje.mapid -1].criaturasid.length
           
        console.log(criaturasEnMapa)
         if(criaturasEnMapa === 1){
            criaturasEnMapa = ". Hay una criatura cerca"
        }
        else if (criaturasEnMapa === 2){
            criaturasEnMapa = "hay varias criaturas a tu alrededor"
        } else if(criaturasEnMapa >= 3){
             criaturasEnMapa = "hay muchas criaturas a tu alrededor"
        }

        let textoArmado = `Te encuentras en ${description[personaje.mapid - 1].ubicacion} de ${description[personaje.mapid - 1].lugar}
         ${description[personaje.mapid - 1].detalles[0]} ${personasEnMapa}
        ${criaturasEnMapa} ${itemsEnMapa}
        `

    texto.text(textoArmado)

})

}





//referencias de jQuery
//variables de chat.html
var texto = $('#texto')
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var para = $('#para');
var btnBorrar = $('#btnBorrar');
var nombreSala = $('#nombreSala');
const imgPJ = $('#imgPJ');
const nombrePJ = $('#nombrePJ');
const nivelPJ = $('#nivelPJ');
const exp = $('#exp');
const expTotal = $('#expTotal');
var mapa = $('#mapa')
var manoizq = $('#izquierda')
var cabeza = $('#cabeza')
var torso = $('#torso')
var manoder = $('#derecha')

    ;
var buscar = $('#buscar');
var target;
const btn1 = $('#btn1');
const btn2 = $('#btn2');
const btn3 = $('#btn3');
const btn4 = $('#btn4');
const btn5 = $('#btn5');
const btn6 = $('#btn6');
const btn7 = $('#btn7');
const btn8 = $('#btn8');
const btn9 = $('#btn9');
const btn10 = $('#btn10');
const btn11 = $('#btn11');
const btn12 = $('#btn12');

const inp1 = $('#inp1');
const inp2 = $('#inp2');
const inp3 = $('#inp3');
const inp4 = $('#inp4');
const inp5 = $('#inp5');
const inp6 = $('#inp6');
const inp7 = $('#inp7');
const inp8 = $('#inp8');
const inp9 = $('#inp9');
const inp10 = $('#inp10');
const inp11 = $('#inp11');
const inp12 = $('#inp12');

const slot1 = $('#slot1')
const slot2 = $('#slot2')
const slot3 = $('#slot3')
const slot4 = $('#slot4')
const slot5 = $('#slot5')
const slot6 = $('#slot6')
const slot7 = $('#slot7')
const slot8 = $('#slot8')
const slot9 = $('#slot9')
const slot10 = $('#slot10')
const slot11 = $('#slot11')
const slot12 = $('#slot12')

var divTexto = $('#divTexto');

//funciones para renderizar usuarios

function renderAccion(mensaje) {

    var html = ''
    html += '<p class="accion">' + mensaje + '</p>';
    divTexto.html(html)
}

async function renderizarUsuarios(personas) {
    //cargo las variables que necesito para meter en la interface
    //traigo la data desde socket-chat donde ya las cargue al logear
    await interface()

    var html = '';
    html += '<li>';
    html += ' <a href="javascript:void(0)" class="active"> Chat de <span> ' + sala + '</span></a>';
    html += '</li>';

    for (let i = 0; i < personas.length; i++) {

        html += '<li>';
        html += ' <a data-id="' + personas[i].id + '" data-nombre="' + personas[i].nombre + '" href="javascript:void(0)"><img src="' + personas[i].img + '" alt="user-img" class="img-circle"> <span>' + personas[i].nombre + '<small class="text-success">online</small></span></a>';
        html += '</li>';

    }



    divUsuarios.html(html);


}


function renderizarMensajes(mensaje, yo, privado) {

    var html = "";
    var fecha = new Date(mensaje.fecha);
    if (fecha.getMinutes('MM') < 10) {
        var hora = fecha.getHours() + ":0" + fecha.getMinutes();
    } else {
        var hora = fecha.getHours() + ":" + fecha.getMinutes();
    }

    var adminClass = "info";
    if (privado) {
        adminClass = "success";
    }
    if (mensaje.nombre === "Administrador") {
        adminClass = "text-warning";
        mensaje.mensaje = '--' + mensaje.mensaje + '--'
    } else {

        mensaje.mensaje = ' ' + mensaje.nombre + ': ' + mensaje.mensaje
    }

    if (!yo) {
        html += '<li class="animated fadeIn">';
        if (mensaje.nombre !== "Administrador") {
            //   html += '    <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
            html += '    <div class="chat-content">';
            //   html += '        <h5>'+ mensaje.nombre +'</h5>';   
        }
        html += '    <div class="chat-content">';
        if (privado) {
            html += '        <div class="box">' + 'Privado: ' + mensaje.mensaje + '</div>';
        } else {
            html += '        <div class="box">' + mensaje.mensaje + '</div>';
        }
        html += '    </div>';
        //       html += '    <div class="chat-time">'+ hora +'</div>';
        html += '</li>';

    } else {
        html += '<li class="reverse">'
        html += '   <div class="chat-content">'
        //      html += '       <h5>'+ mensaje.nombre +'</h5>'
        if (privado) {
            html += '       <div class="box">' + 'Privado: ' + mensaje.mensaje + '</div>'
        } else {
            html += '       <div class="box">' + mensaje.mensaje + '</div>'
        }
        html += '   </div>'
        //  html += '   <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>'
        //          html += '   <div class="chat-time">'+ hora +'</div>'
        html += '</li>'

    }



    divChatbox.append(html);

}

function scrollBottom() {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}

//listeners


//filtrar users segun lo tipeado en busqueda
buscar.on("input", (e) => {
    let data = {
        filtro: e.target.value,
        sala: sala
    }
    socket.emit('busqueda', data);
})

divUsuarios.on('click', 'a', function () {
    var id = $(this).data("id");
    var nombre = $(this).data("nombre");
    var user = {
        id,
        nombre
    }
    if (id) {
        target = user;
        para.val(user.nombre);
    }
})
btn1.on("click", () => {
    txtMensaje.val(inp1.val())
})
btn2.on("click", () => {
    txtMensaje.val(inp2.val())
})
btn3.on("click", () => {
    txtMensaje.val(inp3.val())
})
btn4.on("click", () => {
    txtMensaje.val(inp4.val())
})
btn5.on("click", () => {
    txtMensaje.val(inp5.val())
})
btn6.on("click", () => {
    txtMensaje.val(inp6.val())
})
btn7.on("click", () => {
    txtMensaje.val(inp7.val())
})
btn8.on("click", () => {
    txtMensaje.val(inp8.val())
})
btn9.on("click", () => {
    txtMensaje.val(inp9.val())
})
btn10.on("click", () => {
    txtMensaje.val(inp10.val())
})
btn11.on("click", () => {
    txtMensaje.val(inp11.val())
})
btn12.on("click", () => {
    txtMensaje.val(inp12.val())
})


btnBorrar.on("click", () => {
    para.val("");
    target = "";
})

formEnviar.on('submit', function (e) {
    e.preventDefault();
    if (txtMensaje.val().trim().length === 0) {
        return
    };
    const primerPalabra = txtMensaje.val().trim().split(' ')[0]
    const comandos = ['/ir', '/comerciar', '/tirar', '/usar']
    if (comandos.includes(primerPalabra)) {

        renderAccion(txtMensaje.val())
        txtMensaje.val("")

    } else {

        if (target) {
            socket.emit('mensajePrivado', {
                nombre: nombre,
                mensaje: txtMensaje.val(),
                para: target.id
            }, function (mensaje) {
                txtMensaje.val("").focus();
                renderizarMensajes(mensaje, true, true);
                scrollBottom();
            });
        } else {
            //    Enviar información
            socket.emit('crearMensaje', {
                nombre: nombre,
                mensaje: txtMensaje.val()
            }, function (mensaje) {
                txtMensaje.val("").focus();
                renderizarMensajes(mensaje, true, false);
                scrollBottom();
            });

        }

    }

})