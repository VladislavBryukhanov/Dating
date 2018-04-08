
export default function Reducer(state, action){

  	if(action.type==='LoadRoles'){
  		return{
  			...state,
  			 roles: action.Role
  		};
  	}
  	return state;
	return state;
}
