//需引入http://res.wx.qq.com/open/js/jweixin-1.0.0.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root['JWeixin'] = factory());
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root['JWeixin'] = factory();
  }
}(this, function () {
  var JWeixin = {
    G_SIGN_PACKAGE:null, //微信JSSDK接口的签名信息
    init:function(sign, callback, errorCallback){
        this.G_SIGN_PACKAGE=sign;
        var allApiList = [
           'onMenuShareTimeline',
           'onMenuShareAppMessage',
           'onMenuShareQQ',
           'onMenuShareWeibo',
           'hideMenuItems',
           'showMenuItems',
           'chooseImage',
           'previewImage',
           'uploadImage',
           'downloadImage',
           'getNetworkType',
           'openLocation',
           'getLocation',
           'hideOptionMenu',
           'showOptionMenu',
           'closeWindow',
           'scanQRCode',
           
           //微信设备相关接口
           'getWXDeviceInfos',
           'openWXDeviceLib',
           'onScanWXDeviceResult',
           'onReceiveDataFromWXDevice',
           'onWXDeviceBluetoothStateChange',
           'onWXDeviceBindStateChange',
           'onWXDeviceStateChange',
           'sendDataToWXDevice',
           'startScanWXDevice',
           'stopScanWXDevice',
           'getWXDeviceTicket',
           'connectWXDevice',
           'disconnectWXDevice'
        ];
        
        //通过config接口注入权限验证配置
        wx.config({
           debug: false,//调试模式
           appId: this.G_SIGN_PACKAGE["appId"],
           timestamp: this.G_SIGN_PACKAGE["timestamp"],
           nonceStr: this.G_SIGN_PACKAGE["nonceStr"],
           signature: this.G_SIGN_PACKAGE["signature"],
           jsApiList:allApiList
        });

        //config信息验证失败会执行error函数
        wx.error(function(res){
            errorCallback ? errorCallback(res) : alert("微信JSAPI验证失败：" + res.errMsg);
        });
        
        var _this = this;
        wx.ready(function(){
            callback&&callback(_this);
        })
        return this;
    },
    //检测api是否可用
    checkJsApi : function(api_name,callBack){
        wx.checkJsApi({
            jsApiList: [api_name],
            success: function(res) {
                //以键值对的形式返回，可用的api值true，不可用为false
                //如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                if(res.errMsg = "checkJsApi:ok"){
                    var chkResult = res.checkResult;
                    if(chkResult[api_name] === true){
                        callBack();
                    }else{
                        alert("接口" + api_name + "不支持，请检查接口名称或升级微信到最新版本");
                    }
                }else{
                    alert(res.errMsg);
                }
            }
        });
    },
    /**
     * 调用微信js api
     * @param string api_name api名称
     * @param object config 微信接口的配置对象
     * @returns {undefined}
     */
    invoke : function(api_name,config){
        this.checkJsApi(api_name,function(){
            config = config || {};
            config.title = config.title || document.title;
            config.fail = config.fail || function(res){
                alert("调用微信接口失败：" + JSON.stringify(res));
            };
            wx[api_name](config);
        });
    }
  }

  return JWeixin;
}));