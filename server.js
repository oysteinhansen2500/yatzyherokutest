const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const mysql = require('mysql');
var cors = require('cors');
app.use(cors());
const mc = mysql.createPool({
    host: 'mysql-ait.stud.idi.ntnu.no',
    user: 'g_dcst1008_3',
    password: '0u2ytjnl',
    database: 'g_dcst1008_3'
});
//app.listen(process.env.PORT || 15004);
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT || 15004);
const whitelist = ['http://localhost:4200', 'http://testyatzyoy.herokuapp.com/'];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    console.log(origin);
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

app.use(cors(corsOptions));
/*
io.on('connection', (client) => {
  client.on('test', (test) => {
    console.log("client tester", test);
    client.emit('test', "test");

  })

  client.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);



  });
});*/
io.on('connection', (client) => {
  client.on('sockettest', test => {
    console.log("socket tester", test);
    client.emit('sockettest', test);
  })
  console.log("TEST");
  client.on('test', (test) => {
    console.log("client tester", test);
    client.emit('test', "test");
  })
})

  // here you can start emitting events to the client






app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser())
app.get('/ping', function (req, res) {
  var pong;
mc.query('SELECT username FROM users', function(err, results, fields) {
  if(err) throw err;
  pong=results;
   return res.send(results);
});




});

app.get('/gamelist/:id', function (req, res) {
  io.emit('cancer', "canceeeeeeer");
    mc.query(`SELECT * FROM users WHERE id = ?`, [req.params.id], function(err, results, fields) {
      if(err) throw err;
      console.log("pepega", results, req.headers.password);
      if (results.length>0) {
        if (results[0].password == req.headers.password) {

          mc.query('SELECT * FROM scoreboards WHERE player=? ORDER BY date desc', [req.params.id], function(err, results3, fields) {
            if(err) throw err;

            return res.send(200, results3);
          })

        } else {
          return res.sendStatus(401);
        }
      } else {
        return res.sendStatus(401);
      }


    })
})

/*
app.post('/gamelist/:id', (req, res) => {
  console.log("passord", req.params.id);
  mc.query(`INSERT INTO scoreboards (player) VALUES (?)`, [req.params.id], function(err, results, fields) {
    if(err) throw err;


  })


});*/
app.post('/changePassword/:id', function(req, res) {
  console.log("body", req.body);
  var id = req.params.id;
  var newPassword = req.body.password;
  console.log(typeof(id), typeof(newPassword));

  mc.query(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, id], function(err, results, fields){
    if(err) throw err;
    console.log("password updated");
    mc.query(`SELECT * from users WHERE id = ?`, [id], function(err, results, fields){
      console.log(results);
      if(err) throw err;
      console.log(results[0]);
      res.status(200).cookie('user', results[0]).json({
            success:true,
            redirectUrl: `../gamelist/${results[0].id}`
        });
    })

  })

  console.log("Updated password", req.body);

})
app.put('/gamelist/:id', function(req, res) {

  var d = new Date();
  console.log(typeof(d.getTime()));
  var id = req.params.id;
  var identifier = req.body.field;
  console.log("body.field:", req.body.field, typeof(req.body.field));
  mc.query(`INSERT INTO scoreboards (player, date) VALUES (?, ?)`, [req.params.id, d.getTime()], function(err, results, fields){

    mc.query(`INSERT INTO multiplayergame (id, name) VALUES (?, ?)`, [results.insertId, 'game'+results.insertId]);
    mc.query(`UPDATE scoreboards SET multiplayerid=(?) WHERE id=(?)`, [results.insertId, results.insertId]);
    if(err) throw err;
    return res.sendStatus(200);
  })
  console.log("Inserted into scoreboard", req.body);

})


