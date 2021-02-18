# NEOLOL Back-end

TBD

Front-end repository: https://github.com/Neolol-source/Neolol-FE

### How to start the app

##### Preparing the environment
Install MySQL, following the instructions on screen.
`$ sudo apt update`
`$ sudo apt install mysql-server`
`$ sudo systemctl restart mysql`

Configure MySQL credentials.
`$ mysql -u root -p`
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '[PASSWORD]';
FLUSH PRIVILEGES;
CREATE DATABASE test;
```

##### Preparing the app
On the repository folder, install all dependencies.
`$ npm install` 

Make a copy of the file `.env-TEMPLATE` and name it `.env`;
Fill the necessary information following the comments on the file.

Optionally, [create a Google ReCAPTCHA Key](https://developers.google.com/recaptcha/intro) for the v2 and v3 captchas


##### Running the app
Run the app.
`$ node server.js`

This will start the API on your localhost with the port 5000 by default.
Try accessing http://localhost:5000/

It will most likely return an empty list, so you can add some sample data with:
`$ node server.js --sample`

You can also reset the database to its blank state with:
`$ node server.js --drop`

### Documentation
Dynamic Swagger API documentation: TBD soon
Postman endpoint testing collection: TBD soon
Project structure summary: TBD
