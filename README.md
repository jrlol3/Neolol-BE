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
$ npm ci
```

Make a copy of the file `.env-TEMPLATE` and name it `.env`, then fill the information following the comments.

Run the server, at port 5000 by default:
```bash
$ npm run start
```

Accessing http://localhost:5000/ will return an empty list, but you can add some sample data with:
```bash
$ npm run sample
```

You can also reset the database to its blank state with:
```bash
$ npm run clean
```

### Running the [Front-End](https://github.com/Neolol-source/Neolol-FE)
TBD

### Running the Tests
TBD

### Docker
TBD

## Documentation

### [Swagger](https://swagger.io/)  
You can paste [Swagger YAML](docs/api.yml) at https://editor.swagger.io/  
Or open the [Swagger UI HTML at /docs/swagger.html](docs/swagger.html) locally  
Both are updated at every run   

### [Postman](https://www.postman.com/)
You can import the Postman collection on [NEOLOL.postman_collection.json](docs/postman/NEOLOL.postman_collection.json)  
The collection uses Environment Variables, which you can also import on [Alpha.postman_environment.json](docs/postman/Alpha.postman_environment.json)  
It is incomplete, as it takes effort to keep up with development, but it is useful for manual testing  

### Project Structure
TBD

## Contributing
TBD

## Built with
- [Next.js](https://nextjs.org/)
- [MySQL](https://www.mysql.com/)
- [Sequelize ORM](https://sequelize.org/)
- [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/)
