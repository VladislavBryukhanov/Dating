import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';
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
    console.log(response);
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
           console.log(result);
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
     // this.props.Store.users.map((user)=>{
       if(this.state.likeBtnName=="Like"){
         this.props.DispatchAddLike(result);
         this.setState({likeBtnName:"Remove like"});
       }
       else if(this.state.likeBtnName=="Remove like"){
         this.props.DispatchDeleteLike(result);
         this.setState({likeBtnName:"Like"});
       }
       // this.props.ownProps.history.push('/HomePage/MyLikes');
      // })


    })
  }

onFavorite(){
  fetch(this.props.Store.Url["FriendList"], {
  method: 'post',
  body:  JSON.stringify({who:this.props.Store.myPage.id, with:this.props.match.params.id}),
  headers: {
  'Content-Type': 'application/json;charset=utf-8'
},
credentials: 'include'//,
//credentials: 'include'
  })
  .then(function(response){
   return(response.json());
  })
  .then(result => {
   // this.props.Store.users.map((user)=>{
     if(this.state.favBtnName=="Favorites"){
       this.props.DispatchAddFavorite(result);
       this.setState({favBtnName:"Remove from favorites"});
     }
     else if(this.state.favBtnName=="Remove from favorites"){
       this.props.DispatchDeleteFavorite(result);
       this.setState({favBtnName:"Favorites"});
     }
     // this.props.ownProps.history.push('/HomePage/Favorites');
   // })
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
        // console.log(result);
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
      // result.data
      var delOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                      x.confirmState=="PrevAva")[0];
      this.props.DispatchDelAvatar(delOldAva);

      var setNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                      x.confirmState=="Waiting")[0];
      // setNewAva=Object.assign({},setNewAva);
      setNewAva.confirmState="Confirmed";
      this.props.DispatchEditAvatar(setNewAva);

       var newPage=this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
       // setNewAva=Object.assign({},newPage);
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
    // result.data

         var delNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                         x.confirmState=="Waiting")[0];
         this.props.DispatchDelAvatar(delNewAva);

         var setOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.props.match.params.id &&
                                                         x.confirmState=="PrevAva")[0];
          if(setOldAva!=undefined){
            // setOldAva=Object.assign({},setOldAva);
            setOldAva.confirmState="Confirmed";
            this.props.DispatchEditAvatar(setOldAva);
          }
          else
            setOldAva=this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];
            this.props.DispatchEditAvatar(setOldAva);

            var newPage=this.props.Store.users.filter(x=>x.id==this.props.match.params.id)[0];
            // newPage=Object.assign({},newPage);
            newPage.avatar=setOldAva;
            this.props.DispatchEditUser(newPage);

            //при изменении (setOldAva.confirmState или newPage.avatar) объект в сторе тоже изменяется на это значение и
            //диспатч DispatchEditAvatar и DispatchEditUser не отработает изменения, а это нарушает логику редакс,
            //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?
  })
}
showUserProfile(){//отображения профиля для юзера
return    this.props.Store.users.map(function(user){
          //userInterface- функции взаимодействия с юзером,
          var userInterface= "";

          //если же страница не наша, то вместо отображения новой аватарки мы отрисует интерфейс взаимодействия с пользователем
          if(user.id!=this.props.Store.myPage.id){
            userInterface=<div>
                            <button onClick={()=>{this.props.msg(this.state.currentDialog)}}>Start chat</button>
                            <button onClick={this.onLike}>{this.state.likeBtnName}</button>
                            <button onClick={this.onFavorite}>{this.state.favBtnName}</button>
                          </div>
          }
          else{
            //если выбранный юзер= наша страница то мы можем просмотреть аватурку, которую отправили на модерацию
                userInterface=<div>
                                  {
                                      this.props.Store.avatar.map(function(ava){
                                        if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                                          return <img height="100px" src={ava.base64}/>
                                        }
                                      }.bind(this))
                                   }
                                   {
                                     this.props.Store.avatar.map(function(ava){
                                       if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                                         return <img height="100px" src={ava.base64}/>
                                       }
                                     }.bind(this))
                                   }
                              </div>
                              // this.props.Store.avatar.map(function(ava){
                              //                   if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                              //                     return <img height="100px" src={ava.base64}/>
                              //                   }
                              //                 }.bind(this))
          }
          var status="offline";
          if(user.online)
              status="online";
          if(user.id==this.props.match.params.id){
            return <td key={user.id}>
                      <img height="100px" src={user.avatar.base64}/>
                      {user.welcome}<br/>
                      {user.name}<br/>
                      {user.birthDay}<br/>
                      {user.gender}<br/>
                      {user.weight}<br/>
                      {user.height}<br/>
                      {user.education}<br/>
                      {status}<br/>
                      <ul>
                      {
                        this.getHobby().map(function(hobby){
                          return hobby;
                        })
                      }
                      </ul>
                      {userInterface}
                      <table>
                        <tr>
                          {
                            this.state.Gallery.map(function(img){
                                  return <td>
                                            <img height="100px" src={img.content}/>
                                         </td>
                            }.bind(this))

                          }
                        </tr>
                     </table>
                   </td>

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
                                  <button onClick={()=>{this.props.msg(this.state.currentDialog)}}>Start chat</button>
                                  <button onClick={this.onLike}>{this.state.likeBtnName}</button>
                                  <button onClick={this.onFavorite}>{this.state.favBtnName}</button>

                                  <button onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile/'+this.props.match.params.id);}}>Edit user</button>
                                  <button onClick={()=>{this.onBanUser(user);}}>{this.state.banBtn}</button>
                              </div>
              //Запрещаем модератору банить и/или редактировать профиль администратора
              else if(user.id!=this.props.Store.myPage.id &&
                (this.props.Store.myPage.roleId==this.getRoleId("Moder") && user.roleId==this.getRoleId("Admin")))
                adminInterface=<div>
                                  <button onClick={()=>{this.props.msg(this.state.currentDialog)}}>Start chat</button>
                                  <button onClick={this.onLike}>{this.state.likeBtnName}</button>
                                  <button onClick={this.onFavorite}>{this.state.favBtnName}</button>
                              </div>


              var status="offline";
              if(user.online)
                  status="online";
              if(user.id==this.props.match.params.id){
                return <td key={user.id}>
                          <img height="100px" src={user.avatar.base64}/>
                          {user.welcome}<br/>
                          {user.name}<br/>
                          {user.birthDay}<br/>
                          {user.gender}<br/>
                          {user.weight}<br/>
                          {user.height}<br/>
                          {user.education}<br/>
                          {status}<br/>
                          <ul>
                          {
                            this.getHobby().map(function(hobby){
                              return hobby;
                            })
                          }
                          </ul>

                          {user.dateOfEdit}<br/>
                          {user.avatar.dateOfChange}<br/>
                          <div>
                                {
                                    this.props.Store.avatar.map(function(ava){
                                      if(ava.confirmState=="PrevAva" && ava.siteUserId==this.props.match.params.id){
                                        return <img height="100px" src={ava.base64}/>
                                      }
                                    }.bind(this))
                                 }
                                {
                                  this.props.Store.avatar.map(function(ava){
                                    if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
                                      return  <div>
                                                  <img height="100px" src={ava.base64}/>
                                                  <button onClick={this.onConfirmAva}>Confirm avatar</button>
                                                  <button onClick={this.onRejectAva}>Reject avatar</button>
                                              </div>
                                    }
                                  }.bind(this))
                                }
                            </div>

                          {adminInterface}
                          <table>
                            <tr>
                              {
                                this.state.Gallery.map(function(img){
                                      return <td>
                                                <img height="100px" src={img.content}/>
                                             </td>
                                }.bind(this))
                              }
                            </tr>
                         </table>


                       </td>
              }
            }.bind(this)
          )
          // {
          //   this.props.Store.avatar.map(function(ava){
          //     if(ava.confirmState=="Waiting" && ava.siteUserId==this.props.match.params.id){
          //       return <div>
          //                   <img height="100px" src={ava.base64}/>
          //                   <button onClick={this.onConfirmAva}>Confirm avatar</button>
          //                   <button onClick={this.onRejectAva}>Reject avatar</button>
          //               </div>
          //     }
          //   }.bind(this))
          // }
}



  render(){
    const cookies = new Cookies();
    var profileForRender;
    if(cookies.get('UserSession').roleId==this.getRoleId("Admin") || cookies.get('UserSession').roleId==this.getRoleId("Moder"))
      profileForRender=this.showAdminProfile();
    else if (cookies.get('UserSession').roleId==this.getRoleId("User"))
      profileForRender=this.showUserProfile();

    return <div>
             <table>
               <tr>
                 {
                    profileForRender
                     // return showAdminProfile()
                     // return this.showUserProfile();
                 }
               </tr>
            </table>
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
