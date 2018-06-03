import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Next from './Layout/Next.png';
import {  bindAvatar } from './App.js';
import Loading from './Layout/bx_loader.gif';
import {OpenPhoto} from './OpenPhoto.js';
import { getLikeList } from './Menu.js';
import { getGuestList } from './Menu.js';

class MyProfile extends  Component{
constructor(props){
  super(props);
  this.state={
    openImg:"",
    currentUser:null,
    Gallery:[],
    hobby: [],
    currentDialog:null,
    likeBtnName: "Like",//Имена кнопок избранное и лайков
    favBtnName: "Favorites",
    banBtn:"Ban user"
  }

  this.showAdminProfile=this.showAdminProfile.bind(this);
  this.showUserProfile=this.showUserProfile.bind(this);
  this.onLike=this.onLike.bind(this);
  this.onFavorite=this.onFavorite.bind(this);
  this.getUserGallery=this.getUserGallery.bind(this);
  this.onRejectAva=this.onRejectAva.bind(this);
  this.onConfirmAva=this.onConfirmAva.bind(this);
  this.loadHobby=this.loadHobby.bind(this);
  this.getHobby=this.getHobby.bind(this);
  this.getUser=this.getUser.bind(this);
  this.onViewPhoto=this.onViewPhoto.bind(this);
  this.onClocsePhotoView=this.onClocsePhotoView.bind(this);
  }

