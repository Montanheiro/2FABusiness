const config = require('../config/config.js');
const jwt = require('jsonwebtoken');
const Company = require('../models/CompanyModel.js');


module.exports = (user) => {
    logger.debug('[generateJWT]', 'Parametros', user._id);
    return new Promise((success, reject) => {
        //cria o token com validade de 24h
        let token = jwt.sign({
            _id: user._id
        }, config.secret, {
            expiresIn: '7d' //(seconds) 24h
        });
		logger.debug('[generateJWT]', 'Token gerado com sucesso', token);
		logger.debug('[generateJWT]', 'Salvar token no BD...');
        //Salva o Token criado para conferencia
        Company.update({
                _id: user._id
            }, {
                $set: {
                    accessToken: token
                }
            })
            .then((userMod) => { //É retornado o token salvo no BD
				logger.debug('[generateJWT]', 'Token salvo com sucesso', userMod);
                success({
                    success: true,
                    token: token
                });
            })
            .catch((err) => { //Caso algum erro ocorra, inviabiliza o token
				logger.error('[generateJWT]', 'Erro ao salvar token no DB', err.errmsg);
                reject({
                    success: false,
                    token: null,
					err: err.errmsg
                });
            });
    });
}
