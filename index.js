    var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

let array;

getJSON('./jsonExport.json',
function(err, data) {
  if (err != null) {
    alert('Something went wrong: ' + err);
  } else {
    console.log(data);
    array = data;
  }
});

setTimeout (function() {LI(array)}, 1200)

function viewArray (ar) {
  ar.forEach(function(item){
    console.log(item.names, item.path, item.types, item.levelUpPath, item.rootnode);
  })
}

let html = '<ol>';

function LI (ar) {
ar.forEach(function(item, i, arr) {
  console.log(item.names); 
    html += `<li>${item.types}  =>  ${item.names}  Path=>  ${item.path} </li>`;
});
html += '</ol>'

document.write(html)};