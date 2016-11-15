/**
 * RealtimeVoteControlService
 */
var Q = require('q');

module.exports = {

    //初始化系统
    initSystem: function(){
        var deferred = Q.defer();
        RealtimeVoteTeamService.removeTeams().then(function(){
            RealtimeVoteTeamService.addTeams().then(function(teams){
                RealtimeVoteRecordService.removeRecords().then(function(){
                    deferred.resolve(teams);
                },function(err){
                    deferred.reject(err);
                })
            },function(err){
                deferred.reject(err);
            });
        },function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    },

    //开启投票
    openVote:  function(id){
        var deferred = Q.defer();

        RealtimeVoteTeamService.fetchTeams().then(function(teams){
            var teamvoting = false;
            var now= (new Date()).getTime();
            for(var i=0; i<teams.length;i++){
                var team = teams[i];
                if(team.vote_starttime>0&&now<team.vote_endtime){
                    teamvoting=true;
                    break;
                }
            }

            if(teamvoting){
                deferred.reject('其他团队正在点赞中');
            }else{
                var vote_starttime = (new Date()).getTime();
                var vote_endtime = vote_starttime + 60*1000

                VoteTeam.findByIdAndUpdate(id, { $set: { vote_starttime: vote_starttime, vote_endtime:vote_endtime }}, {new:true}, function (err, team) {
                    if (err) {
                        sails.log(err);
                        deferred.reject(err);
                        return;
                    }
                    deferred.resolve(team);
                });
            }
        },function(err){
            deferred.reject(err);
        })
        return deferred.promise;
    }
};