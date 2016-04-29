import userModule from './init.js';

// User Profile template config
userModule
.run(["$templateCache", function($templateCache) {
  $templateCache.put("halo/modules/user/template/profile.html", require("./template/profile.html")
	);
}]);

// User List template config
userModule
.run(["$templateCache", function($templateCache) {
  $templateCache.put("halo/modules/user/template/list.html", require("./template/list.html")
	);
}]);