app.get('/game/:id', function (req, res) {
  console.log(req.headers.email);
  mc.query(`SELECT player FROM scoreboards WHERE id = ?`, [req.params.id], function(err, results, fields) {
    console.log("resultat", results);

    if (results.length>0) {

    var playerID = results[0].player;
    mc.query(`SELECT * FROM users WHERE id = ?`, [playerID], function(err, results, fields) {
      if(err) throw err;
      console.log(results, req.headers.password);
      if (results.length>0) {
        if (results[0].password == req.headers.password) {

          var id = req.params.id;
          console.log("the id", req.params.id);
          mc.query('SELECT multiplayerid from scoreboards where id=?', [id], function(err, results, fields) {
            console.log("mpid", results);
            mc.query('SELECT multiplayergame.round, users.username, multiplayergame.boardDice, multiplayergame.savedDice, scoreboards.id, scoreboards.player, scoreboards.ones, scoreboards.twos, scoreboards.threes, scoreboards.fours, scoreboards.fives, scoreboards.sixes, scoreboards.one_pair, scoreboards.two_pairs, scoreboards.triplet, scoreboards.four_of_a_kind, scoreboards.small_straight, scoreboards.large_straight, scoreboards.chance, scoreboards.yatzy, scoreboards.full_house, scoreboards.date, scoreboards.rounds, scoreboards.score, scoreboards.attempts, scoreboards.multiplayerid FROM scoreboards INNER JOIN users on scoreboards.player=users.id INNER JOIN multiplayergame on multiplayergame.id=scoreboards.multiplayerid WHERE multiplayerid=(?)', [results[0].multiplayerid], function(err, results, fields) {
              if(err) throw err;
              console.log("id", results);

              return res.send(results);
            })
          })


        } else {
          console.log("EMAIL:", req.headers.username);
          mc.query(`SELECT * FROM users WHERE username=(?)`, [req.headers.username], function(err, results, fields) {
            console.log("results1", results)
            mc.query(`SELECT date, multiplayerid FROM scoreboards WHERE id=?`, [req.params.id], function(err2, results2, fields2) {
              console.log("results2", results2)
                mc.query(`SELECT * from scoreboards WHERE multiplayerid = (?) AND player = (?)`, [results2[0].multiplayerid, req.headers.id], function(err3, results3, fields3) {
                  console.log(results3.length);
                  if (results3.length==0) {
                    mc.query(`INSERT INTO scoreboards (player, date, multiplayerid) VALUES (?, ?, ?)`, [results[0].id, results2[0].date, results2[0].multiplayerid]);
                    mc.query(`UPDATE multiplayergame SET playercount=playercount+1 WHERE id=(?)`, [results2[0].multiplayerid]);
                  }
                })

            });
            mc.query('SELECT multiplayergame.round, users.username, multiplayergame.boardDice, multiplayergame.savedDice, scoreboards.id, scoreboards.player, scoreboards.ones, scoreboards.twos, scoreboards.threes, scoreboards.fours, scoreboards.fives, scoreboards.sixes, scoreboards.one_pair, scoreboards.two_pairs, scoreboards.triplet, scoreboards.four_of_a_kind, scoreboards.small_straight, scoreboards.large_straight, scoreboards.chance, scoreboards.yatzy, scoreboards.full_house, scoreboards.date, scoreboards.rounds, scoreboards.score, scoreboards.attempts, scoreboards.multiplayerid FROM scoreboards INNER JOIN users on scoreboards.player=users.id INNER JOIN multiplayergame on multiplayergame.id=scoreboards.multiplayerid WHERE multiplayerid=(?)', [req.params.id], function(err, results, fields) {
              if(err) throw err;
              console.log("id from result", results);
              console.log("emitting");

              return res.send(results);
            })


          })


        }
      } else {
        return res.sendStatus(401);
      }


    })
  } else {
    return res.sendStatus(401);
  }

  })


})

app.put('/storedice', function(req, res) {
  console.log("storing attempt");
  console.log(req.body);
  var id = req.body.id;
  //mc.query('INSERT IN')
  mc.query(`UPDATE multiplayergame SET boardDice = ?, savedDice = ? WHERE id = ?`, [req.body.dice, req.body.savedDice, id], function(err, results, fields){
    if(err) throw err;

io.sockets.emit('reloadGame', "test");
    return res.send(results);
  })


})
app.put('/storeattempt', function(req, res) {
  console.log("storing attempt");
  console.log(req.body);
  var id = req.body.id;
  mc.query(`UPDATE multiplayergame SET boardDice = ?, savedDice = ? WHERE id = ?`, [req.body.dice, req.body.savedDice, req.body.mpid]);
  mc.query(`UPDATE scoreboards SET attempts = attempts-1 WHERE id = ?`, [id], function(err, results, fields){
    if(err) throw err;
    io.sockets.emit('reloadGame', "test");
    return res.send(results);
  })


})

