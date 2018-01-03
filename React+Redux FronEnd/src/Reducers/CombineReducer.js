import {combineReducers} from 'redux'
import Avatar from './Avatar.js';
import Dialog from './Dialog.js';
import Favorites from './Favorites.js';
import Likes from './Likes.js';
import Messages from './Messages.js';
import Roles from './Roles.js';
import Users from './Users.js';
export default combineReducers({
  Avatar,
  Dialog,
  Favorites,
  Likes,
	Messages,
  Roles,
	Users
})
