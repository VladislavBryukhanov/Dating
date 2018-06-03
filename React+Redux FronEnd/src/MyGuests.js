import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { getSiteUsers } from './Menu.js';
import {  bindAvatar } from './App.js';
import {getYearOld} from './Profile.js';
import Loading from './Layout/bx_loader.gif';
import {pagingButtons} from './Users.js';
class MyGuests extends  Component{
  constructor(props){
      super(props);
      this.state={
        page:1,
        isLoaded:false
      }
      this.showGuests=this.showGuests.bind(this);
      this.showUsers=this.showUsers.bind(this);
      this.getUsers=this.getUsers.bind(this);
  }

  componentWillMount() {
    this.getUsers(this.state.page);
  }

  getUsers(currentPage) {
    this.setState({isLoaded:false});
    fetch(this.props.Store.Url["GuestsList"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage, {
     credentials: 'include'
    }).then(function(response){
     return(response.json());
    })
    .then(result => {
       this.props.DispathcLoadAvatars(result.avatars);
       var loadUsers=bindAvatar(result.userList, result.avatars);
       this.props.DispatchLoadUsers(loadUsers);
       getSiteUsers.onopen= function (msg) {
       getSiteUsers.send(JSON.stringify(result.id));
       };
       if(getSiteUsers.readyState === getSiteUsers.OPEN)
          getSiteUsers.send(JSON.stringify(result.id));
       this.setState({isLoaded:true});
    });
    this.setState({page:currentPage});
  }

  showUsers(user, guest) {
    var age =  getYearOld(user.birthDay);
    var status="Offline";
    if(user.online)
      status="Online";
    return <div className="User">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p className="userName">{user.name}</p>
                   <p className="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<span className={status}></span></p>
                   <p>{user.city}</p>
                   <p className="colorBlock">Count of visits: <span>{guest.count}</span></p>
                   <p className="colorBlock">Last visit: <span>{guest.lastVisit.split('T')[0]}<br/>
                                         {guest.lastVisit.split('T')[1].split('.')[0]} </span></p>
            </div>
  }

  showGuests(user) {
  return  this.props.Store.guests.map(function(guest){
              if(guest.who === user.id)
                return this.showUsers(user, guest)
              }.bind(this)
          )
  }

  render() {
    if(this.state.isLoaded) {
        return <div>
                     {
                       this.props.Store.users.map(function(user) {
                         if(user.id !== this.props.Store.myPage.id) {
                             return this.showGuests(user)
                           }
                       }.bind(this))
                     }
                     {pagingButtons(this.state.page, this.props.Store.users, this.getUsers)}
               </div>
    }
    else return <div className="Loading"><img src={Loading}/></div>
  }
}
export default connect(
    (state) => ({
      Store: state
    }),
    dispatch => ({
      DispatchLoadUsers:(user)=>{
        dispatch({type:'LoadUser', Users: user});
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      }
    })
)(MyGuests);
