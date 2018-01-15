import React, { Component } from 'react';
import { connect } from 'react-redux';
import Registration from './Registration';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

import Logo from './Layout/logo.svg';

class Users extends Component {

constructor(props) {
    super(props);
    this.state={
     onlineCheckSocket: new WebSocket(this.props.Store.Url["AuthSocket"]),
     getDialogList: new WebSocket(this.props.Store.Url["GetDialogList"]),
     getGuestList: new WebSocket(this.props.Store.Url["GetGuests"]),
     getLikeList: new WebSocket(this.props.Store.Url["GetLikes"]),
     getUsers: new WebSocket(this.props.Store.Url["GetUsers"]),

     // getSiteUsers: new WebSocket(this.props.Store.Url["GetUsers"]),
     email: "",
     password:""
   }
    this.onAddUser=this.onAddUser.bind(this);
    this.getUsers=this.getUsers.bind(this);
    this.onEmailChange=this.onEmailChange.bind(this);
    this.onPasswordChange=this.onPasswordChange.bind(this);
    this.onAuthorisation=this.onAuthorisation.bind(this);
    this.onResetPassword=this.onResetPassword.bind(this);
    this.SignIn=this.SignIn.bind(this);

    // this.getLikeList=this.getLikeList.bind(this);
    this.getFavoritesList=this.getFavoritesList.bind(this);
    // this.getGuestsList=this.getGuestsList.bind(this);

}
// componentWillUnmount(){
//   // this.state.getGuestList.close();
//   this.state.getLikeList.close();
// }
componentWillMount() {
  //грузим список ролей из бд в стор
  // this.getUsers();
  fetch(this.props.Store.Url["Roles"])
  .then(function(response){
    return response.json();
  })
  .then(function(json){
    return(json);
  })
  .then(result => {
    this.props.DispatchLoadRoles(result);
    this.SignIn();
  });
}
// getGuestsList(id){
//   fetch(this.props.Store.Url["GuestsList"]+"/"+id, {credentials: 'include'})
//   .then(function(response){
//    return(response.json());
//   })
//   .then(result => {
//     this.props.DispatchLoadGuests(result);
//    })
// }
getUsers(user){
  // fetch(this.props.Store.Url["Users"])
  // .then(function(response){
  //   return response.json();
  // })
  // .then(function(json){
  //   return(json);
  // })
  // .then(result => {
    this.getFavoritesList(user.id);
    var firstLoad=true;
    var filter={
      id:user.id,
      gender:user.gender,
      genderForSearch:user.genderForSearch,
      ageForSearch: user.ageForSearch,
      cityForSearch: user.cityForSearch
    }

    this.state.getUsers.onopen= function (msg) {
      this.state.getUsers.send(JSON.stringify(filter));
    }.bind(this);
    if(this.state.getUsers.readyState === this.state.getUsers.OPEN)
       this.state.getUsers.send(JSON.stringify(filter));
    this.state.getUsers.onmessage = function (msg) {
          var users=JSON.parse( msg.data );
          for(var i=0;i<users.length;i++){
            var avatarList=this.props.Store.avatar.filter(x=> x.siteUserId== users[i].id);
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
            users[i].avatar=userAvatar;
          }
          // this.SignIn();
          this.props.DispatchLoadUsers(users);

          if(firstLoad){//Если мы в первый раз получили данные, то диспатчим свою страницу и переходим на нее иначе просто обновляем данные в сторе
            this.props.DispatchAuth(users.filter(x=>x.id==filter.id)[0]);
            if(this.props.ownProps.history!=undefined)
                this.props.ownProps.history.push('/HomePage');
            firstLoad=false;
            console.log(firstLoad);
          }

        }.bind(this);


        // fetch(this.props.Store.Url["Users"])
        // .then(function(response){
        //   return response.json();
        // })
        // .then(function(json){
        //   return(json);
        // })
        // .then(result => {
        //   var user=result;
        //   for(var i=0;i<user.length;i++){
        //     var avatarList=this.props.Store.avatar.filter(x=> x.siteUserId== user[i].id);
        //     var userAvatar=null;
        //     if(avatarList.length!=0){//Если было найдено значение
        //         for(var j=0;j<avatarList.length;j++){
        //           if(avatarList[j].confirmState=="Confirmed")
        //               userAvatar=avatarList[j];//.base64;
        //         }
        //         if(userAvatar==null)
        //             userAvatar=this.props.Store.avatar.filter(x=> x.siteUserId == -1)[0];
        //     }
        //     else//Иначе дефолтное значение с айди 0
        //         userAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];//.base64;
        //
        //     user[i].avatar=userAvatar;
        //   }
        //   this.props.DispatchLoadUsers(user);
        //   this.SignIn();
        // });
    // this.openWebSocketConnection(this.state.getUsers, this.props.DispatchLoadUsers, user);
    // var user=result;
    // for(var i=0;i<user.length;i++){
    //   var avatarList=this.props.Store.avatar.filter(x=> x.siteUserId== user[i].id);
    //   var userAvatar=null;
    //   if(avatarList.length!=0){//Если было найдено значение
    //       for(var j=0;j<avatarList.length;j++){
    //         if(avatarList[j].confirmState=="Confirmed")
    //             userAvatar=avatarList[j];//.base64;
    //       }
    //       if(userAvatar==null)
    //           userAvatar=this.props.Store.avatar.filter(x=> x.siteUserId == -1)[0];
    //   }
    //   else//Иначе дефолтное значение с айди 0
    //       userAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];//.base64;
    //
    //   user[i].avatar=userAvatar;
    // }
    // this.SignIn();
    // this.props.DispatchLoadUsers(user);
  // });
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


// getLikeList(id){
//   fetch(this.props.Store.Url["LikeList"]+"/"+id,{credentials: 'include'})
//   .then(function(response){
//    return(response.json());
//   })
//   .then(result => {
//     this.props.DispatchLoadLikeList(result);
//    })
// }
openWebSocketConnection(socket, dispatch, params){
  socket.onopen= function (msg) {
    socket.send(params);
  };
  if(socket.readyState === socket.OPEN)
     socket.send(params);
  socket.onmessage = function (msg) {
    dispatch(JSON.parse( msg.data ));
    // this.state.getGuestList.close();
  };
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
    if(response.status==400){
      return "Email already exist!";
    }
    return(response.json());
  })
  .then(result => {
    if(result=="Email already exist!"){
      alert(result);
      return;
    }
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

   // this.props.Store.users.map((user)=>{
   // if(user.id==result.id){

     // this.props.DispatchAuth(user);
     const cookies = new Cookies();
     var data={sessionId:result.sessionId,roleId: result.roleId,id: result.id};
     cookies.set('UserSession', data, { path: '/',
                                        // httpOnly: true,
                                        maxAge:  60 * 60 * 24 * 30 });
                                        //domain: this.props.Store.Url["Authorize"]
                                        //httpOnly: true
     var user=result;
     delete user.password;
     delete user.sessionId;
     if(user.roleId!=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id){
       // this.getLikeList(user.id);
       // this.getFavoritesList(user.id);
       // this.getGuestsList(user.id);

       this.getUsers(user);
       this.openWebSocketConnection(this.state.onlineCheckSocket, null, user.id );
       this.openWebSocketConnection(this.state.getGuestList, this.props.DispatchLoadGuests, user.id );
       this.openWebSocketConnection(this.state.getLikeList, this.props.DispatchLoadLikeList, user.id );
       this.openWebSocketConnection(this.state.getDialogList, this.props.DispatchLoadDialogList, user.id );



       // var filter={
       //   id:user.id,
       //   gender:user.gender,
       //   genderForSearch:user.genderForSearch,
       //   ageForSearch: user.ageForSearch,
       //   cityForSearch: user.cityForSearch
       // }

       // this.state.getSiteUsers.onopen= function (msg) {
       //   this.state.getSiteUsers.send(JSON.stringify(filter));
       // }.bind(this);
       // this.state.getSiteUsers.onmessage = function (msg) {
       //   console.log(msg.data);
       // }.bind(this);
       // this.state.getSiteUsers.send(JSON.stringify(filter));

        }
        // this.props.ownProps.history.push('/HomePage');
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
    var user=result;
    delete user.password;
    delete user.sessionId;
    // this.props.DispatchAuth(user);
    if(user.roleId!=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id){
      // this.getFavoritesList(user.id);
      // this.getUsers(user);
       // this.getLikeList(user.id);
       // this.getFavoritesList(user.id);
       // this.getGuestsList(user.id);
       this.getUsers(user);
       this.openWebSocketConnection(this.state.onlineCheckSocket, null, user.id );
       this.openWebSocketConnection(this.state.getGuestList, this.props.DispatchLoadGuests, user.id );
       this.openWebSocketConnection(this.state.getLikeList, this.props.DispatchLoadLikeList, user.id );
       this.openWebSocketConnection(this.state.getDialogList, this.props.DispatchLoadDialogList, user.id );


       // var filter={
       //   id:user.id,
       //   gender:user.gender,
       //   genderForSearch:user.genderForSearch,
       //   ageForSearch: user.ageForSearch,
       //   cityForSearch: user.cityForSearch
       // }
       // this.state.getSiteUsers.onopen= function (msg) {
       //   this.state.getSiteUsers.send(JSON.stringify(filter));
       // }.bind(this);
       // this.state.getSiteUsers.onmessage = function (msg) {
       //   console.log(msg.data);
       // }.bind(this);
       // this.state.getSiteUsers.send(JSON.stringify(filter));
     }
     // if(this.props.ownProps.history!=undefined)
     //    this.props.ownProps.history.push('/HomePage');
 })
}
render() {
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
                        <div class="carouselBody">
                          <div class="carouselGallery">
                            {
                              this.props.Store.avatar.map(function(avatar){
                                if(avatar.siteUserId!=0 && avatar.siteUserId!=-1 && avatar.confirmState!="Waiting")//не отображать систмные и не подтвержденные аватарки
                                    return <img height="100px" src={avatar.base64}/>
                              })
                            }
                          </div>
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
      DispatchLoadDialogList:(dl)=>{
        dispatch({type:'LoadDialogList', DialogList: dl});
      },
      DispatchLoadGuests:(guest)=>{
        dispatch({type:"LoadGuests", Guest:guest});
      }
    })
)(Users);
