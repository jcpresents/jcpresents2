
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
		var top_of_element = $("#top").offset().top;
		var bottom_of_element = $("#top").offset().top + $("#top").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#top']").addClass("active")
		} else {
			$(".content-button[href$='#top']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#first").offset().top;
		var bottom_of_element = $("#first").offset().top + $("#first").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#first']").addClass("active")
		} else {
			$(".content-button[href$='#first']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#second").offset().top;
		var bottom_of_element = $("#second").offset().top + $("#second").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#second']").addClass("active")
		} else {
			$(".content-button[href$='#second']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#third").offset().top;
		var bottom_of_element = $("#third").offset().top + $("#third").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#third']").addClass("active")
		} else {
			$(".content-button[href$='#third']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#fourth").offset().top;
		var bottom_of_element = $("#fourth").offset().top + $("#fourth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#fourth']").addClass("active")
		} else {
			$(".content-button[href$='#fourth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#fifth").offset().top;
		var bottom_of_element = $("#fifth").offset().top + $("#fifth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#fifth']").addClass("active")
		} else {
			$(".content-button[href$='#fifth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#sixth").offset().top;
		var bottom_of_element = $("#sixth").offset().top + $("#sixth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#sixth']").addClass("active")
		} else {
			$(".content-button[href$='#sixth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#seventh").offset().top;
		var bottom_of_element = $("#seventh").offset().top + $("#seventh").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#seventh']").addClass("active")
		} else {
			$(".content-button[href$='#seventh']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#eighth").offset().top;
		var bottom_of_element = $("#eighth").offset().top + $("#eighth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#eighth']").addClass("active")
		} else {
			$(".content-button[href$='#eighth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#ninth").offset().top;
		var bottom_of_element = $("#ninth").offset().top + $("#ninth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#ninth']").addClass("active")
		} else {
			$(".content-button[href$='#ninth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#tenth").offset().top;
		var bottom_of_element = $("#tenth").offset().top + $("#tenth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#tenth']").addClass("active")
		} else {
			$(".content-button[href$='#tenth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#eleventh").offset().top;
		var bottom_of_element = $("#eleventh").offset().top + $("#eleventh").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#eleventh']").addClass("active")
		} else {
			$(".content-button[href$='#eleventh']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#twelfth").offset().top;
		var bottom_of_element = $("#twelfth").offset().top + $("#twelfth").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#twelfth']").addClass("active")
		} else {
			$(".content-button[href$='#twelfth']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $("#13").offset().top;
		var bottom_of_element = $("#13").offset().top + $("#13").outerHeight();
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#13']").addClass("active")
		} else {
			$(".content-button[href$='#13']").removeClass("active")
		}
	});
  });

  $(document).ready(function(){
	
	$(window).scroll(function() {
		var top_of_element = $(".accordion").offset().top;
		var bottom_of_element = $(".accordion").offset().top + $(".accordion").outerHeight() * 5;
		var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight() / 1.3;
		var top_of_screen = $(window).scrollTop();
	
		if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
			$(".content-button[href$='#secret']").addClass("active")
		} else {
			$(".content-button[href$='#secret']").removeClass("active")
		}
	});
});