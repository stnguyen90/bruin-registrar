
/**
 * Module dependencies.
 */

var express = require('express'),
	gzippo = require('gzippo'),
	routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	//app.use(express.static(__dirname + '/public'));
	app.use(gzippo.staticGzip(__dirname + '/public'));	// use gzip compression
	app.use(gzippo.staticGzip(__dirname + '/'));		// use gzip compression
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/listClasses', routes.listClasses);
app.get('/viewCourse', routes.viewCourse);
app.get('/viewCourseDetails', routes.viewCourseDetails);


var port = (process.env.VMC_APP_PORT || 3000);
app.listen(port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