  componentWillMount() {
    this.getUser(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
      if(this.props.match.params.id !== nextProps.match.params.id) { // this.state.currentUser.id
          this.getUser(nextProps.match.params.id);
      }
  }

  getUser(id) {
    //ПРоверяем есть ли юзер у нас в друзяьх, ставили ли мы ему лайки и в зависимости от этого меняет кнопку на лайкнуть/удалить лайк,
    //добавить в избранное/удалить из избранного
    this.loadHobby();

    fetch(this.props.Store.Url["Users"]+"/"+id,)
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      var user=[];
      var avatar=result.avatar;
      user.push(result.siteUser);
      user=bindAvatar(user, avatar);
      this.setState({currentUser:user[0]});
      this.loadAllUserData(user[0]);
    })
  }

  loadAllUserData(loadUsers) {
      this.props.Store.favorites.map(function(favorites){
        if(favorites.who == this.props.Store.myPage.id && favorites.with==this.props.match.params.id)
          this.setState({favBtnName:"Remove from favorites"});
      }.bind(this))

      this.props.Store.likes.map(function(like){
        if(like.from == this.props.Store.myPage.id && like.to==this.props.match.params.id)
          this.setState({likeBtnName:"Remove like"});
      }.bind(this))

      this.newVisit();
      if(loadUsers.roleid==this.getroleid("Banned")) {
          this.setState({banBtn:"Reject ban"});
      }
      //находит диалог с этим пользователем или создает новый
      //Получаем из списка всех наших диалогов только тот, который проводился между нашим и этим пользователем
      var currentDlg=this.props.Store.myDialogList.filter(x => x.firstUserId==this.props.Store.myPage.id &&
                                                                  x.secondUserId==this.props.match.params.id ||
                                                                  x.secondUserId==this.props.Store.myPage.id &&
                                                                  x.firstUserId==this.props.match.params.id )[0];
      if(currentDlg==undefined)
        currentDlg={
          id:-1,
          firstUserId:this.props.Store.myPage.id,
          secondUserId:parseInt(this.props.match.params.id)
        }
        this.setState({currentDialog:currentDlg});
        this.getUserGallery();
  }

  loadHobby() {
    fetch(this.props.Store.Url["Hobby"]+"/"+this.props.match.params.id)
    .then(function(response){
      if(response.status==404)//Если у пользователя пустая галлерея
        return [];
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      this.setState({hobby:result});
    });
  }

  getHobby() {
    var response=[];
    this.state.hobby.map((hobby)=>{
      response.push(<li key={hobby.id}>{hobby.name}</li>);
    })
    return response
  }

  getroleid(role) {
    return this.props.Store.roles.filter(x=> x.roleName==role)[0].id
  }

  newVisit() {
    var guest = JSON.stringify({who:this.props.Store.myPage.id, to:this.props.match.params.id});
    getGuestList.send(guest);
  }

  onLike() {
    var like = JSON.stringify({from:this.props.Store.myPage.id, to:this.props.match.params.id});
    getLikeList.send(like);

    if(this.state.likeBtnName == "Like"){
      this.setState({likeBtnName:"Remove like"});
    }
    else if(this.state.likeBtnName=="Remove like"){
      this.setState({likeBtnName:"Like"});
    }
  }

  onBanUser(user)
    {
        if(user.roleid==this.getroleid("Banned"))
            user.roleid=this.getroleid("User");
        else
            user.roleid=this.getroleid("Banned");
        fetch(this.props.Store.Url["Users"], {
         method: 'put',
         body: JSON.stringify(user),
         headers: {
         'Content-Type': 'application/json;charset=utf-8'
         },
         credentials: 'include'
        }).then(function(response){
         return(response.json());
        })
       .then(result => {
         this.props.DispatchEditUser(user);
         if(result.roleid==this.getroleid("Banned"))
            this.setState({banBtn:"Reject ban"});
         else
            this.setState({banBtn:"Ban user"});
         })
    }

  onFavorite(){
    fetch(this.props.Store.Url["FriendList"], {
    method: 'post',
    body:  JSON.stringify({who:this.props.Store.myPage.id, with:this.props.match.params.id}),
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    credentials: 'include'
    })
    .then(function(response){
      return(response.json());
    })
    .then(result => {
       if(this.state.favBtnName=="Favorites"){
         this.props.DispatchAddFavorite(result);
         this.setState({favBtnName:"Remove from favorites"});
       }
       else if(this.state.favBtnName=="Remove from favorites"){
         this.props.DispatchDeleteFavorite(result);
         this.setState({favBtnName:"Favorites"});
       }
    })
  }

  getUserGallery(){
    fetch(this.props.Store.Url["Gallery"]+"/"+this.props.match.params.id, {
        method: 'get',
        headers: {
        'Content-Type': 'application/json;charset=utf-8'
        }})
        .then(function(response){
          if(response.status==404)//Если у пользователя пустая галлерея
            return [];
          return response.json();
        })
        .then(function(json){
          return(json);
        })
        .then(result => {
          this.setState({Gallery:result});
        });
  }

  onViewPhoto(content){
    var OpenPhotoForm=<OpenPhoto image={content} forClose={this.onClocsePhotoView}/>
    this.setState({openImg:OpenPhotoForm});
  }

  onClocsePhotoView(){
    this.setState({openImg:""});
  }

  onConfirmAva(){
      fetch(this.props.Store.Url["Avatar"], {
       method: 'put',
       body: JSON.stringify(this.props.match.params.id),
       headers: {
       'Content-Type': 'application/json;charset=utf-8'
       },
       credentials: 'include'
      }).then(function(response){
       return(response.json());
      })
      .then(result => {
        var delOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                        x.confirmState=="PrevAva")[0];
        this.props.DispatchDelAvatar(delOldAva);

        var setNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                        x.confirmState=="Waiting")[0];
        setNewAva.confirmState="Confirmed";
        this.props.DispatchEditAvatar(setNewAva);

         var newPage=this.state.currentUser;//this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
         newPage.avatar=setNewAva;
         this.props.DispatchEditUser(newPage);

         if(this.props.match.params.id==this.props.Store.myPage.id)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
              this.props.DispatchMyPage(newPage);
         //при изменении (setNewAva.confirmState или newPage.avatar) объект в сторе тоже изменяется на это значение и
         //диспатч DispatchEditAvatar и DispatchEditUser не отработает изменения, а это нарушает логику редакс,
         //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?
      })
  }
  onRejectAva(){
    fetch(this.props.Store.Url["Avatar"], {
     method: 'delete',
     body: JSON.stringify(this.props.match.params.id),
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
     },
     credentials: 'include'
    }).then(function(response){
     return(response.json());
    })
    .then(result => {
           var delNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                           x.confirmState=="Waiting")[0];
           this.props.DispatchDelAvatar(delNewAva);

           var setOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                           x.confirmState=="PrevAva")[0];
            if(setOldAva!=undefined){
              setOldAva.confirmState="Confirmed";
              this.props.DispatchEditAvatar(setOldAva);
            }
            else
              setOldAva=this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];
              this.props.DispatchEditAvatar(setOldAva);

              var newPage=this.state.currentUser;//this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
              newPage.avatar=setOldAva;
              this.props.DispatchEditUser(newPage);

              if(this.props.match.params.id==this.props.Store.myPage.id)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
                   this.props.DispatchMyPage(newPage);
              //при изменении (setOldAva.confirmState или newPage.avatar) объект в сторе тоже изменяется на это значение и
              //диспатч DispatchEditAvatar и DispatchEditUser не отработает изменения, а это нарушает логику редакс,
              //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?
    })
  }

  showUserProfile(){//отображения профиля для юзера
    var userMap=[this.state.currentUser];
  return    userMap.map(function(user){
    if(user.id==this.props.match.params.id){
          var userInterface= "";
          if(user.id!=this.props.Store.myPage.id){
            userInterface=<div className="UI">
                            <button className="btn btn-primary" onClick={()=>{this.props.msg(this.state.currentDialog, this.state.currentUser)}}>Send Message</button>
                            <button className="btn btn-success" onClick={this.onLike}>{this.state.likeBtnName}</button>
                            <button className="btn btn-warning" onClick={this.onFavorite}>{this.state.favBtnName}</button>
                          </div>
          }
          else{
                userInterface = <div className="ChangeAva">
              {
                  this.props.Store.avatar.map(function(ava){
                    if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                      return  <div>
                                <img className="PrevAva" height="90px" src={ava.base64}/>
                                <img height="40px" src={Next}/>
                              </div>
                    }
                  }.bind(this))
               }
               {
                this.props.Store.avatar.map(function(ava){
                  if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                    return  <div>
                                <img className="NewAva" height="90px" src={ava.base64}/>
                            </div>
                  }
                }.bind(this))
               }
          </div>
          }
          var status="Offline";
          if(user.online)
              status="Online";
          var age =  getYearOld(user.birthDay);
          return <div className="Profile">
                    {this.state.openImg}
                    <div className="BodyLeft">
                      <img className="Ava" height="100px" src={user.avatar.base64}/>
                      {userInterface}
                      <div className="Gallery">
                          {
                            this.state.Gallery.map(function(img){
                                  return <img onClick={()=>{this.onViewPhoto(img.content)}} height="100px" src={img.content}/>
                            }.bind(this))
                          }
                      </div>
                    </div>
                    <div className="BodyRight">
                      <p className="MainData">{user.name}, {age} years old</p>
                      <p>{user.welcome}</p>
                      <p>  <span className={status}></span>{status}</p>
                      <p className="MainData">My hobbies</p>
                      <ul>
                      {
                        this.getHobby().map(function(hobby){
                          return hobby;
                        })
                      }
                      </ul>
                      <p className="MainData">More information about {user.name}</p>
                      <table className="table table-striped">
                        <tbody>
                          <tr>
                              <td>Gender: {user.gender}</td>
                              <td>Education: {user.education}</td>
                          </tr>
                          <tr>
                              <td>Weight: {user.weight}</td>
                              <td>Height: {user.height}</td>
                          </tr>
                          <tr>
                              <td>City: {user.city}</td>
                              <td>Birthday: {user.birthDay.split('T')[0]}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                 </div>
            }
          }.bind(this)
        )
  }

  showAdminProfile(){
  var userMap=[this.state.currentUser];
  return    userMap.map(function(user){
        if(user.id==this.props.match.params.id){
            var adminInterface="";
            if(user.id!=this.props.Store.myPage.id &&
            ( this.props.Store.myPage.roleid!=this.getroleid("Moder") || user.roleid!=this.getroleid("Admin") ))
              adminInterface=<div>
                                <button className="btn btn-primary" onClick={()=>{this.props.msg(this.state.currentDialog, this.state.currentUser)}}>Start chat</button>
                                <button className="btn btn-success" onClick={this.onLike}>{this.state.likeBtnName}</button>
                                <button className="btn btn-warning" onClick={this.onFavorite}>{this.state.favBtnName}</button>
                                <button className="btn btn-light" onClick={()=>{this.props.history.push('/HomePage/EditProfile/'+this.props.match.params.id);}}>Edit user</button>
                                <button className="btn btn-danger" onClick={()=>{this.onBanUser(user);}}>{this.state.banBtn}</button>
                            </div>
            //Запрещаем модератору банить и/или редактировать профиль администратора
            else if(user.id!=this.props.Store.myPage.id &&
            (this.props.Store.myPage.roleid==this.getroleid("Moder") && user.roleid==this.getroleid("Admin")))
              adminInterface=<div>
                                <button onClick={()=>{this.props.msg(this.state.currentDialog, this.state.currentUser)}}>Start chat</button>
                                <button onClick={this.onLike}>{this.state.likeBtnName}</button>
                                <button onClick={this.onFavorite}>{this.state.favBtnName}</button>
                            </div>
            var dateOfAvaChange="None";
            if(user.avatar.dateOfChange!=undefined)
              dateOfAvaChange=user.avatar.dateOfChange.split('T')[0]
            var status="Offline";
            if(user.online)
              status="Online";
            var age =  getYearOld(user.birthDay);
            // age=parseInt(user.birthDay.split('-')[0]);
            // age=parseInt(now.getFullYear())-age;
            return <div key={user.id} className="Profile">
                      <div className="BodyLeft">
                        <img className="Ava" height="100px" src={user.avatar.base64}/>
                        {adminInterface}
                        <div className="Gallery">
                            {
                              this.state.Gallery.map(function(img){
                                    return <img key={img.id} height="100px" src={img.content}/>
                              }.bind(this))
                            }
                        </div>
                      </div>
                      <div className="BodyRight">
                        <p className="MainData">{user.name}, {age} years old</p>
                        <p>{user.welcome}</p>
                        <p>  <span className={status}></span>{status}</p>
                        <p className="MainData">My hobbies</p>
                        <ul>
                        {
                          this.getHobby().map(function(hobby){
                            return hobby;
                          })
                        }
                        </ul>
                        <p className="MainData">More information about {user.name}</p>
                        <table className="table table-striped">
                          <tbody>
                            <tr>
                                <td>Gender: {user.gender}</td>
                                <td>Education: {user.education}</td>
                            </tr>
                            <tr>
                                <td>Weight: {user.weight}</td>
                                <td>Height: {user.height}</td>
                            </tr>
                            <tr>
                                <td>City: {user.city}</td>
                                <td>Birthday: {user.birthDay.split('T')[0]}</td>
                            </tr>
                            <tr>
                                <td>Date of Edit:</td>
                                <td>{user.dateOfEdit.split('T')[0]}</td>
                            </tr>
                            <tr>
                                <td>Date of change avatar:</td>
                                <td>{dateOfAvaChange}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="ChangeAva">
                              {
                                  this.props.Store.avatar.map(function(ava){
                                    if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                                      return  <div>
                                                <img className="PrevAva" height="80px" src={ava.base64}/>
                                                <img height="40px" src={Next}/>
                                              </div>
                                    }
                                  }.bind(this))
                               }
                               {
                                  this.props.Store.avatar.map(function(ava){
                                    if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                                      return  <div>
                                                  <img className="NewAva" height="80px" src={ava.base64}/>
                                                  <button className="btn btn-success" onClick={this.onConfirmAva}>Confirm avatar</button>
                                                  <button className="btn btn-danger" onClick={this.onRejectAva}>Reject avatar</button>
                                              </div>
                                    }
                                  }.bind(this))
                               }
                          </div>
                      </div>
                   </div>
                   }
              }.bind(this)
            )
  }

  render(){
    const cookies = new Cookies();
    var profileForRender;
    if(!this.state.currentUser){
      return <div className="Loading"><img src={Loading}/></div>
    }
    if(cookies.get('UserSession').roleid==this.getroleid("Admin") || cookies.get('UserSession').roleid==this.getroleid("Moder"))
      profileForRender=this.showAdminProfile();
    else if (cookies.get('UserSession').roleid==this.getroleid("User"))
      profileForRender=this.showUserProfile();

    return <div>
                 {profileForRender}
           </div>
  }
}

