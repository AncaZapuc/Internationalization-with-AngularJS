
; (function (global, angular) {
    'use strict';

    angular.module('app', ['ngSanitize']).

        /**
         * Configure a basic route, to enable use to navigate through a few pages
         * using $routeParams we will be able to extract the culture and page name
         */
        config(function ($routeProvider, $locationProvider) {

            $routeProvider.
                when('/:culture/:page', {

                    //Note the use of a template here, rather than templateUrl, see RouteCtrl for more info
                    template: '<ng-include src="templateUrl">',
                    controller: 'RouteCtrl'
                }).
                otherwise({ redirectTo: '/en/home' });
        }).

        /**
         * This service enables the application to get the string resources required by the application's UI
         */
        service('appLocale', function ($q, $http, $timeout) {
            
            var getLocaleResources = function (culture) {

                var deferred = $q.defer();
                culture = culture || 'en';

                $timeout(function () {

                    $http.
                        get('/Scripts/i18n/angular-locale_' + culture + '.js').
                        success(function (response) {
                            global.eval(response);
                        }).
                        error(function (response) {
                            console.log('Unable to locate AngularJS locale resource.');
                        });

                    $http.
                        get('/Scripts/app-i18n/' + culture + '.js').
                        success(function (response) {
                            deferred.resolve(response);
                        }).
                        error(function (response) {
                            console.log('Unable to locate application locale resource.');
                        });
                });

                return deferred.promise;
            };

            return {
                getResources: getLocaleResources
            };
        }).

        //This controller enables the user to change the language, and navigate to other pages
        controller('AppCtrl', function ($scope, $location, $routeParams, appLocale) {

            $scope.changeLanguage = function (culture) {
                appLocale.getResources(culture).then(function (localeResources) {
                    $scope.locale = localeResources;
                    $location.path('/' + culture + '/' + $routeParams.page);
                });
            };

            //Used to navigate between pages - usually like so: <a ng-click="go('home')">
            $scope.go = function (page) {

                //This navigation implementation is fairly naive, but it works for the demo,
                //What would be nice is if one of the values in the routeParams was changed, that a
                //method could be called on the route to refresh the location based on the current route's data
                $location.path('/' + $routeParams.culture + '/' + page);
            };

            //Ensure that when the app first loads that the locale resources are applied
            $scope.$on('$routeChangeSuccess', function () {
                if ($scope.locale == null || $scope.locale['locale-id'] !== $routeParams.culture) {
                    $scope.changeLanguage($routeParams.culture);
                }
            });
        }).

        /**
         * The RouteCtrl is used to build up the URL to the template based on information available in $routeParams
         * It would be nice to have this information earlier on, to remove the need for this, see this url for where i got the idea:
         * http://stackoverflow.com/questions/11534710/angularjs-how-to-use-routeparams-in-generating-the-templateurl
         */
        controller('RouteCtrl', function ($scope, $routeParams) {
            $scope.templateUrl = '/Templates/' + $routeParams.page + '.html';
        });
    
}(this, angular));