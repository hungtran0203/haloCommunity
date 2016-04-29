import schema from './storeSchema.js'
import storeSchema from './storeReducer.js'
import {compose, createStore, applyMiddleware} from 'redux';
import _ from 'lodash';

let schemaReducer = storeSchema.createReducer(schema);
let store = createStore(schemaReducer);

let storeModule = window.angular.module('hl-store', []);

storeModule.provider("$hlStore", function haloStoreProvider(){
	const getStateIterator = function(stateId, conditions){
		return storeSchema.selectStateFromId(store.getState(), stateId, conditions)
	}

	const selectStateCollection = (stateId, conditions) => {
		var iterator = getStateIterator(stateId, conditions)
		var arr = [];
		for(let item of iterator){
			arr.push(item.state)
		}
		if(arr.length === 0){
			return emptyMemoizeFn(stateId, conditions)
		} else {
			return memoizeFn(...arr);
		}
	}

	const selectState = (stateId, conditions) => {
		var iterator = getStateIterator(stateId, conditions)
		var selectedState = iterator.next();
		return selectedState.done?undefined:selectedState.value.state;
	}

	const memoizeFn = _.memoize((...args) => {return [...args]});

	const emptyMemoizeFn = _.memoize((state, conditions) => {return []});

	this.$get = () => {
		window.store = store;
		return {...store, selectState, selectStateCollection}
	}
})

export default storeModule;