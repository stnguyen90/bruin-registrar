/*
 * Home page where you can select term and subject
 */
exports.index = function(req, res)
{	
	var request = require('request'),
		cheerio = require('cheerio');

	// uncomment to disable scrape
	// res.render('index', { title: 'Form', terms: 'terms', subjects: 'subjects' } );

	request({ uri:'http://www.registrar.ucla.edu/schedule/schedulehome.aspx' }, function (error, response, body) 
	{
		if (error && response.statusCode !== 200) 
		{
			console.log('Error loading the page');
			res.render('error', { title : 'Sorry!', error : 'Could not access the UCLA Registrar.'});
		}

		var $ = cheerio.load(body);

		// cheerio is now loaded on the window created from 'body'
		var termSelect = $('#ctl00_BodyContentPlaceHolder_SOCmain_lstTermDisp').html();			// retrieve the terms
		var subjectSelect = $('#ctl00_BodyContentPlaceHolder_SOCmain_lstSubjectArea').html();	// retrieve the subjects
		res.render('index', { title : 'UCLA Registrar', terms : termSelect, subjects : subjectSelect });
	});
};


/*
 * get courses with term and subject
 */
exports.listClasses = function(req, res)
{
	
	var request = require('request'),
		cheerio = require('cheerio');

	var term = (req.param('term')) ? req.param('term') : '';
	var subject = (req.param('subject')) ? req.param('subject').replace(/\s/g, '+') : '';

	// uncomment to disable scrape
	// res.render('index', { title: 'Form', terms: 'terms', subjects: 'subjects' } );

	if ( term.length > 0 && subject.length > 0 )
	{
		request({ uri:'http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=' + term  + '&subareasel=' + subject }, function (error, response, body) 
		{
			if (error && response.statusCode !== 200) 
			{
				console.log('Error loading the page');
				res.render('error', { title : 'Sorry!', error : 'Could not access the UCLA Registrar.'});
			}

			var $ = cheerio.load(body);

			// cheerio is now loaded on the window created from 'body'
			var noClasses = $('#ctl00_BodyContentPlaceHolder_crsredir1_lblNotFoundText').length;		// check if there are any classes
			if ( noClasses == 1 )	// this element will only exist if there are no classes
			{
				res.render('error', { title : 'Sorry!', error : 'No classes are scheduled for this subject area this quarter.'});
				return;
			}
				
			var classes = {};
			var classesSelect = $('#ctl00_BodyContentPlaceHolder_crsredir1_lstCourseNormal');			// retrieve the classes for the specified term and subject
			// iterate through classes and create an associated array of classCode : classTitle
			classesSelect.children().each(function(idx, elem)
			{
				classes[$(elem).attr('value').replace(/\s/g, '+')] = $(elem).text();
			});
			var termHeader = $('#ctl00_BodyContentPlaceHolder_crsredir1_lblTermHeader').text();			// retrieve the human readable term
			var subjectHeader = $('#ctl00_BodyContentPlaceHolder_crsredir1_lblSAHeaderNormal').text();	// retrieve the human readable subject

			if ( false )
				res.render('classesListView', { title: termHeader + " - " + subjectHeader, 'term' : term, 'subject' : subject, 'classes' : classes });
			else
				res.render('classesSelect', { title: termHeader + " - " + subjectHeader, 'term' : term, 'subject' : subject, 'classes' : classes, 'classesSelect' : classesSelect.html() });
		});

	}
	else
		res.render('error', { title : 'Sorry!', error : 'Please select a term and subject!'});

};


/*
 * get chosen course
 */
