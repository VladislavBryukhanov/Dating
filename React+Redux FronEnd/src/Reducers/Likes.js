
export default function Reducer(state, action){
	if(action.type==='AddLike'){
		return{
			...state,
			likes:[...state.likes, action.Likes]
		};
	}
	if(action.type==='LoadLike'){
		return{
			...state,
			likes:action.Likes
		};
	}
	if(action.type==='DeleteLike'){
		const DelLike = action.Likes;
		// console.log(DelLike);
		return{
			...state,
			likes:state.likes.filter(x => x.id != DelLike.id)
		};
	}

	return state;
}
