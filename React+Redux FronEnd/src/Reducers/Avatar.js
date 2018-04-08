export default function Reducer(state, action){
  if(action.type==='AddAvatar'){
		return{
			...state,
			 avatar:[...state.avatar, action.Avatar]
		};//... создание нового массива - state[] с добавлением в него старого стейта + action.payload
	}
	if(action.type==='DelAvatar'){
		return{
			...state,
			avatar:state.avatar.filter(item => item != action.Avatar)
		};
	}
	if(action.type==='EditAvatar'){
		for(var i = 0;i<state.avatar.length; i++){
			if(state.avatar[i].id==action.Avatar.id){
				state.avatar[i]=action.Avatar;
			}
		}
		return{
			...state,
			 avatar:[...state.avatar]
		};
	}

	return state;
}
