import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

class Users extends  Component{
  constructor(props){
    super(props);
    this.state={
      users:Object.assign([],this.props.Store.users)
    }
    this.adminInterface=this.adminInterface.bind(this);
    this.moderInterface=this.moderInterface.bind(this);
    this.getRoleList=this.getRoleList.bind(this);
    this.onEditUserRole=this.onEditUserRole.bind(this);
    this.onRemoveUser=this.onRemoveUser.bind(this);
  }
  onRoleChange(e,user){
    var getUser=this.state.users;
    getUser.filter(x=>x==user)[0].roleid=this.props.Store.roles.filter(x=> x.roleName==e.target.value)[0].id;
    this.setState({users: getUser});
  }
  getRoleList(){
    return this.props.Store.roles.map(function(role){
      return   <option selected value={role.roleName}>{role.roleName}</option>
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
                  <select class="form-control" onChange={(e)=>{this.onRoleChange(e, user);}} value={roleAssoc}>
                      {this.getRoleList()}
                  </select>
                </td>
                <td><button class="btn btn-link" onClick={()=>{this.onEditUserRole(user);}}>Save changes</button></td>
                <td><button class="btn btn-link" onClick={()=>{this.onRemoveUser(user);}}>Delete user</button></td>
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
     this.setState({users: this.props.Store.users});
     })
  }


  render(){
    const cookies = new Cookies();
    return <div>
             <table class="table table-bordered">
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
                     this.state.users.map(function(user){
                     if(cookies.get('UserSession').roleid==this.props.Store.roles.filter(x=> x.roleName=="Admin")[0].id)
                       return this.adminInterface(user);
                     else if (cookies.get('UserSession').roleid==this.props.Store.roles.filter(x=> x.roleName=="Moder")[0].id)
                      return this.moderInterface(user);
                     }.bind(this)
                   )
                 }
              </tbody>
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
      DispatchDelUser:(user)=>{
        dispatch({type:'DelUser', Users: user});
      }

    })
)(Users);
