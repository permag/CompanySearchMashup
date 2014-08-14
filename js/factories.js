
// fetch data from Eniro API
app.factory('eniroFactory', function($http) {
    var factory = {};
    factory.getResults = function(industry, location, page, grab) {
        var basicUrl = 'http://api.eniro.com/cs/search/basic?key=1562073226586824804&profile=permag&country=se&version=1.1.3';
        var from = 0;
        page = parseInt(page);
        if (page === 1) {
            from = 1;
        } else {
            from = page * grab;
        }
        var to = from + grab - 1;
        var params = '&search_word=' + industry + '&geo_area=' + location + '&from_list='+from+'&to_list='+to;

        return $http({
            url: basicUrl + params,
            method: 'GET'
        });
    };
    return factory;
});

// fetch data from LinkedIn API
app.factory('linkedInFactory', function($http) {
    var factory = {};
    factory.getResults = function(industry, location) {
        var basicUrl = 'http://api.linkedin.com/v1/people-search?comapny=apple';
        var params = '';
        return $http({
            url: basicUrl + params,
            method: 'GET'
        });
    };
    return factory;
});


// test persons data
app.factory('testPersonsFactory', function($http) {
    var factory = {};
    factory.getResults = function(company, city) {
        return $http({
            url: './php/persons.php?company='+company+'&city='+city,
            method: 'GET'
        });
    };
    return factory;
});
