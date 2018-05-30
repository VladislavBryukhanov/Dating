import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { getSiteUsers } from './Menu.js';
import {  bindAvatar } from './App.js';
import {getYearOld} from './Profile.js';
import Loading from './Layout/bx_loader.gif';
import {pagingButtons} from './Users.js';

class MyLikes extends  Component{
  constructor(props){
    super(props);
    this.state={
      page:1,
      isLoaded:false
    }
    this.showLikes=this.showLikes.bind(this);
    this.showUsers=this.showUsers.bind(this);
    this.getUsers=this.getUsers.bind(this);
  }

  componentWillMount(){
    this.getUsers(this.state.page);
  }

  getUsers(currentPage){
    this.setState({isLoaded:false});
    fetch(this.props.Store.Url["LikeList"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage, {
     credentials: 'include'
   }).then(function(response){
     return(response.json());
   })
   .then(result => {
     this.props.DispathcLoadAvatars(result.avatars);
     var loadUsers=bindAvatar(result.userList, result.avatars);
     this.props.DispatchLoadUsers(loadUsers);
     getSiteUsers.onopen= function (msg) {
     getSiteUsers.send(JSON.stringify(result.id));
     };
     if(getSiteUsers.readyState === getSiteUsers.OPEN)
        getSiteUsers.send(JSON.stringify(result.id));

     this.setState({isLoaded:true});
     });
     this.setState({page:currentPage});
  }

  showUsers(user, answer){
    var age =  getYearOld(user.birthDay);

    var isOnline="Offline";
    if(user.online)
      isOnline="Online";
    return <div className="LikeUser">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p className="userName">{user.name}</p>
                   <p className="userAge">{age} years old</p>
                   <p>{user.genderForSearch}<div className={isOnline}></div></p>
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
    if(this.state.isLoaded){
      return <div>
                   {
                     this.props.Store.users.map(function(user){
                       if(user.id!=this.props.Store.myPage.id){
                           return this.showLikes(user)
                         }
                       }.bind(this)
                     )
                   }
                   {pagingButtons(this.state.page, this.props.Store.users, this.getUsers)}
             </div>
     }
     else return <div className="Loading"><img src={Loading}/></div>
  }
}
export default connect(
    (state) => ({
      Store: state
    }),
    dispatch => ({
      DispatchLoadUsers:(user)=>{
        dispatch({type:'LoadUser', Users: user});
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      }
    })

)(MyLikes);
