const http = require("http");
const fs = require("fs");
const rl = require('readline');
const path = require('path');
const mysql = require("mysql2");
const open = require('open');



let pathUser = process.argv[2];

let msqlPathUser = pathUser.replace(/[^\w\d]/g, '');

  //MySQL database
let paramSql = {
  host: "localhost",
  user: "root",
  password: "freebsdwinxp"
}

const connection = mysql.createConnection(paramSql).promise();

const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: msqlPathUser,
  password: "freebsdwinxp"
}).promise();

const sqlTable = `create table if not exists objectsTree(
  id int primary key auto_increment,
  name varchar(255) not null,
  path varchar(255) not null,
  type varchar(255) not null,
  levelUpPath varchar(255) not null,
  rootnode varchar(255) not null)`;

connection.query(`DROP DATABASE IF EXISTS ${msqlPathUser}`)
    .then(result=>{
        console.log(`OLD MySQL base ${msqlPathUser} deleted`)
        return connection.query(`CREATE DATABASE ${msqlPathUser}`)
    })
    .then(result=>{
    	console.log(result);
        console.log(`NEW MySQL Base ${msqlPathUser} created`)
        connection.end()
        return Promise.resolve(pool.query(sqlTable))
    })
    .then(result=>{
    	console.log(result);
        console.log(`Table created in MySQL Base ${msqlPathUser}`)
        return Promise.resolve(explorePath(pathUser))
    })
    .then(result=>{
    	console.log(result);
        console.log(`Scan is finished. Result is ----`)
        console.log(result);
        return pool.execute("SELECT * FROM objectsTree")
    })
    .then(result=>{
  	console.log(result[1]);
  	console.log(array);
        return JsonTree(array)
    })
    .then(result=>{
        return WEB(8080)
    })
    .catch(function(err) {
        console.log(err.message);
    });


//Recursive Search Function

  function explorePath (startPath) {
    
    let ArrRes = fs.readdir(startPath, function(err, items) {
        console.log(`Number of Objects in path ${startPath} are ${items.length} ${String.fromCharCode(0x25BC)}`);
        console.log('===============================');
        if (items.length == 0) {
            return console.log(`${startPath} is empty`)
        } else {

        	let new_items = items.map(function (item) {
        			console.log(`item is ${item}`);
        			let levelUpPath = path.dirname(startPath);
	        		let type = 'File';
	        	if (fs.lstatSync(path.join(startPath,item)).isDirectory()) {
	        		type = 'Directory';
	        		explorePath(path.join(startPath,item))
	        	}
				let Objec = {};
	                Objec.names = item;
	                Objec.path = startPath;
	                Objec.types = type;
	                Objec.levelUpPath = levelUpPath;
	                Objec.rootnode = pathUser;
	                array.push(Objec);
	                console.log(array);
	            const sqlAddDataFile = `INSERT objectsTree(name, path, type, levelUpPath, rootnode) VALUES ('${item}', '${startPath}', '${type}', '${levelUpPath}', '${pathUser}')`;
                pool.query(sqlAddDataFile, function(err, results) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(`New object added to objectsTree Table`);
                        }
                    });
				return Objec;
        		});
			return new_items
            }
        });
    return ArrRes
	}

let array = [];

let jsonarr;	

function JsonTree (file) {
		console.log('***************************************************JSONARRAY');
		console.log(array);
		var json = JSON.stringify(file)
		console.log(json);
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





