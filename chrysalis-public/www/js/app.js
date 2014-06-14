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
	.when("/donation/:cardid", {
		controller: "Donation",
		templateUrl: "pages/donation.html"
	})
	.when("/sent", {
		templateUrl: "pages/sent.html"
	})
	.when("/admin/messages", {
		controller: "AdminMessages",
		templateUrl: "pages/adminMessages.html"
	})
	.when("/ecard/:cardid", {
		controller: "Ecard",
		templateUrl: "pages/ecard.html"
	})
	.when("/admin/images", {
		controller: "AdminImages",
		templateUrl: "pages/adminImages.html"
	})
	.when("/admin/image/edit/:id", {
		controller: "AdminEditImage",
		templateUrl: "pages/adminEditImage.html"
	})
	.when("/admin/image/upload", {
		controller: "Upload",
		templateUrl: "pages/imageUpload.html"
	})
	.otherwise({
		redirectTo:  "/"
	});
})

.factory("ImageList", ['$resource', function($resource){
	return $resource("api/images", {}, {
		query: {method: "GET", isArray:true}
	});
}])

.factory("MessageList", ['$resource', function($resource){
	return $resource("api/messages", {}, {
		query: {method: "GET", isArray:true}
	});
}])

.factory("CardService", ['$resource', function($resource){
	return $resource("api/cards/:id", {
		id: "@cardid"
	}, {
		query: {method: "GET"}
	});
}])

.factory("Card", function() {
	var card = {};
	return card;
})

.factory("Tags", ['$resource', function($resource){
	return $resource("api/tags", {}, {
		query: {method: "GET", isArray:true}
	});
}])

.controller("IndexController", ["$scope", "ImageList", "Card", "Tags", "$location",
	function($scope, ImageList, Card, Tags, $location) {
		$scope.imageList = ImageList.query();
		$scope.card = Card;
		$scope.card.tag = {
			name: "General Occasion"
		};
		Tags.query().$promise.then(function(tags) {
			tags.unshift($scope.card.tag);
			$scope.tags = tags;
		});

		$scope.selectImage = function(image) {
			$scope.card.image = image;
			$location.path("/selectMessage");
		};

		$scope.containsTag = function(tag) {
			return function(image) {
				var contains = false;

				if ($scope.card.tag == "" || $scope.card.tag && $scope.card.tag.name == "General Occasion") {
					return true;
				}

				angular.forEach(image.tags, function(imgtag) {
					if (imgtag.name == $scope.card.tag.name) {
						contains = true;
					}
				});
				return contains;
			};
		};
	}]
)

.controller("SelectController", ["$scope", "Card", "MessageList", "$location",
	function($scope, Card, MessageList, $location) {
		$scope.messages = MessageList.query();
		$scope.card = Card;

		$scope.setSelectMessage = function(message) {
			$scope.card.messageText = message.text;
			$location.path("/card-horiz");
		};

		$scope.setCustomMessage = function() {
			$scope.card.messageText = $scope.custommessage;
			$location.path("/card-horiz");
		};
	}
])

.controller("CardHoriz", ["$scope", "Card", "$http", "$location",
	function($scope, Card, $http, $location) {
		$scope.card = Card;
		$scope.checked = false;

		$scope.saveCard = function() {
			$scope.checked = true;
			if ($scope.cardinfo.$valid) {
				$http.post("api/cards", $scope.card).success(function(data) {
					$location.path("/donation/" + data._id);
				});
			}
		};
	}
])

.controller("Donation", ["$scope", "$routeParams",
	function($scope, $routeParams) {
		$scope.cardid = $routeParams.cardid;
		$scope.paypal = "5VYV4XB5D3NV2";
		$scope.returnURL = "http://" + window.location.host + "/api/cards/send/" + $scope.cardid;
	}
])

.controller("Ecard", ["$scope", "$routeParams", "CardService",
	function($scope, $routeParams, CardService) {
		$scope.card = CardService.query({id: $routeParams.cardid});
	}
])

.controller("Upload", ["$scope", function($scope) {
	
}])

