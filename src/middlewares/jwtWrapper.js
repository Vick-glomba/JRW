const jwt = require('jsonwebtoken');

const cryptWrapper = require('./cryptWrapper');

//Constantes de claves
const KEYS = require('../consts/keys.json');
const JWTSIGNKEY = KEYS.jwt_sign_key;
const JWTENCRYPTIONKEY = KEYS.jwt_encryption_key;
const JWTENCRYPTIONSALT = KEYS.jwt_encryption_salt;

//Constantes
const EXCEPTIONS = require('../consts/exceptions.json');
const JWTCONFIG = require('../consts/jwt.json')
const AUTHORIZEDENDPOINTS = JWTCONFIG.authorized_endpoints;

//Declaro las opciones de verificacion (Algoritmo usado, tiempo de duracion de token, etc.)
const options = {
	expiresIn: JWTCONFIG.expiration_time,
	algorithm: JWTCONFIG.algorithm
};

//Wrapper para la función "verify" de JWT

const verifyToken = async (req, res, next) => {
	
	//si es un endpint que esta en el array de autorizados quiere decir que no voy a verificar token, entonces lo dejo pasar, estas apis no usan token
	const authorizedEndpointsLength = AUTHORIZEDENDPOINTS.length;
	for (let i = 0; i < authorizedEndpointsLength; i++) {
		if (req.url.includes('/' + AUTHORIZEDENDPOINTS[i])) {
			next();
			return;
		}
	}

	//Verifico que el token este presente el header del request
	let token = req.headers['authorization'];
	if (!token) {
		console.log('Intento de acceso a API sin autorizacion', req);
		return res.status(403).json({ status: EXCEPTIONS.noTokenProvided });
	}

// Elimino la porcion de texto que contiene "Bearer", si la contiene
if (token.substring(0, 7) === 'Bearer ') {
	token = token.slice(7);
} else if (token.substring(0, 6) === 'Bearer') {
	token = token.slice(6);
}
//Chequeo que el token sea valido
try {
	//intendo desencriptar el token que recibi, si falla es invalido
	let validToken = jwt.verify(token, JWTSIGNKEY, options);
	let decryptedToken = cryptWrapper.decrypt(validToken.token, JWTENCRYPTIONKEY, JWTENCRYPTIONSALT);
	if (!decryptedToken) {
		//El token es invalido
		console.log('Intento de acceso a API sin autorizacion (se utilizo un token invalido)', req);
		return res.status(403).json({ status: EXCEPTIONS.noTokenProvided });
	} else {
		req.token = decryptedToken;
	}
	next();
} catch (err) {
	// Si no es valido, termino la solicitud con un error
	console.log('Intento de acceso a API con token invalido', req, err);
	return res.status(403).json({ status: EXCEPTIONS.invalidTokenProvided });
}
}
//Wrapper para la funcion "sign" de JWT

function signToken(payload) {
	//Firmo y encripto token
	encryptedPayload = cryptWrapper.encrypt(payload, JWTENCRYPTIONKEY, JWTENCRYPTIONSALT);
	return jwt.sign({ token: encryptedPayload }, JWTSIGNKEY, options);

}


module.exports = {
	verifyToken,
	signToken
};