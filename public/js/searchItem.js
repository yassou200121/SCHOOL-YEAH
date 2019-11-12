class searchItem
{
	constructor(data)
	{
		this.ID = data.ID;
		this.firstname = data.FirstName;
		this.lastname = data.LastName;
		this.photo = data.Photo;
		this.etablissementType = data.Type;
		this.etablissementName = data.Name;
		this.city = data.City;
	}

	htmlspecialchar(text)
	{
	  	return text
	    .replace(/&/g, "&amp;")
	    .replace(/</g, "&lt;")
	    .replace(/>/g, "&gt;")
	    .replace(/"/g, "&quot;")
	    .replace(/'/g, "&#039;");
	}

	draw()
	{
		return '<div class="searchItem" id="' + this.ID + '" href="profile/' + this.ID + '/"> <div class="photoContainer"> <img src="../' + this.photo + '" class="photo"> </div> <div class="infoContainer"> <p class="name-info">' + htmlspecialchar(this.firstname) + ' ' + htmlspecialchar(this.lastname) + '</p> <p class="other-info">' + htmlspecialchar(this.etablissementType) + ' ' + htmlspecialchar(this.etablissementName) + ', ' + htmlspecialchar(this.city) + '</p> </div> <div class="followButtonContainer"> <button class="followButton">Follow</button> </div> </div>';
	}
}