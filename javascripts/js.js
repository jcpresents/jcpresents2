
function ScrollPage(ID) {
	document.getElementById(ID).scrollIntoView(false);
}

document.addEventListener("DOMContentLoaded", function(){
var myOffcanvas = document.getElementById('offcanvasNavigator');
var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
	document.getElementById("OpenMenu").addEventListener('click',function (e){
	e.preventDefault();
	e.stopPropagation();
	bsOffcanvas.toggle();
	});
});

function topFunction() {
document.body.scrollTop = 0;
document.documentElement.scrollTop = 0;
}

$(document).ready(function(){

    $(window).scroll(function() {
        var movies = ['#top', '#first', '#second', '#third', '#fourth', '#fifth', '#sixth',
		'#seventh', '#eighth', '#ninth', '#tenth', '#eleventh', '#twelfth', '#13', '#secret'];
        for ( let i = 0; i < movies.length; i++ ) {
            
            var top_of_element = $(movies[i]).offset().top;
            var bottom_of_element = $(movies[i]).offset().top + $(movies[i]).outerHeight();
            var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
            var top_of_screen = $(window).scrollTop();
        
            if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
                $(".content-button[href$='" + movies[i] + "']").addClass("active")
            } else {
                $(".content-button[href$='" + movies[i] + "']").removeClass("active")
            }
		}
    });
});