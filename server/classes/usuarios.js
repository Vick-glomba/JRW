const usersService = require("../../src/services/usersService");

//ESTE ES EL SERVER

class Usuarios {

    constructor() {
        this.personas = [];
        this.mundo = []
        this.mundo.personajes = [];
        this.mundo.barras = [];
        this.mundo.maps = [];
        this.mundo.criaturas = [];
        this.mundo.items = [];
        this.mundo.hechizos =[];
        this.mundo.habilidades = [];
        this.mundo.inventario = [];
        this.mundo.description = [];
    
    }

    obtener(tabla, id) {
        return this.mundo[tabla][id - 1]
    }
    obtenerTabla(tabla) {
        return this.mundo[tabla]
    }


    agregarPersona(id, nombre, sala, img) {

        let persona = { id, nombre, sala, img };

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

        if (respTabla.result[0]) {
            this.mundo[tabla] = respTabla.result   
        } else {
            console.log("No cago la tabla: ", tabla)
        }

    }
}



module.exports = {
    Usuarios
}