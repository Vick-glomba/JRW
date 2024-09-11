var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala') || !params.has('img')) {
    window.location = 'index.html';
    console.error('El nombre y sala son necesarios, imagen tambien');
}


var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala'),
    img: params.get('img')
};



socket.on('connect', function() {
    console.log('Conectado al servidor');

    socket.emit('entrarChat', usuario, function(resp) {
        renderizarUsuarios(resp);
        console.log(usuario)
    });

});

// escuchar
socket.on('disconnect', function() {

    console.log('Perdimos conexión con el servidor');

});


// Escuchar información
socket.on('crearMensaje', function(mensaje) {
    
    renderizarMensajes(mensaje, false, false);
    scrollBottom();
});

// Escuchar cambios de usuarios
// cuando un usuario entra o sale del chat
socket.on('listaPersona', function(personas) {
    renderizarUsuarios(personas);
});



// Mensajes privados
socket.on('mensajePrivado', function(mensaje) {
    renderizarMensajes(mensaje, false, true);
    scrollBottom();
    console.log('Mensaje Privado:', mensaje);

});