.controller("AdminMessages", ["$scope", "MessageList", "Tags", "$http", "$location", "$q",
	function($scope, MessageList, Tags, $http, $location, $q) {
		$scope.showAdminTabs = true;
		$scope.selection = [];
		$scope.newMessage = {};
		$scope.tag = {
			name: "General Occasion"
		};
		Tags.query().$promise.then(function(tags) {
			tags.unshift($scope.tag);
			$scope.tags = tags;
		});
		$scope.messages = MessageList.query();

		$scope.showNewMessageDiv = false;

		$scope.showNewMessage = function(){
			$scope.showNewMessageDiv = true;
		};

		$scope.createNewMessage = function($event){
			$event.preventDefault();
			$http.post("api/messages", $scope.newMessage).success(function(data) {
				$scope.messages.push(data);
				$scope.showNewMessageDiv = false;
			});
		};
		$scope.toggleSelection = function(message) {
		    var idx = $scope.selection.indexOf(message);
		    if (idx > -1) {
		      $scope.selection.splice(idx, 1);
		    } else {
		      $scope.selection.push(message);
		    }
		  };

		$scope.deleteSelectedMessages = function($event){
			$event.preventDefault();

			angular.forEach($scope.selection, function(messageToDelete) {
				var idx = $scope.messages.indexOf(messageToDelete);
				if (idx > -1) {
					$scope.messages.splice(idx, 1);
					$http.get("api/messages/delete/" + messageToDelete._id);
				}
			});
		};

		$scope.containsTag = function(tag) {
			return function(message) {
				var contains = false;

				if ($scope.tag == "" || $scope.tag && $scope.tag.name == "General Occasion") {
					return true;
				}

				angular.forEach(message.tags, function(messagetag) {
					if (messagetag.name == $scope.tag.name) {
						contains = true;
					}
				});
				return contains;
			};
		};

		$scope.removeTag = function(message, tag, $event){
			$event.preventDefault();

			var idx = message.tags.indexOf(tag);
			if (idx > -1) {
				message.tags.splice(idx, 1);
				$http.post("api/messages/update/" + message._id, message).success(function(data) {
					
				});
			}
		};

		$scope.addNewTag = function(message, $event){
			$event.preventDefault();

			if(!message.tags){
				message.tags = [];
			}
			$http.get("api/tags/name/" + message.newTagName)
				.success(function(data){
					if(data.length <= 0){
						var newTag = {"name" : message.newTagName};
						$http.post("api/tags", newTag).success(function(data) {
							message.tags.push(data);
							$http.post("api/messages/update/" + message._id, message).success(function(data) {
								
							});
						});
					}else{
						var contains = false;
						angular.forEach(message.tags, function(tag){
							if(tag._id == data[0]._id){
								contains = true;
							}
						});
						if (!contains) {
							message.tags.push(data[0]);
							$http.post("api/messages/update/" + message._id, message).success(function(data) {
								
							});
						}
					}
				});
		};

		$scope.goToMessages = function($event){
			$event.preventDefault();
		};
		$scope.goToImages = function($event){
			$event.preventDefault();
			$location.path('/admin/images');
		};
	}]
)

.controller("AdminImages", ["$scope", "ImageList", "Tags", "$http", "$location",
	function($scope, ImageList, Tags, $http, $location) {
		$scope.images = ImageList.query();
		$scope.showAdminTabs = true;
		$scope.selection = [];
		$scope.newImage = {};
		$location.path('/admin/images');
		$scope.tag = {
			name: "General Occasion"
		};
		Tags.query().$promise.then(function(tags) {
			tags.unshift($scope.tag);
			$scope.tags = tags;
		});
		
		$scope.selectImage = function(image) {
			$location.path("/admin/image/edit/" + image._id);
		};

		$scope.uploadImage = function($event) {
			$event.preventDefault();
			$location.path("/admin/image/upload");
		};

		$scope.toggleSelection = function(image) {
		    var idx = $scope.selection.indexOf(image._id);
		    if (idx > -1) {
		      $scope.selection.splice(idx, 1);
		    } else {
		      $scope.selection.push(image._id);
		    }
		  };

		$scope.containsTag = function(tag) {
			return function(image) {
				var contains = false;

				if ($scope.tag == "" || $scope.tag && $scope.tag.name == "General Occasion") {
					return true;
				}

				angular.forEach(image.tags, function(imagetag) {
					if (imagetag.name == $scope.tag.name) {
						contains = true;
					}
				});
				return contains;
			};
		};

		$scope.goToMessages = function($event){
			$event.preventDefault();
			$location.path('/admin/messages');
		};
		$scope.goToImages = function($event){
			$event.preventDefault();
		};
	}]
)

.controller("AdminEditImage", ["$scope", "$routeParams", "Tags", "$http", "$location",
	function($scope, $routeParams, Tags, $http, $location) {
		$http.get("api/images/" + $routeParams.id).success(function(data){
			$scope.image = data;
		});

		$scope.deleteImage = function($event){
			$event.preventDefault();
			$http.get("api/images/delete/" + $scope.image._id).success(function(data){
				$location.path('/admin/images');
			});
		};

		$scope.removeTag = function(tag, $event){
			$event.preventDefault();
			var idx = $scope.image.tags.indexOf(tag);
			if (idx > -1) {
				$scope.image.tags.splice(idx, 1);
				$http.post("api/images/update/" + $scope.image._id, $scope.image).success(function(data) {
					
				});
			}
		};

		$scope.saveButton = function($event){
			$event.preventDefault();
			$location.path("/admin/images");
		};

		$scope.addNewTag = function($event){
			$event.preventDefault();
			if(!$scope.image.tags){
				$scope.image.tags = [];
			}
			$http.get("api/tags/name/" + $scope.image.newTagName)
				.success(function(data){
					if(data.length <= 0){
						var newTag = {"name" : $scope.image.newTagName};
						$http.post("api/tags", newTag).success(function(data) {
							$scope.image.tags.push(data);
							$http.post("api/images/update/" + $scope.image._id, $scope.image).success(function(data) {
							});
						});
					}else{
						var contains = false;
						angular.forEach($scope.image.tags, function(tag){
							if(tag._id == data[0]._id){
								contains = true;
							}
						});
						if (!contains) {
							$scope.image.tags.push(data[0]);
							$http.post("api/images/update/" + $scope.image._id, $scope.image).success(function(data) {
							});
						}
					}
				});
		};

		$scope.goToMessages = function($event){
			$event.preventDefault();
			$location.path('/admin/messages');
		};
		$scope.goToImages = function($event){
			$event.preventDefault();
			$location.path('/admin/images');
		};
	}]
);


