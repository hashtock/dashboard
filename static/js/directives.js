'use strict';

/* Directives */

var hashtockDirectives = angular.module('hashtockDirectives', []);

hashtockDirectives.directive('ionslider',function(){
    return{
        restrict:'E',
        scope:{
            min:'=',
            max:'=',
            from: '=',
            step:'@',
            postfix:'@',
            action:'&'
        },
        controller: function($rootScope, $scope, $element){
            (function init(){
                var postfix = $scope.postfix ? ' ' + $scope.postfix : '';

                $($element).ionRangeSlider({
                    type: 'single',
                    grid: false,
                    min: $scope.min,
                    max: $scope.max,
                    from: $scope.from,
                    step: $scope.step,
                    postfix: postfix,
                    onChange: function(data) {
                        $scope.action({'data':data.from});
                    }
                });
            })();

            var slider = $($element).data("ionRangeSlider");

            $scope.$watch('max', function(value) {
                var disabled = $scope.max === $scope.min;
                if (value !== undefined) {
                    slider.update({
                        max: value,
                        step: $scope.step,
                        disable: disabled
                    });
                }
            }, true);       

            $scope.$watch('min', function(value) {
                var disabled = $scope.max === $scope.min;
                if (value !== undefined) {
                    slider.update({
                        min: value,
                        step: $scope.step,
                        disable: disabled
                    });
                }
            }, true);

            // Force reset when value is switched to undefined
            $scope.$watch('from', function(value) {
                var disabled = $scope.max === $scope.min;
                if (value === undefined) {
                    slider.update({
                        from: 0,
                        step: $scope.step,
                        disable: disabled
                    });
                }
            }, true);
        }
    }
});

hashtockDirectives.directive('orderAction', function () {
    return {
        restrict: 'EA',
        scope: {
            orderAction: '='
        },
        template: '{{ action }}',
        link: function (scope, element, attrs) {
            if (scope.orderAction !== undefined) {
                if (scope.orderAction.quantity > 0) {
                    scope.action = 'buy';
                } else {
                    scope.action = 'sell';
                }
            }
        }
    }
});

