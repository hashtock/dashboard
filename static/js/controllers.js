'use strict';

/* Controllers */

var hashtockControllers = angular.module('hashtockControllers', []);

hashtockControllers.controller('UserCtrl', ['$scope', 'User', 'Balance',
    function($scope, User, Balance) {
        $scope.user = User.get();
        $scope.balance = Balance.get();
    }
]);

hashtockControllers.controller('TagListCtrl', ['$scope', 'Tag',
    function($scope, Tag) {
        $scope.tags = Tag.query();
        $scope.orderProp = 'hashtag';
        $scope.reverse = false;
    }
]);

hashtockControllers.controller('OrderListCtrl', ['$scope', 'Order',
    function($scope, Order) {
        $scope.historicalOrders = Order.history();
        $scope.pendingOrders = Order.pending();

        $scope.cancelOrder = function(order) {
            order.$cancel(function(value) {
                $scope.pendingOrders = Order.pending(function(){
                    // In case GAE returns shity old data
                    for (var i = 0; i < $scope.pendingOrders.length; i++) {
                        if ($scope.pendingOrders[i].uuid === order.uuid) {
                           $scope.pendingOrders.splice(i, 1);
                           break;
                        }
                    };
                });
            });
        };
    }
]);

hashtockControllers.controller('PortfolioCtrl', ['$scope', 'Portfolio',
    function($scope, Portfolio) {
        $scope.portfolioTags = Portfolio.query();
    }
]);

hashtockControllers.controller('TagDetailCtrl',
    ['$scope', '$routeParams', '$q', 'User', 'Tag', 'Portfolio', 'Balance', 'Order', 'moment',
  function($scope, $routeParams, $q, User, Tag, Portfolio, Balance, Order, moment) {
    $scope.balance = Balance.get();
    $scope.share = Portfolio.tag({tag: $routeParams.tag}, function() {
        $scope.maxSharesToSell = $scope.share.quantity;
    });
    $scope.tag = Tag.get({tag: $routeParams.tag});
    $scope.sucessfulOrders = Order.successful({tag: $routeParams.tag});

    $q.all([$scope.balance.$promise, $scope.tag.$promise]).then(function(){
        var val = Math.floor(10 * $scope.balance.cash / $scope.tag.value)/10;
        $scope.maxSharesToBuy = Math.min(val, $scope.tag.in_bank);
    })

    $scope.shareQuantityChanged = function(data) {
        $scope.newOrder.quantity = data;
        $scope.$apply();
    }

    $scope.shareUnitPriceChanged = function(data) {
        $scope.newOrder.unit_price = data;
        $scope.$apply();
    }

    $scope.canExecuteOrder = function() {
        if ($scope.newOrder === undefined || $scope.newOrder.quantity == 0 || $scope.orderUnitPrice() <= 0) {
            return false
        }

        // Buy
        if ($scope.newOrder.quantity > 0)
        {
            if ($scope.newOrder.type === 'bank') {
                return ($scope.newOrder.quantity <= $scope.maxSharesToBuy)
            }

            if ($scope.newOrder.type === 'market') {
                return ($scope.newOrder.quantity * $scope.newOrder.unit_price <= $scope.balance.cash)
            }
        }

        // Sell
        if ($scope.newOrder.quantity < 0) {
            return ($scope.newOrder.quantity >= -$scope.maxSharesToSell)
        }

        // Other cases...
        return false
    }

    $scope.currentAction = function() {
        var action = 'trade';

        if ($scope.newOrder === undefined) {
            action = '';
        } else {
            if ($scope.newOrder.quantity > 0) {
                action = 'buy';
            }
            if ($scope.newOrder.quantity < 0) {
                action = 'sell';
            }            
        }

        return action
    }

    $scope.canTradeWithBank = function () {
        return $scope.maxSharesToBuy > 0.1 || $scope.maxSharesToSell > 0.1;
    }

    $scope.canPlaceMarketOrder = function () {
        return  $scope.balance.cash > 0 || $scope.maxSharesToSell > 0.1;
    }

    $scope.isPlacingBankOrder = function() {
        return ($scope.newOrder && $scope.newOrder.type === 'bank');
    }

    $scope.isPlacingMarketOrder = function() {
        return ($scope.newOrder && $scope.newOrder.type === 'market');
    }

    $scope.isOrderInProgress = function() {
        return ($scope.newOrder !== undefined);
    }

    $scope.orderUnitPrice = function() {
        if ($scope.isPlacingBankOrder()){
            return $scope.tag.value;
        }

        if ($scope.isPlacingMarketOrder()){
            return $scope.newOrder.unit_price;
        }

        return 0
    }

    $scope.cancelOrder = function() {
        $scope.newOrder = undefined;
    }

    $scope.newBankOrder = function() {
        $scope.newOrder = new Order({
            type: 'bank',
            hashtag: $scope.tag.hashtag,
            quantity: 0
        });
    }

    $scope.newMarketOrder = function() {
        $scope.newOrder = new Order({
            type: 'market',
            hashtag: $scope.tag.hashtag,
            quantity: 0,
            unit_price: 0
        });
    }

    $scope.executeOrder = function() {
        $scope.newOrder.$save(function(data){
            $scope.newOrder = undefined;
        });
    }
}]);

