var socket = io.connect('http://localhost:3001');
var name = "";
var roomName = document.title;

socket.on('connect', function() {
	name = prompt('반갑습니다!', '');
	if(!name) name = 'Guest';
	socket.emit('joinRoom', name, roomName);
});

socket.on('update', function(data) {
	$('#main').append('<span>' + data.message +'</span></br>');
});

socket.on('recMsg', function(data) {
	console.log("data from recMsg : " + data);
	$('#main').append('<span>' + data.comment +'</span></br>');
});

function send() {
	var msg = $("#text").val();
	$("#text").val('');
	if(msg) socket.emit('msg', {msg: msg, roomName: roomName, name: name});
}