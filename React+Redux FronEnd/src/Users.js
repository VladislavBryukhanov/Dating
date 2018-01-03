import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class Users extends  Component{
  constructor(props){
    super(props);
    this.showUsers=this.showUsers.bind(this);
    this.checkWithFilter=this.checkWithFilter.bind(this);
  }
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
  checkWithFilter(user){
    var now = new Date();
    var age;
    age=parseInt(user.birthDay.split('-')[0]);
    age=parseInt(now.getFullYear())-age;
    var from=parseInt(this.props.Store.myPage.ageForSearch.split(' ')[0]);
    var to=parseInt(this.props.Store.myPage.ageForSearch.split(' ')[2]);


    // настраиваем промежуток "от 53 и более", тут нет точной границы для
    //конечного возраста, поэтому ставим произвольное недостижимое число
    if(from==53)
      to=200;
    //если юзер выбирает "couple", то должны отображаться
    // особи противоположного пола, в остальных случаях отображаются все
    var correctGender=true;
    if(this.props.Store.myPage.genderForSearch=="Couple"){
      if(this.props.Store.myPage.gender!=user.gender)
        correctGender=true;
      else
        correctGender=false;
    }

    var nameFilter=true;//по умолчанию допускаем, что юзер не ввел имя и не сортируем по нему
    if(this.props.Store.myPage.nameFilter!=undefined){//Если пользователь ввел имя в фильтр, то начинаем сортировку
        if(user.name.toLowerCase().indexOf(this.props.Store.myPage.nameFilter.toLowerCase(), 0)!=-1)
          nameFilter=true;
        else
          nameFilter=false;
    }

    if((user.genderForSearch==this.props.Store.myPage.genderForSearch || this.props.Store.myPage.genderForSearch=="All")  &&
         (user.city==this.props.Store.myPage.cityForSearch || this.props.Store.myPage.cityForSearch=="All") &&
         ((age>=from && age<=to) || this.props.Store.myPage.ageForSearch=="All") &&
         nameFilter && correctGender)//совпадают ли поля+ проверка находится ли возраст в диапазоне
      return this.showUsers(user);
    else
      return;
  }

  render(){

    //var userId=this.props.Store.roles.filter(x=> x.roleName=="User")[0].id;//Получаем id роли юзера
    var Banned=this.props.Store.roles.filter(x=> x.roleName=="Banned")[0].id;//Получаем id роли юзера
    return <div>
             <table>
               <tr>
                 {
                   this.props.Store.users.map(function(user){
                     if(user.id!=this.props.Store.myPage.id && user.roleId!=Banned){//&& user.roleId== userId  исключаем отображение своего профиля и отображаем только юзеров(админы и модераторы скрыты)
                           if(this.props.Store.myPage.onlineFilter==true)//проверяем задавали ли мы фильтр поиск по онлайну
                           {
                             if(user.online)
                                return  this.checkWithFilter(user);
                             else return;
                           }
                           else
                              return  this.checkWithFilter(user);
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
)(Users);
