import React, { Component } from 'react';
import { connect } from 'react-redux';
import Registration from './Registration';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

import Logo from './Layout/logo.svg';
// var Slider = require('react-slick');
// import Slider from 'react-slick';
// import 'can-use-dom';
// import 'enquire.js';
// import 'json2mq';
// import 'slick-carousel';
// import 'string-convert';

class Users extends Component {

constructor(props) {
    super(props);
   this.state={
     onlineCheckSocket: new WebSocket(this.props.Store.Url["AuthSocket"]),
     email: "",
     password:""
   }
    // this.state = {
    // onlineCheckSocket: new WebSocket("ws://localhost:59088/Controllers/OnlineStatusChecker.ashx")
    // };
    this.onAddUser=this.onAddUser.bind(this);
    this.getUsers=this.getUsers.bind(this);
    this.onEmailChange=this.onEmailChange.bind(this);
    this.onPasswordChange=this.onPasswordChange.bind(this);
    this.onAuthorisation=this.onAuthorisation.bind(this);
    this.onResetPassword=this.onResetPassword.bind(this);
    this.SignIn=this.SignIn.bind(this);

    this.getLikeList=this.getLikeList.bind(this);
    this.getFavoritesList=this.getFavoritesList.bind(this);
    this.getGuestsList=this.getGuestsList.bind(this);

}

componentWillMount() {
  //грузим список ролей из бд в стор
  this.getUsers();
  fetch(this.props.Store.Url["Roles"])
  .then(function(response){
    return response.json();
  })
  .then(function(json){
    return(json);
  })
  .then(result => {this.props.DispatchLoadRoles(result);
  });
}
getGuestsList(id){
  fetch(this.props.Store.Url["GuestsList"]+"/"+id, {credentials: 'include'})
  .then(function(response){
   return(response.json());
  })
  .then(result => {
    this.props.DispatchLoadGuests(result);
   })
}
getUsers(){
  fetch(this.props.Store.Url["Users"])
  .then(function(response){
    return response.json();
  })
  .then(function(json){
    return(json);
  })
  .then(result => {
    var user=result;
    for(var i=0;i<user.length;i++){
      var avatarList=this.props.Store.avatar.filter(x=> x.siteUserId== user[i].id);
      var userAvatar=null;
      if(avatarList.length!=0){//Если было найдено значение
          for(var j=0;j<avatarList.length;j++){
            if(avatarList[j].confirmState=="Confirmed")
                userAvatar=avatarList[j];//.base64;
          }
          if(userAvatar==null)
              userAvatar=this.props.Store.avatar.filter(x=> x.siteUserId == -1)[0];
      }
      else//Иначе дефолтное значение с айди 0
          userAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];//.base64;

      user[i].avatar=userAvatar;
    }
    this.props.DispatchLoadUsers(user);
    this.SignIn();
  });
}


getFavoritesList(id){
  fetch(this.props.Store.Url["FriendList"]+"/"+id,{credentials: 'include'})
  .then(function(response){
   return(response.json());
  })
  .then(result => {
    this.props.DispatchLoadFavoritesList(result);
   })
}


getLikeList(id){
  fetch(this.props.Store.Url["LikeList"]+"/"+id,{credentials: 'include'})
  .then(function(response){
   return(response.json());
  })
  .then(result => {
    this.props.DispatchLoadLikeList(result);
   })
}

onEmailChange(e){
  this.setState({email:e.target.value});
}
onPasswordChange(e){
  this.setState({password:e.target.value});
}

