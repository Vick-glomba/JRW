const usersService = require("../../src/services/usersService");

//ESTE ES EL SERVER



//creador tabla para ver los mapas y poder analizar si pasa bien de mapa a mapa
const ancho = 15
const alto = 10
const mapasTotal = ancho * alto
let arrayFilas = []
let fila = []

    for (let i = 1; i <= mapasTotal; i++) {
        fila.push(i) ;
        if(i%ancho === 0){
            arrayFilas.push(fila)
            fila = []
        }   
    }   
    console.table(arrayFilas)
 


class Usuarios {

    constructor() {
        this.personas = [];
        this.mundo = []
        this.mundo.dimensiones = [ ancho, alto]
        this.mundo.personajes = {};
        this.mundo.barras = {};
        this.mundo.maps = {};
        this.mundo.criaturas = {};
        this.mundo.items = {};
        this.mundo.hechizos ={};
        this.mundo.habilidades = {};
        this.mundo.inventario = {};
        this.mundo.description = {};
        
        console.log("ancho:", this.mundo.dimensiones[0], "alto:" ,this.mundo.dimensiones[1])
    }
    
    actualizarPersonaje(personajeID, mapaVa) {
         this.mundo.personajes[personajeID ].mapid = mapaVa
    }
    obtenerMundo() {
        return { 
            dimensiones: {
             ancho : this.mundo.dimensiones[0],
             alto : this.mundo.dimensiones[1],
            },
            maps: this.mundo.maps}
    }
    obtener(tabla, id) {
        return this.mundo[tabla][id ]
    }
    obtenerTabla(tabla) {
        return this.mundo[tabla]
    }


    agregarPersona(id, nombre, sala) {

        let persona = { id, nombre, sala};

        this.personas.push(persona);
        return this.personas;
    }

    getPersona(id) {
        let persona = this.personas.filter(persona => persona.id === id)[0]
        return persona;
    }

    getPersonas() {
        return this.personas;
    }

    getPersonasPorSala(sala) {
        let personasEnSala = this.personas.filter(persona => persona.sala === sala);
        return personasEnSala;
    }
    borrarPersona(id) {
        let personaBorrada = this.getPersona(id);
        this.personas = this.personas.filter(persona => persona.id != id);

        return personaBorrada;
    }



    //hechizos habilidades items criaturas mapas
    cargarMundo = async () => {

        try {
            await this.cargarTabla("personajes")
            await this.cargarTabla("maps")
            await this.cargarTabla("criaturas")
            await this.cargarTabla("items")
            await this.cargarTabla("hechizos")
            await this.cargarTabla("habilidades")
            await this.cargarTabla("barras")
            await this.cargarTabla("inventario")
            await this.cargarTabla("description")
            console.log("CARGO MUNDO CORRECTAMENTE", Object.keys(this.mundo))

        } catch (error) {
            console.log("Fallo en la carga de mundo")

        }


    }
    cargarTabla = async (tabla) => {
        let respTabla = await usersService.getAll(tabla)
        let arrayToObject = {}

        if (respTabla.result[0]) {
        respTabla.result.forEach( indice => {
           arrayToObject[indice.id] = indice      
        });       
            this.mundo[tabla] = arrayToObject  
        } else {
            console.log("No cargo la tabla: ", tabla)
        }

    }
}



module.exports = {
    Usuarios
}