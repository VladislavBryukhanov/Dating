import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import {  bindAvatar } from './App.js';
import { getSiteUsers } from './Menu.js';
import {getYearOld} from './Profile.js';
import Loading from './Layout/bx_loader.gif';
import Left from './Layout/slider_left.png';
import Right from './Layout/slider_right.png';

class Users extends  Component{
  constructor(props){
    super(props);
    this.state={
      page: 1,
      isLoaded: false,
      imgCount: []
    }
    this.showUsers=this.showUsers.bind(this);
    this.getGalleryCount=this.getGalleryCount.bind(this);
    this.getUsers=this.getUsers.bind(this);
  }

  componentWillMount(){
    this.getUsers(this.state.page);
  }

  getUsers(currentPage){
      let path;
      if(this.props.Store.myPage.nameFilter){
        path=this.props.Store.Url["Users"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage+
            "&name="+this.props.Store.myPage.nameFilter+"&isOnline="+this.props.Store.myPage.onlineFilter;
      }
      else
        path=this.props.Store.Url["Users"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage;

      fetch(path)
      .then(function(response){
        return response.json();
      })
      .then(function(json){
        return(json);
      })
      .then(result => {
        this.props.DispathcLoadAvatars(result.avatars);
        let loadUsers=bindAvatar(result.userList, this.props.Store.avatar);
        this.props.DispatchLoadUsers(loadUsers);

        getSiteUsers.onopen= function (msg) {
        getSiteUsers.send(JSON.stringify(result.id));
        };
        if(getSiteUsers.readyState === getSiteUsers.OPEN)
           getSiteUsers.send(JSON.stringify(result.id));

        // this.setState({isLoaded:true});
        this.setState({page:currentPage, isLoaded:true});
      })
      this.getGalleryCount();
  }

  getGalleryCount(){
    fetch(this.props.Store.Url["Gallery"], {
          method: 'get',
          headers: {
          'Content-Type': 'application/json;charset=utf-8'
          }})
          .then(function(response){
            return response.json();
          })
          .then(function(json){
            return(json);
          })
          .then(result => {
            this.setState({imgCount:result});
          });
  }

  showUsers(user){
    let count=0;
    if(this.state.imgCount.length!=0){
        count=this.state.imgCount.filter(x=>x.id==user.id)[0];
        if(count!=undefined)//Если в галлерее не было найдено изображений значит их 0
          count=count.count;
        else
          count=0;
    }

    let age =  getYearOld(user.birthDay);

    let status="Offline";
    if(user.online)
      status="Online";
    return <div key={user.id} className="User"
                onClick={()=>{this.props.history.push('/HomePage/Profile/'+user.id);}}>
                   <img height="100px" src={user.avatar.base64}/>
                   <p className="userName">{user.name}</p>
                   <p className="userAge">{age} years old</p>
                   <p>{user.typeForSearch}<span className={status}></span></p>
                   <p className="colorBlock">{user.city}<span>{count}</span></p>

            </div>
  }

  render(){
    let Banned=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id;//Получаем id роли юзера

    if(this.state.isLoaded){
      return <div>
                   {
                     this.props.Store.users.map(function(user){
                       if(user.id!=this.props.Store.myPage.id && user.roleid!=Banned){//&& user.roleid== userId  исключаем отображение своего профиля и отображаем только юзеров(админы и модераторы скрыты)
                             if(this.props.Store.myPage.onlineFilter==true)//проверяем задавали ли мы фильтр поиск по онлайну
                             {
                               if(user.online)
                                  return  this.showUsers(user);
                               else return;
                             }
                             else
                              return  this.showUsers(user);
                         }
                       }.bind(this)
                     )
                   }
                   {
                     pagingButtons(this.state.page, this.props.Store.users, this.getUsers)
                   }
             </div>
    }
    else return <div className="Loading"><img src={Loading}/></div>
  }
}

function pagingButtons(page, users, method){
  let nextBtn= <button className="Paging" onClick={()=>{method(page+1);}}>
               <img src={Right}/>
            </button>;
  let backBtn=  <button className="Paging" onClick={()=>{method(page-1);}}>
                <img src={Left}/>
              </button>
  if(users.length<12)//12 юзеров + мой профиль = 13 и это макс кол-во профилей в сторе
    nextBtn="";
  if(page==1)
    backBtn="";

  return (<div className="pagingBlock">
             {backBtn}
             {nextBtn}
          </div>);
}
export {pagingButtons}
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
)(Users);
