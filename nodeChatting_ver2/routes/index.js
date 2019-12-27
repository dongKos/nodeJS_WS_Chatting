var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'chattingRoom'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	connection.query('SELECT * FROM CHAT', function(err, rows) {
		if(err) console.log(err);
		var msg = 'Choose Your Chatting Server'
		console.log('rows : ' + rows);
		if(rows[0] == undefined) msg = '현재 채팅방이 없습니다';
		res.render('index', { title: 'Chatting Server', rows: rows, msg: msg });
	});
	
});

module.exports = router;
