import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyLikes extends  Component{
  constructor(props){
    super(props);
    // this.state={
      // mutualLikes:[]
    // }
    // this.getLikeList=this.getLikeList.bind(this);
    this.showLikes=this.showLikes.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }

  getLikeList(){
    fetch(this.props.Store.Url["LikeList"]+"/"+this.props.Store.myPage.id,{credentials: 'include'})
    .then(function(response){
     return(response.json());
    })
    .then(result => {
      this.props.DispatchLoadLikeList(result);
     })
  }

// componentWillMount(){
// }



  showUsers(user, answer){
    return <td key={user.id}>
                <div>
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p>{user.name+' '+user.genderForSearch}</p>
                   {user.city}<br/>
                   {answer}
               </div>
           </td>
  }
  showLikes(user){
    var id=[];

    for(var i=0; i<this.props.Store.likes.length; i++){
        if(this.props.Store.likes[i].to==this.props.Store.myPage.id){
          for(var j=0; j<this.props.Store.likes.length; j++){
            if(this.props.Store.likes[i].from==this.props.Store.likes[j].to){

                id[id.length]={ my:this.props.Store.likes[i].id,
                                other:this.props.Store.likes[j].id
                  }
                 // console.log(this.props.Store.likes[i].id+" "+this.props.Store.likes[j].id);
                 // console.log(this.props.Store.likes[i].from+" "+this.props.Store.likes[j].to);

            }
        }
      }
    }

console.log(id);

    return  this.props.Store.likes.map(function(like){
                var answer;

                if(id.filter(x=>x.my == like.id).length>0){
                  answer="Взаимный лайк";
                }
                else if(id.filter(x=> x.other==like.id).length>0){
                  return;
                }
                else  if(like.to!=this.props.Store.myPage.id)
                  answer="Я лайкнул";
                else if(like.to==this.props.Store.myPage.id)
                  answer="Меня лайкнули";

                if(like.from==user.id || like.to==user.id)
                  return this.showUsers(user, answer)
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
                         return this.showLikes(user)
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
    }),
    dispatch => ({
      DispatchLoadLikeList:(like)=>{
        dispatch({type:'LoadLike', Likes: like});
      }
    })

)(MyLikes);
