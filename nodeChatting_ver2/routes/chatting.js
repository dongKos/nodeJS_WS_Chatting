var express = require('express');
var router = express.Router();
var io = require('socket.io').listen(3001);
var http = require('http');
var roomName;
var server = http.createServer(router);
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'chattingRoom'
});
/* GET users listing. */
router.get('/enter/:roomName', function(req, res, next) {
	
	var roomName = req.params.roomName;
	console.log('welcome to chatting server');
	connection.query('SELECT * FROM CHAT WHERE CHAT_NM = ?', [roomName], function(err, rows) {
		if(err) console.log(err);
		console.log('이미 삭제된 채팅방');
		if(rows[0] == undefined) {
			res.render('index', { title: 'Chatting Server', rows: rows, msg: '삭제된 채팅방입니다!'});
		} else {
			res.render('room', {title: roomName});
		}
	});
});

router.get('/create/:roomName', function(req, res, next) {
	var roomName = req.params.roomName;
	connection.query('INSERT INTO CHAT SELECT ? CHAT_NM, 0 PERSON_CNT FROM DUAL WHERE NOT EXISTS (SELECT * FROM CHAT WHERE CHAT_NM = ?)', [roomName, roomName], function(err) {
		if(err) console.log(err);
		res.render('room', {title: roomName});
	})
});

io.on('connection', function(socket) {
	var instanceId = socket.id;
	var roomNm;
	socket.on('joinRoom', function(name, roomName) {
		console.log(name + "님이" + roomName + " 방에 접속했습니다");
		socket.name = name;
		socket.join(roomName);
		roomName = roomName;
		roomNm = roomName;
		connection.query('UPDATE CHAT SET PERSON_CNT = PERSON_CNT + 1 WHERE CHAT_NM = ?', [roomName], function(err) {
			if(err) console.log(err);
		});
		
		io.sockets.in(roomName).emit('update', {type: 'connect', name: 'SERVER', message: name + "님이" + roomName + " 방에 접속했습니다"});
	});
	socket.on('msg', function(data) {
		io.sockets.in(data.roomName).emit('recMsg', {comment: data.name + " : " + data.msg + "\n"});
	});
	socket.on('disconnect', function() {
		socket.broadcast.to(roomNm).emit('update', {message: socket.name + "님이 나가셨습니다!"});
		connection.query('UPDATE CHAT SET PERSON_CNT = PERSON_CNT - 1 WHERE CHAT_NM = ?', [roomNm], function(err) {
			if(err) console.log(err);
			connection.query('SELECT PERSON_CNT FROM CHAT WHERE CHAT_NM = ?', [roomNm], function(err, rows, fields) {
				if(err) {
					connection.rollback(function(){console.error('rollback!')});
				}
				var personCnt = rows[0].PERSON_CNT;
				console.log("남은 인원 수 : " + personCnt);
				if(personCnt == 0 ) {
					connection.query('DELETE FROM CHAT WHERE CHAT_NM = ?', [roomNm], function(err) {
						console.log('전부 나가서' + roomNm + ' 채팅방 삭제! ');
						if(err) console.log(err);
					})
				}
				
			});
		});
	});
});

module.exports = router;
