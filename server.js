var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var _           = require('underscore');
var fs          = require('fs');
var jsonfile    = require('jsonfile');
var JSONFormatter = require("simple-json-formatter");
var csvjson     = require('csvjson');
var multipart      = require('connect-multiparty');
var mv = require('mv');

var port        = process.env.PORT || 7070;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public'));


app.get('/',function(req,res){
  res.sendFile(__dirname + "/index.html");
});
var header;
app.post('/api/photo',multipart(),function(req,res){
    //console.log(req.files);
    //console.log(req.body)
    var imageName     = req.files.userPhoto.name;
    var imagePath   = req.files.userPhoto.path;
    header      = req.body.header;
    //console.log(header) 

    var sourcePath  = imagePath;
    var folder = "public/upload/"+imageName
    //console.log(imagePath)
    //console.log(folder)

    mv(imagePath, folder, function(err) {
      // done. it tried fs.rename first, and then falls back to 
      // piping the source file to the dest file and then unlinking 
      // the source file. 
      if(err){
        console.log('errrrrr'+err);
      }else{
        //console.log('sucesss');
        res.send('upload sucesssfully')
      }
    });
});


app.post('/submitJson', function (req,res) {
  //console.log(req.body)
  var data        = fs.readFileSync('public/upload/'+req.body.file, { encoding : 'utf8'});
  var options = {
   delimiter : ',', // optional
   quote     : '"' // optional
  };
  var csvHeaders = header.split(",");
  var firstLevelNode = csvHeaders[0];
  var secondLevelNode = csvHeaders[1];


  var file = csvjson.toObject(data,options);


  var obj = {};
  var inObj = {};
  var result = _.groupBy(file,firstLevelNode);

  
  for(var i in result){
      for(var j =0;j<result[i].length;j++){
       _.forEach(result[i][j],function (value,key) {
        if(result[i][j][key] == '' || result[i][j][key] == null){
         delete result[i][j][key];
        }
       })
        inObj[result[i][j][secondLevelNode]] = result[i][j];
        delete result[i][j][secondLevelNode];
        delete result[i][j][firstLevelNode];
           //console.log(inObj)
      }

      obj[i] = inObj;
      inObj = {};
  }    

  fs.unlink('public/upload/final.json', function (err,result) {
    fs.appendFile('public/upload/final.json', JSONFormatter.format(JSON.stringify(obj),"\t"), function(err,response) {
         if(err){
          }else{
              //console.log(res);
              unlink();
              res.send('fff')
          }
    });
  })

})

var unlink = function (argument) {
  

  setTimeout(function () {
     fs.readdir('public/upload/.',function (err, files){  
     for (var i = 0, len = files.length; i < len; i++) {
          //console.log(files)
          fs.unlink('public/upload/'+files[i], function (err,result) {
          });
        /*var match = files[i].match(/en.*.js/);
        if(match !== null)
            fs.unlink(match[0]);*/
     }
  });

  },2000)
 
  // body...
}
app.listen(port, function () {
  console.log("Server listening on port ", port);
})  