$(document).ready(function()
{
    socket = io.connect('http://localhost:8080');
    
	$('.registerButton, .loginButton').mouseover(function()
	{
		$(this).animate({ borderTopColor: 'green', borderLeftColor: 'green', borderRightColor: 'green', borderBottomColor: 'green', color: '#4da6ff'}, 'fast');
	});
	$('.registerButton, .loginButton').mouseleave(function()
	{
		$(this).animate({ borderTopColor: 'white', borderLeftColor: 'white', borderRightColor: 'white', borderBottomColor: 'white', color: '#ffa500'}, 'fast');
	});

    $('.loginButton ').on('click', function()
    {
    	var id = $('#id').val();
    	var password = $('#password').val();
    	socket.emit('login', {id : id, password: password});
    });

    $('.registerButton').on('click', function()
    {
    	var size = document.URL.split('/').length;
    	var name = $('#name').val();
    	var prenom = $('#prenom').val();
    	var email = $('#email').val();
    	var password = $('#registerPassword').val();
    	var ville = document.URL.split('/')[size - 4];
    	var etablissement = document.URL.split('/')[size - 3];
    	var classe = document.URL.split('/')[size - 2];

    	socket.emit('register', {name: name, prenom: prenom, email: email, password: password, city: ville, etablissement: etablissement, classe: classe});
    });

    socket.on('register', function(data)
    {
    	alert(data);
    });

    socket.on('login', function(data)
    {
    	if(data == "ok")
    	{
    		document.location = "/dashboard";
    	}
    	else
    	{
    		alert(data);
    	}
    });
});