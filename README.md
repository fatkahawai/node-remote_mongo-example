node-remote_mongo-example
=========================

example webserver for AWS EC2 using node with express and mongoose, which connects to a MongoDB on a second server instance

a "HELLO WORLD" server-side application to demonstrate running a node Webserver and a mongo DB on separate instances on AWS EC2.
Uses the Express and Mongoose node packages. 

install node on the primary EC2 instance, then install mongoDB from the AWS marketplace - it will be installed on a second EC2 instance. 

Go to the Security Groups for the MongoDB instance, and create a new inbound rule: 
open port 27017 for the node instance's security group so that database requests from there will be let throught the firewall.
Next install the express and mongoose node packages on the node instance, using
 $ npm install mongoose
 $ npm install express
 
