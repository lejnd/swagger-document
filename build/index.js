var sysList = {0};
var ul = document.getElementById('list');
sysList.forEach((sys)=>{
 var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '/swagger-ui/?url=/' + sys.folder + '/index.json';
    a.innerText = sys.name;
    li.appendChild(a);
    ul.appendChild(li);
});