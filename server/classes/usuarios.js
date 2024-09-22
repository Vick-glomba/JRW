const usersService = require("../../src/services/usersService");

//ESTE ES EL SERVER



 


class Usuarios {

    constructor() {
        this.personas = [];
        this.mundo = []
        this.mundo.dimensiones = [ 10, 20]
        this.mundo.personajes = {};
        this.mundo.barras = {};
        this.mundo.maps = {};
        this.mundo.criaturas = {};
        this.mundo.items = {};
        this.mundo.hechizos ={};
        this.mundo.habilidades = {};
        this.mundo.inventario = {};
        this.mundo.description = {};
        this.mundo.enviroments = {};
        
        console.log("ancho:", this.mundo.dimensiones[0], "alto:" ,this.mundo.dimensiones[1])
    }
    
    cambiarUbicacion(viejaUid,nuevaUid) {  
      
       let mapaViejo =this.mundo.maps[viejaUid]
       mapaViejo.uid = nuevaUid
       delete this.mundo.maps[viejaUid]
      
        this.mundo.maps[mapaViejo.uid] = mapaViejo     
        return 
    }
    cambiarTamaño(ancho, alto) {
   
        this.mundo.dimensiones = [ancho ,alto ]
        console.log("ahora el mapa mide:", this.mundo.dimensiones)
        return 
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
            maps: this.mundo.maps,
            enviroments: this.mundo.enviroments
        }
    }
    obtener(tabla, uid) {
        return this.mundo[tabla][uid]
    }
    obtenerTabla(tabla) {
        return this.mundo[tabla]
    }


    agregarPersona(uid, nombre, sala) {

        let persona = { uid, nombre, sala};

        this.personas.push(persona);
        return this.personas;
    }

    getPersona(uid) {
        let persona = this.personas.filter(persona => persona.uid === uid)[0]
        return persona;
    }

    getPersonas() {
        return this.personas;
    }

    getPersonasPorSala(sala) {
        let personasEnSala = this.personas.filter(persona => persona.sala === sala);
        return personasEnSala;
    }
    borrarPersona(uid) {
        let personaBorrada = this.getPersona(uid);
        this.personas = this.personas.filter(persona => persona.uid != uid);

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
            await this.cargarTabla("enviroments")
            
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
           arrayToObject[indice.uid] = indice      
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