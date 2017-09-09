const User = require('../models/UserModel.js');
const Business = require('../models/BusinessModel.js');
const config = require('../config/config.js');
const jwt = require('jsonwebtoken');

module.exports = {
    signup: (req, res, next) => {
        logger.debug('[Login Controller]', 'Parametros Signup', req.body);
        //Cadastra uma nova empresa
        let newBusiness = new Business({
            name: req.body.businessName
        });
        newBusiness.save()
            .then((business) => {
                logger.debug('[Login Controller]', 'Empresa criada com sucesso');
                let newUser = new User(req.body);
                newUser.businessId = business._id;
                newUser.save()
                    .then((user) => { //Usuário criado com sucesso
                        logger.debug('[Login Controller]', 'Usuário salvo com sucesso');
                        res.status(200).json({
                            success: true,
                            msg: "Conta cadastrada com sucesso!",
                        });
                    })
                    .catch((err) => { //Algum erro durante a criaçãos
                        logger.error('[Login Controller]', 'Erro ao cadastrar Usuário', err);
                        res.status(500).json({
                            success: false,
                            msg: "Erro ao cadastrar nova conta. Tente novamente!",
                            err: err
                        });
                    });               
            })
            .catch((err) => {
                logger.error('[Login Controller]', 'Erro ao cadastrar Usuário', err);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao cadastrar nova empresa. Tente novamente!",
                    err: err,
                    req: req.body
                });
            });
    },

    //Realiza o login da empresa no sistema admin
    login: (req, res, next) => {
        logger.debug('[Login Controller]', 'Parametros login', req.body);
        let fields = {
            email: 1,
            password: 1
        };
        User.findOne({
                email: req.body.email
            }, fields)
            .then((user) => {
                logger.debug('[Login Controller]', 'Retorno dados do usuário', user.email);
                if (!user) { 
                    logger.debug('[Login Controller]', 'Não existe usuário com email fornecido');
                    res.status(500).json({
                        success: false,
                        token: null,
                        msg: 'A autenticação falhou. Conta não encontrada!'
                    });
                } else {
                    logger.debug('[Login Controller]', 'Empresa encontrada. Verificar senha...');
                    user.comparePassword(req.body.password, (err, isMatch) => {
                        if (isMatch && !err) { //Caso a senha passada esteja correta
                            logger.debug('[Login Controller]', 'Senha correta. Gerar token...');
                            require('../lib/generateJWT.js')(user)
                                .then((success) => {
                                    logger.debug('[Login Controller]', 'Token gerado com sucesso', success);
                                    res.status(200).json(success);
                                })
                                .catch((err) => {
                                    logger.error('[Login Controller]', 'Erro ao gerar Token', err);
                                    err.msg = "Erro ao gerar token. Tente novamente!";
                                    res.status(500).json(err);
                                })
                        } else { //Senha não corresponde com a cadastrada
                            logger.error('[Login Controller]', 'Senha informada incorreta', err);
                            res.status(500).json({
                                success: false,
                                token: null,
                                msg: 'A autenticação falhou. Senha incorreta!'
                            })
                        }
                    });
                }
            })
            .catch((err) => { //Erro ao buscar usuário e/ou senha
                logger.error('[Login Controller]', 'Erro ao recuperar dados da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'A autenticação falhou. Erro ao recuperar dados da conta.',
                    err: err.errmsg
                });
            });
    },

    //Realiza o logout da empresa do sistema admin
    logout: (req, res, next) => {
        logger.debug('[Login Controller]', 'Parametros logout', req.userID);
        const userID = req.userID; //Recupera a empresa logada pelo token passado

        //Invalida o token cadastrado para a empresa.
        User.update({
                _id: userID
            }, {
                $set: {
                    accessToken: null
                }
            })
            .then((data) => {
                logger.debug('[Login Controller]', 'Token invalidado com sucesso', data);
                res.status(200).json({
                    success: true,
                    msg: "Logout realizado com sucesso!"
                });
            })
            .catch((err) => {
                logger.error('[Login Controller]', 'Erro ao invalidar token', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Falha ao realizar o Logout. Tente novamente!",
                    err: err.errmsg
                });
            });
    },

    tokenVerify: (req, res, next) => {
        logger.debug('[Login Controller]', 'TokenVerify no middleware JWTVerify');
        res.status(200).json({
            success: true,
            msg: "Token válido!"
        });
    },

    recoveryPass: (req, res, next) => {
		//@TODO Passar email e cnpj e corporateName
        logger.debug('[Login Controller]', 'Parametros para recuperar senha', req.body);
		const newPass = 'cardapio01';
		logger.debug('[Login Controller]', 'Nova senha gerada', newPass);
		User.findOneAndUpdate({
                email: req.body.email
            }, {
                password: newPass
            })
            .then((userMod) => {
                logger.debug('[Login Controller]', 'Senha temporária salva com sucesso');
				req.body.newPass = newPass;
				require('../lib/email/recoveryPassEmail.js')(req.body)
				.then((result)=>{
					logger.debug('[Login Controller]', 'E-mail de recuperação de senha enviado com sucesso.', result);
					res.status(200).json({
	                    success: true,
	                    msg: "Senha recuperada com sucesso. Verifique seu e-mail!"
	                });
				})
                .catch((errEmail) => {
					logger.error('[Login Controller]', 'Erro ao enviar e-mail de recuperação de senha', errEmail);
					res.status(200).json({
	                    success: false,
	                    msg: "Senha atualizada com sucesso! Erro ao enviar e-mail."
	                }); //retorna o usuário criado
				})
            })
            .catch((err) => {
                logger.debug('[Login Controller]', 'Erro ao salvar senha temporária', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao buscar dados da empresa. Tente novamente!",
                    err: err.errmsg
                });
            })
    }
};
