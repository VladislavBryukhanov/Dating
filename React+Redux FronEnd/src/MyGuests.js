import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyGuests extends  Component{
  constructor(props){
    super(props);
    this.state={
      guests:[]
    }
    this.getGuestsList=this.getGuestsList.bind(this);
    this.showGuests=this.showGuests.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }
componentWillMount(){
  this.getGuestsList();
}

  getGuestsList(){
    fetch(this.props.Store.Url["GuestsList"]+"/"+this.props.Store.myPage.id, {credentials: 'include'})
    .then(function(response){
     return(response.json());
    })
    .then(result => {
      this.setState({guests:result});
     })
  }

  showUsers(user, guest){
    return <td key={user.id}>
                <div>
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p>{user.name+' '+user.genderForSearch}</p>
                   {user.city}<br/>
                   Count of visit: {guest.count}<br/>
                   Last visit: {guest.lastVisit}<br/>
               </div>
           </td>
  }
  showGuests(user){
  return  this.state.guests.map(function(guest){
              if(guest.who==user.id)
                return this.showUsers(user, guest)
              }.bind(this)
          )
  }
  render(){
    return <div>
             <table>
               <tr>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id){
                         return this.showGuests(user)
                       }
                     }.bind(this)
                   )
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
    })
)(MyGuests);
