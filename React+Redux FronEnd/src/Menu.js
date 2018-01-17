import React, {Component} from 'react';
import { connect } from 'react-redux';
import {  Route, Router, Switch } from 'react-router-dom';
import Cookies from 'universal-cookie';

import App from './App.js';
import EditProfile from './EditProfile';
import MyGallery from './MyGallery';
import Users from './Users';
import Profile from './Profile'
import Messages from './Messages.js'
import MyGuests from './MyGuests.js'
import MyLikes from './MyLikes.js'
import MyFavorites from './MyFavorites.js'
import Filter from './Filter.js'

import AdminList from './AdminList.js'
import MassMessage from './MassMessage.js'

import Logo from './Layout/logo.svg';
import Gift from './Layout/hand-with-gift-box-icon_1978785.svg';
import NewFaces from './Layout/newfaces.png';
import Chat from './Layout/chat.png';
import Birthday from './Layout/birthday.png';
import ChatRoom from './Layout/chat-room.png';
import Exit from './Layout/arrow-button-right-next-green-round.png';
import Trash from './Layout/trash.png';

class MyMenu extends  Component{
  constructor(props){
    super(props);
    this.state={
      dialogList:null,
      dialog:null,
      selectedDialogs: [],
      ShowDialogForm: false
      }
      this.logOut=this.logOut.bind(this);
      this.showDialogForm=this.showDialogForm.bind(this);
      this.loadDialogList=this.loadDialogList.bind(this);
      this.onOpenDialog=this.onOpenDialog.bind(this);
      this.onSelectDialogChanged=this.onSelectDialogChanged.bind(this);
      this.onRemoveDialogs=this.onRemoveDialogs.bind(this);


      this.userInterface=this.userInterface.bind(this);
      this.adminInterface=this.adminInterface.bind(this);
  }

  componentWillReceiveProps(nextProps){//Проверяем был ли обновлен список диалогов, если да то перерисем форму
    if(nextProps.Store.myDialogList.length!=this.props.Store.myDialogList.length
                                      && nextProps.Store.myDialogList!=undefined)
      this.setState({dialogList: null});
  }
  componentDidReceiveProps(){
    if(this.props.Store.myPage!=null &&  this.state.dialogList==null ){
      this.loadDialogList();
    }
  }
  componentWillMount(){
      if(this.props.Store.myPage!=null){
          const cookies = new Cookies();
          if (cookies.get('UserSession').roleid!=this.getroleid("Banned"))
              this.loadDialogList();
    }
  }
  onSelectDialogChanged(e, dialog){
    var newState=this.state.selectedDialogs;
    if(e.target.checked)
      newState[newState.length]=dialog.id;
    else
      newState=newState.filter(x=>x!=dialog);
    this.setState({selectedDialogs: newState})
  }
  loadDialogList(){
   //  fetch(this.props.Store.Url["DialogList"]+"/"+this.props.Store.myPage.id,{credentials: 'include'})//Не безопасно, т к любой юзер сможет читать сообщения подставив эти значения в урл
   //  .then(function(response){
   //   return(response.json());
   // })
   //  .then(result => {
   //    this.props.DispatchLoadDialogList(result);
      console.log(this.props.Store.myDialogList.length);
      var list=this.props.Store.myDialogList.map(function(dialogs){
        var user;
        var otherUserId;
        if(dialogs.firstUserId==this.props.Store.myPage.id)
          otherUserId=dialogs.secondUserId;
        else
          otherUserId=dialogs.firstUserId;
        user=this.props.Store.users.filter(x=>x.id==otherUserId)[0];//[0] потому что такое значение будет только 1 в массиве

        var isOnline="Offline";
        if(user.online)
          isOnline="Online";

        if(user==undefined){
          user={};
          user.avatar={};
          user.avatar.base64=this.props.Store.avatar.filter(x=>x.siteUserId==0)[0].base64;
        }
        return <div class="DialogBody">
                  <input onChange={(e)=>{this.onSelectDialogChanged(e, dialogs)}} type="checkbox"/>
                  <div class="Dialog" onClick={()=>{this.onOpenDialog(dialogs)}}>
                      <img height="50px" src={user.avatar.base64}/>
                      {user.name}
                      <div class={isOnline}></div>
                  </div>
               </div>
        }.bind(this))
        list= <div class="DialogList">
                  <img class="CloseDialogList" src={Exit} onClick={()=>{this.setState({ShowDialogForm:false});
                                        this.setState({dialog:null});
                                        this.setState({dialogList:null});}}/>
                  <img class="RemoveDialogs" src={Trash} onClick={this.onRemoveDialogs}/>
                  <p class="Conversaciones">Conversaciones</p>
                  {list}
              </div>
        this.setState({dialogList: list});
    // });
  }

