import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class Filter extends  Component{
  constructor(props){
    super(props);
    this.state={
      filter:{
          gender:"All",
          genderForSearch:"All",
          ageForSearch:"All",
          cityForSearch:"All"
        },
        message:null
    }
    this.checkWithFilter=this.checkWithFilter.bind(this);

    this.onGenderForSearchChange=this.onGenderForSearchChange.bind(this);
    this.onAgeForSearchChange=this.onAgeForSearchChange.bind(this)
    this.onCityForSearch=this.onCityForSearch.bind(this);
    this.onGenderChange=this.onGenderChange.bind(this);
    this.onMessageChange=this.onMessageChange.bind(this);


    }

    onMessageChange(e){
      this.setState({message: e.target.value})
    }
    onGenderForSearchChange(e){
      var tmpForUpdate=this.state.filter;
      tmpForUpdate.genderForSearch=e.target.value
      this.setState({filter: tmpForUpdate})
    }
    onAgeForSearchChange(e){
      var tmpForUpdate=this.state.filter;
      tmpForUpdate.ageForSearch=e.target.value
      this.setState({filter: tmpForUpdate})
    }
    onCityForSearch(e){
      var tmpForUpdate=this.state.filter;
      tmpForUpdate.cityForSearch=e.target.value
      this.setState({filter: tmpForUpdate})
    }

    onGenderChange(e){
      var tmpForUpdate=this.state.filter;
      tmpForUpdate.gender=e.target.value
      this.setState({filter: tmpForUpdate})
    }

    checkWithFilter(user){
      var now = new Date();
      var age;
      age=parseInt(user.birthDay.split('-')[0]);
      age=parseInt(now.getFullYear())-age;
      var from=parseInt(this.state.filter.ageForSearch.split(' ')[0]);
      var to=parseInt(this.state.filter.ageForSearch.split(' ')[2]);
      // настраиваем промежуток "от 53 и более", тут нет точной границы для
      //конечного возраста, поэтому ставим произвольное недостижимое число
      if(from==53)
        to=200;
        var userId=this.props.Store.roles.filter(x=> x.roleName=="User")[0].id;//Получаем id роли юзера

      if((user.genderForSearch==this.state.filter.genderForSearch || this.state.filter.genderForSearch=="All")  &&
           (user.city==this.state.filter.cityForSearch || this.state.filter.cityForSearch=="All") &&
           ((age>=from && age<=to) || this.state.filter.ageForSearch=="All") &&
           (this.state.filter.gender==user.gender || this.state.filter.gender=="All")&&
            user.roleid== userId)
        return user.id
    }

  sendMassMessage()
  {
    var filteredUserList=this.props.Store.users.map(function(user){
          return this.checkWithFilter(user);
        }.bind(this))
        filteredUserList=filteredUserList.filter(x=>x!=undefined)
        console.log(filteredUserList);

    fetch(this.props.Store.Url["Messages"], {
     method: 'post',
     body: JSON.stringify({to: filteredUserList,content: this.state.message,from: this.props.Store.myPage.id}),//body: JSON.stringify(filteredUserList,"qwer",4)
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
     },
     credentials: 'include'
   }).then(function(response){
     return(response.json());
   })
   .then(result => {
       console.log(result);
       this.props.DispatchLoadDialog(result);
       this.setState({message:""});
   })
  }

  render(){
    return <form encType="multipart/form-data">
                 <select onChange={this.onGenderChange} value={this.state.filter.gender} >
                     <option value="All">All</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                </select>
                <select onChange={this.onGenderForSearchChange} value={this.state.filter.genderForSearch}>
                    <option value="All">All</option>
                    <option value="Couple">Couple</option>
                    <option value="Friends">Friends</option>
                    <option value="Chat">Chat</option>
                </select>

                <select onChange={this.onAgeForSearchChange} value={this.state.filter.ageForSearch}>
                    <option value="All">All</option>
                    <option value="18 to 24 years">18 to 24 years</option>
                    <option value="25 to 31 years">25 to 31 years</option>
                    <option value="32 to 38 years">32 to 38 years</option>
                    <option value="39 to 45 years">39 to 45 years</option>
                    <option value="46 to 52 years">46 to 52 years</option>
                    <option value="53 years and more">53 years and more</option>
                </select>

                <select onChange={this.onCityForSearch} value={this.state.filter.cityForSearch}>
                    <option value="All">All</option>
                    <option value="Washington">Washington</option>
                    <option value="Moscow">Moscow</option>
                    <option value="Pekin">Pekin</option>
                </select>

                <input type="text"
                       value={this.state.message}
                       onChange={this.onMessageChange}/>

               <button onClick={(e)=>{
                                 e.preventDefault();
                                 this.sendMassMessage();}}>
                                 Send
               </button>

           </form>
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    }),
    dispatch => ({
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchLoadDialog:(dlg)=>{
        dispatch({type:'LoadDialogList', DialogList: dlg});
      }
    })
)(Filter);
