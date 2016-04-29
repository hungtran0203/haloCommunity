import connectorModule from './init.js'

import storeModule from '../store/index.js'

import _ from 'lodash'

var getUniqueId = function(){
	var index = 1;
	return function(){
		return '' + index++;
	}
}()

connectorModule
.factory('hlStoreConnector', ["hlBaseConnector", function(BaseConnector){
	// store Connector
	class StoreConnector extends BaseConnector {
		constructor(opts={store:{}, stateId: ''}) {
			var isStore = (store) => {
				if(!_.isPlainObject(store)){
					throw new Error("Store option must be a plain object, got " +  typeof store)
				}
				if(!_.isFunction(store.selectState)){
					throw new Error("Store must have selectState function")	
				}
				if(!_.isFunction(store.getState)){
					throw new Error("Store must have getState function")	
				}
				if(!_.isFunction(store.dispatch)){
					throw new Error("Store must have dispatch function")	
				}
				if(!_.isFunction(store.subscribe)){
					throw new Error("Store must have subscribe function")	
				}

				return true;
			}
			var isStateId = (stateId) => {
				if(!_.isString(stateId) || stateId === ''){
					throw new Error('Invalide state id')
				}
			}
			// verify required options
			isStore(opts.store);
			isStateId(opts.stateId);

			super(opts);

			this.store = this.getOption('store')
			this.stateId = this.getOption('stateId')

		}

		getActionPayload(model){
			return {
				data: model.getProperties(),
				filter: this.getFilter(model)
			}
		}
		getFilter(model){
			let modelKey = model.getKey();
			let keyVal = model[modelKey];
			let filter = {};

			filter[this.stateId] = {};
			filter[this.stateId][modelKey] = keyVal;
			return filter;		
		}

		$isChanged(model){
			// compare current model value with the state value
			var modelProps = model.getProperties();
			var modelClass = model.getModelClass();
			var filter = {};
			let modelKey = model.getKey();
			filter[modelKey] = model[modelKey]
			return modelClass.$find(filter)
			.then((stateModels) => {
				var stateModel = stateModels.shift();
				if(_.isMatch(modelProps, stateModel.getProperties())){
					return Promise.resolve(false)
				} else {
					return Promise.resolve(stateModel)
				}
			})
		}

		$update(model){
			var that = this
			return new Promise((resolve, reject) => {
				that.store.dispatch({type: 'UPDATE@' + that.stateId, payload: that.getActionPayload(model)});
				// update model properties after saving
				let queryPromise  = that.$queryRaw(that.getFilter(model))
				queryPromise.then((data)=>{
					// query always return an array of matched record
					if(Array.isArray(data) && data.length){
						model.bind(data[0])
						resolve(model)
					} else {
						reject(new Error('Could not update model'))
					}
				})
			})
		}
		$delete(model){
			return Promise.resolve(this.store.dispatch({type: 'DELETE@' + this.stateId, payload: {filter: this.getFilter(model)}}))
		}
		$add(model){
			var that = this
			// generate unique key id for this new model
			let key = model.getKey();
			model[key] = getUniqueId();

			return new Promise((resolve, reject) => {
				that.store.dispatch({type: 'ADD@' + that.stateId, payload: that.getActionPayload(model)});
				// update model properties after saving
				let queryPromise  = that.$queryRaw(that.getFilter(model))
				queryPromise.then((data)=>{
					// query always return an array of matched record
					if(Array.isArray(data) && data.length){
						model.bind(data[0])
						resolve(model)
					} else {
						reject(new Error('Could not add new model'))
					}
				})
			})
		}
		$query(condition){
			// transform model condition to connector condition
			let filter = {};

			filter[this.stateId] = condition;

			return this.$queryRaw(filter)
		}

		$queryRaw(condition){
			return Promise.resolve(this.store.selectState(this.stateId, condition))
		}

		$subscribe(handler){
			var that = this;
			return this.store.subscribe(() => {
				handler.apply();
			})
		}
	}

	return StoreConnector
}])