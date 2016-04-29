import modelModule from './init.js'
import _ from 'lodash'

/**
 * Return an empty array-like collection instance of a model
 *
 * @returns empty collection instance
 *
 */
function getCollectionInstance(className, condition){
	var collection = [];
	function isEqualCollection(col1, col2){
		let  isEqual = false;
		// fast compare
		if(!Array.isArray(col1) || !Array.isArray(col2)) return false;
		if(col1.length !== col2.length) return false;
		// slow compare
		for(let index in col1){
			if(!col2[index] || (typeof col2[index].equal === 'function' && !col2[index].equal(col1[index]))){
				return false
			}
		}
		return true;
	}
	collection.watchOnScope = function($scope, propName){
		let curr = $scope[propName];
		// for init watching
		if(curr !== undefined){
			// compare current with this collection to determine the change
			if(curr !== collection){
				$scope.$apply(() => {
					$scope[propName] = collection
				})				
			}
		}

		$scope[propName] = collection;
		let connector = className.$getConfig('connector');
		if(!connector){
			throw new Error('Connector is not configured for this collection')
		}
		var unsubscribe = connector.$subscribe(() => {
			//check for changed on collection
			let query = className.$find(condition);
			query.then((currentCollection) => {
				let isEqual  = isEqualCollection(currentCollection, collection)
				if(!isEqual){
					$scope.$apply(() => {
						$scope[propName] = currentCollection
					})					
				}
			})
		})
		// unsubscribe on $scope destroy event
		$scope.$on("$destroy", unsubscribe);
		return unsubscribe;

	}
	return collection;
}

class BaseModel {
  /**
   * Save this model by using the connector which is configured for this model. 
   * It might create a new record if key id is not provided or falsy or update the existing record
   * In case of adding new record, it will update the key id of model after successfully saving
   *
   * @returns a Promise object for this action
   *
   */
	save(){
		// get the connector assign to this model
		let connector = this.getConfig('connector');
		if(!connector){
			throw new Error('Connector is not configured for this model')
		}

		let key = this.getKey();
		if(this[key]){
			// for updating model
			return connector.$update(this)
		} else {
			// for new model
			return connector.$add(this);
		}

	}
  /**
   * Delete model from database/store
   *
   * @returns a Promise object for this action
   *
   */
	delete(){
		// get the connector assign to this model
		let connector = this.getConfig('connector');
		if(!connector){
			throw new Error('Connector is not configured for this model')
		}
		// for updating model
		return connector.$delete(this)

	}

  /**
   * Return the class/function definition for this model. 
   * This function is used in purpose to access static class method of model
   *
   * @returns class/function 
   *
   */
	getModelClass(){
		let prototype = Object.getPrototypeOf(this);
		if(prototype.constructor){
			return prototype.constructor;
		} else {
			throw new Error("Unknown Model Class name")
		}
	}

  /**
   * Return key identify for this model
   *
   * @returns string
   *
   */
	getKey(){
		let $config = this.getConfig();
		if(!$config || $config.key === undefined){
			throw new Error("Model key property is not configured")
		}
		let className = this.getModelClass();
		let $properties = className.$properties();
		if(!_.isString($config.key)){
			throw new Error("Invalid model key property")	
		}
		if($properties[$config.key] === undefined){
			throw new Error("Model key does not exists in properties list")	
		}
		return $config.key

	}

  /**
   * Return a configure option of this model
   *
   * @returns 
   *
   */
	getConfig(key, def){
		let className = this.getModelClass();
		return className.$getConfig(key, def)
	}

  /**
   * Return all properties of this model
   *
   * @returns array
   *
   */
	getProperties(){
		let className = this.getModelClass();
		let $properties = className.$properties();
		var rtn = {};
		var propNames = Object.getOwnPropertyNames($properties);
		for(let prop of propNames){
			rtn[prop] = this[prop];
		}
		return rtn;

	}

  /**
   * Bind input data to model properties
   *
   * @returns updated model
   *
   */
	bind(data){
		var propNames = Object.getOwnPropertyNames(this);
		for(let propName of propNames) {
			if(data[propName] !== undefined){
				this[propName] = data[propName];
			}
		}
		return this;
	}

  /**
   * Assign watcher for this model on a specific angular scope
   *
   * @returns unsubscribe function handler
   *
   */
	watchOnScope($scope, propName){
		// for init watching
		if(curr !== undefined){
			// compare current with this collection to determine the change
			if(curr !== collection){
				$scope.$apply(() => {
					$scope[propName] = this
				})				
			}
		}

		$scope[propName] = this;
		let connector = this.getConfig('connector');
		if(!connector){
			throw new Error('Connector is not configured for this model')
		}
		var model = this;
		var unsubscribe = connector.$subscribe(() => {
			connector.$isChanged(model).then((isChanged) => {
				if(isChanged){
					$scope.$apply(() => {
						$scope[propName] = isChanged
					})
				}
			})
		})

		// unsubscribe on $scope destroy event
		$scope.$on("$destroy", unsubscribe);
		return unsubscribe;
	}

  /**
   * Equal comparasion this model with a target model.
   * The comparasion is to check if all properties are equal
   *
   * @returns unsubscribe function handler
   *
   */
	equal(targetModel){
		var thisProps = this.getProperties();
		var targetModelProps = targetModel.getProperties();
		return _.isMatch(thisProps, targetModelProps)
	}

  /**
   * Static method to create new model instance with initialized data as properties
   *
   * @returns model instance
   *
   */
	static $new(data) {
		var className = this;
		var instance = new className();
		var defaultProps = className.$properties();
		// bind data
		if(_.isPlainObject(defaultProps)){
			var propNames = Object.getOwnPropertyNames(defaultProps);
			for(let propName of propNames) {
				var propVal
				if(_.isPlainObject(data) && data[propName] !== undefined){
					propVal = data[propName];
				} else if(typeof defaultProps[propName] === 'function'){
					propVal = defaultProps[propName].apply(instance, [data]);
				} else {
					propVal = defaultProps[propName];
				}
				instance[propName] = propVal;
			}
		}
		// Object.seal(instance)
		return instance;
	}

  /**
   * find a collection of models satisfy condition input
   *
   * @returns a Promise object with model collection as resolved value
   *
   */
	static $find(condition) {
		var className = this;
		let connector = className.$getConfig('connector');
		return connector.$query(condition).then((records) => {
			// create new instance for  each found record
			var rtn = getCollectionInstance(className, condition);
			if(Array.isArray(records)){
				for(let r of records){
					let instance = className.$new(r);
					rtn.push(instance)
				}
			}
			return Promise.resolve(rtn);
		})
	}

  /**
   * find the first found model satisfy condition input
   *
   * @returns a Promise object with first found model as resolved value
   *
   */
	static $findOne(condition){
		return this.$find(condition).then((found) => {
			return Promise.resolve(found.shift())
		})
	}

  /**
   * provide configuration for this model instances
   *
   * @returns configuration object
   *
   */
	static $config(){
		return {
			key: '_id'
		}
	}

  /**
   * return a specific configuration value of this model
   *
   * @returns configuration value
   *
   */
	static $getConfig(key, def){
		let $config = this.$config();
		if(key !== undefined){
			if($config && $config[key] !== undefined){
				return $config[key]
			} else {
				return def;
			}
		}
		return $config;
	}

  /**
   * provide all properties fields of this model
   *
   * @returns properties object
   *
   */
	static $properties() {
		return {
			_id:  null,
		}
	}
}

modelModule.factory('hlBaseModel', function(){
	return BaseModel;
})
