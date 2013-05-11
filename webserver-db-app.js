/**
 * webserver-db-app.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * a "HELLO WORLD" server-side application to demonstrate running a node 
 * Webserver and a mongo DB on separate instances on AWS EC2.
 * Uses the Express and Mongoose node packages. 
 * 
 * 
 * @throws none
 * @see nodejs.org
 * @see express.org
 * @see mongoosejs.com
 * 
 * @author Ceeb
 * (C) 2013 Fatkahawai
 */

var http      = require('http');
var mongoose  = require('mongoose');
var express   = require('express');

var app       = express();

var config = {
      "USER"     : "",                  // if your database has user/pwd defined
      "PASS"     : "",
      "HOST"     : "ec2-54-252-31-96.ap-southeast-2.compute.amazonaws.com",  // the domain name of our MongoDB EC2 instance
      "PORT"     : "27017",             // this is the default port mongoDB is listening for incoming queries
      "DATABASE" : "my_example"         // the name of your database on that instance
    };

var dbPath  = "mongodb://" + config.USER + ":" +
    config.PASS + "@"+
    config.HOST + ":"+
    config.PORT + "/"+
    config.DATABASE;

var standardGreeting = 'Hello World!';

var db;              // our MongoDb database

var greetingSchema;  // our mongoose Schema
var Greeting;        // our mongoose Model

// create our schema
greetingSchema = mongoose.Schema({
  sentence: String
});
// create our model using this schema
Greeting = mongoose.model('Greeting', greetingSchema);

// ------------------------------------------------------------------------
// Connect to our Mongo Database hosted on another server
//
console.log('\nattempting to connect to remote MongoDB instance on another EC2 server '+config.HOST);

if ( !(db = mongoose.connect(dbPath)) )
  console.log('Unable to connect to MongoDB at '+dbPath);
else 
  console.log('connecting to MongoDB at '+dbPath);

// connection failed event handler
mongoose.connection.on('error', function(err){
  console.log('database connect error '+err);
}); // mongoose.connection.on()

// connection successful event handler:
// check if the Db already contains a greeting. if not, create one and save it to the Db
mongoose.connection.once('open', function() {
  var greeting;
  
  console.log('database '+config.DATABASE+' is now open on '+config.HOST );
  
  // search if a greeting has already been saved in our db
  Greeting.find( function(err, greetings){
    if( !err && greetings ){ // at least one greeting record already exists in our db. we can use that
      console.log(greetings.length+' greetings already exist in DB' );
    }
    else { // no records found
      console.log('no greetings in DB yet, creating one' );

      greeting = new Greeting({ sentence: standardGreeting });
      greeting.save(function (err, greetingsav) {
        if (err){ // TODO handle the error
          console('couldnt save a greeting to the Db');
        }
        else{
          console.log('new greeting '+greeting.sentence+' was succesfully saved to Db' );

          Greeting.find( function(err, greetings){
            if( greetings )
              console.log('checked after save: found '+greetings.length+' greetings in DB' );
          }); // Greeting.find()
        } // else
      }); // greeting.save()
    } // if no records
  }); // Greeting.find()

  
}); // mongoose.connection.once()

// ------------------------------------------------------------------------
// set up Express routes to handle incoming requests
//
// Express route for all incoming requests
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
      if(greetings){
        console.log('found '+greetings.length+' greetings in DB');
        // send newest greeting 
        responseText = greetings[0].sentence;
      }
      console.log('sending greeting to client: '+responseText);
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

// ------------------------------------------------------------------------
// Start Express Webserver
//
console.log('starting the Express (NodeJS) Web server');
app.listen(8080);
console.log('Webserver is listening on port 8080');
