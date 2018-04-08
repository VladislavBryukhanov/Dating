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

import {
 createAction,
 createActions,
 handleActions,
 handleAction,
 combineActions
} from 'redux-actions';



// var serverAddress="10.1.43.122:5908";
// var serverAddress="10.1.22.132:5908";
// var serverAddress="192.168.1.5:5908";
var serverAddress="localhost:59088";
var store;

const initialState={
	Url:{
		"GetUsers":"ws://"+serverAddress+"/Controllers/GetUsers.ashx",

		"GetDialogList":"ws://"+serverAddress+"/Controllers/GetDialogList.ashx",
		"GetLikes":"ws://"+serverAddress+"/Controllers/GetLikes.ashx",
		"GetGuests":"ws://"+serverAddress+"/Controllers/GetGuests.ashx",

		"MessageSocket":"ws://"+serverAddress+"/Controllers/Chat.ashx",
		"AuthSocket":"ws://"+serverAddress+"/Controllers/OnlineStatusChecker.ashx",

		"RegData":"http://"+serverAddress+"/api/GetAllRegistrationData",
		"Roles":"http://"+serverAddress+"/api/Roles",
		"Avatar":"http://"+serverAddress+"/api/Avatars",
		"FriendList":"http://"+serverAddress+"/api/FriendLists",
		"LikeList":"http://"+serverAddress+"/api/LikeLists",
		"GuestsList":"http://"+serverAddress+"/api/GuestLists",
		"DialogList":"http://"+serverAddress+"/api/DialogLists",
		"Messages":"http://"+serverAddress+"/api/Dialogs",
		"Hobby":"http://"+serverAddress+"/api/Hobbies",
		"Authorize":"http://"+serverAddress+"/api/Authentific",
		"Users":"http://"+serverAddress+"/api/SiteUsers",
		"Gallery":"http://"+serverAddress+"/api/Galleries"
	},
	formData:[],
	avatar:[],
	roles:[],
	users:[],
	dialogUsers:[],
	messages:[],
	likes:[],
	favorites:[],
	myDialogList: [],
	guests:[],
	myPage:null
}

	const Edit=(data, actionData)=>{
		for(var i = 0; i<data.length; i++){
			if(data[i].id == actionData.id){
				data[i]=actionData;
			}
			return [...data];
		}
	}

	const Reducer = handleActions({
		LoadFormData: (state, action) => ({
			...state, formData:action.Data
		}),
	  LoadAvatar: (state, action) => ({
	    ...state, avatar:action.Avatar
	  }),
		AddAvatar: (state, action) => ({
			...state, avatar:[...state.avatar, action.Avatar]
		}),
		DelAvatar: (state, action) => ({
			...state, avatar:state.avatar.filter(item => item != action.Avatar)
		}),
		EditAvatar: (state, action) => ({
			...state, avatar:Edit(state.avatar, action.Avatar)
		}),
		LoadUser: (state, action) => ({
			...state, users: action.Users
		}),
		AddUser: (state, action) => ({
			...state, users:[...state.users, action.Users]
		}),
		EditUser: (state, action) => ({
			...state, users:Edit(state.users, action.Users)
		}),
		DelUser: (state, action) => ({
			...state, users:state.users.filter(x => x.id != action.Users.id)
		}),
		LoadDalogUsers: (state, action) => ({
			...state, dialogUsers: action.DUsers
		}),
		AddDalogUsers: (state, action) => ({
			...state, dialogUsers:[...state.users, action.DUsers]
		}),
		DelDalogUsers: (state, action) => ({
			...state, dialogUsers:state.users.filter(x => x.id != action.DUsers.id)
		}),
		MyPage: (state, action) => ({
			...state, myPage:action.Users
		}),
		AddFavorite: (state, action) => ({
			...state, favorites:[...state.favorites, action.Favorites]
		}),
		LoadFavorite: (state, action) => ({
			...state, favorites:action.Favorites
		}),
		DeleteFavorite: (state, action) => ({
			...state, favorites:state.favorites.filter(x => x.id != action.Favorites.id)
		}),
		AddLike: (state, action) => ({
			...state, likes:[...state.likes, action.Likes]
		}),
		LoadLike: (state, action) => ({
			...state, likes:action.Likes
		}),
		DeleteLike: (state, action) => ({
			...state, likes:state.likes.filter(x => x.id != action.Likes.id)
		}),
		AddDialog: (state, action) => ({
			...state, myDialogList:[...state.myDialogList, action.DialogList]
		}),
		LoadDialogList: (state, action) => ({
			...state, myDialogList:action.DialogList
		}),
		RemoveDialog: (state, action) => ({
			...state, myDialogList:state.myDialogList.filter(x=>x.id!=action.RemoveDialog)
		}),
		LoadMessage: (state, action) => ({
			...state, messages: action.Message
		}),
		SendMessage: (state, action) => ({
			...state, messages:[...state.messages, action.Message]
		}),
		LoadRoles: (state, action) => ({
			...state, roles: action.Role
		}),
		LoadGuests: (state, action) => ({
			...state, guests: action.Guest
		}),
	}, initialState);

store  = createStore(Reducer,initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());//создаем стор только после выкачивания данных из бэекенда и закидываем эти данные в стор, это будет его начальный контент

ReactDOM.render(
 <Provider store={store}>
	 <BrowserRouter>
		 <Switch>
				<Route exact path='/' component={App}/>
			  // <Route path='/HomePage' component={Menu}/>
			</Switch>
	 </BrowserRouter>
 </Provider>,
 document.getElementById('root')
);
