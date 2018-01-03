import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
// import DefaultAvatar from './Ava.png'
class MyLikes extends  Component{
  constructor(props){
    super(props);
    // this.state={
      // favorites:[]
    // }
    this.showFavorites=this.showFavorites.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }
// componentWillMount(){
// }



  showUsers(user){
    return <td key={user.id}>
                <div>
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p>{user.name+' '+user.genderForSearch}</p>
                   {user.city}
               </div>
           </td>
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
             <table>
               <tr>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id){
                         return this.showFavorites(user)
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
)(MyLikes);
