import React, { Component } from 'react';
import { connect } from 'react-redux';
import Registration from './Registration';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Avatar from './Ava.jpg';
import Clock from './Clock.jpg';
import Logo from './Layout/logo.svg';
import Loading from './Layout/bx_loader.gif';

class Auth extends Component {

constructor(props) {
    super(props);
    this.state={
      isAvatarsLoaded:false,
      isDataLoaded:false,
      cookieAccess: "Waiting",
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
    this.getFavoritesList=this.getFavoritesList.bind(this);
}
componentWillMount() {
  fetch(this.props.Store.Url["Avatar"])
	.then(function(response){
		return response.json();
	})
	.then(function(json){
		return(json);
	})
  .then(result => {
    this.props.DispathcLoadAvatars(result);
    this.setState({isAvatarsLoaded:true});
  })

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

  fetch(this.props.Store.Url["RegData"])
  .then(function(response){
    return response.json();
  })
  .then(function(json){
    return(json);
  })
  .then(result => {
    this.props.DispathcLoadFormData(result);
    this.setState({isDataLoaded:true});
  });
}

getUsers(user){
  this.getFavoritesList(user.id);

  fetch(this.props.Store.Url["Users"]+"/"+user.id)//"/?id="+user.id+"&page="+1)
  .then(function(response){
    return response.json();
  })
  .then(function(json){
    return(json);
  })
  .then(result => {
    var user=[result.siteUser];
    var ava=result.avatar;

    user=bindAvatar(user, ava);
    this.props.DispatchAuth(user[0]);
    if(ava[0]!=null)
      this.props.DispathcLoadAvatars(ava);
    this.props.DispatchLoadUsers(user);
    if(this.props.history!=undefined)
      this.props.history.push('/HomePage');
  })
}

getFavoritesList(id){
  fetch(this.props.Store.Url["FriendList"]+"/?id="+id+"&page="+1,{credentials: 'include'})
  .then(function(response){
   return(response.json());
  })
  .then(result => {
    this.props.DispatchLoadFavoritesList(result.fullFavoriteList);
   })
}

onEmailChange(e){
  this.setState({email:e.target.value});
}
onPasswordChange(e){
  this.setState({password:e.target.value});
}

onAddUser(user) {
  console.log(user);
  var data={
    name: user.name,
    birthDay: user.birthDay,
    gender: user.gender,
    city: user.city,
    education: user.education,
    typeForSearch: user.genderForSearch,
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

     const cookies = new Cookies();
     var data={sessionId:result.sessionId,roleid: result.roleid,id: result.id};
     cookies.set('UserSession', data, { path: '/',
                                        // httpOnly: true,
                                        maxAge:  60 * 60 * 24 * 30 });
                                        //domain: this.props.Store.Url["Authorize"]
                                        //httpOnly: true
     var user=result;
     delete user.password;
     delete user.sessionId;
     this.getUsers(user);
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
    console.log(result);
    if(result=="Access denied!"){
      this.setState({cookieAccess: "Denied"});
      return;
    }
    var user=result;
    delete user.password;
    delete user.sessionId;
    if(user.roleid!=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id){
       this.getUsers(user);
     }
 })
}
render() {
  if(this.state.isAvatarsLoaded && this.state.isDataLoaded){//this.props.Store.avatar.length>0){
            if(this.props.withoutGUI && this.state.cookieAccess!="Denied"){
              this.SignIn();
              return <div className="Loading"><img src={Loading}/></div>
            }
            return  <div>
                        <div className="AuthorizePanel">
                            <div className="logo">
                              <img src={Logo}/>
                              <p>Find your ideal partner</p>
                            </div>
                            <div  className="AuthForm">
                                <label>If you already have a Profile</label>
                                <form onSubmit={this.onAuthorisation}>
                                    <input type="text" placeholder="Email" onChange={this.onEmailChange}/>
                                    <input type="password" placeholder="Password" onChange={this.onPasswordChange}/>
                                    <button className="logIn" onChange={()=>{this.onAuthorisation}}>Log in</button>
                                </form>
                                <button className="btn btn-link" onClick={this.onResetPassword}>Forgot password?</button>
                            </div>
                        </div>
                        <div className="registrationBody">
                            <Registration onAddUserSubmit={ this.onAddUser.bind(this)}/>
                        </div>
                        <div className="carouselBody">
                          <div className="carouselGallery">
                            {
                              this.props.Store.avatar.map(function(avatar){
                                if(avatar.id!="Clock" && avatar.id!="None" && avatar.confirmState!="Waiting")//не отображать систмные и не подтвержденные аватарки
                                    return <img key={avatar.id} height="100px" src={avatar.base64}/>
                              })
                            }
                          </div>
                        </div>
                    </div>
      }
      else return <div className="Loading"><img src={Loading}/></div>
  }
}

function  bindAvatar(users, propAva){
  var Waiting={base64:Clock, id:"Clock"};
  var None={base64:Avatar, id:"None"};

   for(var i=0;i<users.length;i++){
      if(propAva[i]==null){
          propAva[i]=None;
          users[i].avatar=propAva[i];
      }
    }
    for(var i=0;i<users.length;i++){
      var avatarList=propAva.filter(x=> x.siteUserId== users[i].id);
      var userAvatar=null;
      if(avatarList.length!=0){//Если было найдено значение
          for(var j=0;j<avatarList.length;j++){
            if(avatarList[j].confirmState=="Confirmed")
                userAvatar=avatarList[j];//.base64;
          }
          if(userAvatar==null)
            userAvatar=Waiting;
      }
      else//Иначе дефолтное значение с айди 0
        userAvatar=None;
      users[i].avatar=userAvatar;

  }
  return users;
}

export default connect(
    (state) => ({
      Store: state
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
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      },
      DispathcLoadFormData:(data)=>{
        dispatch({type:"LoadFormData", Data: data})
      }
    })
)(Auth);

export {bindAvatar};
