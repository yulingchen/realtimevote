/**
 * RealtimeVoteRecordService
 */
var Q = require('q');

module.exports = {

    //删除投票记录
    removeRecords: function(){
        var deferred = Q.defer();
        VoteRecord.remove({}, function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve();
        });
        return deferred.promise;
    }
};