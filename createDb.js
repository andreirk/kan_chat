/**
 * Created by acer on 5/2/2016.
 */
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

// Connection URL
var url = 'mongodb://localhost:27017/chat';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
   if(err) throw err;

    var collection = db.collection('test insert');
    collection.remove({},function (err, affected) {
        if (err) throw err;
    });
    collection.insert({a:2}, function (err, count) {


    var cursor  =  collection.find({a:2});
    cursor.toArray(function (err, results) {
        console.dir(results);
        db.close();
        });
    });
});