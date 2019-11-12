var currentSlide = 0;
var ville = null;
var etablissement = null;
var classe = null;

$(document).ready(function()
{
	socket = io.connect('http://localhost:8080');

	$('.startContent').animate({opacity : 1}, 2000, function()
	{
		rotate();
		$('.startContent span').each(function()
		{
			$(this).animate({"font-size" : "200px"}, 1000, function()
				{
					$('.startContent').animate(
					{
						opacity : 0,
						top : "-100vh"
					}, 1500, function()
						{
							$('.content').animate({opacity: 1}, 750);
						});
				});
		});
	});

	$('.next-slide').on('click', function()
	{
		alert($(this).parent().find("input:empty").length);
		if($(this).parent().find("input:empty").length == 0)
		{
			if(currentSlide == 2)
			{


			}
			$(this).parent().parent().animate({opacity: 0}, 500, function()
			{
				if(currentSlide == 0)
					ville = $(this).find('input').val();
				else if(currentSlide == 1)
					etablissement = $(this).find('input').val();
				else if(currentSlide == 2)
				{
					classe = $(this).find('input:eq(0)').val() + " " + $(this).find('input:eq(1)').val();
					window.location.href = "register/" + ville + "/" + etablissement + "/" + classe + "/";
				}

				currentSlide++;
				$(this).remove();
				$('#s' + currentSlide + ".slide").css({'visibility': 'visible', 'opacity' : 0}).animate({opacity:1}, 500);
			});
		}
	});

	$('#ville, #etablissement, #classe').on('keyup', function(e)
	{
		if (e.keyCode == 13)
		{
			$(this).parent().find('.next-slide').click();
    	}
	});

	$('input#ville').on('keyup', function()
	{
		if($(this).val().length > 2)
		{
			socket.emit('city', $(this).val());
		}
	});

	$('input#etablissement').on('keyup', function()
	{
		if($(this).val().length > 2)
		{
			socket.emit('etablissement', $(this).val() + ';' + ville);
		}
	});

	socket.on('city', function(data)
	{

		$(".cityDropdown").empty();

		for(var i = 0; i < data.length; i++)
		{
			var city = data[i].charAt(0).toUpperCase() + data[i].slice(1);
			
			$(".cityDropdown").append('	<div class="suggestion" _checked="false">\
											<p class="suggestionTitle">' + city + '</p>\
											<div class="circleValidation">\
												<i class="fas fa-check valid-icon"></i>\
											</div>\
										</div>');

			if(i == data.length - 1)
			{
				$(".cityDropdown").css({opacity: 1, display: "block"}).slideUp(1).slideDown("slow", "linear");
			}
		}

		$(".suggestion").on('click', function()
		{
			var text = $(this).find(".suggestionTitle").text();

			if($(this).attr("_checked") == "false")
			{
				$(".suggestion").attr("_checked", "false");
				$(".suggestion").find(".valid-icon").animate({opacity: 0}, 200);
				$(this).find(".valid-icon").animate({opacity: 1}, 200);
				$(this).attr("_checked", "true");
				$("#ville").val(text);
			}
			else if($(this).attr("_checked") == "true")
			{
				$(this).find(".valid-icon").animate({opacity: 0}, 200);
				$(this).attr("_checked", "false");
			}
		});
	});

	socket.on('etablissement', function(response)
	{
		$(".etablissementDropdown").empty();

		for(var i = 0; i < response.length; i++)
		{
			var name = response[i].Name;
			var type = response[i].Type;
			$(".etablissementDropdown").append('<div class="suggestion" _checked="false">\
													<p class="suggestionTitle">' + type + ' - ' + name + '</p>\
													<div class="circleValidation">\
														<i class="fas fa-check valid-icon"></i>\
													</div>\
												</div>');

			if(i == response.length - 1)
			{
				$(".etablissementDropdown").css({opacity: 1, display: "block"}).slideUp(1).slideDown("slow", "linear");
			}
		}

		$(".suggestion").on('click', function()
		{
			var text = $(this).find(".suggestionTitle").text();

			if($(this).attr("_checked") == "false")
			{
				$(".suggestion").attr("_checked", "false");
				$(".suggestion").find(".valid-icon").animate({opacity: 0}, 200);
				$(this).find(".valid-icon").animate({opacity: 1}, 200);
				$(this).attr("_checked", "true");
				$("#etablissement").val(text);
			}
			else if($(this).attr("_checked") == "true")
			{
				$(this).find(".valid-icon").animate({opacity: 0}, 200);
				$(this).attr("_checked", "false");
			}
		});
	});

});

function rotate()
{
  	$('.startContent span').each(function()
	{
		$(this).rotate(
		{
			angle: 0,
		    animateTo: 360
		});
	});
}