onAddUser(user) {
  var data={
    name: user.name,
    birthDay: user.birthDay,
    gender: user.gender,
    city: user.city,
    education: user.education,
    genderForSearch: user.genderForSearch,
    cityForSearch: user.city,
    ageForSearch: user.ageForSearch,
    email:user.email,
    password:user.password,
  };

   fetch(this.props.Store.Url["Users"], {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    }
  }).then(function(response){
    return(response.json());
  })
  .then(result => {
    var userAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId== 0)[0];//set Default avatar
    result.avatar=userAvatar;

    this.props.DispatchNewUser(result);
    this.setState({email:user.email});
    this.setState({password:user.password});
    this.onAuthorisation(null);
  })
}
onAuthorisation(e)
{
  if(e!=null)
    e.preventDefault();
  var loginData={
    email:this.state.email,
    password:this.state.password
  };

  fetch(this.props.Store.Url["Authorize"], {
  method: 'post',
  body:  JSON.stringify(loginData),
  headers: {
  'Content-Type': 'application/json;charset=utf-8'
  },
  credentials: 'include'
  })
  .then(function(response){
    return(response.json());
  })
  .then(result => {
   if(result=="Access denied!"){
     alert("Incorrect username or password")
     return;
   }

   this.props.Store.users.map((user)=>{
   if(user.id==result.id){

     this.props.DispatchAuth(user);
     const cookies = new Cookies();
     var data={sessionId:result.sessionId,roleId: user.roleId,id: user.id};
     cookies.set('UserSession', data, { path: '/',
                                        // httpOnly: true,
                                        maxAge:  60 * 60 * 24 * 30 });
                                        //domain: this.props.Store.Url["Authorize"]
                                        //httpOnly: true
     if(user.roleId!=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id){
       this.getLikeList(user.id);
       this.getFavoritesList(user.id);
       this.getGuestsList(user.id);

       this.state.onlineCheckSocket.onopen= function (msg) {
         this.state.onlineCheckSocket.send(user.id);
       }.bind(this);
       this.state.onlineCheckSocket.send(user.id);
     }
     this.props.ownProps.history.push('/HomePage');
      }
   })
 })
}
onResetPassword(e)
{
  if(e!=null)
    e.preventDefault();

  fetch(this.props.Store.Url["Authorize"], {
  method: 'put',
  body:  JSON.stringify(this.state.email),
  headers: {
  'Content-Type': 'application/json;charset=utf-8'
  },
  credentials: 'include'
  })
  .then(function(response){
    return(response.json());
  })
  .then(result => {
    console.log(result);
  })
}
SignIn()
{
  fetch(this.props.Store.Url["Authorize"], {
  method: 'get',
  headers: {
  'Content-Type': 'application/json;charset=utf-8'
  },
  credentials: 'include'
  })
  .then(function(response){
   return(response.json());
  })
  .then(result => {
    if(result=="Access denied!"){
      return;
    }
   this.props.Store.users.map((user)=>{
   if(user.id==result.id){
     this.props.DispatchAuth(user);
     if(user.roleId!=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id){
       this.getLikeList(user.id);
       this.getFavoritesList(user.id);
       this.getGuestsList(user.id);
       this.state.onlineCheckSocket.onopen= function (msg) {
         this.state.onlineCheckSocket.send(user.id);
       }.bind(this);
       this.state.onlineCheckSocket.send(user.id);
     }
     if(this.props.ownProps.history!=undefined)
        this.props.ownProps.history.push('/HomePage');
     //this.props.ownProps.history.push('/HomePage');
    }
   })
 })
}
render() {
  //if(this.props.match.history.id==undefined)//Если мы в первый раз заходим на сайт, в ином случае этот компонент вызывается из Menu для авторизации по кукам и не требует перерисовки
  //col-md-5 offset-md-7 col-sm-6  offset-xs-6 col-xs-10 offset-xs-2
  // <label>If you already have a Profile</label>
            if(this.props.withoutGUI!=undefined)
              return <h1>Loading...</h1>
            return  <div>
                        <div class="AuthorizePanel">
                            <div class="logo">
                              <img src={Logo}/>
                              <p>Find your ideal partner</p>
                            </div>
                            <div  class="AuthForm">
                                <label>If you already have a Profile</label>
                                <form onSubmit={this.onAuthorisation}>
                                    <input type="text" placeholder="Email" onChange={this.onEmailChange}/>
                                    <input type="password" placeholder="Password" onChange={this.onPasswordChange}/>
                                    <button class="logIn" onChange={()=>{this.onAuthorisation}}>Log in</button>
                                </form>
                                <button class="btn btn-link" onClick={this.onResetPassword}>Forgot password?</button>
                            </div>
                        </div>
                        <div class="registrationBody">
                            <Registration onAddUserSubmit={ this.onAddUser.bind(this)}/>
                        </div>
                        <div class="carouselGallery">
                            {
                              this.props.Store.avatar.map(function(avatar){
                                if(avatar.siteUserId!=0 && avatar.siteUserId!=-1 && avatar.confirmState!="Waiting")//не отображать систмные и не подтвержденные аватарки
                                    return <td key={avatar.id}><img height="100px" src={avatar.base64}/></td>
                              })
                            }
                        </div>
                    </div>
        }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    }),
    dispatch => ({
      DispatchAuth:(user)=>{
        dispatch({type:'MyPage', Users: user});
      },
      DispatchLoadUsers:(user)=>{
      dispatch({type:'LoadUser', Users: user});
      },
      DispatchNewUser:(user)=>{
        dispatch({type:'AddUser', Users: user});
      },
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchLoadLikeList:(like)=>{
        dispatch({type:'LoadLike', Likes: like});
      },
      DispatchLoadFavoritesList:(fav)=>{
        dispatch({type:'LoadFavorite', Favorites: fav});
      },
      DispatchLoadRoles:(role)=>{
        dispatch({type:'LoadRoles', Role: role});
      },
      DispatchLoadGuests:(guest)=>{
        dispatch({type:"LoadGuests", Guest:guest});
      }
    })
)(Users);
