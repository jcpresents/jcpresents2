document.body.onload = setTimeout( init_AsciiDoc, 1000);
var List = {};

function init_AsciiDoc() {

	var navButton = document.getElementsByClassName("navClick");
	for (var i = 0; i < navButton.length; i++)
		navButton[i].addEventListener("click", load_AsciiDoc);

	load_AsciiDoc( "2018" );
}

function load_AsciiDoc( year ) {

	if(event) year = event.srcElement.innerText;
	var asciidoctor = Asciidoctor();
	var file = 'webpages/' + year + '.adoc';
	fetch( file )
		.then(response => {

		    if (!response.ok && response.status == 404)
				throw '404 File Not Found "' + year + '.adoc"';

			return response.text()
		})
		.then((data) => {

			let html = asciidoctor.convert( data );
			document.getElementById('content').innerHTML = html;

			var observer = new IntersectionObserver( function(entries) {

				switch( List.direction ) {

					default:
						if (entries[0].isIntersecting) {
							List.index = entries[0].target.name;
						}
						break;

					case "next":
						let y = entries.length == 1 ? 0 : 1; //Avoids a rare error where only 1 section is detected
						if ( entries[y].isIntersecting ) {
							List.index = entries[y].target.name;
						}
						break;
				}
				List.direction = null;
			}, { threshold: [0.5] });

			List = document.getElementsByClassName("sect1");
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

	event.preventDefault();
	List.direction = IN;

	switch( IN ) {
		case "prev":
			List.index--;
			break;
		case "next":
			List.index++;
			break;
	}

	if ( List.index < 0 ) {
		List.index = List.length-1;
	}
	else if ( List.index > List.length-1 ) {
		List.index = 0;
	}
	List[List.index].scrollIntoView( true );
}