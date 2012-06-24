/*
	set the term before submitting
	used in index.jade
 */
var setTerm = function(e)
{
	if (!e) var e = window.event;

	var currPage = $(e.target).parents('div[data-role="page"]');

	var href = $(e.target).parents('li').attr('href').split('?')[0];
	var subject = $(e.target).parents('li').attr('href').split('?')[1].split('&')[0].split('=')[1];
	var term = currPage.attr('data-url').split('?')[1].split('=')[1];

	//$(e.target).attr('href', href + '?subject=' + subject + '&term=' + term);
	$.mobile.changePage(href, {
		data : {
			'subject' : subject,
			'term' : term
		}
	})
}

/*
	set the course title before submitting
	used in classes.jade
*/
var setCourseTitle = function()
{
	if (!e) var e = window.event;

	var href = $(e.target).parents('li').attr('href').split('?')[0];
	var course = $(e.target).parents('li').attr('href').split('?')[1].split('&')[0].split('=')[1];
	var term = getUrlVars()['term'];
	var subject = getUrlVars()['subject'];
	var courseTitle = $(e.target).parents('li').text().replace(/[^-]*- /, '');

	//$(e.target).attr('href', href + '?course=' + course + '&term=' + term + '&subject=' + subject + '&courseTitle=' + courseTitle);
	$.mobile.changePage(href, {
		data : {
			'course' : course,
			'term' : term,
			'subject' : subject,
			'courseTitle' : courseTitle
		}
	})
};

/*
	extract a get parameter from the URL
 */
var getUrlVars = function() 
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


$(document).on('pagecreate', '#indexSubjectsPage', function(){
	var page = $('#indexSubjectsPage');

	// create list dividers for subjects to make it easier to see different subjects
	var lastLeadingChar = '';
	page.find('ul li').each(function( idx, elem ){
		var currLeadingChar = $(elem).text().substring(0,1);
		if ( currLeadingChar != lastLeadingChar )
		{
			$(elem).before('<li data-role="list-divider">' + currLeadingChar + '</li>');
		}

		lastLeadingChar = currLeadingChar;
	});

});

$(document).on('pagechange', '#indexSubjectsPage', function(){
	var page = $('#indexSubjectsPage');

	// update the link in the url to match data-url
	// this ensures the url parameter, term, is up to date
	location.hash = page.attr('data-url');


});