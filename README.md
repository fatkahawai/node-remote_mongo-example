node-remote_mongo-example
=========================

A Node-Express Webserver on AWS EC2 with a MongoDB noSQL database on a second EC2 instance

a 'HELLO WORLD' server-side application to demonstrate running a node Webserver and a mongo DB on separate instances on AWS EC2.
Uses the Express and Mongoose node packages. 

install node on the primary EC2 instance, then install mongoDB from the AWS marketplace - it will be installed on a second EC2 instance. 

Go to the Security Groups for the MongoDB instance, and create a new inbound rule: 
open port 27017 for the node instance's security group so that database requests from there will be let throught the firewall.
Next install the express and mongoose node packages on the node instance, using
 $ npm install mongoose
 $ npm install express
 
Open a web browser and navigate to the IP address of your Node EC2 instance, appending port 8080
E.g. http://20.152.23.128:8080

You should see the Hello World appear in the browser window. 

(c) 2013 Pink Pelican Ltd