  logOut(){
    const cookies = new Cookies();
    cookies.remove('UserSession');

    this.props.ownProps.history.push('/');
    window.location.reload();
  }
  onRemoveDialogs(e){
    e.preventDefault();
    console.log(this.state.selectedDialogs);

    if(this.state.selectedDialogs.length!=0){
      fetch(this.props.Store.Url["DialogList"], {
      method: 'delete',
      body:  JSON.stringify(this.state.selectedDialogs),
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
      },
      credentials: 'include'
      })
      .then(function(response){
        return(response.json());
      })
      .then(result => {
        if(result=="Success"){
          this.state.selectedDialogs.map(function(id){
            this.props.DispatchRemoveDialog(id);
          }.bind(this))
        }
        this.setState({selectedDialogs:[]});
      })
    }


  }
  onOpenDialog(dialog){
    var user;
    if(dialog.firstUserId!=this.props.Store.myPage.id)
      user=this.props.Store.users.filter(x=>x.id==dialog.firstUserId)[0];
    else
      user=this.props.Store.users.filter(x=>x.id==dialog.secondUserId)[0];

    var isOnline="Offline";
    if(user.online)
      isOnline="Online";

    var msg=   <div class="DialogList">
                  <img class="CloseDialogList" src={Exit} onClick={()=>{
                                        this.setState({ShowDialogForm:false});
                                        this.setState({dialog:null});
                                        this.setState({dialogList:null});}}/>
                  <img class="RemoveDialogs" src={Trash} onClick={this.onRemoveDialogs}/>
                  <p class="Conversaciones">Conversaciones</p>
                  <div  class="Messages">
                      <div class="DialogBody">
                        <input onChange={(e)=>{this.onSelectDialogChanged(e, dialog)}} type="checkbox"/>
                        <div class="Dialog" onClick={()=>{this.setState({dialog:null});}}>
                            <img height="50px" src={user.avatar.base64}/>
                            {user.name}
                            <div class={isOnline}></div>
                        </div>
                      </div>
                    <Messages dialog={dialog}/>
                  </div>

               </div>
    this.setState({dialog:msg});
    this.setState({ShowDialogForm:true});
  }

  showDialogForm(){
    if(this.state.ShowDialogForm){//Если форма диалога открыта
      if(this.state.dialogList==null && this.state.dialog==null){//Загружаем список людей с которыми мы вели диалог
        this.loadDialogList();
      }
      else if(this.state.dialogList!=null && this.state.dialog==null)//Отображаем список людей с которыми мы вели диалог
        return this.state.dialogList;
      else if( this.state.dialog!=null)// отображаем диалог в выбранной персоной
        return this.state.dialog;
    }
  }
  unauthorisedInterface(){
    const cookies = new Cookies();
    if(cookies.get('UserSession')!=undefined)
      return <App withoutGUI={true}/>
    else
      this.props.ownProps.history.push('/');
  }
  bannedInterface(){
    return <div>
              <button onClick={this.logOut}>Log Out</button>
              <h1>You was banned!!!</h1>
            </div>
  }
  userInterface(){
    var iLike=0;
    var likeMe=0;
    var mutualLike=0;
    var messages=this.props.Store.myDialogList.length;
    for(var i=0; i<this.props.Store.likes.length; i++){
        if(this.props.Store.likes[i].to==this.props.Store.myPage.id){
          for(var j=0; j<this.props.Store.likes.length; j++){
            if(this.props.Store.likes[i].from==this.props.Store.likes[j].to){
                  mutualLike++;
            }
          }
        }
     }

    this.props.Store.likes.map(function(like){
      if(like.to!=this.props.Store.myPage.id)
        iLike++;
      else if(like.to==this.props.Store.myPage.id)
        likeMe++;
      }.bind(this))

    return <div>
             <div class="menu">
                 <img class="logoImg" onClick={()=>{this.props.ownProps.history.push('/HomePage')}} src={Logo}/>
                 <img class="Avatar" src={this.props.Store.myPage.avatar.base64} height="100px" width="100px"
                      onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile');}}/>
                 <div class="subMenu">
                     <p>Configuration</p>
                     <div class="subMenuBody">
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                          this.setState({dialog:null});
                                          this.setState({dialogList:null});}}>Messages</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Favorites/')}}>Favorites</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/All')}}>Likes</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MyGuests/')}}>Guests</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Filter/')}}>Filter</p>
                         <p onClick={this.logOut}>Log Out</p>
                     </div>
                 </div>

             </div>

             <div class="InterfaceBody">
                 <div class="RightNavbar hidden-xs sm-hidden">
                     <div class="FirstBlock">
                         <p class="Title">
                            Earn VIP Membership
                            <img src={Gift}/>
                         </p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile');}}>
                              Add your profile avatar</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile');}}>
                              Complete profile text</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile');}}>
                              Complete social data</p>
                     </div>
                     <div class="SecondBlock">
                         <p>Recommended</p>
                         <p onClick={()=>{this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                          this.setState({dialog:null});
                                          this.setState({dialogList:null});}}>
                                          Conversations
                            <span>{messages}</span>
                         </p>
                         <p  onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/'+"iLike")}}>
                            I like them
                            <span>{iLike}</span>
                         </p>
                         <p  onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/'+"meLike")}}>
                            They like me
                            <span>{likeMe}</span>
                         </p>
                         <p  onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/'+"mutualLike")}}>
                            Mutual Interest
                            <span>{mutualLike}</span>
                         </p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MyGuests/')}}>
                              They visited me
                              <span>{this.props.Store.guests.length}</span>
                         </p>
                     </div>
                     <div class="Search"  onClick={()=>{this.props.ownProps.history.push('/HomePage/Filter/')}}>
                          Search users</div>

                     <div class="ThirdBlock">
                         <p class="Title">
                            New Faces
                            <img src={NewFaces}/>
                         </p>
                         <p>
                            Online Users
                            <img src={Chat}/>
                         </p>
                         <p>
                            Birthday
                            <img src={Birthday}/>
                         </p>
                         <p>
                            Chat Rooms
                            <img src={ChatRoom}/>
                         </p>
                     </div>
                 </div>

                 <div class="Pages">
                   <Switch>
                     <Route exact path='/HomePage' component={Users}/>
                     <Route path='/HomePage/EditProfile' component={EditProfile}/>
                     <Route path='/HomePage/MyGallery' component={MyGallery}/>
                     <Route path='/HomePage/Profile/:id' render={(props)=><Profile{...props}msg={this.onOpenDialog}/>}/>

                     <Route path='/HomePage/MyGuests' component={MyGuests}/>
                     <Route path='/HomePage/MyLikes/:action' render={(props)=><MyLikes{...props}msg={this.onOpenDialog}/>}/>

                     <Route path='/HomePage/Favorites' component={MyFavorites}/>
                     <Route path='/HomePage/Filter' component={Filter}/>
                  </Switch>
                </div>
                {
                     this.showDialogForm()
                }
             </div>

          </div>
  }
  adminInterface(){
    return <div>
             <div class="menu">
                 <img class="logoImg" onClick={()=>{this.props.ownProps.history.push('/HomePage')}} src={Logo}/>
                 <img class="Avatar" src={this.props.Store.myPage.avatar.base64} height="100px" width="100px"
                      onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile/'+this.props.Store.myPage.id);}}/>
                 <div class="subMenu">
                     <p>Configuration</p>
                     <div class="subMenuBody">
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Favorites/')}}>Favorites</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/')}}>Likes</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MyGuests/')}}>Guests</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Filter/')}}>Filter</p>

                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                               this.setState({dialog:null});
                                               this.setState({dialogList:null});}}>Dialogs</p>
                         <p onClick={()=>{this.props.ownProps.history.push('/HomePage/MassMessage')}}>Mass Messages</p>
                         <p onClick={this.logOut}>Log Out</p>
                     </div>
                 </div>
             </div>

             <div class="adminBody">

               <Switch>
                 <Route path='/HomePage/MyGuests' component={MyGuests}/>
                 <Route path='/HomePage/MyLikes' component={MyLikes}/>
                 <Route path='/HomePage/Favorites' component={MyFavorites}/>
                 <Route path='/HomePage/Filter' component={Filter}/>

                 <Route exact path='/HomePage' component={AdminList}/>
                 <Route path='/HomePage/EditProfile/:id' render={(props)=><EditProfile{...props}msg={this.onOpenDialog}/>}/>
                 <Route path='/HomePage/Profile/:id' render={(props)=><Profile{...props}msg={this.onOpenDialog}/>}/>
                 <Route path='/HomePage/MyGallery/:id' render={(props)=><MyGallery{...props}msg={this.onOpenDialog}/>}/>
                 <Route path='/HomePage/MassMessage' component={MassMessage}/>
               </Switch>
               {
                    this.showDialogForm()
               }
             </div>

          </div>
  }


  getroleid(role){
    return this.props.Store.roles.filter(x=> x.roleName==role)[0].id
  }
  render(){
    if(this.props.Store.myPage==null )//Если не все данные были загружены или мы не авторизировались, то ожидаем загрузки
        return this.unauthorisedInterface();
    const cookies = new Cookies();
    if(cookies.get('UserSession').roleid==this.getroleid("Admin") || cookies.get('UserSession').roleid==this.getroleid("Moder"))
      return this.adminInterface();
    else if (cookies.get('UserSession').roleid==this.getroleid("User"))
      return this.userInterface();
    else if (cookies.get('UserSession').roleid==this.getroleid("Banned"))
      return this.bannedInterface();
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    })
    ,
    dispatch => ({
      // DispatchLoadDialogList:(dl)=>{
      //   dispatch({type:'LoadDialogList', DialogList: dl});
      // },
      DispatchRemoveDialog:(dl)=>{
        dispatch({type:"RemoveDialog", RemoveDialog:dl});
      }
  })
)(MyMenu);