hashtockControllers.controller('TagValuesCtrl',
    ['$scope', '$routeParams', '$q', 'TagValues', 'moment',
  function($scope, $routeParams, $q, TagValues, moment) {

    $scope.durationOptions = [
        {
            'label':'1 day',
            'duration': 1*24+'h',
            'sampling': undefined // raw
        },
        {
            'label':'week',
            'duration': 7*24+'h',
            'sampling': 'day'
        },
        {
            'label':'2 weeks',
            'duration': 14*24+'h',
            'sampling': 'day'
        },
        {
            'label':'4 weeks',
            'duration': 28*24+'h',
            'sampling': 'day'
        }
    ];
    $scope.currentDuration = $scope.durationOptions[0];

    $scope.showDays = function(option) {
        $scope.loadingTagValues = true;
        $scope.tagValues = TagValues.query({tag: $routeParams.tag, duration: option.duration, sampling: option.sampling}, function(values) {
            for (var i = 0; i < values.length; i++) {
                var date = new Date(values[i].date)
                values[i].label = date;
                values[i].value = values[i].count;
            };

            $scope.currentDuration = option;
            $scope.data = [{
                key: '#' + $routeParams.tag,
                values: values
            }];
            $scope.loadingTagValues = false;
        });
    }
    $scope.showDays($scope.currentDuration);

    $scope.formatDate = function(d) {
        switch ($scope.currentDuration.duration) {
            case '24h': return moment(d).format("HH:mm");
            default: return moment(d).format("D MMM");
        }
    }

    $scope.options = {
        chart: {
            type: 'lineChart',
            height: 250,
            margin : {top: 20, right: 20, bottom: 60, left: 60},
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            showLegend: false,
            xAxis: {
                axisLabel: 'Time',
                showMaxMin: false,
                tickFormat: $scope.formatDate,
            },
            yAxis: {
                axisLabel: 'Value',
                tickFormat: function(d){
                    return d.toFixed(1);
                }
            }
        }
    }
}]);

hashtockControllers.controller('MarketCtrl', ['$scope', '$routeParams', 'Portfolio', 'Balance', 'Order',
    function($scope, $routeParams, Portfolio, Balance, Order) {
        $scope.marketOrders = Order.pending({type: 'market'});
        $scope.balance = Balance.get();
        $scope.share = Portfolio.tag({tag: $routeParams.tag});

        $scope.fulfilOrder = function(order) {
            order.$fulfil();
        };

        $scope.canFulfilOrder = function(order) {
            // Buy market order
            if (order.quantity > 0) {
                return $scope.share.quantity >= order.quantity;
            }

            // Sell market order
            if (order.quantity < 0) {
                return $scope.balance.cash >= order.value;
            }

            return false;
        };
    }
]);
