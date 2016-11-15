/**
 * RealtimeVoteTeamService
 */
var Q = require('q');

module.exports = {

    //获取团队列表
    fetchTeams: function(userid){
        var deferred = Q.defer();
        //VoteTeam.find({}, null, {sort: {'vote_total':-1}}, function (err, teams) { //排序
        VoteTeam.find({}, function (err, teams) {
            if (err) {
                sails.log(err);
                deferred.reject(err);
                return;
            }

            //标识用户点赞的团队
            if(userid){
                RealtimeVoteUserService.fetchVotedTeams(userid).then(function(voteteams){
                    if(voteteams&&voteteams.length>0){
                        var newteams=[];
                        teams = teams.map(function(team){
                            var isVoted=false;
                            for(var i=0; i<voteteams.length;i++){
                                if(voteteams[i].teamid==team._id){
                                    isVoted=true;
                                    break;
                                }
                            }

                            newteams.push({
                                _id: team._id,
                                name: team.name,
                                headimg: team.headimg,
                                __v: team.__v,
                                vote_total: team.vote_total,
                                vote_endtime: team.vote_endtime,
                                vote_starttime: team.vote_starttime,
                                isvoted: isVoted
                            })
                        })
                        deferred.resolve(newteams);
                    }else{
                        deferred.resolve(teams);
                    }
                },function(err){
                    deferred.reject(err);
                })
            }else{
                deferred.resolve(teams);
            }
        });
        return deferred.promise;
    },

    //获取团队信息
    fetchTeamInfo: function(teamid){
        var deferred = Q.defer();
        VoteTeam.findById(teamid, function (err, team) {
            if (err) {
                sails.log(err);
                deferred.reject(err);
                return;
            }
            deferred.resolve(team);
        });
        return deferred.promise;
    },

    //添加全部团队
    addTeams: function(){
        var deferred = Q.defer();
        VoteTeam.create(RealtimeVoteConfigService.voteTeams, function (err, teams) {
            if (err) {
                sails.log(err);
                deferred.reject(err);
                return;
            }
            deferred.resolve(teams);
        });
        return deferred.promise;
    },

    //删除全部团队
    removeTeams: function(){
        var deferred = Q.defer();
        VoteTeam.remove({}, function (err) {
            if (err) {
                sails.log(err);
                deferred.reject(err);
                return;
            }
            deferred.resolve();
        });
        return deferred.promise;
    },

    //获取团队的投票成员
    fetchVotedUsers: function(teamid){
        var deferred = Q.defer();
        VoteRecord.find({teamid: teamid}, function (err, users) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(users);
        })
        return deferred.promise;
    }
};