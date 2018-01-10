import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyLikes extends  Component{
  constructor(props){
    super(props);
    this.showFavorites=this.showFavorites.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }


  showUsers(user){
    var now = new Date();
    var age;
    age=parseInt(user.birthDay.split('-')[0]);
    age=parseInt(now.getFullYear())-age;
    var isOnline="Offline";
    if(user.online)
      isOnline="Online";
    return <div class="User">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p class="userName">{user.name}</p>
                   <p class="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<div class={isOnline}></div></p>
                   <p>{user.city}</p>
            </div>
  }
  showFavorites(user){
  return  this.props.Store.favorites.map(function(like){
              if(like.with==user.id)
                return this.showUsers(user)
              }.bind(this)
          )
  }
  render(){
    return <div>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id){
                         return this.showFavorites(user)
                       }
                     }.bind(this)
                   )
                 }
           </div>
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    })
)(MyLikes);
