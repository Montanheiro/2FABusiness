// const Audio = require('../models/AudioModel.js');
// const config = require('../config/config.js');
// const speakeasy = require("speakeasy");

// module.exports = {
//     new: (req, res, next) => {
//             logger.debug('[Audio Controller]', 'Parametros new', req.body);
//             //TODO verificar dados já existente CNPJ, Email e razão social
//             let newAudio = new Audio(req.body);
//             newAudio.save()
//                 .then((company) => { //Usuário criado com sucesso
//                     logger.debug('[Audio Controller]', 'Audio salvo com sucesso');
//                     res.status(200).json({
//                         success: true,
//                         msg: "Audio salvo com sucesso!",
//                     });
//                 })
//                 .catch((err) => { //Algum erro durante a criaçãos
//                     logger.error('[Audio Controller]', 'Erro ao cadastrar Audio', err.errmsg);
//                     res.status(500).json({
//                         success: false,
//                         msg: "Erro ao cadastrar novo audio. Tente novamente!",
//                         err: err.errmsg
//                     });
//                 });
//     },

//     test: (req, res, next) => {
//             logger.debug('[Audio Controller]', 'Parametros test', req.body);
//             //TODO verificar dados já existente CNPJ, Email e razão social
            
//             var secretGerado = speakeasy.generateSecret();


//             let tokenGerado = speakeasy.totp({
//               secret: req.body.key,
//               encoding: 'base32'
//             })

//             res.status(200).json({
//                 success: true,
//                 token: tokenGerado,
//                 secret: secretGerado
//             });



//     }
// }