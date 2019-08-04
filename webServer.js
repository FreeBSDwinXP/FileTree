const http = require("http"),
    fs = require("fs"),
    path = require('path'),
    mysql = require("mysql2"),
    open = require('open');

let positionId = -1,
    array = [],
    pathUser = process.argv[2],
    msqlPathUser = pathUser.replace(/[^\w\d]/g, '');

//MySQL database Parametres
const paramSql = {
        host: "localhost",
        user: "root",
        password: "freebsdwinxp"},
    connection = mysql.createConnection(paramSql).promise(),
    pool = mysql.createPool({
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        database: msqlPathUser,
        password: "freebsdwinxp"}).promise(),
    sqlTable = `create table if not exists objectsTree(
        id int primary key auto_increment,
        idObj TEXT not null,
        name TEXT not null,
        parent TEXT not null,
        path TEXT not null,
        type TEXT not null,
        levelUpPath TEXT not null,
        rootnode TEXT not null)`;

//Algoritm correct work APP
connection.query(`DROP DATABASE IF EXISTS ${msqlPathUser}`)
    .then(result=>{
        console.log(`STEP 1 - Database ${msqlPathUser} deleted if exists`);
        console.log(`STEP 2 - Create clear Database ${msqlPathUser}`);
        return connection.query(`CREATE DATABASE ${msqlPathUser}`);
    })
    .then(result=>{
        console.log(`Database ${msqlPathUser} created`);
        console.log(`STEP 3 - Create Table objectsTree`);
        connection.end();
        return pool.query(sqlTable);
    })
    .then(result=>{
        console.log(`Table created`);
        console.log(`STEP 4 - Start explore PATH ${pathUser}`);
        return explorePath(pathUser);
    })
    .then(result=>{
        console.log(`Path scan DONE`);
        console.log('STEP 5 - Database query');
        return pool.execute("SELECT * FROM objectsTree");
    })
    .then(result=>{
        console.log(result[0]);
        console.log('STEP 6 - RUN JSON create');
        return JsonTree(array);
    })
    .then(result=>{
        console.log('STEP 7 - RUN WEB-server');
        return WEB(8080);
    })
    .catch(function(err) {
        console.log('error!!');
        console.log(err.message);
    });


//Recursive Search Function
function explorePath (startPath, parent = "") {
    return new Promise((res, rej) => {
        fs.readdir(startPath, function(err, items) {
          if (err) {
              return rej(err);
          }
          items.map(function (item) {
            positionId += 1; 
        	let levelUpPath = path.dirname(startPath),
                type = 'File',
                Objec = {};
            Objec.id = String(positionId);
	        Objec.names = item;
            Objec.parent = parent;
	        Objec.path = startPath;
	        Objec.levelUpPath = levelUpPath;
	        Objec.rootnode = pathUser;
            if (fs.lstatSync(path.join(startPath,item)).isDirectory()) {
                type = 'Directory';
                explorePath(path.join(startPath,item), + Objec.id);
                }
            Objec.types = type;  
            array.push(Objec);
	        const sqlAddDataFile = `INSERT objectsTree(idObj, name, parent, path, type, levelUpPath, rootnode) VALUES ('${Objec.id}', '${item}', '${Objec.parent}', '${startPath}', '${type}', '${levelUpPath}', '${pathUser}')`;
            pool.query(sqlAddDataFile, function(err, results) {
                if(err) {
                    console.log(err);
                }
            });
        	});
          return res(items);
        });
      });
    }

//Transform array to JSON file
function JsonTree (file) {
    let json = JSON.stringify(file);
    return new Promise((resolve, reject) => {
        fs.writeFile('jsonExport.json', json, function(err, data) {
          if (err) throw err;
          return resolve(console.log("JSON file create"));
        });
      });
}	

//WEB SERVER
function WEB (port){
	http.createServer(function(request, response){
        console.log(`request: ${request.url}`);
        const filePath = request.url.substr(1);//identify request file
        fs.access(filePath, fs.constants.R_OK, err => {//Check availability
            if(err){//if unavailabale => status 404
                response.statusCode = 404;
                response.end("Resourse not found!");
            }
            else{// if ok => unload requested file
                fs.createReadStream(filePath).pipe(response);
            }
        });
    }).listen(port, function(){//start web-server on port
    console.log(`PLease open in your browser http://127.0.0.1:${port}/index.html`);
    (async () => {
    // Opens the url in the default browser
    await open(`http://127.0.0.1:${port}/index.html`);})()
    });
}