function getYearOld(birthDay){
  var now = new Date();
  var birth = new Date(birthDay.split('-')[0],birthDay.split('-')[1]-1,birthDay.split('-')[2].split('T')[0] );
  // var birth = new Date(user.birthDay.split('-')[0]).toDateString("yyyy-MM-dd");
  var year=now.getFullYear()-birth.getFullYear();
  var month=now.getMonth()-birth.getMonth();
  var day=now.getDate()-birth.getDate();
  if(day<=0)
    month--;
  if(month<0)
    year--;
  return parseInt(year);
}
export {getYearOld}
export default connect(
    (state) => ({
      Store: state
    }),
    dispatch => ({
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchAddFavorite:(fav)=>{
        dispatch({type:'AddFavorite', Favorites: fav});
      },
      DispatchDeleteFavorite:(like)=>{
        dispatch({type:'DeleteFavorite', Favorites: like});
      },
      DispatchDelAvatar:(ava)=>{
        dispatch({type:'DelAvatar', Avatar: ava});
      },
      DispatchAddAvatar:(ava)=>{
        dispatch({type:'AddAvatar', Avatar: ava});
      },
      DispatchEditAvatar:(ava)=>{
        dispatch({type:'EditAvatar', Avatar: ava});
      },
      DispatchMyPage:(user)=>{
        dispatch({type:'MyPage', Users: user});
      }
    })
)(MyProfile);
