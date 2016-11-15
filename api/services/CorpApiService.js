/**
 * CorpApiService
 */
var request = require('request');
var Q = require('q');
var config = require('../../config');

module.exports = {

    //获取企业号access_token
    fetchCorpAccessToken: function(){
        var deferred = Q.defer();
        request({
            method:'GET',
            uri: config.WechatCorpApiDomain+'/cgi-bin/gettoken?corpid='+config.CORPID+'&corpsecret='+config.CORPSECRET
        },function (error, response, body) {
            if (error) {
                deferred.reject(JSON.parse(error));
            }else{
                deferred.resolve(JSON.parse(body));
            }
        });

        return deferred.promise;
    },

    //获取企业员工userid
    fetchCorpUserId: function(access_token, code){
        var deferred = Q.defer();
        request({
            method:'GET',
            uri: config.WechatCorpApiDomain+'/cgi-bin/user/getuserinfo?access_token='+access_token+'&code='+code
        },function (error, response, body) {
            if (error) {
                deferred.reject(JSON.parse(error));
            }else{
                deferred.resolve(JSON.parse(body));
            }
        });

        return deferred.promise;
    },

    //获取通讯录成员信息
    fetchCorpUserInfo: function(access_token, userid){
        var deferred = Q.defer();
        request({
            method:'GET',
            uri: config.WechatCorpApiDomain+'/cgi-bin/user/get?access_token='+access_token+'&userid='+userid
        },function (error, response, body) {
            if (error) {
                deferred.reject(JSON.parse(error));
            }else{
                deferred.resolve(JSON.parse(body));
            }
        });

        return deferred.promise;
    }
};