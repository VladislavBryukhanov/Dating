
export default function Reducer(state, action){

	if(action.type==='AddFavorite'){
		return{
			 ...state,
			 favorites:[...state.favorites, action.Favorites]
		};
	}
	if(action.type==='LoadFavorite'){
		return{
			 ...state,
			 favorites:action.Favorites
		};
	}
	if(action.type==='DeleteFavorite'){
		const DelFav = action.Favorites;
		return{
			 ...state,
			 favorites:state.favorites.filter(x => x.id != DelFav.id)
		};
	}
	return state;
}
