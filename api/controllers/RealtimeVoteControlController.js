/**
 * RealtimeVoteControlController
 *
 * @description :: Server-side logic for managing Realtimevotes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');

module.exports = {

	//控制视图
	control: function(req, res){
		if (req.isSocket) {
			sails.sockets.join(req, 'controlSockets');
			return res.ok({message: "control socket request ok!"});
		}else{
			res.view('realtimevote/control',{layout: null});
		}
	},

	//初始化系统
	apiInitSystem: function(req, res){
		RealtimeVoteControlService.initSystem().then(function(teams){
			res.json(200, {result: true,msg:'init system success！'});
			sails.sockets.broadcast('controlSockets', 'initSystem', {teams:teams}, req);
		},function(err){
			res.json(200, {result: false,msg:err});
		});
	},

	//获取团队列表
	apiFetchTeams: function(req, res){
		var userid = req.query.userid;

		RealtimeVoteTeamService.fetchTeams(userid).then(function(teams){
			res.json(200, {result: true, msg:'', data:{teams:teams, server_time: (new Date()).getTime()}});
		},function(err){
			res.json(200, {result: false, msg:err});
		})
	},

	//开启投票
	apiOpenVote: function(req, res){
		var id = req.body.teamid;
		RealtimeVoteControlService.openVote(id).then(function(team){
			res.json(200, {result: true,msg:'open vote success', data: team});
			sails.sockets.broadcast('controlSockets', 'listenVote', {type:'openvote', team: team, server_time: (new Date()).getTime()}, req);
		},function(err){
			res.json(200, {result: false,msg:err});
		});
	},

	//查看投票
	apiShowVote: function(req, res){
		var teamid = req.body.teamid;
		RealtimeVoteTeamService.fetchVotedUsers(teamid).then(function(users){
			var usersArr=[];
			users.map(function(user){
				usersArr.push(user.username);
			})

			res.json(200, {result: true,msg:'ok', data: usersArr.join()});
		},function(err){
			res.json(200, {result: false,msg:err});
		});
	}
};

