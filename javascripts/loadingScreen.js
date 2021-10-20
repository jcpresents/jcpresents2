window.addEventListener( "load", function() {
	setTimeout(function(){

		const loader = document.querySelector(".loader");
		loader.style.opacity = "0";
		setTimeout(function(){ loader.style.display = "none"; }, 500);
	},4000);
}, false );