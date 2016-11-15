module.exports.mongoose = {


  // The Mongo connection URI
  // (see https://github.com/mikermcneil/sails-hook-orm-mongoose/blob/master/README.md#configuration for more info)
  //
  uri: 'mongodb://chenyl:BwvxiBzhc3XME@dds-bp1788f76b9aaa842.mongodb.rds.aliyuncs.com:3717/vote,mongodb://chenyl:BwvxiBzhc3XME@dds-bp1788f76b9aaa841.mongodb.rds.aliyuncs.com:3717',


  // Optionally, you can provide options to pass in as the second argument to `mongoose.connect()`
  // (see https://github.com/mikermcneil/sails-hook-orm-mongoose/blob/master/README.md#configuration for more info)
  //
  connectionOpts: {
	db: { native_parser: true },
	server: { poolSize: 5 },
	replset: { rs_name: 'realtimevote' },
	// user: 'myUserName',
	// pass: 'myPassword'
  }

};