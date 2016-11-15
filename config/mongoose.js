module.exports.mongoose = {
  uri: 'mongodb://chenyl:BwvxiBzhc3XME@dds-bp1788f76b9aaa842.mongodb.rds.aliyuncs.com:3717,dds-bp1788f76b9aaa841.mongodb.rds.aliyuncs.com:3717/vote?replicaSet=mgset-1721345',
  connectionOpts: {
      autoIndex: false,
      db: {
          native_parser: true,
      },
      server: {
          poolSize: 5
      }
  }
};