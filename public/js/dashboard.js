$(document).ready(function()
{
	var searchInputStat = 0;

	socket = io.connect('http://localhost:8080');

	$('.resultSearchDiv').css({height: window.innerHeight - 80 + "px"});				//80 = marginTop + inputSize

	$('.app').mouseenter(function()
	{
		$(this).find('button').animate({backgroundColor : '#0033ec', color: 'white'}, 'fast');
		$(this).animate({width: '300px', height: '225px', borderColor: "rgb(77, 166, 255)"}, 'fast');
	});
	$('.app').mouseleave(function()
	{
		$(this).find('button').animate({'background-color' : '#1a1b17', color: '#4da6ff'}, 'fast');
		$(this).animate({width: '275px', height: '200px', borderColor: "#ffa512"}, 'fast');
	});

	$('#search-input').on('click', function()
	{
		if(searchInputStat == 0)
		{
			$(this).animate({width : '70%'}, 'fast');
			$(this).animate({height:'40px'}).parent().css({position: 'absolute'/*, height: '300px'*/}).animate({width: '100%', height: '100%', borderColor: 'transparent'}, 700);
			$('#returnContainer').css({display : 'flex', opacity: 0, width: '110px'}).animate({opacity : 1}, 1500);
			$('.resultSearchDiv').css({display: 'flex'});
			$('.resultSearchDiv').animate({width : '70%', opacity: 1}, 'fast');
			searchInputStat = 1;
		}
	});

	$("#returnContainer").mouseenter(function()
	{
		$("#return-back").css({display: 'block'}).animate({width: "40px", opacity: 1}, 500);
	});
	$("#returnContainer").mouseleave(function()
	{
		$("#return-back").animate({width: "0px", opacity: 0}, 500);
	});

	$("#returnContainer").on("click", function()
	{
		$(this).animate({opacity: 0, width: 0}, 'fast', function()
		{
			$(this).css({display: 'none'});
		});
		$(".resultSearchDiv").css({opacity: 0, width: 0});
		$('#search-input').animate({width : '80%'}, 'fast');
		$('#search-input').animate({height:'32px'}).parent().css({position: 'static'/*, height: '300px'*/}).animate({width: '20%', height: '100%', borderColor: '#ffa512'}, 700);
		searchInputStat = 0;
	});

	$('#search-input').keyup(function()
	{
		console.log('socket emited');
		$(".resultSearchDiv").empty();
		socket.emit('search', $('#search-input').val());
	});

	socket.on('search-result', function(data)
	{
		console.log(data);
		if(data != "-1")
		{
			for(var i = 0; i < data.length; i++)
			{
				var result = new searchItem(data[i]);

				$('.resultSearchDiv').append(result.draw());
			}

			$('.followButton').mouseenter(function()
			{
				$(this).animate({backgroundColor : '#0033ec', color: 'white'}, 'fast');
			});
			$('.followButton').mouseleave(function()
			{
				$(this).animate({backgroundColor : '#1a1b17', color: '#4da6ff'}, 'fast');
			});
			$('.searchItem').mouseenter(function()
			{
				$(this).animate({backgroundColor: "#1b191b"}, 200);
			});
			$('.searchItem').mouseleave(function()
			{
				$(this).animate({backgroundColor: "rgb(40, 41, 35)"}, 200);
			});
			$('.searchItem').on('click', function()
			{
				document.location = $(this).attr('href');
			});
		}
	});
});

function htmlspecialchar(text)
{
  	return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}