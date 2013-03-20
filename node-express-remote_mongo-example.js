/**
 * node-express-remote_mongo-example.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * a "HELLO WORLD" server-side application to demonstrate running a node 
 * Webserver and a mongo DB on separate instances on AWS EC2.
 * 
 * install node on the primary EC2 instance then install mongoDB from the AWS 
 * marketplace - it will be installed on a second EC2 instance. open port 27017
 * for the node isntance's security group on the mongoDB instance then install
 * the express and mongoose node packages on the node instance, using
 * $ npm install mongoose
 * $ npm install express
 * 
 * @throws none
 * @see nodejs.org
 * @see express.org
 * 
 * @author Robert Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

var http      = require('http');
var mongoose  = require('mongoose');
var express   = require('express');

var app    = express();

var config = {
      "USER"     : "",                  // if your database has user/pwd defined
      "PASS"     : "",
      "HOST"     : "ec2-54-252-31-96.ap-southeast-2.compute.amazonaws.com",  // the domain name of the MongoDB EC2 instance
      "PORT"     : "27017",             // this is the default port mongoDB is listening for incoming queries
      "DATABASE" : "my_example"               // the name of your database
    };

var dbPath  = "mongodb://" + config.USER + ":" +
    config.PASS + "@"+
    config.HOST + ":"+
    config.PORT + "/"+
    config.DATABASE;

var db;              // our MongoDb database

var greetingSchema;  // our mongoose Schema
var Greeting;        // our mongoose Model

//
// Connect to our Mongo Database hosted on another server
//
console.log('\nattempting to connect to remote MongoDB instance on another EC2 server '+config.HOST);

if ( !(db = mongoose.connect(dbPath)) ){
  console.log('Unable to connect to MongoDB at '+dbPath);
} 
else console.log('connecting to MongoDB at '+dbPath);

// set up event handlers for connection success and fail events

// connection failed event handler
mongoose.connection.on('error', function(err){
  console.log('database connect error '+err);
}); // mongoose.connection.on()

// connection successful event handler
mongoose.connection.once('open', function() {
  var greeting;
  
  console.log('database '+config.DATABASE+' is now open on '+config.HOST );
  
  greetingSchema = mongoose.Schema({
    sentence: String
  });
  Greeting = mongoose.model('Greeting', greetingSchema);
  
  greeting = new Greeting({ sentence: 'Hello World!' });
  greeting.save(function (err, greetingsav) {
    if (err) // TODO handle the error
      console('couldnt save greeting to Db');
    else{
      console.log('new greeting saved to DB: '+ greeting.sentence );

      Greeting.find( {sentence: /^H/}, function(err, greetingslist){
        if( greetingslist )
          console.log('check ok: found saved '+greetingslist.length+' greetings in DB' );
      }); // Greeting.find()
    } // else
  }); // greeting.save()
}); // mongoose.connection.once()

// set up Express route to handle incoming webpage requests
app.get('/', function(req, res){
  var responseText = '';

  console.log('received client request');
  if( !Greeting )
    console.log('Database not ready');
  
  // look up all greetings in our DB
  Greeting.find(function (err, greetings) {
    if (err) {
      console.log('couldnt find a greeting in DB. error '+err);
      next(err);
    }
    else {
      console.log('found '+greetings.length+' greetings in DB. using most recent greeting');
      // send newest greeting 
      if(greetings)
        responseText = greetings[greetings.length-1].sentence;
  
      console.log('sending latest greeting to client: '+responseText);
      res.send(responseText);
    }
  });
}); // apt.get()

//
// Express route to handle errors
//
app.use(function(err, req, res, next){
  if (req.xhr) {
    res.send(500, 'Something went wrong!');
  } else {
    next(err);
  }
}); // apt.use()

//
// Start Express Webserver
//
console.log('starting the Express (NodeJS) Web server');
app.listen(8080);
console.log('Webserver is listening on port 8080');
