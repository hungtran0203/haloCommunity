import userModule from './init.js';

// Halo User Profile directive
userModule
.directive('haloUserProfile', function(){
	return {
		restrict: 'E',
		controller: 'hlUserController',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'halo/modules/user/template/profile.html';
    }
	}
})


// Halo User Profile directive
userModule
.directive('haloUserList', function(){
	return {
		restrict: 'E',
		scope: {},
		controller: 'hlUserListController',
		controllerAs: 'ctrl',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'halo/modules/user/template/list.html';
    }
	}
})
