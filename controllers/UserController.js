const User = require('../models/UserModel.js');

module.exports = {

    get: (req, res, next) => {
        logger.debug('[User Controller]', 'Parametros GETUser', req.companyID);
        let companyID = req.companyID;
        User.findOne({
                _id: companyID
            }).lean()
            .then((company) => {
                logger.debug('[User Controller]', 'Dados da empresa recuperados com sucesso', company);
                res.status(200).json({
                    success: true,
                    company: company
                })
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[User Controller]', 'Erro ao recuperar dados da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao buscar os dados da companhia!',
                    company: null,
                    err: err.errmsg
                });
            });
    },


    edit: (req, res, next) => {
        logger.debug('[User Controller]', 'Parametros editUser', req.companyID, req.body);
        //Pegar dados da compania logada, via token
        const companyID = req.companyID;
        const companyUpd = {
            fantasyName: req.body.fantasyName,
            corporateName: req.body.corporateName,
            email: req.body.email,
            cpnj: req.body.cpnj,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            address: req.body.address,
            social: req.body.social,
            friendlyUrl: req.body.friendlyUrl
        };

        User.update({
                _id: companyID
            }, {
                $set: companyUpd
            })
            .then((companyMod) => { //Caso a companhia seja alterada com sucesso, a retorna ao cliente
                //Como foi realizada uma alteração nos dados do usuário, um novo token é gerado
                //cria o token com validade de 24h
                logger.debug('[User Controller]', 'Empresa editada com sucesso', companyMod);
                logger.debug('[User Controller]', 'Gerar novo token...');
                require('../lib/generateJWT.js')(companyMod)
                    .then((success) => {
                        logger.debug('[User Controller]', 'Token gerado com sucesso', success);
                        res.status(200).json(success);
                    })
                    .catch((err) => {
                        logger.error('[User Controller]', 'Erro ao gerar novo token', err);
                        err.msg = "Erro ao gerar token na edição da empresa. Tente novamente!";
                        res.status(500).json(err);
                    })
            })
            .catch((err) => { //Caso aconteca algum erro na edição
                logger.error('[User Controller]', 'Erro ao editar empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    token: null,
                    msg: 'Erro ao editar Empresa. Tente novamente!',
                    err: err.errmsg
                });
            });
    },

    changePassword: (req, res, next) => {
        //Pegar dados da compania logada, via token
        logger.debug('[User Controller]', 'Parametros changePassword', req.companyID, req.body);
        const companyID = req.companyID;
        let fields = {
            email: 1,
            password: 1
        };

        User.findOne({
                _id: companyID
            }, fields)
            .then((company) => {
                logger.debug('[User Controller]', 'Dados da empresa recuperados', company);
                if (!company) { //Não foi encontrado companhia com o name passado
                    logger.debug('[User Controller]', 'Erro ao encontrar empresa com email passado', company);
                    res.status(500).json({
                        success: false,
                        token: null,
                        msg: 'A autenticação falhou. Empresa não encontrada!'
                    });
                } else {
                    logger.debug('[User Controller]', 'Empresa encontrada. Verificar senha passada', company);
                    company.comparePassword(req.body.oldPassword, (err, isMatch) => {
                        if (isMatch && !err) { //Caso a senha passada esteja correta
                            //Altera somente o password da compania logada
                            logger.debug('[User Controller]', 'Senha correta. Atualizar senha no DB...');
                            User.findOneAndUpdate({
                                    _id: companyID
                                }, {
                                    password: req.body.newPassword
                                })
                                .then((companyMod) => { //Caso a companhia seja alterada com sucesso, a retorna ao cliente
                                    logger.debug('[User Controller]', 'Senha atualizada com sucesso', companyMod);
                                    if (companyMod) {
                                        logger.debug('[User Controller]', 'Gerar novo Token...');
                                        require('../lib/generateJWT.js')(companyMod)
                                            .then((success) => {
                                                logger.debug('[User Controller]', 'Token gerado com sucesso. Senha alterada!', success);
                                                success.msg = "Senha alterada com sucesso!";
                                                res.status(200).json(success);
                                            })
                                            .catch((err) => {
                                                logger.error('[User Controller]', 'Erro ao gerar token. Senha não alterada', err);
                                                err.msg = "Erro ao alterar senha. Tente novamente!";
                                                res.status(500).json(err);
                                            });
                                    } else {
                                        logger.error('[User Controller]', 'Erro ao salvar senha no DB');
                                        res.status(500).json({
                                            success: false,
                                            token: null,
                                            msg: "Erro ao alterar a senha. Tente novamente!"
                                        });
                                    }
                                })
                                .catch((errUp) => { //Caso aconteca algum erro na edição
                                    logger.error('[User Controller]', 'Erro ao salvar senha no DB', errUp.errmsg);
                                    res.status(500).json({
                                        success: false,
                                        token: null,
                                        msg: 'Atualização da senha falhou. Tente novamente!',
                                        err: errUp.errmsg
                                    });
                                });
                        } else { //Senha não corresponde com a cadastrada
                            logger.error('[User Controller]', 'Senha antiga informada não está correta');
                            res.status(500).json({
                                success: false,
                                token: null,
                                msg: 'A autenticação falhou. Senha incorreta!',
                                err: err
                            })
                        }
                    });
                }
            })
            .catch((err) => { //Erro ao buscar usuário e/ou senha
                logger.error('[User Controller]', 'Erro ao recuperar dados da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'A autenticação falhou. Usuário e/ou Senha incorretos!',
                    err: err.errmsg
                });
            });
    },

    uniqueFieldVerify: (req, res, next) => {
        logger.debug('[User Controller]', 'Parâmetro Unique Field Verify', req.body);
        const fieldValue = req.body.fieldValue;
        const fieldName = req.body.fieldName;
        let validator = false;
        switch (fieldName) {
            case 'email':
                validator = require('../models/validations/isEmail.js')(fieldValue);
                break;
            case 'cnpj':
                validator = require('../models/validations/isCnpjOrCpf.js')(fieldValue);
                break;
            case 'corporateName':
                validator = require('../models/validations/isName.js')(fieldValue);
                break;
            case 'friendlyUrl':
                validator = require('../models/validations/isUrl.js')(fieldValue);
                break;
            default:
                break;
        }
        logger.debug('[User Controller]', 'Validator Field Verify', validator);
        if (!validator) {
            res.status(200).json({
                success: false,
                msg: `O ${fieldValue} não é um ${fieldName} válido!`
            })
        } else {
            const param = {};
            param[fieldName] = fieldValue;
            const field = { _id: 1 };
            User.find(param, field)
                .then((company) => {
                    if (company.length >= 1) {
                        logger.debug('[User Controller]', 'User Recuperada', company[0]._id);
                        res.status(200).json({
                            success: false,
                            msg: `${fieldName}: ${fieldValue} já cadastrado!`
                        });
                    } else {
                        logger.debug('[User Controller]', 'Nenhuma User Recuperada');
                        res.status(200).json({
                            success: true
                        });
                    }
                })
                .catch((err) => {
                    logger.error('[User Controller]', 'Erro ao recuperar company', err.errmsg);
                    res.status(200).json({
                        success: false,
                        msg: 'Erro ao recuperar dados da empresa!',
                        err: err.errmsg
                    });
                })
        }
    },
}