app.put('/game/:id', function(req, res) {
  console.log("cancer:", req.body.player);
  var id = req.params.id;
  var identifier = req.body.field;
  console.log("body.field:", req.body.field, typeof(req.body.field));
  mc.query('UPDATE multiplayergame SET boardDice = null, savedDice = null WHERE id = ?', [req.body.mpid]);
  mc.query(`UPDATE scoreboards SET ${req.body.field} = ? WHERE multiplayerid = (?) AND player=(?)`, [req.body.value, parseInt(req.params.id), req.body.player], function(err, results, fields){
  //io.sockets.emit('reloadGame', "test");
    if(err) throw err;



  console.log(req.params.id);
  mc.query(`UPDATE scoreboards SET attempts = 3 WHERE multiplayerid = (?) AND player=(?)`, [req.params.id, req.body.player]);
  mc.query(`UPDATE scoreboards SET rounds = rounds+1 WHERE multiplayerid = (?) AND player=(?)`, [req.params.id]);
  mc.query(`UPDATE scoreboards SET score = score+? WHERE multiplayerid = (?) AND player=(?)`, [req.body.value ,req.params.id, req.body.player]);
  mc.query(`SELECT round, playercount FROM multiplayergame WHERE id=(?)`, [req.params.id], function(err2, results2, fields2){
    if (results2[0].round == results2[0].playercount-1) {
      mc.query(`UPDATE multiplayergame SET round = 0 WHERE id = (?)`, [req.params.id]);
    } else{
    mc.query(`UPDATE multiplayergame SET round = round+1 WHERE id = (?)`, [req.params.id]);
    }
  });

  console.log("Inserted into scoreboard", req.body);
        io.sockets.emit('reloadGame', "test");
return res.send(results);
});
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});




app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/bonkers', (req, res) => {
  res.send({dwyouareadog: "dw you are a dog"});
})


app.get('/login/:id', (req, res) => {
  console.log("req", req.params.id);
  mc.query(`SELECT salt FROM users WHERE username = (?)`, [req.params.id], function(err, results, fields){
    if(err) {console.log("err", err); throw err;}
    console.log(results);
    return res.send(results);
  })
})

app.post('/api/login', (req, res) => {
  console.log("body", req.body);
  console.log("req", req.params.id);
  mc.query(`SELECT salt FROM users WHERE username = (?)`, [req.body.email], function(err, results, fields){
    if(err) {console.log("err", err); throw err;}
    console.log(results);
    return res.send(results);
  })
})

app.post('/api/authenticate', (req, res) => {
  console.log("passord", req.body.password);
  mc.query(`SELECT * FROM users WHERE username = (?)`, [req.body.email], function(err, results, fields) {
    if(err) throw err;

    console.log("results:", results[0].password);
    if (results.length>0) {
    if (results[0].password == req.body.password) {
      console.log("pog");
      return res.status(200).cookie('user', results[0]).json({
            success:true,
            redirectUrl: `../gamelist/${results[0].id}`
        });

      /*json({
            success:true,
            redirectUrl: `../gamelist/${results[0].id}`
        })*/
      console.log("sent");
    } else {
      console.log("feil");
      return res.status(401).json({
            success:false,
            status:401

        });
    }
  } else {
    return res.status(401).json({
          success:false,
          status:401

      });
  }
  })


});
app.post('/api/register', (req, res) => {
  console.log("passord", req.body.password);

  mc.query(`INSERT INTO users (username, password, salt) VALUES (?, ?, ?)`, [req.body.email, req.body.password, req.body.salt], function(err, results, fields) {
    if(err) throw err;
    mc.query(`SELECT * FROM users WHERE username = (?)`, [req.body.email], function(err, results, fields) {
        if(err) throw err;
        console.log("pepega", results[0], results[0].password);
        return res.status(200).cookie('user', results[0]).json({
              success:true,
              redirectUrl: `../gamelist/${results[0].id}`
          });
      });

  });
  console.log(req.body.email);



});
