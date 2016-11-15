module.exports = {
  schema: {
    name: String,
    headimg: String,
    vote_starttime: {
    	type: Number, default: 0
    },
    vote_endtime:{
    	type: Number, default: 0
    },
    vote_total:{
    	type: Number, default: 0
    }
  }
}