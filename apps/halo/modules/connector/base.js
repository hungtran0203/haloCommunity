import connectorModule from './init.js'

// follow CRUD approach
class BaseConnector {
	constructor(opts) {
		this.options = opts;
	}

	// Update in CRUD
	$update(model) {
		return Promise.resolved(true)
	}
	// Read in CRUD
	$query(condition) {
		return Promise.resolved(true)
	}
	// Delete in CRUD
	$delete(model) {
		return Promise.resolved(true)
	}
	// Create in CRUD
	$add(model) {
		return Promise.resolved(true)
	}
	getOption(optName, def){
		return (this.options && this.options[optName]) || def;
	}
}


connectorModule
.factory('hlBaseConnector', function(){
	return BaseConnector
})