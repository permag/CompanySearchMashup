
app.controller('AppCtrl', function($scope, $http, $q, $location, $routeParams, orderByFilter, eniroFactory, testPersonsFactory) {
    $scope.mashup = [];
    $scope.loading = false;
    $scope.showAll = true;
    $scope.countContacts = 0;
    $scope.selectAllText = '';
    $scope.addedContactsCount = 0;
    $scope.predicate = 'city';
    var addedContactsArr = [];
    var eniroData = [];
    $scope.totalHits = 0;
    var resultList = [];
    var industry = '';
    var grab = 50;

    if ($routeParams.industry && $routeParams.location && $routeParams.page) {
        getEniroData($routeParams.industry, $routeParams.location, $routeParams.page, grab);
    }

    $scope.numberOfPages = function() {
        return Math.floor($scope.totalHits / grab);
    };

    $scope.submitSearch = function() {
        $scope.loading = true;
        $scope.mashup = [];
        $scope.countContacts = 0;
        resultList = [];
        $('#check-all').find('input').removeAttr('checked');
        $scope.selectAllText = 'Markera alla.'
        industry = $('#industry option:selected').attr('value');
        var location = $('#location option:selected').attr('value');
        var sale = $('#sale option:selected').attr('value');

        getEniroData(industry, location, 1, grab);
        // $location.path(industry+'/'+location+'/1');

    };

    function getEniroData(industry, location, page, grab) {
        // get data from Eniro API
        eniroFactory.getResults(industry, location, page, grab).success(function(data) {
            eniroData = data.adverts;
            $scope.totalHits = data.totalHits;
            createMashup(eniroData);

        }).error(function() {
                console.log('Error: Eniro API.');
        });

    }

    // version that creates mashup and updates view with all items at once.
    function createMashup(eniroData) {
        var promises = [];
        var persons = [];
         $.each(eniroData, function(key, value) {
            var company = value.companyInfo.companyName;
            var city = value.address.postArea;
            promises.push(testPersonsFactory.getResults(company, city));
         });
         $q.all(promises).then(function(responsArray) {
            $.each(eniroData, function(key, value) {
                persons = [];
                $.each(responsArray, function(k, v) {
                    if (v.data.length > 0) {
                        if (value.companyInfo.companyName.toLowerCase() === v.data[0].company.toLowerCase() && value.address.postArea.toLowerCase() === v.data[0].city.toLowerCase()) {
                            $.each(v.data, function(kk, vv) {
                                persons.push(v.data[kk]);  // v.data is array too
                            });
                            $scope.countContacts++;
                        }
                    }
                });
                if (value.address.postArea !== null && value.phoneNumbers.phoneNumber !== null) {
                    resultList.push({
                        industry: industry.toUpperCase(),
                        company: value.companyInfo.companyName,
                        city: value.address.postArea,
                        phoneNumbers: value.phoneNumbers,
                        persons: persons
                    });
                }
            });
            $scope.mashup = resultList;
            $scope.mashup = orderByFilter($scope.mashup, '+city');
            $scope.loading = false;
         });
    }

    // version that creates mashup and updates view with items, one at the time.
    function createMashup_2(eniroData) {
        $.each(eniroData, function(key, value) {
            var company = value.companyInfo.companyName;
            var city = value.address.postArea;
            var phoneNumbers = value.phoneNumbers;
            // if company name exists in Persons API
            // get persons data, json array.
            // get persons test data, and create new object with mashup data.
            testPersonsFactory.getResults(company, city).success(function(data) {
                if (data.length > 0) {  // if no persons found
                    $scope.countContacts++;
                }
                if (city !== null && phoneNumbers.phoneNumber !== null) {  // don't add hits without city and phones
                    resultList.push({
                        industry: industry.toUpperCase(),
                        company: company,
                        city: city,
                        phoneNumbers: phoneNumbers,
                        persons: data
                    });
                }

                $scope.mashup = resultList;
                $scope.mashup = orderByFilter($scope.mashup, '+city');
                $scope.loading = false;

            }).error(function() {
                console.log('Error: Test persons API.');
            });
                
        });
    }

    $scope.toggleShowAll = function() {
        $scope.showAll = !$scope.showAll;
    };

    $scope.selectAll = function() {
        var checkBoxes = $('.check-box');
        if ($('#check-all').find('input').attr('checked')) {
            checkBoxes.attr('checked', 'checked');
            $scope.selectAllText = 'Avmarkera alla.';
        } else {
            checkBoxes.removeAttr('checked');
            $scope.selectAllText = 'Markera alla.';
        }
    };

    function checkIfSelected() {
        return $('.check-box').is(':checked');
    }

    function getSelected() {
        var checkedList = [];
        var checkBoxes = $('.check-box');
        $.each(checkBoxes, function(key, box) {
            if ($(box).is(':checked')) {
                checkedList.push(key); // key is same as box id
            }
        });
        return checkedList;
    }

    $scope.addContacts = function() {
        if (!checkIfSelected() || $scope.countContacts === 0) {
            return;
        }
        var checkedList = getSelected();

        $.each($scope.mashup, function(key, value) {
            if ($.inArray(key, checkedList) !== -1) {
                if (value.persons.length > 0) {
                    $.each(value.persons, function(k, person) {
                        $scope.addContact(value, k);
                    });
                }
            }
        });
    }

    $scope.addContact = function(obj, index) {
        var csvString = obj.industry+';'+obj.city+';'+obj.company+';'+obj.persons[index].firstName+' '+obj.persons[index].lastName+';'+obj.persons[index].profileImage+';'+obj.persons[index].title+';'+obj.persons[index].email+'%0D%0A';
        if ($.inArray(csvString, addedContactsArr) === -1) {
            $scope.addedContactsCount++; // count
            addedContactsArr.push(csvString);
        }
    };

    $scope.generateCSV = function() {
        if ($scope.addedContactsCount === 0) {
            return;
        }
        var csvHeader = 'Bransch;Stad;Företag;Namn;Profilbild;Titel;Kontaktuppgifter%0D%0A';
        var csvContacts = csvHeader + addedContactsArr.join('');
        window.open('./php/generate_csv.php?csvString='+csvContacts, 'Kontakter', '');
        $scope.addedContactsCount = 0;
        addedContactsArr = [];
    };

});
