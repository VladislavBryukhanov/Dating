import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyLikes extends  Component{
  constructor(props){
    super(props);
    this.showLikes=this.showLikes.bind(this);
    this.showUsers=this.showUsers.bind(this);
  }

  // getLikeList(){
  //   fetch(this.props.Store.Url["LikeList"]+"/"+this.props.Store.myPage.id,{credentials: 'include'})
  //   .then(function(response){
  //    return(response.json());
  //   })
  //   .then(result => {
  //     this.props.DispatchLoadLikeList(result);
  //    })
  // }

  showUsers(user, answer){
    var now = new Date();
    var age;
    age=parseInt(user.birthDay.split('-')[0]);
    age=parseInt(now.getFullYear())-age;
    var isOnline="Offline";
    if(user.online)
      isOnline="Online";
    return <div class="LikeUser">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.ownProps.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p class="userName">{user.name}</p>
                   <p class="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<div class={isOnline}></div></p>
                   <p>{user.city}</p>
                   <p>{answer}</p>
            </div>
  }


  showLikes(user){
    var answer=null;
    var id=[];
    for(var i=0; i<this.props.Store.likes.length; i++){
        if(this.props.Store.likes[i].to==this.props.Store.myPage.id){
          for(var j=0; j<this.props.Store.likes.length; j++){
            if(this.props.Store.likes[i].from==this.props.Store.likes[j].to){

                id[id.length]={ my:this.props.Store.likes[i].id,
                                other:this.props.Store.likes[j].id
                  }
            }
        }
      }
    }

    if(this.props.match.params!="All"){
      if(this.props.match.params.action=="iLike"){
        return this.props.Store.likes.map(function(like){
                  if(like.to!=this.props.Store.myPage.id)
                    if(like.from==user.id || like.to==user.id){
                      answer="I like";
                      return this.showUsers(user, answer)
                    }
                  }.bind(this))
                }
      else if(this.props.match.params.action=="meLike"){
        return  this.props.Store.likes.map(function(like){
                  if(like.to==this.props.Store.myPage.id){
                    if(like.from==user.id || like.to==user.id){
                      answer="Me like";
                      return this.showUsers(user, answer)
                    }
                  }
                }.bind(this))
      }
      else if(this.props.match.params.action=="mutualLike"){
        return  this.props.Store.likes.map(function(like){
                  if(id.filter(x=>x.my == like.id).length>0){
                    if(like.from==user.id || like.to==user.id){
                      answer="Mutual like";
                      return this.showUsers(user, answer)
                    }
                  }
                }.bind(this))
      }
    }


    return  this.props.Store.likes.map(function(like){
                if(id.filter(x=>x.my == like.id).length>0){
                  answer="Mutual like";
                }
                else if(id.filter(x=> x.other==like.id).length>0){
                  return;
                }
                else  if(like.to!=this.props.Store.myPage.id)
                  answer="I like";
                else if(like.to==this.props.Store.myPage.id)
                  answer="Me like";

                if(like.from==user.id || like.to==user.id)
                  return this.showUsers(user, answer)
                }.bind(this)
            )
  }
  render(){
    return <div>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id){
                         return this.showLikes(user)
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
    }),
    dispatch => ({
      DispatchLoadLikeList:(like)=>{
        dispatch({type:'LoadLike', Likes: like});
      }
    })

)(MyLikes);
