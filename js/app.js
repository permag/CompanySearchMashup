
var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {templateUrl: './views/partials/_results.html', controller: 'AppCtrl'})
        .when('/:industry/:location/:page', {templateUrl: './views/partials/_results.html', controller: 'AppCtrl'})
        .otherwise({redirectTo: '/'});
});
