/**
 * WechatCorpController
 *
 * @description :: Server-side logic for managing wechats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var config = require('../../config');

module.exports = {

	/*微信网页授权
	 *
	 * uri 跳转的url
	 *
	 * 示例：http://m.tiyanke.com/wechatcorp/oauth2?uri=http%3a%2f%2fm.tiyanke.com%2frealtimevote%2fvote
	 */
	oauth2: function(req, res){
		var STATE = 'corpqazplmxcvbn',
			code = req.query.code, 
			state = req.query.state, 
			uri = req.query.uri;

		if(code&&state==STATE){
			var toUri = decodeURIComponent(uri);
			var codeParam = (toUri.indexOf('?') >-1 ? '&' : '?')+'code='+code;
			res.redirect(toUri+codeParam);
		}else{
			res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.CORPID+'&redirect_uri='+encodeURIComponent(config.SiteDomain+'/wechatcorp/oauth2?uri='+encodeURIComponent(uri))+'&response_type=code&scope=snsapi_base&state='+STATE+'#wechat_redirect');
		}
	}
};