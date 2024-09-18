/*
 *	Implementacion propia de encriptacion. Actualmente se soporta:
 *		Hmac con hex y UTF-8, para SHA256 y SHA512
 *		Bcrypt
 *		AES-256-CBC
 */
 
 /*
 *	1. Importo dependencias
 */
const crypto = require('crypto');		// Libreria nativa de Node.js para encriptacion
const bcrypt = require('bcryptjs');	// Libreria de Bcrypt

// Constantes
const KEYS = require('../consts/keys.json');
const KEY = KEYS.encryption_key;
const ENCRYPTIONSALT = KEYS.encryption_salt;
const HASHSALT = KEYS.hash_salt;


/*
 *	2. Funciones
 */
// Funcion para hashear un dato segun si es SHA512, SHA256, o Bcrypt, y convierte el resultado a UTF8
function hashUTF8(dato, metodoEncriptacion = 'bcrypt') {
	return new Promise( (resolve, reject) => {
		// Limpieza de entrada de datos en "metodoEncriptacion"
		if (metodoEncriptacion == 256 || metodoEncriptacion == 'sha256' || metodoEncriptacion == 'SHA256') {
			metodoEncriptacion = 'sha256';
		} else if (metodoEncriptacion == 512 || metodoEncriptacion == 'sha512' || metodoEncriptacion == 'SHA512') {
			metodoEncriptacion = 'sha512';
		} else if (metodoEncriptacion == 'bcrypt' || metodoEncriptacion == 'BCRYPT') {
			metodoEncriptacion = 'bcrypt';
		} else {
			// Se recibio un metodo de encriptacion invalido
			return reject(false);
		}
		
		if (metodoEncriptacion === 'sha256' || metodoEncriptacion === 'sha512') {
			// Metodo: hasheo SHA256 o SHA512
			const hashed = crypto.createHmac(metodoEncriptacion, HASHSALT).update(dato).digest('hex');
			return resolve(hashed);
		}
		
		// Metodo: Bcrypt
		bcrypt.hash(dato, 8, (err, hash) => {
			if (err) {
				return reject(err);
			}
			
			resolve(hash);
		});
	});
}

// Funcion para comprar la validez de un hash SHA512, SHA256 o Bcrypt
function checkHash(dato, hash, metodoEncriptacion = 'bcrypt') {
	return new Promise( (resolve, reject) => {
		// Limpieza de entrada de datos en "metodoEncriptacion"
		if (metodoEncriptacion == 256 || metodoEncriptacion == 'sha256' || metodoEncriptacion == 'SHA256') {
			metodoEncriptacion = 'sha256';
		} else if (metodoEncriptacion == 512 || metodoEncriptacion == 'sha512' || metodoEncriptacion == 'SHA512') {
			metodoEncriptacion = 'sha512';
		} else if (metodoEncriptacion == 'bcrypt' || metodoEncriptacion == 'BCRYPT') {
			metodoEncriptacion = 'bcrypt';
		} else {
			// Se recibio un metodo de encriptacion invalido
			return reject(false);
		}
		
		if (metodoEncriptacion === 'sha256' || metodoEncriptacion === 'sha512') {
			// Metodo: compruebo hash SHA256 o SHA512
			const hashed = crypto.createHmac(metodoEncriptacion, HASHSALT).update(dato).digest('hex');
			if (hashed == hash) {
				return resolve(true);
			}
			return resolve(false);
		}
		
		// Metodo: Bcrypt
		bcrypt.compare(dato, hash, (err, res) => {
			if (err) {
				return reject(err);
			}
			
			resolve(res);
		});
	});
}

// Funcion para encriptar un dato con AES-256-CBC
function encrypt(data, customKey = false, customSalt = false) {
	// Encryption Key
	let encryptionKeyString;
	if (customKey) {
		// Encripto utilizando la clave recibida
		encryptionKeyString = customKey;
	} else {
		// Encripto utilizando la clave configurada
		encryptionKeyString = KEY;
	}
	// Salt
	let saltString;
	if (customSalt) {
		// Encripto utilizando la clave recibida
		saltString = customSalt;
	} else {
		// Encripto utilizando la clave configurada
		saltString = ENCRYPTIONSALT;
	}
	
	// Si para encriptar se recibio un dato que no es un string (por ejemplo un objeto), lo paso a string
	if (typeof data !== 'string') {
		data = JSON.stringify(data);
	}
	
	// Genero la clave en base al string de clave recibido/configurado
	const encryptionKey = crypto.scryptSync(encryptionKeyString, saltString, 32);
	// Genero vector de inicializacion
	const iv = crypto.randomBytes(16);
	
	// Encriptacion
	const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
	let encryptedData = cipher.update(data);
	encryptedData = Buffer.concat([encryptedData, cipher.final()]);
	
	// Formateo de resultado de encriptacion. Agrego el dato encriptado, el vector de inicializacion, y lo devuelvo en formato Base64
	let encryptedResult = {
		iv: iv.toString('base64'),
		encryptedData: encryptedData.toString('base64')
	};
	encryptedResult = JSON.stringify(encryptedResult);
	let encryptedResultBuffer = Buffer.from(encryptedResult);
	
	return encryptedResultBuffer.toString('base64');
}

// Funcion para desencriptar un dato con AES-256-CBC
function decrypt(data, customKey = false, customSalt = false) {
	// Encryption key
	let encryptionKeyString;
	if (customKey) {
		// Desencripto utilizando la clave recibida
		encryptionKeyString = customKey;
	} else {
		// Desencripto utilizando la clave configurada
		encryptionKeyString = KEY;
	}
	// Salt
	let saltString;
	if (customSalt) {
		// Encripto utilizando la clave recibida
		saltString = customSalt;
	} else {
		// Encripto utilizando la clave configurada
		saltString = ENCRYPTIONSALT;
	}
	
	// Formateo el valor encriptado de nuevo a un objeto
	const encodedBuffer = Buffer.from(data, 'base64');  
	const encodedString = encodedBuffer.toString('utf-8');
	let encodedObject;
	let decryptedData;
	try {
		encodedObject = JSON.parse(encodedString);
		
		// Genero la clave en base al string de clave recibido/configurado
		const encryptionKey = crypto.scryptSync(encryptionKeyString, saltString, 32);
		// Obtengo vector de inicializacion
		const iv = Buffer.from(encodedObject.iv, 'base64');
		
		// Desencriptado
		const encryptedData = Buffer.from(encodedObject.encryptedData, 'base64');
		const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
		decryptedData = decipher.update(encryptedData);
		decryptedData = Buffer.concat([decryptedData, decipher.final()]);
		decryptedData = decryptedData.toString();
	} catch (err) {
		// El string a desencriptar es invalido! Causa posible: Fue encriptado con otra clave
		return '';
	}
	
	// Si el string desencriptado es un JSON, lo paso a objeto de javascript y lo devuelvo. De lo contrario, devuelvo el string
	try {
		return JSON.parse(decryptedData);
	} catch (error) {
		return decryptedData;
	}
}

module.exports = {
	hashUTF8,
	checkHash,
	encrypt,
	decrypt
};