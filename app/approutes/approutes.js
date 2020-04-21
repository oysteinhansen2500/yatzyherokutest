'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/todoListController');

  // todoList Routes
  app.route('/test')
    .get(todoList.list_all_tasks)
    .post(todoList.create_a_task);


    };
