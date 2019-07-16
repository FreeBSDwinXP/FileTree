  window.onload=function(){


var beginObj = {
    0: {
        parent: 1
    },
    1: {
        parent: 4
    },
    2: {
        parent: 3
    },
    3: {
        parent: 4
    },
    4: {
        parent: ""
    },
    5: {
        parent: ""
    },
    6: {
        parent: ""
    },
    7: {
        parent: 8
    },
    8: {
        parent: ""
    },
    9: {
        parent: 10
    },
    10: {
        parent: ""
    }
};
/* переделка обьекта в массив */
var data = Object.keys(beginObj).map(function (key,i) {

  return {"id" : key,"cat_name":"Dashboard"+i,"parent": beginObj[key].parent  }

});
var n = 0 ;
function rec(data) {
  console.log(data);
    var f = document.createElement('ul');
      for (var i=0; i<data.length; i++)  {
      var li = data[i];
      var parentId = '_'+li.parent;
      var liParent = f.querySelector('#'+parentId);
      if (!liParent) {
      liParent = document.createElement('li');
      liParent.id = parentId;
      f.appendChild(liParent);
      } ;
      var ul = liParent.querySelector('ul');
      if(!ul) {
          liParent.className = 'selfSwitcher';
          ul = document.createElement('ul');
          liParent.appendChild(ul)
      };
      var liId = '_'+li.id;
      var liText = li.cat_name;
      li = f.querySelector('#'+liId);
      if(!li) {
         li = document.createElement('li');
         li.id = liId;
      }
      li.insertBefore(document.createTextNode(liText),li.firstChild );
      ul.appendChild(li)
    }
    f.firstChild.insertBefore(document.createTextNode('menu'), f.firstChild.firstChild )
    x.appendChild(f)

}
rec(data);


 Array.prototype.forEach.call(document.querySelectorAll(".selfSwitcher"), function(c) {
    c.addEventListener("click", function(a) {
        a = a.target;
        a == c && a.classList.toggle("opened")
    })
});
}