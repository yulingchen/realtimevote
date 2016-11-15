/**
 * RealtimeVoteDisplayController
 *
 * @description :: Server-side logic for managing Realtimevotes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');

module.exports = {

	//大屏幕视图
	display: function(req, res){
		res.view('realtimevote/display',{layout: null});
	}

};

