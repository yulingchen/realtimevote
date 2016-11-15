/**
 * CorpService
 */
var Q = require('q');
var config = require('../../config');

module.exports = {

    //获取企业号access_token
    getCorpAccessToken: function(){
        var deferred = Q.defer();
        CorpAccount.findOne({corpid: config.CORPID}).exec(function(err, account){
            var currtime = (new Date()).getTime();           
            if(account&&((currtime-account.corp_access_token_lasttime)/1000)<account.corp_access_token_expires){
                deferred.resolve(account.corp_access_token);
                return;
            }
            
            CorpApiService.fetchCorpAccessToken()
            .then(function(body){
                var corpAccount;
                if(account){
                    CorpAccount.findByIdAndUpdate(account._id, { $set: { corp_access_token:body.access_token, corp_access_token_expires:body.expires_in, corp_access_token_lasttime:(new Date()).getTime()}}, {new:true}, function (error, corpaccount) {
                        if (error) {
                            console.log('error:'+error)
                            deferred.reject({
                                errcode: -1,
                                errmsg: error
                            });
                        }else{
                            deferred.resolve(corpaccount.corp_access_token);
                        }
                    });
                }else{
                    corpAccount = new CorpAccount({
                        corpid: config.CORPID,
                        corpsecret: config.CORPSECRET,
                        corp_access_token: body.access_token,
                        corp_access_token_expires: body.expires_in,
                        corp_access_token_lasttime: (new Date()).getTime()
                    });

                    corpAccount.save(function(error, corpaccount) {
                        if (error) {
                            console.log('error:'+error)
                            deferred.reject({
                                errcode: -1,
                                errmsg: error
                            });
                        }else{
                            deferred.resolve(corpaccount.corp_access_token);
                        }
                    });
                }
            },function(error){
                console.log('error:'+error)
                deferred.reject({
                    errcode: -1,
                    errmsg: error
                });
            })
        })
        return deferred.promise;
    },

    //获取企业号通讯录成员信息
    getCorpUserInfo: function(code){
        var deferred = Q.defer();
        this.getCorpAccessToken().then(function(corp_access_token){
            CorpApiService.fetchCorpUserId(corp_access_token, code).then(function(user){
                CorpApiService.fetchCorpUserInfo(corp_access_token, user.UserId).then(function(userinfo){
                    deferred.resolve(userinfo);
                },function(error){
                    deferred.reject(error);
                })

            },function(error){
                deferred.reject(error);
            })

        },function(error){
            deferred.reject(error);
        })

        return deferred.promise;
    }
};