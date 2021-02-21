# NEOLOL Back-end

#### [Front-End Repository](https://github.com/Neolol-source/Neolol-FE)

#### [Feature list on Trello](https://trello.com/b/b5gN1DpV/neolol-planned-features)


## Getting Started

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
| Folder       | Description  |
| ------------ | ------------ |
| config       | Keeps environment variables, cookie setup and keys |
| constants    | Keeps configurations in an easy to import way |
| controllers  | Deals with request validation, utilizes services and returns responses  |
| database     | Configures the database while storing queries and sample data |
| helpers      | Contains simple code used by other classes |
| middlewares  | Next.js middlewares and error handling |
| models       | Keeps all the database entities in an easy to import way |
| routes       | Configures all Express routes and keeps the Swagger docs |
| services     | Handles all the business logic for the controllers |
| swagger      | Generates the Swagger docs from the info in routes |
| test         | Has all testing cases and data |
| utils        | Simple stateless code |

## Contributing  

We encourage you to contribute to NEOLOL!  
Please check our quite short [Contribution Guide](CONTRIBUTING.md).  

You can also discuss features and bugs on our issues page.

## Built with
- [Next.js](https://nextjs.org/)
- [MySQL](https://www.mysql.com/)
- [Sequelize ORM](https://sequelize.org/)
- [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/)
