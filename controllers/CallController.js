  //db.categories.update({},{$inc: {position: -1}}, {multi: true})

  const Call = require('../models/CallModel.js');
  const Company = require('../models/CompanyModel.js');
  const Audio = require('../models/AudioModel.js');
  const totalvoiceConfig = require('../config/totalvoiceConfig.js');
  const request = require('request');



  module.exports = { 

     //  findAllByCompany: (req, res, next) => {
     //      //Pegar dados da compania logada, via token
     //      const companyID = req.companyID;
     //      logger.debug('[Call Controller]', 'Parametros findAllByCompany', req.companyID);
     //      //Buscar todas categorias associadas a companhia desejada
     //      Call.find({
     //              companyID: companyID
     //          }, {}, {
     //              sort: {
     //                  position: 1
     //              }
     //          }).lean()
     //          .then((categories) => {
     //              logger.debug('[Call Controller]', 'Categorias recuperadas com sucesso', categories);
     //              res.status(200).json({
     //                  success: true,
     //                  categories: categories
     //              });
     //          })
     //          .catch((err) => { //Caso algum erro ocorra
     //              logger.error('[Call Controller]', 'Erro ao recuperar dados de company', err.errmsg);
     //              res.status(500).json({
     //                  success: false,
     //                  msg: "Erro ao buscar dados das categorias!",
     //                  categories: null,
  			// 		err: err.errmsg
     //              });
     //          });
     //  },

     new: (req, res, next) => {
          //Pegar dados da compania logada, via token
          const companyID = req.companyID;
          logger.debug('[Call Controller]', 'Parametos new call', req.companyID, req.body);
          //Cria uma nova categoria de acordo com o nome da categoria passada
          
          //VERIFICAR SE TEM CRÉDITO de segurança
          Company.findOne({
                  _id: companyID
              }).lean()
              .then((company) => {
                  logger.debug('[Call Controller]', 'Dados do usuário recuperados com sucesso', company);

                  Audio.findOne({
                      _id: req.body.audioId
                  }).lean()
                  .then((audio) => {
                      logger.debug('[Call Controller]', 'Dados do áudio recuperados com sucesso', company);
                      
                      //verificar se é mobile ou fix
                      if(req.body.to.length == 11 || req.body.from.length == 11) var valueCost = totalvoiceConfig.costMinutoMobile;
                      else if(req.body.to.length == 10 || req.body.from.length == 10) var valueCost = totalvoiceConfig.costMinuteFix;
                      else{
                        res.status(500).json({
                            success: false,
                            msg: 'Numero inválido!'
                        });
                      }

                      var costCall = parseFloat(audio.minuteTime) * parseFloat(valueCost);  

                      if (parseFloat(company.balanceSecurity) < costCall) {
                        if (company.balance == company.balanceSecurity) {
                          res.status(500).json({
                              success: false,
                              msg: 'Você não tem créditos suficientes!'
                          });
                        }else{
                          res.status(500).json({
                              success: false,
                              msg: 'Você possui algumas ligações pendentes, aguarde alguns minutos e tente novamente!'
                          });
                        }  
                      }  

                      //debitar crédito de segurança
                      let debit = parseFloat(company.balanceSecurity) - costCall;
                      const companyUpd = {
                          balanceSecurity: debit
                      };
                      Company.update({
                            _id: companyID
                        }, {
                            $set: companyUpd
                        })
                        .then((companyMod) => { 

                            //iniciando ligação
                            const token = totalvoiceConfig.token;
                            const params = {
                              'numero_destino': req.body.to,
                              'dados': [{
                                'acao': 'audio',
                                'acao_dados': {
                                  'url_audio': audio.url
                                }
                              }],
                              'bina': req.body.from,
                              'tags': companyID
                            };

                            logger.debug('[Call Controller]', 'Parâmetros pra API (JSON)', params);

                            let options = {
                              url: 'https://api.totalvoice.com.br/composto',
                              method: 'POST',
                              headers: {
                                'Accept': 'application/json',
                                'Access-Token': token
                              },
                              body: params,
                              json: true
                            }

                            request(options, function(errPS, responsePS, bodyPS) {
                              if (errPS) {
                                logger.error('[Call Controller]', 'Erro ao comunicar com a API externa', errPS);
                                
                                let credit = parseFloat(company.balanceSecurity) + costCall;
                                const companyUpd = {
                                    balanceSecurity: credit
                                };
                                Company.update({
                                      _id: companyID
                                  }, {
                                      $set: companyUpd
                                  })
                                  .then((companyMod) => { 
                                    logger.error('[Call Controller]', 'Erro o comunicar com a API externa', err);
                                    res.status(500).json({
                                      success: false,
                                      msg: 'Erro ao comunicar com a API externa. Tente novamente!',
                                      response: responsePS
                                    })

                                  })
                                  .catch((err) => {
                                    logger.error('[Call Controller]', 'Erro ao retornar créditos', err);
                                    res.status(500).json({
                                      success: false,
                                      msg: "Erro na comunicação e erro ao retornar os créditos. Tente novamente!",
                                      err: err
                                    });
                                  });
                                
                              }

                              logger.debug('[Call Controller]', 'Retorno da API: ', bodyPS);

                              let newCall = new Call(
                              {
                                'companyID': companyID
                                //'compostoId': bodyPS.dados.id
                              });
                              newCall.save()
                                .then((call) => {
                                  logger.debug('[Call Controller]', 'Ligação criada com sucesso', call._id)

                                    var callVar = call;
                                  // let options = {
                                  //   url: 'https://api.totalvoice.com.br/composto/' + bodyPS.dados.id,
                                  //   method: 'GET',
                                  //   headers: {
                                  //     'Accept': 'application/json',
                                  //     'Access-Token': token
                                  //   }
                                  // }

                                  // request(options, function(errPS2, responsePS2, bodyPS2) {
                                  //   if (errPS2) {
                                  //     logger.error('[Call Controller]', 'Erro ao comunicar com a API externa', errPS2);
                                  //     res.status(500).json({
                                  //       success: false,
                                  //       msg: 'Erro ao comunicar com a API externa. Tente novamente!',
                                  //       response: responsePS2
                                  //     })
                                  //   }

                                  //  logger.debug('[Call Controller]', 'Retorno da API: ', bodyPS2);

                                  //   retornar créditos caso ligação não seja atendida


                                  //  let dadosTemp = JSON.parse(bodyPS2);


                                    verificarAlteracao(bodyPS.dados.id, token, valueCost, call);


                                    res.status(200).json({
                                      success: true,
                                      compostoId: bodyPS.dados.id
                                    });

                                  })
                                })
                                .catch((err) => { //Algum erro durante a criaçãos
                                  logger.error('[Call Controller]', 'Erro ao salvar ligação', err);
                                  res.status(500).json({
                                    success: false,
                                    msg: "Erro ao salvar ligação. Tente novamente!",
                                    err: err
                                  });
                                });

                              

                        })
                        .catch((err) => { //Caso aconteca algum erro na edição
                            logger.error('[Call Controller]', 'Erro ao debitar créditos', err);
                            res.status(500).json({
                                success: false,
                                msg: 'Erro ao debitar créditos. Tente novamente!',
                                err: err,
                                callIdToString: callVar._id.toString(),
                                callId: callVar._id,
                                call: callVar
                            });
                        });                    

                  })
                  .catch((err) => { //Caso algum erro ocorra
                      logger.error('[Call Controller]', 'Erro ao recuperar dados do áudio', err);
                      res.status(500).json({
                          success: false,
                          msg: 'Erro ao buscar os dados do áudio!',
                          err: err.errmsg
                      });
                  });


              })
              .catch((err) => { //Caso algum erro ocorra
                  logger.error('[Call Controller]', 'Erro ao recuperar dados do usuário', err);
                  res.status(500).json({
                      success: false,
                      msg: 'Erro ao buscar os dados da usuário!',
                      err: err
                  });
              });




         
        }

      }



      function verificarAlteracao(compostoId, token, valueCost, call) {
        let options = {
          url: 'https://api.totalvoice.com.br/composto/' + compostoId,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Access-Token': token
          }
        }

        function requisicao() {
          request(options, function(errPS2, responsePS2, bodyPS2) {
            if (errPS2) {
              logger.error('[Call Controller]', 'Erro ao comunicar com a API externa', errPS2);
              res.status(500).json({
                success: false,
                msg: 'Erro ao comunicar com a API externa. Tente novamente!',
                response: responsePS2
              })
            }

            logger.debug('[Call Controller]', 'Retorno da API - VERIFICAÇÃO: ', bodyPS2);

            let dadosTemp = JSON.parse(bodyPS2);
            if (dadosTemp.dados.status === "preparando") verificarAlteracao(compostoId, token);
            else{

              // const callUpd = {
              //     call: dadosTemp.dados
              // };

              // Call.update({
              //         _id: call._id
              //     }, {
              //         $set: callUpd
              //     })
              //     .then((companyMod) => { 

              //     })
              //     .catch((err) => { //Caso aconteca algum erro na edição
                      
              //     });

              logger.debug('[Call Controller]', '----> atualizar call na call: ');

              //atualizar call na call
              //verificar se ficou todo o tempo
              //fazer cobrança de créditos
              //iguala creditos com credito de segurança
            }
          });
        }

        setTimeout(requisicao, 10000);
      }
