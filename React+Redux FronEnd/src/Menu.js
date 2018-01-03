import React, {Component} from 'react';
import { connect } from 'react-redux';
import {  Route, Router, Switch } from 'react-router-dom';
import Cookies from 'universal-cookie';
// import Menu, {SubMenu, MenuItem} from 'rc-menu';

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

// import "bootstrap/dist/css/bootstrap.min.css";
// import Button from 'react-bootstrap/lib/button';

class MyMenu extends  Component{
  constructor(props){
    super(props);
    this.state={
      dialogList:null,
      dialog:null,
      // onlineCheckSocket: new WebSocket(this.props.Store.Url["AuthSocket"]),
      ShowDialogForm: false
    }
      this.logOut=this.logOut.bind(this);
      this.showDialogForm=this.showDialogForm.bind(this);
      this.loadDialogList=this.loadDialogList.bind(this);
      this.onOpenDialog=this.onOpenDialog.bind(this);

      this.userInterface=this.userInterface.bind(this);
      this.adminInterface=this.adminInterface.bind(this);
      this.unauthorizedInterface=this.unauthorizedInterface.bind(this);
  }


  componentWillMount(){
      console.log("LoadMenu");
      if(this.props.Store.myPage==null){
        // this.props.ownProps.history.push('/');
        // const cookies = new Cookies();
        // if(cookies.get('UserSession')!= undefined)
        // this.SignIn();
      }
      else{
          // this.state.onlineCheckSocket.onopen= function (msg) {
          //   this.state.onlineCheckSocket.send(this.props.Store.myPage.id);
          // }.bind(this);

          //Грузим список наших дилогов в стор
          const cookies = new Cookies();
          if (cookies.get('UserSession').roleId!=this.getRoleId("Banned"))
              this.loadDialogList();
    }
  }

  loadDialogList(){
    fetch(this.props.Store.Url["DialogList"]+"/"+this.props.Store.myPage.id,{credentials: 'include'})//Не безопасно, т к любой юзер сможет читать сообщения подставив эти значения в урл
    .then(function(response){
     return(response.json());
   })
    .then(result => {
      this.props.DispatchLoadDialogList(result);

      var list=this.props.Store.myDialogList.map(function(dialogs){
      var user;
      var otherUserId;
      if(dialogs.firstUserId==this.props.Store.myPage.id)
        otherUserId=dialogs.secondUserId;
      else
        otherUserId=dialogs.firstUserId;
      user=this.props.Store.users.filter(x=>x.id==otherUserId)[0];//[0] потому что такое значение будет только 1 в массиве
      if(user==undefined){
        user={};
        user.avatar={};
        user.avatar.base64=this.props.Store.avatar.filter(x=>x.siteUserId==0)[0].base64;
      }
      return <div onClick={()=>{this.onOpenDialog(dialogs)}}>
                <img height="50px" src={user.avatar.base64}/>
                {user.name}
             </div>
        }.bind(this))
        list= <div>
                  {list}
                  <button onClick={()=>{this.setState({ShowDialogForm:false});
                                        this.setState({dialog:null});
                                        this.setState({dialogList:null});}}>X</button>
              </div>
        this.setState({dialogList: list});
    });
  }

  logOut(){
    const cookies = new Cookies();
    cookies.remove('UserSession');
    this.props.ownProps.history.push('/');
    window.location.reload();
  }

  onOpenDialog(dialog){
    // console.log(id);
    var msg=   <div>
                  <Messages dialog={dialog}/>
                  <button onClick={()=>{this.setState({dialog:null});}}>Back</button>
                  <button onClick={()=>{this.setState({ShowDialogForm:false});
                                        this.setState({dialog:null});
                                        this.setState({dialogList:null})}}>X</button>
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
  unauthorizedInterface(){
    return <App withoutGUI={true}/>
  }
  bannedInterface(){
    return <div>
              <button onClick={this.logOut}>Log Out</button>
              <h1>You was banned!!!</h1>
            </div>
  }
  userInterface(){
    return <div>
             <button bsStyle="link" onClick={this.logOut}>Log Out</button>
             <button bsStyle="link" onClick={()=>{this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                   this.setState({dialog:null});
                                   this.setState({dialogList:null});}}>Messages</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage')}}>Home Page</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/Favorites/')}}>Favorites</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/MyLikes/')}}>Likes</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/MyGuests/')}}>Guests</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/Filter/')}}>Filter</button>

             <img src={this.props.Store.myPage.avatar.base64} height="100px" width="100px"
                  onClick={()=>{this.props.ownProps.history.push('/HomePage/EditProfile');}}/>
             <Switch>
               <Route exact path='/HomePage' component={Users}/>
               <Route path='/HomePage/EditProfile' component={EditProfile}/>
               <Route path='/HomePage/MyGallery' component={MyGallery}/>
               <Route path='/HomePage/Profile/:id' render={(props)=><Profile{...props}msg={this.onOpenDialog}/>}/>

               <Route path='/HomePage/MyGuests' component={MyGuests}/>
               <Route path='/HomePage/MyLikes' component={MyLikes}/>
               <Route path='/HomePage/Favorites' component={MyFavorites}/>
               <Route path='/HomePage/Filter' component={Filter}/>
             </Switch>
             {
                  this.showDialogForm()
             }
          </div>
  }
  adminInterface(){
    return <div>
             <button bsStyle="link" onClick={this.logOut}>Log Out</button>
             <button bsStyle="link" onClick={()=>{this.setState({ShowDialogForm:!this.state.ShowDialogForm});
                                   this.setState({dialog:null});
                                   this.setState({dialogList:null});}}>Dialogs</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage')}}>Home Page</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/MassMessage')}}>Mass Messages</button>
             <button bsStyle="link" onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+this.props.Store.myPage.id)}}>My page</button>

             <Switch>
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
  }


  getRoleId(role){
    return this.props.Store.roles.filter(x=> x.roleName==role)[0].id
  }
  render(){
    if(this.props.Store.myPage==null )//|| this.state.access==null//Если не все данные были загружены или мы не авторизировались, то ожидаем загрузки
        return this.unauthorizedInterface();
        // return <div>waiting...</div>

  const cookies = new Cookies();
  if(cookies.get('UserSession').roleId==this.getRoleId("Admin") || cookies.get('UserSession').roleId==this.getRoleId("Moder"))
    return this.adminInterface();
  else if (cookies.get('UserSession').roleId==this.getRoleId("User"))
    return this.userInterface();
  else if (cookies.get('UserSession').roleId==this.getRoleId("Banned"))
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
      DispatchLoadDialogList:(dl)=>{
        dispatch({type:'LoadDialogList', DialogList: dl});
      }
  })
)(MyMenu);
