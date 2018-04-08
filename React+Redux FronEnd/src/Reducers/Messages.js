
export default function Reducer(state, action){
	if(action.type==='LoadMessage'){
		return{
			...state,
			 messages: action.Message
		};
	}
		if(action.type==='SendMessage'){
			return{
				...state,
				 messages:[...state.messages, action.Message]
			};
		}
	return state;
}
