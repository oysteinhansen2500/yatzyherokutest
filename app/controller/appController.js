var Test = require('../model/appModel.js');


exports.list_all_users = function(req, res) {
  Test.getAllData(function(err, test) {

    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', test);
    res.send(test);
  });
};
