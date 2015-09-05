'use strict';

/* Services */

var hashtockServices = angular.module('hashtockServices', ['ngResource']);

hashtockServices.factory('Tag', ['$resource', function($resource){
    return $resource('/api/bank/:tag/', {}, {
        query: {method:'GET', params:{tag:'@hashtag'}, isArray:true}
    });
}]);

hashtockServices.factory('TagValues', ['$resource', function($resource){
    return $resource('/tags/trends/:tag/', {}, {
        query: {method:'GET', params:{tag:'@hashtag', duration:undefined, sampling:undefined}, isArray:true}
    });
}]);

hashtockServices.factory('User', ['$resource', function($resource){
    return $resource('/auth/who/', {}, {
        get: {method:'GET', isArray:false}
    });
}]);

hashtockServices.factory('Order', ['$resource', function($resource){
    return $resource('/api/order/:uuid/', {}, {
        pending: {method:'GET', params:{type:undefined}, isArray:true},
        history: {method: 'GET', params:{uuid:'history'}, isArray:true},
        successful: {method: 'GET', params:{uuid:'history', tag:undefined, resolution:"success"}, isArray:true},
        get: {method: 'GET', params:{uuid:'@uuid'}, isArray:false},
        save: {method: 'POST', params:{uuid:'@uuid'}, isArray:false},
        fulfil: {method: 'POST', params:{uuid:'@uuid'}, isArray:false},
        cancel: {method: 'DELETE', params:{uuid:'@uuid'}, isArray:false}
    });
}]);

hashtockServices.factory('Balance', ['$resource', function($resource){
    return $resource('/api/balance/', {}, {
        get: {method:'GET', isArray:false},
    });
}]);

hashtockServices.factory('Portfolio', ['$resource', function($resource){
    return $resource('/api/portfolio/:tag/', {}, {
        query: {method:'GET', isArray:true},
        tag: {method:'GET', params:{tag:'@hashtag'}, isArray:false},
        balance: {method:'GET', params:{tag:'balance'}, isArray:false}
    });
}]);
