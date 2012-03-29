/*
	grab the course title and pass that on to the following 
	alternative solution is to create a hidden field and fill the field on click before submitting
*/
var viewCourse = function(term, subject)
{
	var courseTitle = $('select[name=course] option:selected').html().replace(/[^-]*- /, '');
	var course = $('select[name=course] option:selected').val();

	location.href = 'viewCourse?term=' + term + '&subject=' + subject.replace(/\s/g, '+') + '&course=' + course.replace(/\s/g, '+') + '&courseTitle=' + escape(courseTitle);
};

/*
	set the course title before submitting
*/
var setCourseTitle = function()
{
	var courseTitle = $('select[name=course] option:selected').html().replace(/[^-]*- /, '');
	$('input[name=courseTitle]').val(courseTitle);
};

/*
	set the autocomplete field on the index page
*/
(function( $ ) 
{
	$.widget( "ui.combobox", 
	{
		_create: function() 
		{
			var self = this,
				select = this.element,
				selected = select.children( ":selected" ),
				value = selected.val() ? selected.text() : "";
			var selectFieldContain = select.parents('div[data-role="fieldcontain"]');
			selectFieldContain.after( $("<div>") );

			// create the jquery mobile field container
			var div = selectFieldContain.next();
			div.attr('data-role', 'fieldcontain');
			div.append( $('<label/>').attr('for', 'subjectInput') );

			// hide the select field
			// selectFieldContain.hide();
			// div.find('label').text('Subject:');

			var input = this.input = $( "<input>" )
				.attr('id', 'subjectInput')
				.appendTo( div )
				.val( value )
				.click( function(event, ui)
				{
					// clear the input on click
					input.val(""); 
				})
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: function( request, response ) {
						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
						response( select.children( "option" ).map(function() {
							var text = $( this ).text();
							if ( this.value && ( !request.term || matcher.test(text) ) )
								return {
									label: text.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
											$.ui.autocomplete.escapeRegex(request.term) +
											")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: text,
									option: this
								};
						}) );
					},
					select: function( event, ui ) {
						ui.item.option.selected = true;
						self._trigger( "selected", event, {
							item: ui.item.option
						});
						$('#subjectInput').blur();	// blur to take focus off the input and minimize the keyboard
						select.prev().children('span.ui-btn-text').text( ui.item.option.text );	// update the select field
					},
					change: function( event, ui ) {
						if ( !ui.item ) {
							var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
								valid = false;
							select.children( "option" ).each(function() {
								if ( $( this ).text().match( matcher ) ) {
									this.selected = valid = true;
									return false;
								}
							});

							if ( !valid ) 
							{
								// remove invalid value, as it didn't match anything
								$( this ).val( "" );
								select.val( "" );
								input.data( "autocomplete" ).term = "";
								return false;
							}
							else 
							{
								// if it is valid, update the select field
								select.prev().children('span.ui-btn-text').text( $( this ).val() );
							}
						}
					}
				});

			// convert input into jquery mobile input
			div.parent().trigger("create");

			input.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.label + "</a>" )
					.appendTo( ul );
			};

			// on changing of select field, update the input field as well
			select.change(function()
			{
				$('input#subjectInput').val( $( this ).children('option:selected').text() );
			});

		
		},
		destroy: function() 
		{
			this.input.remove();
			this.element.show();
			$.Widget.prototype.destroy.call( this );
		}
	});
})( jQuery );

$(function() 
{
	if ( $('div#index').length > 0 )
		$( "#subject" ).combobox();
});
