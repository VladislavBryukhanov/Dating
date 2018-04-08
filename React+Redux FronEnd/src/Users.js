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
      page:1,
      isLoaded:false,
      imgCount: []
    }
    this.showUsers=this.showUsers.bind(this);
    // this.checkWithFilter=this.checkWithFilter.bind(this);
    this.getGalleryCount=this.getGalleryCount.bind(this);
    this.getUsers=this.getUsers.bind(this);
  }
  componentWillMount(){
    this.getUsers(this.state.page);
  }
  getUsers(currentPage){
      // fetch(this.props.Store.Url["Users"]+"/?id="+this.props.Store.myPage.id+"&page="+currentPage)

      this.setState({isLoaded:false});
      var path;
      if(this.props.Store.myPage.nameFilter!=undefined){
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
        var loadUsers=bindAvatar(result.userList, this.props.Store.avatar);
        this.props.DispatchLoadUsers(loadUsers);

        getSiteUsers.onopen= function (msg) {
        getSiteUsers.send(JSON.stringify(result.id));
        };
        if(getSiteUsers.readyState === getSiteUsers.OPEN)
           getSiteUsers.send(JSON.stringify(result.id));

        this.setState({isLoaded:true});
      })
      this.getGalleryCount();
      this.setState({page:currentPage});
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
    var count=0;
    if(this.state.imgCount.length!=0){
          count=this.state.imgCount.filter(x=>x.id==user.id)[0];
          if(count!=undefined)//Если в галлерее не было найдено изображений значит их 0
            count=count.count;
          else
            count=0;
    }

    var age =  getYearOld(user.birthDay);

    var isOnline="Offline";
    if(user.online)
      isOnline="Online";
    return <div key={user.id} className="User">
                   <img height="100px" src={user.avatar.base64}
                           onClick={()=>{this.props.history.push('/HomePage/Profile/'+user.id);}}/>
                   <p className="userName">{user.name}</p>
                   <p className="userAge">{age} years old</p>
                   <p>{user.typeForSearch}<div className={isOnline}></div></p>
                   <p>{user.city}<span>{count}</span></p>

            </div>
  }
  // checkWithFilter(user){
  //   var now = new Date();
  //   var age;
  //   age=parseInt(user.birthDay.split('-')[0]);
  //   age=parseInt(now.getFullYear())-age;
  //   var from=parseInt(this.props.Store.myPage.ageForSearch.split(' ')[0]);
  //   var to=parseInt(this.props.Store.myPage.ageForSearch.split(' ')[2]);
  //
  //
  //   // настраиваем промежуток "от 53 и более", тут нет точной границы для
  //   //конечного возраста, поэтому ставим произвольное недостижимое число
  //   if(from==53)
  //     to=200;
  //   //если юзер выбирает "couple", то должны отображаться
  //   // особи противоположного пола, в остальных случаях отображаются все
  //   var correctGender=true;
  //   if(this.props.Store.myPage.genderForSearch=="Couple"){
  //     if(this.props.Store.myPage.gender!=user.gender)
  //       correctGender=true;
  //     else
  //       correctGender=false;
  //   }
  //
  //   var nameFilter=true;//по умолчанию допускаем, что юзер не ввел имя и не сортируем по нему
  //   if(this.props.Store.myPage.nameFilter!=undefined){//Если пользователь ввел имя в фильтр, то начинаем сортировку
  //       if(user.name.toLowerCase().indexOf(this.props.Store.myPage.nameFilter.toLowerCase(), 0)!=-1)
  //         nameFilter=true;
  //       else
  //         nameFilter=false;
  //   }
  //
  //   if((user.genderForSearch==this.props.Store.myPage.genderForSearch || this.props.Store.myPage.genderForSearch=="All")  &&
  //        (user.city==this.props.Store.myPage.cityForSearch || this.props.Store.myPage.cityForSearch=="All") &&
  //        ((age>=from && age<=to) || this.props.Store.myPage.ageForSearch=="All") &&
  //        nameFilter && correctGender)//совпадают ли поля+ проверка находится ли возраст в диапазоне
  //     return this.showUsers(user);
  //   else
  //     return;
  // }
//this.checkWithFilter(user);
  render(){
    var Banned=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id;//Получаем id роли юзера



    // console.log(this.props.Store.users);
    // console.log(this.props.Store.users.length);
    // console.log(this.props.Store.avatar.length);
    //
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
  var nextBtn= <button className="Paging" onClick={()=>{method(page+1);}}>
               <img src={Right}/>
            </button>;
  var backBtn=  <button className="Paging" onClick={()=>{method(page-1);}}>
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
