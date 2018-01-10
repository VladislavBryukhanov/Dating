import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Next from './Layout/Next.png';
class MyProfile extends  Component{
constructor(props){
  super(props);
  this.state={
    Gallery:[],
    hobby: {},
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

  }

  componentWillMount() {
    //ПРоверяем есть ли юзер у нас в друзяьх, ставили ли мы ему лайки и в зависимости от этого меняет кнопку на лайкнуть/удалить лайк,
    //добавить в избранное/удалить из избранного
    this.loadHobby();
    this.props.Store.favorites.map(function(favorites){
      if(favorites.who == this.props.Store.myPage.id && favorites.with==this.props.match.params.id)
        this.setState({favBtnName:"Remove from favorites"});
    }.bind(this))

    this.props.Store.likes.map(function(like){
      if(like.from == this.props.Store.myPage.id && like.to==this.props.match.params.id)
        this.setState({likeBtnName:"Remove like"});
    }.bind(this))
    //Записывает нас в список гостей юзера
    if(this.props.Store.myPage.id!=this.props.match.params.id){
      fetch(this.props.Store.Url["GuestsList"], {
          method: 'post',
          body:  JSON.stringify({who:this.props.Store.myPage.id, to:this.props.match.params.id}),
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
            },
            credentials: 'include'
        })
    }
    if(this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0].roleId==this.getRoleId("Banned"))
        this.setState({banBtn:"Reject ban"});
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
        secondUserId:this.props.match.params.id
      }
      this.setState({currentDialog:currentDlg});

      this.getUserGallery();
  }

  loadHobby()
  {
    fetch(this.props.Store.Url["Hobby"]+"/"+this.props.match.params.id)
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      this.setState({hobby:result});
    });
  }
  getHobby(){
    var response=[];
    for(var key in this.state.hobby){
      if(this.state.hobby[key]===true){
        response.push(<li>{key}</li>);
      }
    }
    return response
  }
  getRoleId(role){
    return this.props.Store.roles.filter(x=> x.roleName==role)[0].id
  }

  onBanUser(user)
    {
          if(user.roleId==this.getRoleId("Banned"))
              user.roleId=this.getRoleId("User");
          else
              user.roleId=this.getRoleId("Banned");

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
           if(result.roleId==this.getRoleId("Banned"))
              this.setState({banBtn:"Reject ban"});
           else
              this.setState({banBtn:"Ban user"});
           })
    }
  onLike(){
    fetch(this.props.Store.Url["LikeList"], {
    method: 'post',
    body:  JSON.stringify({from:this.props.Store.myPage.id, to:this.props.match.params.id}),
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    },
    credentials: 'include'
    })
    .then(function(response){
     return(response.json());
    })
    .then(result => {
       if(this.state.likeBtnName=="Like"){
         this.props.DispatchAddLike(result);
         this.setState({likeBtnName:"Remove like"});
       }
       else if(this.state.likeBtnName=="Remove like"){
         this.props.DispatchDeleteLike(result);
         this.setState({likeBtnName:"Like"});
       }
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
        console.log(result);
        this.setState({Gallery:result});
      });
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

       var newPage=this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
       newPage.avatar=setNewAva;
       this.props.DispatchEditUser(newPage);

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

            var newPage=this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
            newPage.avatar=setOldAva;
            this.props.DispatchEditUser(newPage);

            //при изменении (setOldAva.confirmState или newPage.avatar) объект в сторе тоже изменяется на это значение и
            //диспатч DispatchEditAvatar и DispatchEditUser не отработает изменения, а это нарушает логику редакс,
            //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?
  })
}
showUserProfile(){//отображения профиля для юзера
return    this.props.Store.users.map(function(user){
          var userInterface= "";
          if(user.id!=this.props.Store.myPage.id){
            userInterface=<div class="UI">
                            <button class="btn btn-primary" onClick={()=>{this.props.msg(this.state.currentDialog)}}>Send Message</button>
                            <button class="btn btn-success" onClick={this.onLike}>{this.state.likeBtnName}</button>
                            <button class="btn btn-warning" onClick={this.onFavorite}>{this.state.favBtnName}</button>
                          </div>
          }
          else{
                userInterface= <div class="ChangeAva">
                                      {
                                          this.props.Store.avatar.map(function(ava){
                                            if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                                              return  <div>
                                                        <img class="PrevAva" height="90px" src={ava.base64}/>
                                                        <img height="40px" src={Next}/>
                                                      </div>
                                            }
                                          }.bind(this))
                                       }
                                       {
                                        this.props.Store.avatar.map(function(ava){
                                          if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                                            return  <div>
                                                        <img class="NewAva" height="90px" src={ava.base64}/>
                                                    </div>
                                          }
                                        }.bind(this))
                                       }
                                  </div>
          }
          var status="Offline";
          if(user.online)
              status="Online";

          var now = new Date();
          var age;
          age=parseInt(user.birthDay.split('-')[0]);
          age=parseInt(now.getFullYear())-age;
          if(user.id==this.props.match.params.id){
            return <div class="Profile">
                      <div class="BodyLeft">
                        <img class="Ava" height="100px" src={user.avatar.base64}/>
                        {userInterface}
                        <div class="Gallery">
                            {
                              this.state.Gallery.map(function(img){
                                    return <img height="100px" src={img.content}/>
                              }.bind(this))
                            }
                        </div>
                      </div>

                      <div class="BodyRight">
                        <p class="MainData">{user.name}, {age} years old</p>
                        <p>{user.welcome}</p>
                        <p>  <div class={status}></div>{status}</p>

                        <p class="MainData">My hobbies</p>
                        <ul>
                        {
                          this.getHobby().map(function(hobby){
                            return hobby;
                          })
                        }
                        </ul>

                        <p class="MainData">More information about {user.name}</p>
                        <table class="table table-striped">
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
                                <td>Age: {age} years old</td>
                            </tr>
                          </tbody>
                        </table>

                      </div>
                   </div>

          }
        }.bind(this)
      )
}
showAdminProfile(){//отображение профиля для админа

    return    this.props.Store.users.map(function(user){
              var adminInterface="";
              if(user.id!=this.props.Store.myPage.id &&
                ( this.props.Store.myPage.roleId!=this.getRoleId("Moder") || user.roleId!=this.getRoleId("Admin") ))
                adminInterface=<div>
                                  <button class="btn btn-primary" onClick={()=>{this.props.msg(this.state.currentDialog)}}>Start chat</button>
                                  <button class="btn btn-success" onClick={this.onLike}>{this.state.likeBtnName}</button>
                                  <button class="btn btn-warning" onClick={this.onFavorite}>{this.state.favBtnName}</button>
                                  <button class="btn btn-light" onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile/'+this.props.match.params.id);}}>Edit user</button>
                                  <button class="btn btn-danger" onClick={()=>{this.onBanUser(user);}}>{this.state.banBtn}</button>
                              </div>
              //Запрещаем модератору банить и/или редактировать профиль администратора
              else if(user.id!=this.props.Store.myPage.id &&
                (this.props.Store.myPage.roleId==this.getRoleId("Moder") && user.roleId==this.getRoleId("Admin")))
                adminInterface=<div>
                                  <button onClick={()=>{this.props.msg(this.state.currentDialog)}}>Start chat</button>
                                  <button onClick={this.onLike}>{this.state.likeBtnName}</button>
                                  <button onClick={this.onFavorite}>{this.state.favBtnName}</button>
                              </div>


                              var status="Offline";
                              if(user.online)
                                  status="Online";

                              var now = new Date();
                              var age;
                              age=parseInt(user.birthDay.split('-')[0]);
                              age=parseInt(now.getFullYear())-age;
                              if(user.id==this.props.match.params.id){
                                return <div class="Profile">
                                          <div class="BodyLeft">
                                            <img class="Ava" height="100px" src={user.avatar.base64}/>
                                            {adminInterface}
                                            <div class="Gallery">
                                                {
                                                  this.state.Gallery.map(function(img){
                                                        return <img height="100px" src={img.content}/>
                                                  }.bind(this))
                                                }
                                            </div>
                                          </div>


                                          <div class="BodyRight">
                                            <p class="MainData">{user.name}, {age} years old</p>
                                            <p>{user.welcome}</p>
                                            <p>  <div class={status}></div>{status}</p>

                                            <p class="MainData">My hobbies</p>
                                            <ul>
                                            {
                                              this.getHobby().map(function(hobby){
                                                return hobby;
                                              })
                                            }
                                            </ul>

                                            <p class="MainData">More information about {user.name}</p>
                                            <table class="table table-striped">
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
                                                    <td>Age: {age} years old</td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <p>Date of Edit: {user.dateOfEdit.split('T')[0]}</p>
                                            <p>Date of change avatar: {user.avatar.dateOfChange.split('T')[0]}</p>
                                            <div class="ChangeAva">
                                                  {
                                                      this.props.Store.avatar.map(function(ava){
                                                        if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                                                          return  <div>
                                                                    <img class="PrevAva" height="80px" src={ava.base64}/>
                                                                    <img height="40px" src={Next}/>
                                                                  </div>
                                                        }
                                                      }.bind(this))
                                                   }
                                                  {
                                                    this.props.Store.avatar.map(function(ava){
                                                      if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                                                        return  <div>
                                                                    <img class="NewAva" height="80px" src={ava.base64}/>
                                                                    <button class="btn btn-success" onClick={this.onConfirmAva}>Confirm avatar</button>
                                                                    <button class="btn btn-danger" onClick={this.onRejectAva}>Reject avatar</button>
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
    if(cookies.get('UserSession').roleId==this.getRoleId("Admin") || cookies.get('UserSession').roleId==this.getRoleId("Moder"))
      profileForRender=this.showAdminProfile();
    else if (cookies.get('UserSession').roleId==this.getRoleId("User"))
      profileForRender=this.showUserProfile();

    return <div>
                 {
                    profileForRender
                 }
           </div>
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    }),
    dispatch => ({
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchAddLike:(like)=>{
        dispatch({type:'AddLike', Likes: like});
      },
      DispatchAddFavorite:(fav)=>{
        dispatch({type:'AddFavorite', Favorites: fav});
      },
      DispatchDeleteFavorite:(like)=>{
        dispatch({type:'DeleteFavorite', Favorites: like});
      },
      DispatchDeleteLike:(like)=>{
        dispatch({type:'DeleteLike', Likes: like});
      },
      DispatchDelAvatar:(ava)=>{
        dispatch({type:'DelAvatar', Avatar: ava});
      },
      DispatchAddAvatar:(ava)=>{
        dispatch({type:'AddAvatar', Avatar: ava});
      },
      DispatchEditAvatar:(ava)=>{
        dispatch({type:'EditAvatar', Avatar: ava});
      }
    })
)(MyProfile);
