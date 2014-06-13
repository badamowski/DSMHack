var app = angular.module("app", [
		"ngResource",
		"ngRoute"
	]);

app.config(function($routeProvider) {
	$routeProvider.when("/", {
		controller: "IndexController",
		templateUrl: "pages/index.html"
	})
	.when("/selectMessage", {
		controller: "SelectController",
		templateUrl: "pages/selectMessage.html"
	})
	.when("/card-horiz", {
		controller: "CardHoriz",
		templateUrl: "pages/card-horiz.html"
	})
	.otherwise({
		redirectTo:  "/"
	});
})

.factory("ImageList", ['$resource', function($resource){
	return $resource("api/images/list", {}, {
		query: {method: "GET", isArray:true}
	});
}])

.controller("IndexController", ["$scope", "ImageList", function($scope, ImageList) {
	$scope.imageList = ImageList.query();
	$scope.tag = "";
	$scope.tags = [
		"",
		"Anniversary",
		"Birthday"
	];
}]);