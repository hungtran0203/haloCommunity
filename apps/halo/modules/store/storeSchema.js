import {CollectionState, ObjectState, NumberState} from './stateTypes.js'

var getUniqueId = function(){
	var index = 1;
	return function(){
		return '' + index++;
	}
}()

var schema = {
	localData: new ObjectState ({
		itemSchema: {
			users: new CollectionState({
				itemSchema: {
					_id: getUniqueId,
					username: '',
					password: '',
					displayName: '',
					email: ''
				},
				stateId: 'USERS_COLLECTION'
			}),
			categories: new CollectionState({
				itemSchema: {
					_id: getUniqueId,
					name: '',
					creator_id: null
				},
				stateId: 'CATEGORIES_COLLECTION'
			}),			
		},
		stateId: 'LOCAL_DATA'
	})
}

export default schema;