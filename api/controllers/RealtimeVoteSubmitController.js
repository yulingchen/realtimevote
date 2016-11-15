/**
 * RealtimeVoteSubmitController
 *
 * @description :: Server-side logic for managing Realtimevotes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');

module.exports = {

	//投票视图
	vote: function(req, res){
		var code = req.query.code;
		CorpService.getCorpUserInfo(code).then(function(userinfo){
			// console.log('userinfo',userinfo)
			if(userinfo.errcode!=0){
				res.send(userinfo.errmsg);
				return;
			}

			userinfo.avatar = userinfo.avatar.replace(/\/$/g,'/64');
			
			RealtimeVoteUserService.addUser(userinfo).then(function(){
				res.view('realtimevote/vote',{layout: null, userinfo: userinfo});
			},function(err){
				res.send(err);
			})
		},function(err){
			res.send(err);
		})
	},

	//提交投票
	apiSubmitVote: function(req, res){
		var userid = req.body.userid;
		var teamid = req.body.teamid;

		//团队是否存在
		RealtimeVoteTeamService.fetchTeamInfo(teamid).then(function(team){
			if(!team){
				return res.json(200, {result: false, msg:'不存在该团队'});
			}else{

				//团队是否允许投票
				var vote_starttime = team.vote_starttime;
				var vote_endtime = team.vote_endtime;
				var currtime = (new Date()).getTime();

				if(vote_starttime==0){
					return res.json(200, {result: false, msg:'该团队点赞还未开始'});
				}

				if(currtime>vote_endtime){
					return res.json(200, {result: false, msg:'该团队点赞已结束'});
				}

				RealtimeVoteUserService.fetchVotedTeams(userid).then(function(teams){

					//用户投票次数是否用尽
					if(teams.length>=5){
						return res.json(200, {result: false, msg:'您的5次点赞机会已用完'});
					}

					// //用户是否投票该团队
					var filterTeams = teams.filter(function(team){
						return team.teamid == teamid;
					})

					if(filterTeams.length>0){
						return res.json(200, {result: false, msg:'您已点赞成功，不可重复点赞'});
					}

					//提交投票
					RealtimeVoteUserService.commitVote(userid, team).then(function(team){
						RealtimeVoteTeamService.fetchVotedUsers(team._id).then(function(users){
							sails.sockets.broadcast('controlSockets', 'listenVote', {type:'submitvote', team: team, votedusers:users, server_time: (new Date()).getTime()}, req);
							res.json(200, {result: true, msg:'点赞成功'});
						},function(err){
							res.json(200, {result: false, msg:error});
						})	
					},function(error){
						res.json(200, {result: false, msg:error});
					})
				},function(error){
					res.json(200, {result: false, msg:error});
				})
			}
		},function(error){
			res.json(200, {result: false, msg:error});
		})
	},

	//模拟提交投票
	apiSubmitVoteTest: function(req, res){
		var userid = 'testuser_'+(new Date()).getTime();
		var teamid = req.body.teamid;

		//团队是否存在
		RealtimeVoteTeamService.fetchTeamInfo(teamid).then(function(team){
			if(!team){
				return res.json(200, {result: false, msg:'不存在该团队'});
			}else{

				//团队是否允许投票
				var vote_starttime = team.vote_starttime;
				var vote_endtime = team.vote_endtime;
				var currtime = (new Date()).getTime();

				if(vote_starttime==0){
					return res.json(200, {result: false, msg:'该团队点赞还未开始'});
				}

				if(currtime>vote_endtime){
					return res.json(200, {result: false, msg:'该团队点赞已结束'});
				}

				//提交投票
				RealtimeVoteUserService.commitVoteTest(userid, team).then(function(team){
					RealtimeVoteTeamService.fetchVotedUsers(team._id).then(function(users){
						sails.sockets.broadcast('controlSockets', 'listenVote', {type:'submitvote', team: team, votedusers:users, server_time: (new Date()).getTime()}, req);
						res.json(200, {result: true, msg:'点赞成功'});
					},function(err){
						res.json(200, {result: false, msg:error});
					})	
				},function(error){
					res.json(200, {result: false, msg:error});
				})
			}
		},function(error){
			res.json(200, {result: false, msg:error});
		})
	}

};

