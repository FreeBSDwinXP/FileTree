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
        console.log(`OLD MySQL base ${msqlPathUser} deleted`)
        return connection.query(`CREATE DATABASE ${msqlPathUser}`)
    })
    .then(result=>{
        console.log(`NEW MySQL Base ${msqlPathUser} created`)
        connection.end()
        return Promise.resolve(pool.query(sqlTable))
    })
    .then(result=>{
        console.log(`Table created in MySQL Base ${msqlPathUser}`)
        return Promise.resolve(explorePath(pathUser))
    })
    .then(result=>{
        return pool.execute("SELECT * FROM objectsTree")
    })
    .then(result=>{
  	console.log(result[1]);
  	console.log(array);
        return setTimeout(function(){JsonTree(array)}, 2000)
    })
    .then(result=>{
        return WEB(8080)
    })
    .catch(function(err) {
        console.log(err.message);
    });


//Recursive Search Function
function explorePath (startPath, parent = "") {
    let ArrRes = fs.readdir(startPath, function(err, items) {
        console.log(`Number of Objects in path ${startPath} are ${items.length} ${String.fromCharCode(0x25BC)}`);
        console.log('===============================');
        if (items.length == 0) {
            return console.log(`${startPath} is empty`)
        } else {
        	let new_items = items.map(function (item) {
            positionId += 1; 
        	console.log(`item is ${item}`);
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
                } else {
                    console.log(`New object added to objectsTree Table`);
                    }
                });
				return Objec;
        	});
            return new_items;}
        });
    return ArrRes;
}


//Transform array to JSON file
function JsonTree (file) {
	let json = JSON.stringify(file);
	fs.writeFile('jsonExport.json', json, function(err) {
		if (err) throw err;
		return console.log('/////////////JSON-complete//////////////////');
		}
	);
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