exports.viewCourse = function(req, res)
{
	
	var request = require('request'),
		cheerio = require('cheerio');

	var term = (req.param('term')) ? req.param('term') : '';
	var subject = (req.param('subject')) ? req.param('subject').replace(/\s/g, '+') : '';
	var course = (req.param('course')) ? req.param('course') : '';
	var courseTitle = (req.param('courseTitle')) ? unescape(req.param('courseTitle')) : '';

	var ver = (req.param('ver')) ? req.param('ver') : '';

	// uncomment to disable scrape
	// res.render('index', { title: 'Form', terms: 'terms', subjects: 'subjects' } );

	if ( term.length > 0 && subject.length > 0 && course.length > 0)
	{
		request({ uri:'http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=' + term + '&subareasel=' + subject + '&idxcrs=' + encodeURIComponent(course) }, function (error, response, body) 
		{
			if (error && response.statusCode !== 200) 
			{
				console.log('Error loading the page');
				res.render('error', { title : 'Sorry!', error : 'Could not access the UCLA Registrar.'});
			}

			// the original html from the registrar has extra tags that close the tables 
			// prematurely the following line removes these closing tags so we can 
			// properly parse the rest of the dom
			body = body.replace("Definitions </a> &nbsp; </strong></font></td></tr>", "");	
			var $ = cheerio.load(body);

			// cheerio is now loaded on the window created from 'body'
			var courseHTML = $('div#ctl00_BodyContentPlaceHolder_detselect_pnlBodyContent');

			var courses = [];
			var headerIdx = 0;
			var courseIdx = 0;
			// retrieve table headers
			$('div#ctl00_BodyContentPlaceHolder_detselect_pnlBodyContent').children('table.dgdTemplateGrid').each(function(i, elem)	// retrieve tables
			{
				var table = $(elem);
				// console.log("id = " + table.attr('id'));
				if ( table.attr('id') && table.attr('id').search('dgdLectureHeader') >= 0 )
				{
					// console.log("match header");
					courses[headerIdx] = {};																// initialize the object
					courses[headerIdx].lec = table.find('span.coursehead').text();							// set the lec number
					courses[headerIdx].fac = table.find('span.fachead').text().replace(/&nbsp;/g, '');		// set the faculty
					// console.log("courses[" + headerIdx + "].lec = '" + courses[headerIdx].lec + "'");
					// console.log("courses[" + headerIdx + "].fac = '" + courses[headerIdx].fac + "'");
					headerIdx++;
				}
				else if ( !table.attr('id') )
				{
					// console.log("match data table");
					courses[courseIdx].data = [];													// initialize an array to store the data
					table.children('tr').each(function(innerI, innerElem)							// every row has data
					{
						var tr = $(innerElem);
						if ( !tr.attr('class') )
						{
							
							var id		= tr.children('td.dgdClassDataColumnIDNumber').text();
							var type	= tr.children('td.dgdClassDataActType').text();
							var section	= tr.children('td.dgdClassDataSectionNumber').text();
							var days	= tr.children('td.dgdClassDataDays').text().replace(/ /g, '');
							var start	= tr.children('td.dgdClassDataTimeStart').text();
							var end		= tr.children('td.dgdClassDataTimeEnd').text();
							var building= tr.children('td.dgdClassDataBuilding').text();
							var room	= tr.children('td.dgdClassDataRoom').text();
							var en		= tr.children('td.dgdClassDataEnrollTotal').text();
							var encap	= tr.children('td.dgdClassDataEnrollCap').text();
							var wl		= tr.children('td.dgdClassDataWaitListTotal').text();
							var wlcap	= tr.children('td.dgdClassDataWaitListCap').text();
							var stat	= tr.children('td.dgdClassDataStatus').text();
							// console.log(type + ", " + section + ", " + days + ", " + start + ", " + end + ", " + building + ", " + room);
							courses[courseIdx].data.push(
							{ 
								'id'			: id,
								'type'			: type,
								'section'		: section,
								'days'			: days,
								'start'			: start,
								'end'			: end,
								'building'		: building,
								'room'			: room,
								'enrolled'		: en,
								'enrollCap'		: encap,
								'waitlist'		: wl,
								'waitlistCap'	: wlcap,
								'status'		: stat
							});
						}
					});
					courseIdx++;	
				}
			});

			if ( ver == '1' )
				res.render('courseV1', { title: courseTitle, 'term' : term, 'subject' : subject, 'course' : courseHTML.html(), 'courses' : courses });
			else if ( ver == '2' )
				res.render('courseV2', { title: courseTitle, 'term' : term, 'subject' : subject, 'course' : courseHTML.html(), 'courses' : courses });
			else if ( ver == '3' )
				res.render('courseV3', { title: courseTitle, 'term' : term, 'subject' : subject, 'course' : courseHTML.html(), 'courses' : courses });
			else
				res.render('course', { title: courseTitle, 'term' : term, 'subject' : subject, 'course' : courseHTML.html(), 'courses' : courses });
		});
	}
	else
		res.render('error', { title : 'Sorry!', error : 'Please select a term, subject, and course!'});

};