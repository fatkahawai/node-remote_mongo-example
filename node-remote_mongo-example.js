/**
 * node-remote_mongo-example.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * a "HELLO WORLD" server-side application to demonstrate running node and mongo on separate instances on AWS EC2.
 * 
 * 
 * install node on the primary EC2 instance then install mongoDB from the AWS marketplace - it will be 
 * installed on a second EC2 instance. open port 27017 for the node isntance's security group on the mongoDB instance
 * then install the mongoose node package on the node instance, using
 * $ npm install mongoose
 * 
 * @throws none
 * @see 
 * 
 * @author Bob Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

var http = require('http');
var mongoose  = require('mongoose');

var config = {
      "USER"     : "",                  // if your database has user/pwd defined
      "PASS"     : "",
      "HOST"     : "ec2-54-252-31-96.ap-southeast-2.compute.amazonaws.com",  // the domain name of the MongoDB EC2 instance
      "PORT"     : "27017",             // this is the default port mongoDB is listening for incoming queries
      "DATABASE" : "test"               // the name of your database
    };

var dbPath  = "mongodb://" + config.USER + ":";
    dbPath += config.PASS + "@";
    dbPath += config.HOST + ":";
    dbPath += config.PORT + "/";
    dbPath += config.DATABASE;

var db;

console.log('attempting to connect to MongoDB on '+config.HOST);

if ( !(db = mongoose.connect(dbPath)) ){
  console.log('Unable to connect to MongoDB at '+dbPath);
} 
else console.log('connecting to MongoDB at '+dbPath);

//
// set up event handlers for connection success and fail events  
//
mongoose.connection.on('error', function(err){
  console.log('database connect error '+err);
});

mongoose.connection.on('open', function() {
  console.log('database '+config.DATABASE+' is now open on '+config.HOST );
});


console.log('starting web server');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080, '127.0.0.1');  // 8080 is an alternate HTTP port you can use to 80. enter IP address (theres no call to get it)

console.log('NodeJS WebServer now running at http://127.0.0.1:8080/');
