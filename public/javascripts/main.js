/*
	grab the course title and pass that on to the following 
	alternative solution is to create a hidden field and fill the field on click before submitting
*/
var viewCourse = function(term, subject)
{
	var courseTitle = $('select[name=course] option:selected').html().replace(/[^-]*- /, '');
	var course = $('select[name=course] option:selected').val();

	location.href = 'viewCourse?term=' + term + '&subject=' + subject.replace(/\s/g, '+') + '&course=' + course.replace(/\s/g, '+') + '&courseTitle=' + escape(courseTitle);
}

/*
	set the course title before submitting
*/
var setCourseTitle = function()
{
	var courseTitle = $('select[name=course] option:selected').html().replace(/[^-]*- /, '');
	$('input[name=courseTitle]').val(courseTitle);
}
