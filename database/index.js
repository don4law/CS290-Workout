var express = require('express');
var mysql = require('./dbcon.js'); // Had to delete '.js.js from end of this file
var CORS = require('cors');

var app = express();
app.set('port', 5659);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CORS());

const getAllQuery = 'SELECT * FROM workout';
const insertQuery = 'INSERT INTO workout (`name`, `reps`, `weight`, `unit`, `date`) VALUES (?, ?, ?, ?, ?)';
const updateQuery = 'UPDATE workout SET name=?, reps=?, weight=?, unit=?, date=? WHERE id=? ';
const deleteQuery = 'DELETE FROM workout WHERE id=?';
const dropTableQuery = 'DROP TABLE IF EXISTS workout';
const makeTableQuery = `CREATE TABLE workout(
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(255) NOT NULL,
                        reps INT,
                        weight INT,
                        unit BOOLEAN,
                        date DATE);`;

// Parameters: name, reps, weight, date, unit
// For unit: Unit of 0 is pounds, 1 is kg.

const getAllData = () => {
    mysql.pool.query(getAllQuery, (err, rows, fields) => {
        if (err) {
            next(err);
            return;
        }
    });
}


app.get('/',(req,res,next) => {
    var context = {};
    mysql.pool.query(getAllQuery, (err, rows, fields) => {
        if(err){
            next(err);
            return;
        };
        context.results = JSON.stringify(rows);
        res.send(context);
        getAllData(req, res);
    });
});

app.post('/',function(req,res,next){
    var context = {};
    var { name, reps, weight, unit, date, id } = req.body; // Object Destructuring
    mysql.pool.query(insertQuery, [name, reps, weight, unit, date, id], (err, result) => {
        if(err){
            next(err);
            return;
        }
        getAllData();
    });
});

app.delete('/',function(req,res,next){
    var context = {};
    var { id } = req.body;
    mysql.pool.query(deleteQuery, [id], (err, result) => {
        if(err){
            next(err);
            return;
        }
        getAllData();
        // context.results = "Deleted " + result.changedRows + " rows.";
        // res.send(context);
    });
});


///simple-update?id=2&name=The+Task&done=false&due=2015-12-5
app.put('/',function(req,res,next){
    var context = {};
    var { id, name, reps, weight, unit, date } = req.body; // Object Destructuring
    mysql.pool.query(updateQuery,
        [name, reps, weight, unit, date, id],
        (err, result) => {
            if(err){
                next(err);
                return;
            }
            getAllData();
            // context.results = "Updated " + result.changedRows + " rows.";
            // res.send(context);
        });
});

app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query(dropTableQuery, function(err){
        mysql.pool.query(makeTableQuery, function(err){
            res.send('Table reset');
        })
    });
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://flip2.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});