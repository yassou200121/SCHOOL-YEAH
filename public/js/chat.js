var socket = io.connect('http://localhost:8080');
var uploader = new SocketIOFileUpload(socket);
var fileToSend = [];
var sentFiles = [];
var sentMessage = "";

uploader.addEventListener("start", function(event)
{
	event.file.meta.uid = $('.chatItem.selected').attr('uid');
});

uploader.addEventListener('progress', function(event)
{
	var percent = event.bytesLoaded / event.file.size * 100;
    console.log("File is", percent.toFixed(2), "percent loaded");
});

$('.messageContainer').mCustomScrollbar();

$('.pictureButton').unbind().on('click', function()
{
	$('.fileInput')[0].click();
});

$('.sendButton').mouseenter(function()
{
	$(this).animate({backgroundColor : 'rgb(77, 166, 255)', color: 'white'}, 'fast');
});

$('.sendButton').mouseleave(function()
{
	$(this).animate({'background-color' : '#1a1b17', color: '#4da6ff'}, 'fast');
});

$('.messageInput').on('keypress', function(e)
{
	if(e.which == 13)
	{
		sendMessage();
	}
});

$('.sendButton').unbind().on('click', function()
{
	sendMessage();
});

$('input.fileInput').change(function()
{
	for(var i = 0; i < document.getElementById('fileInput').files.length; i++)
	{
		fileToSend.push(document.getElementById('fileInput').files[i]);

		$('.fileBar').append(
								'<div class="file-item" id="' + i + '">									\
									<span class="file-name">' + document.getElementById('fileInput').files[i].name + '</span>				\
									<div class="delete-file-button"></div>					\
								</div>'
							);
	}

	$('.file-item').mouseover(function()
	{
		$(this).animate({'background-color' : 'rgb(77, 166, 255)'}, 500);
		$(this).find('.delete-file-button').animate({'border-color' : 'red', 'background-color' : 'red'}, 500);
	});

	$('.file-item').mouseleave(function()
	{
		$(this).animate({'background-color' : 'transparent'}, 500);
		$(this).find('.delete-file-button').animate({'border-color' : 'rgb(77, 166, 255)', 'background-color' : 'rgb(77, 166, 255)'}, 500);
	});

	$('.delete-file-button').unbind().on('click', function()
	{
		fileToSend.remove($(this).parent().attr('id'));
		$(this).parent().remove();
		$('#fileInput').val("");
	});
});

$('.callBar i').mouseenter(function()
{
	$(this).animate({backgroundColor: '#ffa500', color: 'white'}, 500);
});

$('.callBar i').mouseleave(function()
{
	$(this).animate({backgroundColor: 'rgb(40, 41, 35)', color: '#ffa500'}, 500);
});

$('#phoneCallButton').on('click', function()
{
	$('body').append('<div class="fade"></div><div class="liveCam"></div><div class="myCam" id="myCam"></div>');

	$("#myCam").webcam(
	{
		width: 320,
		height: 240,
		mode: "callback",
		swffile: "/js/jscam_canvas_only.swf",
		onTick: function()
				{

				},
		onSave: function(data)
				{
					console.log(data);
				},
		onCapture:function()
				{
					webcam.save();
				},
		debug: 	function()
				{

				},
		onLoad: function()
				{
					var sendWebcamInterval = window.setInterval(sendWebcam, 100);
				}
	});
});

socket.on('chat', function(data)
{
	console.log("chat : " + data);
	if(data != 1)
	{
		alert("Error !");
	}
	else
	{
		$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message me">' + escapeHtml(sentMessage) + '</p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID).parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
		$('.messageContainer').mCustomScrollbar("scrollTo","bottom");
	}
});

socket.on('image-sent', function(data)
{
	if(data != 1)
	{
		alert("Error !");
	}
	else
	{
		for(var i = 0; i < fileToSend.length; i++)
		{
			var reader = new FileReader();
    
		    reader.onload = function(e)
		    {
		    	$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message me"><img src="' + e.target.result + '"</p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
		    }
		    
		    reader.readAsDataURL(fileToSend[i]);
		}
	}

	fileToSend.splice(0, fileToSend.length);
	$('.fileBar').empty();
});

