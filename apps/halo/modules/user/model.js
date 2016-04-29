import userModule from './init.js';

userModule.factory('hlUserModel', ["hlBaseModel", "hlStoreConnector", "$hlStore", function(BaseModel, StoreConnector, $hlStore){
	class UserModel extends BaseModel{
		static $properties(){
			return {
				_id: null,
				username: '',
				email: ''
			}
		}
		static $config(){
			return {
				connector: new StoreConnector({stateId: 'USERS_COLLECTION', store: $hlStore}),
				key: '_id'
			}
		}
	}
	return UserModel;
}])