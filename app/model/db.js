import mysql from 'mysql';

// Setup MySQL-server connection
var connection = mysql.createConnection({
  host: 'mysql-ait.stud.idi.ntnu.no',
  user: 'g_dcst1008_3',
  password: '0u2ytjnl',
  database: 'g_dcst1008_3'
});

// Connect to MySQL-server
connection.connect(error => {
  if (error) return console.error(error); // If error, show error in console (in red text) and return
});
module.exports = connection;
