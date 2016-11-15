$(function(){
	var openVote=false;

	var voteApp = new Vue({
	  el: '#app',
	  data: {
	    teams: [],
	    server_time:0
	  }
	})

	function showMsg(msg,btnText){
		btnText = btnText || '知道了';
		$('#iosDialog .weui-dialog__bd').html(msg);
		$('#iosDialog .weui-dialog__btn').html(btnText);
    $('#iosDialog').fadeIn(200);
	}

  function bindEvent(){
  	var $app = $('#app');
		var $iosDialog = $('#iosDialog');

  	//查看团队头像
    $app.on('click', '.weui-dialog__btn', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    $app.on('click', '.weui-mask', function(){
      $iosDialog.fadeOut(200);
    });

    $app.on('click', '.headimg', function(){
    	var headimg = $(this).attr('_src');
    	var endzan = $(this).attr('endzan');
    	var zaned = $(this).attr('zaned');
    	if(zaned){
    		showMsg('<img src="'+headimg+'" width="100%" height="100%"/>','亲，谢谢你的赞哦~')
    	}else{
    		if(endzan){
    			showMsg('<img src="'+headimg+'" width="100%" height="100%"/>','说，为啥子不点赞~')
    		}else{
    			showMsg('<img src="'+headimg+'" width="100%" height="100%"/>','看完，记得为我们点赞哦~')
    		}
    	}
    });

    //投票
    var zaned=false;
    $app.on('touchend', '.btn-zan', function(){
    	if(zaned) return;
    	zaned=true;

    	var teamid = $(this).attr('teamid');
    	var userid = $('#userid').val();
    	
    	$.ajax({
				type: "POST",
				url: "/realtimevote/api_submitvote?t="+(new Date()).getTime(),
				data: {teamid:teamid, userid:userid},
				dataType: "json",
				success: function(data){
					zaned=false;
				  showMsg(data.msg)
				},
				error:function(msg){
					zaned=false;
					showMsg('网络异常');
				}
			});
    })

  }

  function init(){
  	bindEvent();

  	//获取投票选项列表
  	var userid = $('#userid').val();
  	function fetchTeams(){
  		$.ajax({
				type: "GET",
				url: "/realtimevote/api_fetchteams?userid="+userid+"&t="+(new Date()).getTime(),
				dataType: "json",
				success: function(data){
				  if(data.result){
				  	voteApp.teams = data.data.teams;
				  	voteApp.server_time = data.data.server_time;

				  	if(!openVote){
				  		var teams = voteApp.teams;
				  		var zanteams=[];
				  		for(var i=0; i<teams.length; i++){
				  			var team = teams[i];
				  			if(team.vote_endtime>=voteApp.server_time){
				  				zanteams.push({
				  					team: team,
				  					resetSeconds: Math.floor(team.vote_endtime-voteApp.server_time)
				  				})
				  			}
				  		}

				  		if(zanteams.length>0){
					  		setTimeout(function(){
									fetchTeams();
								},zanteams[zanteams.length-1].resetSeconds)
				  		}
				  	}
				  }else{
				  	showMsg(data.msg)
				  }
				}
			});
  	}
  	fetchTeams();

  	//初始化系统
		io.socket.on('initSystem', function(data) {
			voteApp.teams = data.teams;
		});

		//监听开启投票
		io.socket.on('listenVote', function(data) {
			var teams = voteApp.teams.concat();
			teams.map(function(team,index){
				if(team._id == data.team._id){
					var newteam = data.team;
					var votedusers = data.votedusers;
					if(votedusers&&votedusers.length>0){
						for(var i=0; i<votedusers.length;i++){
							if(votedusers[i].userid==userid){
								newteam.isvoted = true;
								break;
							}
						}
					}
					teams[index] = newteam
				}
			})
			voteApp.teams = teams;
			voteApp.server_time = data.server_time;

			if(data.type=='openvote'){
				openVote = true;
				setTimeout(function(){
					openVote = false;
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