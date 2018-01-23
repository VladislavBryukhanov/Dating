import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import {  bindAvatar } from './App.js';
import { getSiteUsers } from './Menu.js';
import {getYearOld} from './Profile.js';
import Loading from './Layout/bx_loader.gif';
import {pagingButtons} from './Users.js';
class MyLikes extends  Component{
  constructor(props){
    super(props);
    this.state={
      page:1,
      isLoaded:false
    }
    this.showUsers=this.showUsers.bind(this);
    this.getUsers=this.getUsers.bind(this);
  }

    componentWillMount(){
      // var favorites=this.props.Store.favorites;
      // var id=[];
      // favorites.map((favorite)=>{
      //   id.push(favorite.with);
      // });
      // if(id.length!=0){
      //   var filter={
      //     id:this.props.Store.myPage.id,
      //     getUsersWithId:id,
      //     page: 1
      //   }
      //   getSiteUsers.send(JSON.stringify(filter));
      // }
        this.getUsers(this.state.page);
    }
    getUsers(currentPage){
      fetch(this.props.Store.Url["FriendList"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage, {
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
  showUsers(user){
    var age =  getYearOld(user.birthDay);

    var isOnline="Offline";
    if(user.online)
      isOnline="Online";

    return <div className="User">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p className="userName">{user.name}</p>
                   <p className="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<div className={isOnline}></div></p>
                   <p>{user.city}</p>
            </div>
  }

  render(){
    if(this.state.isLoaded){
        return <div>
                     {
                       this.props.Store.users.map(function(user){
                         if(user.id!=this.props.Store.myPage.id){
                             return this.showUsers(user)
                           }
                         }.bind(this)
                       )
                     }
                     {pagingButtons(this.state.page, this.props.Store.users, this.getUsers)}
               </div>
     }
     else return <div className="Loading"><img src={Loading}/></div>
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    }),
    dispatch => ({
      DispatchLoadUsers:(user)=>{
        dispatch({type:'LoadUser', Users: user});
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      }
    })
)(MyLikes);
