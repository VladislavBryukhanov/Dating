import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';
import {  bindAvatar } from './App.js'
import {pagingButtons} from './Users.js';
import Loading from './Layout/bx_loader.gif';

class Users extends  Component{
  constructor(props){
    super(props);
    this.state={
      page:1,
      isLoaded:false,
      users:this.props.Store.users
    }
    this.adminInterface=this.adminInterface.bind(this);
    this.moderInterface=this.moderInterface.bind(this);
    this.getRoleList=this.getRoleList.bind(this);
    this.onEditUserRole=this.onEditUserRole.bind(this);
    this.onRemoveUser=this.onRemoveUser.bind(this);
    this.getUsers=this.getUsers.bind(this);
  }
  componentWillMount(){
    this.getUsers(this.state.page);
  }
  getUsers(currentPage){
    this.setState({isLoaded:false});
    fetch(this.props.Store.Url["Users"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage)
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      return(json);
    })
    .then(result => {
      this.props.DispathcLoadAvatars(result.avatars);
      var loadUsers=bindAvatar(result.userList, this.props.Store.avatar);
      this.props.DispatchLoadUsers(loadUsers);
      this.setState({isLoaded:true});

      // getSiteUsers.onopen= function (msg) {
      // getSiteUsers.send(JSON.stringify(result.id));
      // };
      // if(getSiteUsers.readyState === getSiteUsers.OPEN)
      //    getSiteUsers.send(JSON.stringify(result.id));
      // this.setState({isLoaded:true});
    })
    this.setState({page:currentPage});
  }
  onRoleChange(e,user){
    // this.setState({users: this.props.Store.users});
    // var getUser=this.state.users;
    var getUser=this.props.Store.users;
    getUser.filter(x=>x==user)[0].roleid=this.props.Store.roles.filter(x=> x.roleName==e.target.value)[0].id;
    this.setState({users: getUser});
  }
  getRoleList(){
    return this.props.Store.roles.map(function(role){
      return   <option defaultValue={role.roleName}>{role.roleName}</option>
      })
  }
  adminInterface(user){
    var roleAssoc=this.props.Store.roles.filter(x=> x.id==user.roleid)[0].roleName;
    return <tr>
                <td>
                   <img width="50px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   {user.name}
                </td>
                <td>
                  <select className="form-control" onChange={(e)=>{this.onRoleChange(e, user);}} defaultValue={roleAssoc}>
                      {this.getRoleList()}
                  </select>
                </td>
                <td><button className="btn btn-link" onClick={()=>{this.onEditUserRole(user);}}>Save changes</button></td>
                <td><button className="btn btn-link" onClick={()=>{this.onRemoveUser(user);}}>Delete user</button></td>
           </tr>
  }
  moderInterface(user){
    var roleAssoc=this.props.Store.roles.filter(x=> x.id==user.roleid)[0].roleName;
    return <tr key={user.id}>
                <td>
                   <img width="50px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   {user.name}
                </td>
                <td>{roleAssoc}</td>
           </tr>
  }
  onEditUserRole(user)
  {
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
         })
  }
  onRemoveUser(user){
    fetch(this.props.Store.Url["Users"], {
     method: 'delete',
     body: JSON.stringify(user.id),
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
     },
     credentials: 'include'
    }).then(function(response){
     return(response.json());
    })
   .then(result => {
     this.props.DispatchDelUser(user);
     // this.setState({users: this.props.Store.users});
     })
  }

   render(){
     if(this.state.isLoaded){
    const cookies = new Cookies();
    return <div>
             <table className="table table-bordered">
               <thead>
                  <tr>
                    <th>User</th>
                    <th>User role</th>
                    <th>Save change</th>
                    <th>Delete user</th>
                  </tr>
                </thead>
                <tbody>
                 {
                     this.props.Store.users.map(function(user){
                     if(cookies.get('UserSession').roleid==this.props.Store.roles.filter(x=> x.roleName=="Admin")[0].id &&
                        user.id!=this.props.Store.myPage.id)
                       return this.adminInterface(user);
                     else if (cookies.get('UserSession').roleid==this.props.Store.roles.filter(x=> x.roleName=="Moder")[0].id &&
                              user.id!=this.props.Store.myPage.id)
                      return this.moderInterface(user);
                     }.bind(this)
                   )
                 }
              </tbody>
            </table>
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
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchDelUser:(user)=>{
        dispatch({type:'DelUser', Users: user});
      },
      DispatchLoadUsers:(user)=>{
        dispatch({type:'LoadUser', Users: user});
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      }

    })
)(Users);
