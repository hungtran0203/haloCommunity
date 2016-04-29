var haloApp = angular.module('halo-app', ['ui.bootstrap', 'hl-user']);

// load core module
import './modules/core.js'

// load user module
import './modules/user'



// Halo Topic component
haloApp
.directive('haloTopic', function(){
	return {
		restrict: 'E',
		controller: 'hlUserController',
		template: '<div ng-repeat="user in users"> {{user.email}} </div>'
	}
})


// Halo Thread component

// Halo User component