socket.on('load-image', function(data)
{
	var elem = JSON.parse(data);

	if(elem.Sender == "0")
	{
		$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message me" id="' + elem.ID + '"><img src="' + elem.Message + '"></p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
	}
	else
	{
		$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message you" id="' + elem.ID + '"><img src="' + elem.Message + '"></p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
	}

	$(".messageContainer").mCustomScrollbar("update");
	
	setTimeout(function()
	{
		$(".messageContainer").mCustomScrollbar("scrollTo", "bottom");
	}, 500);
});

socket.on('load-video', function(data)
{
	var elem = JSON.parse(data);

	if(elem.Sender == "0")
	{
		$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message me" id="' + elem.ID + '"><video src="' + elem.Video + '" controls></p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
	}
	else
	{
		$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message you" id="' + elem.ID + '"><video src="' + elem.Video + '" controls></p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
	}

	$(".messageContainer").mCustomScrollbar("update");
	
	setTimeout(function()
	{
		$(".messageContainer").mCustomScrollbar("scrollTo", "bottom");
	}, 500);
});

socket.on('load-compressed', function(data)
{

});

socket.on('load-message', function(data)
{
	if(data == "success")
	{
		$(".messageContainer").mCustomScrollbar("update");
		setTimeout(function()
		{
	        $(".messageContainer").mCustomScrollbar("scrollTo", "bottom");
	    }, 500);
	}
	else
	{
		var elem = JSON.parse(data);

		if(elem.Sender == "0")
		{
			$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message me" id="' + elem.ID + '">' + escapeHtml(elem.Message) + '</p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
		}
		else
		{
			$('.messageContainer .mCustomScrollBox .mCSB_container').append('<p class="message you" id="' + elem.ID + '">' + escapeHtml(elem.Message) + '</p>').parent().parent().mCustomScrollbar("scrollTo", "#" + elem.ID);
		}
	}
});

socket.on('load-conversation', function(data)
{
	if(typeof(data) == "object")
	{
		if(data.Gender == 1)
		{
			var gender = "male";
		}
		else if(data.Gender == 0)
		{
			var gender = "female";
		}

		if(data.IsNew == true)
		{
			$('.listContainer').append('\
										<div class="chatItem" gender="' + gender + '" uid="' + data.uid + '"> 			\
											<div class="chatItemLine"></div>																\
											<div class="chatItemPhoto" src="' + data.Photo + '"></div>										\
											<div class="chatItemBlock">																		\
												<span class="chatName">' + escapeHtml(data.Name) + '</span>									\
												<span class="chatMessage">' + escapeHtml(data.LastMessage) + '</span>						\
											</div>																							\
											<div class="newMessage"></div>																	\
										</div>																								\
										');
		}
		else
		{
			$('.listContainer').append('\
										<div class="chatItem" gender="' + gender + '" uid="' + data.uid + '"> 			\
											<div class="chatItemLine"></div>																\
											<div class="chatItemPhoto" src="' + data.Photo + '"></div>										\
											<div class="chatItemBlock">																		\
												<span class="chatName">' + escapeHtml(data.Name) + '</span>									\
												<span class="chatMessage">' + escapeHtml(data.LastMessage) + '</span>						\
											</div>																							\
										</div>																								\
										');
		}

		$('.chatItem').unbind().on('click', function()
		{
			$('.chatItem.selected').removeClass('selected');
			$(this).find('.newMessage').remove();
			$(this).addClass('selected');
			$('h2.chatName').text($(this).find('.chatItemBlock .chatName').text());
			$('.messageContainer .mCustomScrollBox .mCSB_container').empty();

			socket.emit('load-message', $(this).attr('uid'));
		});
	}
});

function sendMessage()
{
	var message = $('.messageInput').val();
	if(message != "")
	{
		var id = $('.chatItem.selected').attr('uid');

		socket.emit('message', id + ';' + message);
		$('.messageInput').val('');
		sentMessage = message;
	}

	if(fileToSend.length > 0)
	{
		uploader.submitFiles(fileToSend);
	}
}

function escapeHtml(text)
{
	if(text != "")
	{
		if(text.includes("<") || text.includes(">") || text.includes('"') || text.includes("'"))
		{
			var map =
			{
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
		  	};

			return text.replace(/[&<>"']/g, function(m) { return map[m]; });
		}
		else
		{
			return text;
		}
	}
	else
	{
		return text;
	}
}

Array.prototype.remove = function(from, to)
{
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function sendWebcam()
{
	webcam.capture();
}