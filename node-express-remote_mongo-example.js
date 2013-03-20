/**
 * node-express-remote_mongo-example.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * a "HELLO WORLD" server-side application to demonstrate running node and mongo on separate instances on AWS EC2.
 * 
 * 
 * install node on the primary EC2 instance then install mongoDB from the AWS marketplace - it will be 
 * installed on a second EC2 instance. open port 27017 for the node isntance's security group on the mongoDB instance
 * then install the express and mongoose node packages on the node instance, using
 * $ npm install mongoose
 * $ npm install express
 * 
 * @throws none
 * @see 
 * 
 * @author Bob Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

var http = require('http');
var mongoose  = require('mongoose');
var express = require('express');

var app = express();

var config = {
      "USER"     : "",                  // if your database has user/pwd defined
      "PASS"     : "",
      "HOST"     : "ec2-54-252-31-96.ap-southeast-2.compute.amazonaws.com",  // the domain name of the MongoDB EC2 instance
      "PORT"     : "27017",             // this is the default port mongoDB is listening for incoming queries
      "DATABASE" : "my_example"               // the name of your database
    };

var dbPath  = "mongodb://" + config.USER + ":";
    dbPath += config.PASS + "@";
    dbPath += config.HOST + ":";
    dbPath += config.PORT + "/";
    dbPath += config.DATABASE;

var db;              // our MongoDb database
var greetingSchema;  // mongoose Schema
var Greeting;        // mongoose Model

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
}); // mongoose.connection.on()

mongoose.connection.once('open', function() {
  var greeting;
  
  console.log('database '+config.DATABASE+' is now open on '+config.HOST );
  
  greetingSchema = mongoose.Schema({
    sentence: String
  });
  Greeting = mongoose.model('Greeting', greetingSchema);
  
  greeting = new Greeting({ sentence: 'Hello World!' });
  console.log('new greeting saved to DB: '+ greeting.sentence );
  
  Greeting.find( function(err, greetingslist){
      if( greetingslist )
        console.log('check ok: found saved '+greetingslist.length+' greetings in DB: ' );
  });
}); // mongoose.connection.once()

//
// Set up Routes to handle requests from browsers
//

// Authentication
app.use( express.basicAuth('admin', 'password') );  // only allow access to usr=admin, pwd=password

// set up route to handle incoming webpage requests
app.get('/', function(req, res){
  var responseText = '';

  console.log('received client request')
  if( !Greeting )
    console.log('Database not ready');
  
  // look up all greetings in our DB
  Greeting.find(function (err, greetings) {
    if (err) {
      console.log('couldnt find a greeting in DB. error '+err);
      next(err);
    }
    else {
      console.log('found a greeting in DB: '+greetings);
      // send newest greeting 
      if(greetings)
        responseText = greetings[greetings.length-1].sentence;
  
      console.log('sending greeting to client: '+responseText);
      res.send(responseText);
    }
  });
}); // apt.get()

//
// set up route to handle errors
//
app.use(function(err, req, res, next){
  if (req.xhr) {
    res.send(500, 'Something went wrong!');
  } else {
    next(err);
  }
}); // apt.use()

console.log('starting the Express (NodeJS) Web server');
app.listen(8080);
console.log('Webserver is listening on port 8080');
