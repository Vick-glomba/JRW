const DAL = require('../DAL/baseDAL.js'); //reemplazar cuando se arma
const joiWrapper = require('../middlewares/joiWrapper.js');
const joi = require('joi');
const EXCEPTIONS = require('../consts/exceptions.json');

// Constantes exclusivas
const numberFields= ['id', 'roomid', 'dificult', 'score'] //modificar por la data a formatear

const formatData = (data) => {    
  for (const key in data) {
    if (data[key] === null) {
      data[key] = '';
    }
    if (numberFields.includes(key)) {
      data[key] = Number(data[key])
    }
  }
  return data;
};

const joiDataValidator = async (item, schema) => {
    let joiValidation = await joiWrapper.validateData(item, schema);
    joiValidation = JSON.parse(JSON.stringify(joiValidation));
    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    } else {
        return {};
    }
};


//Obtiene todos
const get = async () => {
    let result;
    try {
        result = await DAL.get();
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: "OK", result }
};

//Agrega 
const add = async (data) => {

    const joiValidation = await joiDataValidator(data, {
        // username: joi.string().min(4).max(20).required(),
        // password: joi.string().min(4).max(20).required()
        //     .regex(/([A-Za-z0-9])/),
        // name: joi.string().min(4).max(100).required(),
        // mail: joi.string().min(4).max(100).required()
        //     .regex(/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/),
        // birthdate: joi.date().iso().required(),
        // avatar: joi.string().max(254).required().allow('', null)
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    formatData(data);

    let result;
    try {
        result = await DAL.add(data);
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

//Actualiza 
const update = async (data) => {

    let joiValidation = await joiDataValidator(data, {

    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }
    
    formatData(data)

    let result;
    try {
        result = await DAL.update(data);
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};
//Borra 
const remove = async (data) => {

    const joiValidation = await joiDataValidator(data, {
        id: joi.number().required()
    });

    if (joiValidation.hasOwnProperty('status')) {
        return joiValidation;
    }

    formatData(data);

    let result;
    try {
        result = await DAL.remove(data.id);
        if (result) {
            return { status: "OK" }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};


//Obtiene segun el id
const getByID = async (id) => {
    let result;
    try {
        result = await DAL.getByID(Number(id));
        if (result[0]) {
            return { status: "OK", result }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};

//Obtiene segun el nombre
const getByName = async (name) => {
    let result;
    try {
        result = await DAL.getByName(name);
        if (result[0]) {
            return { status: "OK", result }
        }
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
    return { status: EXCEPTIONS.invalidData }
};


module.exports = {
    get,
    add,
    update,
    remove,
    getByID,
    getByName
};