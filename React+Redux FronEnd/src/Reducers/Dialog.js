
export default function Reducer(state, action){
  if(action.type==='AddDialog'){
  	return{
  		...state,
  		myDialogList:[...state.myDialogList, action.DialogList]
  	};
  }

  if(action.type==='LoadDialogList'){
  	return{
  		 ...state,
  		 myDialogList:action.DialogList
  	};
  }

	return state;
}
