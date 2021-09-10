var List = {};
document.body.onload = load_List( "2018" );

function load_List( year ) {

	var asciidoctor = Asciidoctor();
	fetch('webpages/' + year + '.adoc')
		.then(response => response.text())
		.then((data) => {
			var html = asciidoctor.convert(data);
			document.getElementById('content').innerHTML = html;

			var observer = new IntersectionObserver(function(entries) {

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
}

function ScrollPage( IN ) {

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