const express = require('express'); // Framework para aplicaciones web y REST API
const router = express.Router();

const usersController = require('../src/controllers/usersController');
const { verifyToken } = require('../src/middlewares/jwtWrapper');


router.route('/api/version').get((req, res, next) => {
    res.status(200).json({ version: '0.0.1' });
});
 router.route('/api/verifyToken').get(usersController.verifyToken);
//Users
router.route('/api/users/login').post(usersController.login);
router.route('/api/user').get(usersController.getUser);
router.route('/api/personaje/login').post(usersController.loginPersonaje);
router.route('/api/personaje').get(usersController.getPersonajeByID);
router.route('/api/map').get(usersController.getMapByID);
router.route('/api/barras').get(usersController.getBarrasByID);
router.route('/api/inventario').get(usersController.getInventarioByID);
router.route('/api/personaje/crear').post(usersController.crearPersonaje);
router.route('/api/user/register').post(usersController.register);
router.route('/api/users').put();
router.route('/api/users').delete();

//cargar mundo

router.route('/api/tablas').get(usersController.getTablas);


module.exports = router;