'use strict';

/* App Module */

var hashtockApp = angular.module('hashtockApp', [
    'ngRoute',

    'nvd3',
    'angularMoment',

    'hashtockControllers',
    'hashtockServices',
    'hashtockDirectives'
]);

hashtockApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/home', {
            templateUrl: '/static/partials/home.html'
        }).

        when('/portfolio', {
            templateUrl: '/static/partials/portfolio-table.html',
            controller: 'PortfolioCtrl'
        }).
        when('/tags', {
            templateUrl: '/static/partials/tag-table.html',
            controller: 'TagListCtrl'
        }).
        when('/tags/:tag', {
            templateUrl: '/static/partials/tag-details.html',
            controller: 'TagDetailCtrl'
        }).
        when('/orders', {
            templateUrl: '/static/partials/order-table.html',
            controller: 'OrderListCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });
    }
]);

hashtockApp.run(function ($rootScope, $location, User) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        var redirectTo;
        if ($rootScope.loggedIn) {
            return;
        }

        if (next && next.redirectTo) {
            redirectTo = next.redirectTo;
        } else if (current && current.redirectTo) {
            redirectTo = current.redirectTo;
        } else if (next && next.$$route && next.$$route.originalPath) {
            redirectTo = next.$$route.originalPath;
        }

        if (redirectTo == '/home') {
            return;
        }

        User.get(function(user) {
            if (user.email === undefined) {
                window.location = "/auth/login/gplus/?continue=" + encodeURIComponent($location.absUrl());
            } else {
                $rootScope.loggedIn = true;
            }
        }, function() {
            window.location = "/auth/login/gplus/?continue=" + encodeURIComponent($location.absUrl());
        });
    });
});

hashtockApp.filter('abs', function () {
  return function(val) {
    return Math.abs(val);
  }
});

hashtockApp.config(['$resourceProvider', function($resourceProvider) {
    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);
