$(function(){
	var initpage=true;

	var displayApp = new Vue({
	  el: '#app',
	  data: {
	    teams: [],
	    server_time:0,
	    perHeight: Math.ceil($('#teamname_wrap').offset().top-$('#countbar_wrap').offset().top)/180
	  }
	})

	//倒计时
	var openDaojishi=false;
	function daojishi(count, callback){
		openDaojishi = true;

		var resetcount=count;
		var count_down = $('#count_down');

		function countdown(){
			if(resetcount>=0){
				if(resetcount==0){
					openDaojishi=false;
					count_down.html('');
					callback&&callback();
				}else{
					count_down.html('<span>'+resetcount+ '</span>')
				}
				resetcount--;
				setTimeout(countdown,1000)
			}
		}
		countdown();
	}

  function init(){

  	//获取投票选项列表
  	function fetchTeams(){
  		$.ajax({
				type: "GET",
				url: "/realtimevote/api_fetchteams?t="+(new Date()).getTime(),
				dataType: "json",
				success: function(data){
				  if(data.result){
				  	displayApp.teams = data.data.teams;
				  	displayApp.server_time = data.data.server_time;

				  	if(!openDaojishi){
				  		var teams = displayApp.teams;
				  		var zanteams=[];
				  		for(var i=0; i<teams.length; i++){
				  			var team = teams[i];
				  			if(team.vote_endtime>=displayApp.server_time){
				  				zanteams.push({
				  					team: team,
				  					resetSeconds: Math.floor((team.vote_endtime-displayApp.server_time)/1000)
				  				})
				  			}
				  		}

				  		if(zanteams.length>0){
				  			daojishi(zanteams[zanteams.length-1].resetSeconds,function(){
					  			fetchTeams();
					  		})
				  		}
				  	}
				  }else{
				  	alert(data.msg)
				  }
				}
			});
  	}
  	fetchTeams();

		//初始化系统
		io.socket.on('initSystem', function(data) {
			displayApp.teams = data.teams;
		});

		//实时投票
		io.socket.on('listenVote', function(data) {
			var teams = displayApp.teams.concat();
			teams.map(function(team,index){
				if(team._id == data.team._id){
					teams[index] = data.team
				}
			})

			displayApp.teams = teams;
			displayApp.server_time = data.server_time;

			if(data.type=='openvote'){
				daojishi(60);
				setTimeout(function(){
					fetchTeams();
				},60000)
			}
		});

		io.socket.get('/realtimevote/control', function gotResponse(body, response) {
			console.log('socket connect')
		  console.log('ControlSocket Server responded with status code ' + response.statusCode + ' and data: ', body);
		})

	  io.socket.on('reconnect', function(){
			console.log('socket reconnect')
			io.socket.get('/realtimevote/control', function gotResponse(body, response) {
			  console.log('ControlSocket Server responded with status code ' + response.statusCode + ' and data: ', body);
			})
	    
			fetchTeams();
	  });

	  io.socket.on('disconnect', function(){
	    console.log('Lost socket connection to server');
	  });
  }
  init();
})