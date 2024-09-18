/*
 *	Implementacion propia de joi (Libreria de validaciones)
 */
 
 /*
 *	1) Importo dependencias
 */
 const joi = require('joi');

 // Constantes
 const EXCEPTIONS = require('../consts/exceptions.json');
 // Opciones de validacion de Joi
 const validationOptions = {
   abortEarly: false,	// false = devuelve todos los errores de validacion. true = solo devuelve el primer error
   allowUnknown: true,	// permite que los objetos recibidos tengan otras claves ademas de las especificadas en el Schema.
   stripUnknown: true 	// elimina las claves que no estan especificadas en el schema una vez validado el objeto
 };
 
 
 // Wrapper para validacion de datos
 async function validateData(data, schema, useJoiError = true) {
     return await joi.validate(data, schema, validationOptions, (err, validatedData) => {
         // Compruebo si hubo errores en la validacion
         if (err) {
             // Si los hay, le doy un formato personalizado a los errores
             let joiError = {
                 status: EXCEPTIONS.validationError,
                 fields: {}
             };
             
             // Recorro los errores y devuelvo string personalizado segun su tipo
             const errDetailsLength = err.details.length;
             for (let i = 0; i < errDetailsLength; i++) {
                 if (!joiError.fields.hasOwnProperty(err.details[i].context.key)) {
                     joiError.fields[err.details[i].context.key] = [];
                 }
                 
                 switch (err.details[i].type) {
                     case 'any.required':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationRequiredField
                         });
                         break;
                     case 'any.allowOnly':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationInvalidField,
                             allowedValues: err.details[i].context.valids
                         });
                         break;
                     case 'number.base':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationNumberInvalid
                         });
                         break;
                     case 'number.integer':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationNumberInteger
                         });
                         break;
                     case 'number.min':
                         if (err.details[i].context.limit == 0) {
                             joiError.fields[err.details[i].context.key].push({
                                 error: EXCEPTIONS.validationRequiredField
                             });
                         } else {
                             joiError.fields[err.details[i].context.key].push({
                                 error: EXCEPTIONS.validationNumberMin,
                                 minimumNumber: err.details[i].context.limit
                             });
                         }
                         break;
                     case 'number.max':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationNumberMax,
                             maximumNumber: err.details[i].context.limit
                         });
                         break;
                     case 'string.min':
                         if (err.details[i].context.limit == 1) {
                             joiError.fields[err.details[i].context.key].push({
                                 error: EXCEPTIONS.validationRequiredField
                             });
                         } else {
                             joiError.fields[err.details[i].context.key].push({
                                 error: EXCEPTIONS.validationStringMin,
                                 minimumLength: err.details[i].context.limit
                             });
                         }
                         break;
                     case 'string.max':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationStringMax,
                             maximumLength: err.details[i].context.limit
                         });
                         break;
                     case 'string.regex.base':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationInvalidField,
                             regex: err.details[i].context.pattern.toString()
                         });
                         break;
                     case 'string.email':
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationStringInvalidEmail
                         });
                         break;
                     default:
                         joiError.fields[err.details[i].context.key].push({
                             error: EXCEPTIONS.validationInvalidField
                         });
                 }
             }
             
             // Si alguno de los campos fallo por validacion "required" elimino todos los demas errores de validacion asociados a ese campo
             for (let property in joiError.fields) {
                 if (joiError.fields.hasOwnProperty(property)) {
                     let errorsLength = joiError.fields[property].length;
                     for (let i = 0; i < errorsLength; i++) {
                         if (joiError.fields[property][i].error == EXCEPTIONS.validationRequiredField) {
                             joiError.fields[property] = [joiError.fields[property][i]];
                             break;
                         }
                     }
                 }
             }
             
             // Mensaje de error personalizado alternativo
       const customError = {
         status: EXCEPTIONS.validationError,
       };
             
             return useJoiError ? joiError : customError;
         }
         
         // Devuelvo el objeto ya validado
         return validatedData;
     });
 }
 
 
 module.exports = {
     validateData
 };