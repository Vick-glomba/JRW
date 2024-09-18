/*
 *	Declaracion de funciones auxiliares asociadas a manejo de generacion de valores aleatorios
 */
 
// Genera un PIN aleatorio
function generatePIN(digits = 4) {
	let pin = '';
	for (let i = 0; i < digits; i++) {
		pin += Math.floor(Math.random() * 10);
	}
	
	return pin;
}

// Genera un numero aleatorio
function generateRandomNumberSequence(digits = 10) {
	let sequence = '';
	for (let i = 0; i < digits; i++) {
		sequence += Math.floor(Math.random() * 10);
	}
	
	return sequence;
}

// Genera un string aleatorio
function generateRandomString(length = 16) {
	let result = '';
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	
	return result;
}

// Genera un string aleatorio (case sensitive)
function generateRandomStringCaseSensitive(length = 16) {
	let result = '';
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	
	return result;
}

module.exports = {
  generatePIN,
	generateRandomNumberSequence,
	generateRandomString,
	generateRandomStringCaseSensitive
};