let List = { };
let lastScrollTop = 0, isScrolling = false, wasScrolling = false, scriptScroll = false;

document.body.addEventListener( "load", init_AsciiDoc(), false );

/*
window.addEventListener( "scroll", function( event ) { isScrolling = true; }, false );

setInterval(function() {

	if ( isScrolling ) {
		isScrolling = false;
		return;
	}
	
	if ( scriptScroll ) {
		scriptScroll = false;
		return;
	}

	if ( List.oindx != List.index ) {
		List.oindx = List.index;
		List[List.index].scrollIntoView( { behavior: 'smooth', block: 'start' } );
		scriptScroll = true;
	}

}, 500);
*/

function init_AsciiDoc() {

	let navButton = document.getElementsByClassName("navClick");
	for (let i = 0; i < navButton.length; i++)
		navButton[i].addEventListener("click", load_AsciiDoc);

	load_AsciiDoc( "2018" );
}

function load_AsciiDoc( year ) {

	if( event ) year = event.srcElement.innerText;
	let asciidoctor = Asciidoctor();
	let file = 'webpages/' + year + '.adoc';
	fetch( file )
		.then(response => {

		    if ( !response.ok && response.status == 404 )
				throw '404 File Not Found "' + year + '.adoc"';

			return response.text()
		})
		.then((data) => {

			let html = asciidoctor.convert( data );
			document.getElementById('content').innerHTML = html;

			let observer = new IntersectionObserver( function( entries ) {

				entries.forEach( x => {
					if ( x.isIntersecting ) {
						List.index = x.target.name;
					}
				});
			}, { threshold: [0.5] });

			List = document.getElementsByClassName("sect1");
			List.oindx = 0;
			List.index = 0;
			for (let i = 0; i < List.length; i++) {
				List[i].name = i;
				observer.observe( List[i] );
			}
	})
	.catch(error => {

		error = "[.text-center]\n== " + error + "";
		let html = asciidoctor.convert( error );
		document.getElementById('content').innerHTML = html;
	});
}

function scroll_AsciiDoc( IN ) {

	if ( event ) event.preventDefault();
	scriptScroll = true;

	List.index += IN;
	if ( List.index < 0 )
		List.index = List.length-1;
	else if ( List.index > List.length-1 )
		List.index = 0;

	List[List.index].scrollIntoView( { behavior: 'smooth', block: 'start' } );
}