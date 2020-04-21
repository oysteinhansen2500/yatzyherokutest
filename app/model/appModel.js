'user strict';
var sql = require('./db.js');


var Test = function(test){
  this.test = task.test;
};


Test.getAllData = function (test, result) {
        sql.query("Select * from users", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('tasks : ', res);

                 result(null, res);
                }
            });
