const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const User = require('../models/UserModel.js');


module.exports = (req, res, next) => {
	logger.debug('[jwtVerify]', 'Parametros', req.headers['x-access-token']);
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];

    // decode token
    if (token) {
		logger.debug('[jwtVerify]', 'Token existente', req.headers['x-access-token']);
		logger.debug('[jwtVerify]', 'Buscar uma empresa com o token passado');
        // verifies secret and checks exp
        User.findOne({
                accessToken: token
            }).lean()
            .then((user) => {
                if (!user) { //Não encontre companhia cadastrada com o token passado
					logger.error('[jwtVerify]', 'Não foi encontrada Empresa com o token passado', user);
                    return res.status(401).json({
                        success: false,
                        msg: 'Token inválido!'
                    });
                }
				logger.debug('[jwtVerify]', 'Empresa encontrada com o token passado', user._id, user.name);
				logger.debug('[jwtVerify]', 'Verificar validade do token...');
                jwt.verify(token, config.secret, function(err, decoded) {
                    if (err) {
						logger.error('[jwtVerify]', 'Falha ao verificar validade do token', err);
                        return res.status(401).json({
                            success: false,
                            msg: 'Falha ao verificar token de acesso. Tente novamente!'
                        });
                    } else {
                        logger.debug('[jwtVerify]', 'Token valido. Salvar valor do token na req.userID', decoded._id);
                        req.userID = decoded._id;
                        next();
                    }
                });
            })
            .catch((err) => { //Não seja encontrado um token válido no BD
				logger.error('[jwtVerify]', 'Token inválido. Nenhuma empresa com o token passado', err.errmsg);
                return res.status(401).json({
                    success: false,
                    msg: 'Token Inválido!',
					err: err.errmsg
                });
            });
    } else {
		logger.error('[jwtVerify]', 'Não foi passado token no HEADER');
        // if there is no token
        // return an error
        return res.status(401).json({
            success: false,
            message: 'O envio do token é obrigatório!'
        });
    }
};
