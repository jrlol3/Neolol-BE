# NEOLOL Back-end

#### [Front-End Repository](https://github.com/Neolol-source/Neolol-FE)  

#### [Feature list on Trello](https://trello.com/b/b5gN1DpV/neolol-planned-features)  


## Installation

Install [MySQL](https://dev.mysql.com/downloads/mysql/)  
```bash
$ sudo apt update
$ sudo apt install mysql-server
$ sudo systemctl restart mysql
```  

Configure MySQL credentials and create a Database 
```bash
$ mysql -u root -p
```  
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '[PASSWORD]';
FLUSH PRIVILEGES;
CREATE DATABASE test;
```

## Usage  

### Running this Back-End
On the repository folder, install all dependencies.  
```bash
$ npm install
```   

Make a copy of the file `.env-TEMPLATE` and name it `.env`;  
Fill the necessary information following the comments.  

Run the server.  
```bash
$ node server.js
```  

This will start the API on localhost with the port 5000 by default.  
Try accessing http://localhost:5000/  

It will likely return an empty list, so you can add some sample data with:  
```bash
$ node server.js --sample
```  

You can also reset the database to its blank state at every run with:  
```bash
$ node server.js --sample --drop
```  

### Running the Front-End
https://github.com/Neolol-source/Neolol-FE  
TBD

### Running the Tests
TBD

### Docker
TBD

## Documentation  
### Swagger  
You can paste [Swagger YAML](docs/api.yml) at https://editor.swagger.io/   
Or open the [Swagger UI HTML at /docs/swagger.html](docs/swagger.html) locally.  
Both are built at every run!  

### Postman Endpoint Collection  
TBD  

### Project Structure
TBD  

## Contributing
TBD

## Built with
- [Next.js](https://nextjs.org/)  
- [MySQL](https://www.mysql.com/)  
- [Sequelize ORM](https://sequelize.org/)
- [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/)