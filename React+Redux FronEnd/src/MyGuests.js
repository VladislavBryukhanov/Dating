import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyGuests extends  Component{
  constructor(props){
    super(props);
    this.state={
      // guests:[]
    }
    // this.getGuestsList=this.getGuestsList.bind(this);
    this.showGuests=this.showGuests.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }
// componentWillMount(){
//   this.getGuestsList();
// }

  // getGuestsList(){
  //   fetch(this.props.Store.Url["GuestsList"]+"/"+this.props.Store.myPage.id, {credentials: 'include'})
  //   .then(function(response){
  //    return(response.json());
  //   })
  //   .then(result => {
  //     this.setState({guests:result});
  //    })
  // }

  showUsers(user, guest){
    var now = new Date();
    var age;
    age=parseInt(user.birthDay.split('-')[0]);
    age=parseInt(now.getFullYear())-age;

    var isOnline="Offline";
    if(user.online)
      isOnline="Online";
    return <div class="GuestUser">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p class="userName">{user.name}</p>
                   <p class="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<div class={isOnline}></div></p>
                   <p>{user.city}</p>
                   <p>Count of visit: <span>{guest.count}</span></p>
                   <p>Last visit: <span>{guest.lastVisit.split('T')[0]}<br/>
                                         {guest.lastVisit.split('T')[1].split('.')[0]} </span></p>
            </div>
  }
  showGuests(user){
  return  this.props.Store.guests.map(function(guest){
              if(guest.who==user.id)
                return this.showUsers(user, guest)
              }.bind(this)
          )
  }
  render(){
    return <div>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id){
                         return this.showGuests(user)
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
)(MyGuests);
