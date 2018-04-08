export default function Reducer(state, action){
	if(action.type==='LoadUser'){
		return{
			...state,
			 users: action.Users
		};//... создание нового массива - state[] с добавлением в него старого стейта + action.payload
	}
	if(action.type==='AddUser'){
		return{
			...state,
			 users:[...state.users, action.Users]
		};//... создание нового массива - state[] с добавлением в него старого стейта + action.payload
	}

	if(action.type==='EditUser'){
		for(var i = 0;i<state.users.length; i++){
			if(state.users[i].id==action.EditedUser.id)
			state.users[i]=action.EditedUser;
		}
		return{
			...state,
			 users:[...state.users]
		};
	}
	if(action.type=='DelUser'){
		const DelUser = action.Users;
		return{
			...state,
			 users:state.users.filter(x => x.id != DelUser.id)
		};
	}
	if(action.type==='MyPage'){
		return{
			...state,
			 myPage:action.Users
		};
	}
	return state;
}
