/**
 * RealtimeVoteUserService
 */
var Q = require('q');

module.exports = {

    //添加投票成员
    addUser: function(userinfo){
        var deferred = Q.defer();
        this.fetchUserInfo(userinfo.userid).then(function(user){
            if(!user){
                VoteUser.create(userinfo, function (err, users) {
                    if (err) {
                        deferred.reject(err);
                        return;
                    }
                    deferred.resolve();
                });
            }else{
                deferred.resolve();
            }
        },function(error){
            deferred.reject(error);
        })
        return deferred.promise;
    },

    //获取投票用户信息
    fetchUserInfo: function(userid){
        var deferred = Q.defer();
        VoteUser.findOne({userid: userid}, function (err, user) {
            if (err) {
                sails.log(err);
                deferred.reject(err);
                return;
            }

            deferred.resolve(user);
        });
        return deferred.promise;
    },

    //提交投票
    commitVote: function(userid, team){
        var deferred = Q.defer();
        this.fetchUserInfo(userid).then(function(user){
            var record = {
                teamid: team._id,
                teamname:team.name,
                userid: user.userid,
                username: user.name,
                useravatar: user.avatar
            }

            VoteRecord.create(record, function (err, records) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                RealtimeVoteTeamService.fetchVotedUsers(team._id).then(function(users){
                    VoteTeam.findByIdAndUpdate(team._id, { $set: { vote_total: users.length }}, {new:true}, function (err, team) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }
                        deferred.resolve(team);
                    });
                },function(err){
                    deferred.reject(err);
                })
            });
        },function(err){
            deferred.reject(err);
        })
        return deferred.promise;
    },

    //模拟提交投票
    commitVoteTest: function(userid, team){
        var deferred = Q.defer();
        var record = {
            teamid: team._id,
            teamname:team.name,
            userid: userid,
            username: '测试'+userid,
            useravatar: ''
        }

        VoteRecord.create(record, function (err, records) {
            if (err) {
                deferred.reject(err);
                return;
            }

            RealtimeVoteTeamService.fetchVotedUsers(team._id).then(function(users){
                VoteTeam.findByIdAndUpdate(team._id, { $set: { vote_total: users.length }}, {new:true}, function (err, team) {
                    if (err) {
                        deferred.reject(err);
                        return;
                    }
                    deferred.resolve(team);
                });
            },function(err){
                deferred.reject(err);
            })
        });
        return deferred.promise;
    },

    //获取用户投票的团队
    fetchVotedTeams: function(userid){
        var deferred = Q.defer();
        VoteRecord.find({userid: userid}, function (err, teams) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(teams);
        })
        return deferred.promise;
    }
};