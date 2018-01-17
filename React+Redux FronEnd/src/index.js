import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Provider} from 'react-redux';
import {createStore} from 'redux'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Avatar from './Ava.jpg';
import Clock from './Clock.jpg';

import App from './App';
import Menu from './Menu';

// import Avatar from './Reducers/Avatar.js';
// import Dialog from './Reducers/Dialog.js';
// import Favorites from './Reducers/Favorites.js';
// import Likes from './Reducers/Likes.js';
// import Messages from './Reducers/Messages.js';
// import Roles from './Reducers/Roles.js';
// import Users from './Reducers/Users.js';

var serverAddress="localhost:59088";
var store;
	fetch("http://"+serverAddress+"/api/Avatars")
	.then(function(response){
		return response.json();
	})
	.then(function(json){
		return(json);
	})
  .then(result => {
		result.push({base64:Clock, id:"Clock"});
		result.push({base64:Avatar, id:"None"})

		var initialState={
			Url:{
				"GetUsers":"ws://"+serverAddress+"/Controllers/GetUsers.ashx",

				"GetDialogList":"ws://"+serverAddress+"/Controllers/GetDialogList.ashx",
				"GetLikes":"ws://"+serverAddress+"/Controllers/GetLikes.ashx",
				"GetGuests":"ws://"+serverAddress+"/Controllers/GetGuests.ashx",

				"MessageSocket":"ws://"+serverAddress+"/Controllers/Chat.ashx",
				"AuthSocket":"ws://"+serverAddress+"/Controllers/OnlineStatusChecker.ashx",

				"Roles":"http://"+serverAddress+"/api/Roles",
				"Avatar":"http://"+serverAddress+"/api/Avatars",
				"FriendList":"http://"+serverAddress+"/api/FriendLists",
				"LikeList":"http://"+serverAddress+"/api/LikeLists",
				"GuestsList":"http://"+serverAddress+"/api/GuestLists",
				"DialogList":"http://"+serverAddress+"/api/DialogLists",
				"Messages":"http://"+serverAddress+"/api/Dialogs",
				"Hobby":"http://"+serverAddress+"/api/Hobbies",
				"Authorize":"http://"+serverAddress+"/api/Authentific",
				// "Gallery":"http://"+serverAddress+"/api/Galleries",
				"Users":"http://"+serverAddress+"/api/SiteUsers",
				"Gallery":"http://"+serverAddress+"/api/Galleries"
			},
			avatar:result,
			roles:[],
			users:[],
			messages:[],
			likes:[],
			favorites:[],
			myDialogList: [],
			guests:[],
			myPage:null
		}
			 store  = createStore(Reducer,initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());//создаем стор только после выкачивания данных из бэекенда и закидываем эти данные в стор, это будет его начальный контент

			 ReactDOM.render(
				 <Provider store={store}>
					 <BrowserRouter>
						 <Switch>
								<Route exact path='/' component={App}/>
							  <Route path='/HomePage' component={Menu}/>
							</Switch>
					 </BrowserRouter>
				 </Provider>,
				 document.getElementById('root')
			 );
  });
// function myCombineReducer(state, action){
// 	console.log(action);
// 	switch(action)
// 	{
// 		case action.Avatar:Avatar(state, action);
// 		case action.DialogList:Dialog(state, action);
// 		case action.Favorites:Favorites(state, action);
// 		case action.Likes:Likes(state, action);
// 		case action.Message:Messages(state, action);
// 		case action.Role:Roles(state, action);
// 		case action.Users:Users(state, action);
// 	}
// 	return state;
// }

function Reducer(state, action){
	if(action.type==='AddAvatar'){
		return{
			...state,
			 avatar:[...state.avatar, action.Avatar]
		};
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

	if(action.type==='LoadUser'){
		return{
			...state,
			 users: action.Users
		};
	}
	if(action.type==='AddUser'){
		return{
			...state,
			 users:[...state.users, action.Users]
		};
	}

	if(action.type==='EditUser'){
		for(var i = 0;i<state.users.length; i++){
			if(state.users[i].id==action.Users.id)
			state.users[i]=action.Users;
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
		return{
			...state,
			likes:state.likes.filter(x => x.id != DelLike.id)
		};
	}

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
if(action.type=='RemoveDialog'){
	return{
		...state,
		myDialogList:state.myDialogList.filter(x=>x.id!=action.RemoveDialog)
	};
}

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

	if(action.type==='LoadRoles'){
		return{
			...state,
			 roles: action.Role
		};
	}
	if(action.type==='LoadGuests'){
		return{
			...state,
			 guests: action.Guest
		};
	}
	return state;
}

// combineReducers({
// 	Avatar,
//   Dialog,
//   Favorites,
//   Likes,
// 	Messages,
//   Roles,
// 	Users
// })
