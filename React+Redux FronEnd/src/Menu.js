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
import EditHobbies from './EditHobbies.js'
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
import Loading from './Layout/bx_loader.gif';
import {  bindAvatar } from './App.js'
import SplitterLayout from 'react-splitter-layout';


var onlineCheckSocket;
var getDialogList;
var getGuestList;
var getLikeList;
var getSiteUsers;
var getDialogUsers;

class MyMenu extends  Component{
  constructor(props){
    super(props);
    this.state={
      isDataLoaded:false,
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
      this.loadAllData=this.loadAllData.bind(this);
      this.loadAllDialogUser=this.loadAllDialogUser.bind(this);
      this.updateDialogListWebSocket=this.updateDialogListWebSocket.bind(this);

      this.userInterface=this.userInterface.bind(this);
      this.adminInterface=this.adminInterface.bind(this);

      onlineCheckSocket= new WebSocket(this.props.Store.Url["AuthSocket"]);
      getDialogList= new WebSocket(this.props.Store.Url["GetDialogList"]);
      getGuestList= new WebSocket(this.props.Store.Url["GetGuests"]);
      getLikeList= new WebSocket(this.props.Store.Url["GetLikes"]);
      getSiteUsers= new WebSocket(this.props.Store.Url["GetUsers"]);
      getDialogUsers= new WebSocket(this.props.Store.Url["GetUsers"]);
  }

  componentWillReceiveProps(nextProps){//Проверяем был ли обновлен список диалогов, если да то перерисем форму
    if(nextProps.Store.myDialogList.length!=this.props.Store.myDialogList.length
                                      && nextProps.Store.myDialogList!=undefined)
      this.setState({dialogList: null});
  }

  loadAllDialogUser(){
    fetch(this.props.Store.Url["DialogList"]+"/"+this.props.Store.myPage.id, {
    credentials: 'include'
    })
    .then(function(response){
      return(response.json());
    })
    .then(result => {
      var dialogUsers=bindAvatar(result.userList, result.avatars);
      this.props.DispatchLoadDialogUsers(dialogUsers);
      this.loadDialogList();

      getDialogUsers.onopen= function (msg) {
      getDialogUsers.send(JSON.stringify(result.id));
      };
      if(getDialogUsers.readyState === getDialogUsers.OPEN)
         getDialogUsers.send(JSON.stringify(result.id));

      getDialogUsers.onmessage = function (msg) {
        var users=JSON.parse( msg.data );
         if(users.length==this.props.Store.dialogUsers.length){//Если в стор прогрузились все новые автарки, то привяжем их и задиспатчим новых юзеров
           var update=[];
           this.props.Store.dialogUsers.map((user)=>{
             user.online=users.filter(x=>x.id==user.id)[0].online;
             update.push(user);
           })
           this.props.DispatchLoadDialogUsers(update);
           this.loadDialogList();
         }
       }.bind(this);
    })
  }
  loadAllData(){
    this.updateUsers(this.props.Store.myPage);
    this.openWebSocketConnection(onlineCheckSocket, null, this.props.Store.myPage.id );
    this.updateDialogListWebSocket();
    // this.openWebSocketConnection(getGuestList, this.props.DispatchLoadGuests, this.props.Store.myPage.id );
    // this.openWebSocketConnectionForLike(getLikeList, this.props.DispatchLoadLikeList, this.props.Store.myPage.id );
    this.getGuests();
    this.getLikes();
    this.setState({isDataLoaded:true});
  }

  getLikes(){
    fetch(this.props.Store.Url["LikeList"] + "/" + this.props.Store.myPage.id,
    {credentials: 'include'})
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      this.props.DispatchLoadLikeList(result);
      this.openWebSocketConnectionForLike(getLikeList, this.props.DispatchAddLike, this.props.DispatchDeleteLike, this.props.Store.myPage.id );
    });
  }

  openWebSocketConnectionForLike(socket, dispatchAdd, dispatchRemove, params){
    socket.onopen = function (msg) {
      socket.send(params);
    };
    if(socket.readyState === socket.OPEN) {
      socket.send(params);
    }
    socket.onmessage = function (msg) {
      let data = JSON.parse( msg.data );
       if(data.action === "Add"){
         dispatchAdd(data.like);
       }
       else if(data.action === "Remove"){
         dispatchRemove(data.like);
       }
    };
  }

  getGuests(){
    fetch(this.props.Store.Url["GuestsList"] + "/" + this.props.Store.myPage.id,
    {credentials: 'include'})
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      this.props.DispatchLoadGuests(result);
      this.openWebSocketConnectionForGuest(getGuestList, this.props.DispatchAddGuest, this.props.DispatchEditGuest, this.props.Store.myPage.id );
    });
  }

  openWebSocketConnectionForGuest(socket, dispatchAdd, dispatchEdit, params){
    socket.onopen = function (msg) {
      socket.send(params);
    };
    if(socket.readyState === socket.OPEN) {
      socket.send(params);
    }
    socket.onmessage = function (msg) {
      let data = JSON.parse( msg.data );
      if(this.props.Store.guests.filter(item => item.id != data.id).length < this.props.Store.guests.length) {
        dispatchEdit(data);
      } else {
        dispatchAdd(data);
      }

    }.bind(this);
  }

  updateDialogListWebSocket(){
    getDialogList.onopen= function (msg) {
      getDialogList.send(this.props.Store.myPage.id );
    }.bind(this);
    if(getDialogList.readyState === getDialogList.OPEN)
       getDialogList.send(this.props.Store.myPage.id );
    getDialogList.onmessage = function (msg) {
        this.props.DispatchLoadDialogList(JSON.parse( msg.data ));

        getDialogUsers.close();
        this.loadAllDialogUser();
    }.bind(this);
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
      var list=this.props.Store.myDialogList.map(function(dialogs){
        var user;
        var otherUserId;
        if(dialogs.firstUserId==this.props.Store.myPage.id)
          otherUserId=dialogs.secondUserId;
        else
          otherUserId=dialogs.firstUserId;
        user=this.props.Store.dialogUsers.filter(x=>x.id==otherUserId)[0];//[0] потому что такое значение будет только 1 в массиве

        if(user==undefined)//Еслиюзер еще не успел задиспатчиться в стор
          return <div className="Loading"><img src={Loading}/></div>

        let status="Offline";
        if(user.online)
          status="Online";

        return <div key={dialogs.id} className="DialogBody">
                  <input onChange={(e)=>{this.onSelectDialogChanged(e, dialogs)}} type="checkbox"/>
                  <img height="50px" src={user.avatar.base64}
                          onClick={()=>{
                            // this.setState({profile:user});
                            this.props.history.push('/HomePage/Profile/'+user.id);}}/>
                  <div className="Dialog" onClick={()=>{this.onOpenDialog(dialogs)}}>
                      <span>{user.name}</span>
                      <span className={status}></span>
                  </div>
               </div>
        }.bind(this))
        list= <div className="DialogList">
                  <img className="CloseDialogList" src={Exit} onClick={()=>{
                                        // this.setState({ShowDialogForm:false});
                                        // this.setState({dialog:null});
                                        this.setState({ShowDialogForm:false, dialog:null, dialogList:null});}}/>
                  <img className="RemoveDialogs" src={Trash} onClick={this.onRemoveDialogs}/>
                  <p className="Conversaciones">Conversaciones</p>
                  {list}
              </div>
        this.setState({dialogList: list});  //Недосягаемый код ?
  }

  updateUsers(){
    var idForSelect=[];
    this.props.Store.users.map((user)=>{
      idForSelect.push(user.id);
    })
    getSiteUsers.onopen= function (msg) {
    getSiteUsers.send(JSON.stringify(idForSelect));
    };

    if(getSiteUsers.readyState === getSiteUsers.OPEN)
       getSiteUsers.send(JSON.stringify(idForSelect));

    getSiteUsers.onmessage = function (msg) {
      var users=JSON.parse( msg.data );
       if(users.length==this.props.Store.avatar.length){//Если в стор прогрузились все новые автарки, то привяжем их и задиспатчим новых юзеров
         users=bindAvatar(users, this.props.Store.avatar);
         this.props.DispatchLoadUsers(users);
       }
     }.bind(this);
  }

  openWebSocketConnection(socket, dispatch, params){
    socket.onopen= function (msg) {
      socket.send(params);
    };
    if(socket.readyState === socket.OPEN)
       socket.send(params);
    socket.onmessage = function (msg) {
      dispatch(JSON.parse( msg.data ));
    };
  }

  logOut(){
    const cookies = new Cookies();
    cookies.remove('UserSession');

    onlineCheckSocket.close();
    getDialogList.close();
    getGuestList.close();
    getLikeList.close();
    getSiteUsers.close();
    getDialogUsers.close();

    this.forceUpdate();
    // this.props.history.push('/');
  }
  onRemoveDialogs(e){
    e.preventDefault();

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

  onOpenDialog(dialog, user){
    if(user==null){
      if(dialog.firstUserId!=this.props.Store.myPage.id)
        user=this.props.Store.dialogUsers.filter(x=>x.id==dialog.firstUserId)[0];
      else
        user=this.props.Store.dialogUsers.filter(x=>x.id==dialog.secondUserId)[0];
    }

    var status="Offline";
    if(user.online)
      status="Online";

    var msg=   <div className="DialogList">
                  <img className="CloseDialogList" src={Exit} onClick={()=>{
                                        // this.setState({ShowDialogForm:false});
                                        // this.setState({dialog:null});
                                        this.setState({ShowDialogForm:false, dialog:null, dialogList:null});}}/>
                  <img className="RemoveDialogs" src={Trash} onClick={this.onRemoveDialogs}/>
                  <p className="Conversaciones">Conversaciones</p>
                  <div  className="Messages">
                      <div className="DialogBody">
                        <input onChange={(e)=>{this.onSelectDialogChanged(e, dialog)}} type="checkbox"/>
                        <div className="Dialog" onClick={()=>{this.setState({dialog:null});}}>
                            <img height="50px" src={user.avatar.base64}/>
                            {user.name}
                            <span className={status}></span>
                        </div>
                      </div>
                    <Messages dialog={dialog} user={user}/>
                  </div>
               </div>
    // this.setState({dialog:msg});
    this.setState({dialog:msg, ShowDialogForm:true});
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
    if(cookies.get('UserSession'))
      return <App withoutGUI={true}/>
    else {
      this.props.history.push('/');
      return false;
    }
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
             <div className="menu">
                 <img className="logoImg" onClick={()=>{this.props.history.push('/HomePage')}} src={Logo}/>
                 <img className="Avatar" src={this.props.Store.myPage.avatar.base64} height="100px" width="100px"
                      onClick={()=>{this.props.history.push('/HomePage/EditProfile');}}/>
                 <div className="subMenu">
                     <p>Configuration</p>
                     <div className="subMenuBody">
                         <p onClick={()=>{this.props.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{
                                          // this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                          // this.setState({dialog:null});
                                          this.setState({ShowDialogForm:!this.state.ShowDialogForm,
                                            dialog:null, dialogList:null});}}>Messages</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/Favorites/')}}>Favorites</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MyLikes/All')}}>Likes</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MyGuests/')}}>Guests</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/Filter/')}}>Filter</p>
                         <p onClick={this.logOut}>Log Out</p>
                     </div>
                 </div>

             </div>

             <div className="InterfaceBody">
                 <div className="RightNavbar hidden-xs sm-hidden">
                     <div className="FirstBlock">
                         <p className="Title">
                            Earn VIP Membership
                            <img src={Gift}/>
                         </p>
                         <p onClick={()=>{this.props.history.push('/HomePage/EditProfile');}}>
                              Add your profile avatar</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/EditProfile');}}>
                              Complete profile text</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/EditProfile');}}>
                              Complete social data</p>
                     </div>
                     <div className="SecondBlock">
                         <p>Recommended</p>
                         <p onClick={()=>{
                                          // this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                          // this.setState({dialog:null});
                                          this.setState({ShowDialogForm:!this.state.ShowDialogForm,
                                             dialog:null, dialogList:null});}}>
                                          Conversations
                            <span>{messages}</span>
                         </p>
                         <p  onClick={()=>{this.props.history.push('/HomePage/MyLikes/'+"iLike")}}>
                            I like them
                            <span>{iLike}</span>
                         </p>
                         <p  onClick={()=>{this.props.history.push('/HomePage/MyLikes/'+"meLike")}}>
                            They like me
                            <span>{likeMe}</span>
                         </p>
                         <p  onClick={()=>{this.props.history.push('/HomePage/MyLikes/'+"mutualLike")}}>
                            Mutual Interest
                            <span>{mutualLike}</span>
                         </p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MyGuests/')}}>
                              They visited me
                              <span>{this.props.Store.guests.length}</span>
                         </p>
                     </div>

                     <div className="Search"  onClick={()=>{this.props.history.push('/HomePage/Filter/')}}>
                          Search users</div>

                     <div className="ThirdBlock">
                         <p className="Title">
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

                 <div className="Pages">
                   <Switch>
                     <Route exact path='/HomePage' component={Users}/>
                     <Route path='/HomePage/EditProfile' component={EditProfile}/>
                     <Route path='/HomePage/MyGallery' component={MyGallery}/>
                     <Route path='/HomePage/Profile/:id' render={(props)=><Profile{...props}msg={this.onOpenDialog} />}/>

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
             <div className="menu">
                 <img className="logoImg" onClick={()=>{this.props.history.push('/HomePage')}} src={Logo}/>
                 <img className="Avatar" src={this.props.Store.myPage.avatar.base64} height="100px" width="100px"
                      onClick={()=>{this.props.history.push('/HomePage/EditProfile/'+this.props.Store.myPage.id);}}/>
                 <div className="subMenu">
                     <p>Configuration</p>
                     <div className="subMenuBody">
                         <p onClick={()=>{this.props.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/Favorites/')}}>Favorites</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MyLikes/')}}>Likes</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MyGuests/')}}>Guests</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/Filter/')}}>Filter</p>

                         <p onClick={()=>{this.props.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</p>
                         <p onClick={()=>{
                                               // this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                               // this.setState({dialog:null});
                                               this.setState({ShowDialogForm:!this.state.ShowDialogForm,
                                                 dialog:null, dialogList:null});}}>Dialogs</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/MassMessage')}}>Mass Messages</p>
                         <p onClick={()=>{this.props.history.push('/HomePage/EditHobbyList')}}>Edit hobbies</p>
                         <p onClick={this.logOut}>Log Out</p>
                     </div>
                 </div>
             </div>

             <div className="adminBody">

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
                 <Route path='/HomePage/EditHobbyList' component={EditHobbies}/>
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
    if(!this.props.Store.myPage)//Если не все данные были загружены или мы не авторизировались, то ожидаем загрузки
        return this.unauthorisedInterface();
    else if(!this.state.isDataLoaded && this.props.Store.users.length!=0){
      this.loadAllData();
      return <div className="Loading"><img src={Loading}/></div>
    }

    const cookies = new Cookies();
    if(!cookies.get('UserSession')) {
        return this.unauthorisedInterface();
    }
    if(cookies.get('UserSession').roleid==this.getroleid("Admin") || cookies.get('UserSession').roleid==this.getroleid("Moder"))
      return this.adminInterface();
    else if (cookies.get('UserSession').roleid==this.getroleid("User"))
      return this.userInterface();
    else if (cookies.get('UserSession').roleid==this.getroleid("Banned"))
      return this.bannedInterface();
  }
}
export default connect(
    (state) => ({
      Store: state
    }),
    dispatch => ({
      DispatchRemoveDialog:(dl)=>{
        dispatch({type:"RemoveDialog", RemoveDialog:dl});
      },
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
      DispatchLoadDialogUsers:(users)=>{
        dispatch({type:"LoadDalogUsers", DUsers: users})
      },
      DispatchDeleteLike:(like)=>{
        dispatch({type:'DeleteLike', Likes: like});
      },
      DispatchAddLike:(like)=>{
        dispatch({type:'AddLike', Likes: like});
      },
      DispatchAddGuest:(like)=>{
        dispatch({type:'AddGuest', Guest: like});
      },
      DispatchEditGuest:(like)=>{
        dispatch({type:'EditGuest', Guest: like});
      }
  })
)(MyMenu);
export { getSiteUsers, getLikeList, getGuestList };
