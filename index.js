window.onload=function(){

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

let array,
    directory = 0,
    files = 0;

getJSON('./jsonExport.json',
function(err, data) {
  if (err != null) {
    console.log(err);
  } else {
    array = data;
    console.log(array);
    return DrawTreePath(data);
  }
});

function CalcTree (arr) {
  arr.map(item=>{
    if(item.types == 'File') {
      files += 1;
    } else if (item.types == 'Directory') {
      directory += 1;
    }
  });
}

function DrawTreePath(datas) {
      CalcTree(array);
      let CreateUl = document.createElement('ul'),//Create Root List 
        textTitle = document.createTextNode(`NodeJS App by FreeBSDwinXP for scan PATH ==> ${array[0].rootnode} <== Directories: ${directory} ||||| Files: ${files} ${String.fromCharCode(0x25BC)}`),
        title = document.createElement('span');
      for (let i=0; i<datas.length; i++)  {//Algoritm for Tree
        let item = datas[i],//Set item in list directory
        parentIdItem = '_'+item.parent,//Set parent id for item
        itemId = '_'+item.id,//Set id for item
        itemNames = `${item.types}--${item.names}`,//Set names to our Objects
        itemParent = CreateUl.querySelector('#'+parentIdItem);//Search Parent for Item in ALL Root List
        if (!itemParent) {//if not found Parent for Item
          itemParent = document.createElement('li');//Create Parent for Item
          itemParent.id = parentIdItem;//Set id for Parent
          CreateUl.appendChild(itemParent);//Add Parent to Root List
          }
          let parent = itemParent.querySelector('ul');//Search existed list in Parent for Item
            if(!parent) {//if not found list in Parent
                itemParent.className = 'directory opened';//Set class to Parent type Directory with Files
                parent = document.createElement('ul');//Create new list
                itemParent.appendChild(parent);//Add new list to Parent for Item
            }
            item = CreateUl.querySelector('#'+itemId);//Search Item in Root List
              if(!item) {//if not found list in Parent
                item = document.createElement('li');//Create our Item
                item.id = itemId;//Set id for Item
                if (datas[i].types == 'Directory') {//if Item Directory
                  item.className = 'directory opened';
                 }
              }
              item.insertBefore(document.createTextNode(itemNames),item.firstChild);//Write Name our Item
              
              parent.appendChild(item);//Add Item to it Parent
            }
            title.classList.add('rootList');//Set class for Title
            title.appendChild(textTitle);//Add text to Title
            CreateUl.firstChild.insertBefore(title, CreateUl.firstChild.firstChild);//Write Title in Root List
            document.body.appendChild(CreateUl);//Add Root List to HTML page
            return Click();
  }

function Click() {
  
      [].forEach.call(document.querySelectorAll(".directory"), function(c) {//Choose all directory in Root List
        c.addEventListener("click", function(a) {//add function on element when "click"
            a = a.target;
            a == c && a.classList.toggle("opened");//close or open list in Directories
        });
    });
  }
};
