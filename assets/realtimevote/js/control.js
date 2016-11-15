$(function(){

	var controlApp = new Vue({
	  el: '#app',
	  data: {
	    teams: []
	  }
	})

	function showMsg(msg,btnText){
		btnText = btnText || '知道了';
		$('#iosDialog .weui-dialog__bd').html(msg);
		$('#iosDialog .weui-dialog__btn').html(btnText);
    $('#iosDialog').fadeIn(200);
	}

  function bindEvent(){
		var $iosDialog = $('#iosDialog');
    $iosDialog.on('click', '.weui-dialog__btn', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    $iosDialog.on('click', '.weui-mask', function(){
      $iosDialog.fadeOut(200);
    });

  	//配置按钮事件
		var $androidActionSheet = $('#androidActionsheet');
	  var $androidMask = $androidActionSheet.find('.weui-mask');

	  $("#showAndroidActionSheet").on('click', function(){
	      $androidActionSheet.fadeIn(200);
	      $androidMask.on('click',function () {
	          $androidActionSheet.fadeOut(200);
	      });
	  });

  	//初始化打分工具
  	$('#init_system').on('click',function(){
  		var auth=prompt("请输入管理员密码","")
  		if(auth&&auth=='88888888'){
  			if(window.confirm('初始化系统投票数据会丢失，是否确定?')){
		  		$.ajax({
						type: "POST",
						url: "/realtimevote/api_initsystem?t="+(new Date()).getTime(),
						dataType: "json",
						success: function(data){
							$androidActionSheet.fadeOut(200);
						  if(!data.result){
						  	showMsg(data.msg)
						  }
						}
					});
		  	}
  		}
	  })

  	//开启投票
  	$('#app').on('click', '.btn-openvote', function(){
  		var teamid = $(this).attr('teamid')
  		if(window.confirm('确定开启投票吗？')){
  			$.ajax({
					type: "POST",
					url: "/realtimevote/api_openvote?t="+(new Date()).getTime(),
					data: {teamid:teamid},
					dataType: "json",
					success: function(json){
					  if(!json.result){
					  	showMsg(json.msg)
					  }
					}
				});
  		}
  	})

  	//查看投票
  	$('#app').on('click', '.btn-showvote', function(){
  		var teamid = $(this).attr('teamid')
			$.ajax({
				type: "POST",
				url: "/realtimevote/api_showvote?t="+(new Date()).getTime(),
				data: {teamid:teamid},
				dataType: "json",
				success: function(json){
				  if(!json.result){
				  	showMsg(json.msg)
				  }else{
				  	showMsg('<div style="text-align:left;height:200px;overflow:auto;">'+json.data+'</div>')
				  }
				}
			});
  	})
  }

  function init(){
  	bindEvent();

  	//获取投票选项列表
		function fetchTeams(){
			$.ajax({
				type: "GET",
				url: "/realtimevote/api_fetchteams?t="+(new Date()).getTime(),
				dataType: "json",
				success: function(data){
				  if(data.result){
				  	controlApp.teams = data.data.teams;
				  }else{
				  	showMsg(data.msg)
				  }
				}
			});
		}
		fetchTeams();

  	//初始化系统
		io.socket.on('initSystem', function(data) {
			controlApp.teams = data.teams;
		});

		//监听开启投票
		io.socket.on('listenVote', function(data) {
			var teams = controlApp.teams.concat();
			teams.map(function(team,index){
				if(team._id == data.team._id){
					teams[index] = data.team
				}
			})
			controlApp.teams = teams;
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

