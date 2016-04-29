import userModule from './init.js';
// Define UserController
userModule
.controller('hlUserController', ["$scope", "hlUserModel", function($scope, UserModel){
	// 
	var user = UserModel.$new();
	user.username = 'u1'
	user.email = 'e1'
	user.save()

	var user2 = UserModel.$new();
	user2.username = 'u2'
	user2.email = 'e2'
	user2.save()
	
	// user.delete();
	user2.save();
	var query = UserModel.$find();

	$scope.users = [];

	query.then((users)=> {
		users.watchOnScope($scope, 'users')
	})

	// user.watchOnScope($scope, 'user');

	// $scope.users = [user, user2]

	setTimeout(
		() => {
			var anotherUser = UserModel.$findOne({username: 'u1'});
			anotherUser.then((user) => {
				if(user){
					user.email = 'another';
					user.save();					
				}
			})

		}, 5000
	)
}])


.controller('hlUserListController', ["$scope", "hlUserModel", function($scope, UserModel){
	// init users list with empty array
	$scope.users = [];

	// sample data loading:
	for(let v = 0; v <= 1000; v ++){
		var user = UserModel.$new();
		user.username = 'username ' + v;
		user.email = 'email' + v + '@email.com'
		user.save()
	}
	// load users list through promise
	var query = UserModel.$find();
	query.then((users)=> {
		users.watchOnScope($scope, 'users')
	})

	setTimeout(
		() => {
			var anotherUser = UserModel.$findOne({username: 'u1'});
			anotherUser.then((user) => {
				if(user){
					user.email = 'another';
					user.save();					
				}
			})

		}, 5000
	)

	// paging setting
	$scope.paging = {
		currentPage: 1,
		limit: 12
	}
}])
