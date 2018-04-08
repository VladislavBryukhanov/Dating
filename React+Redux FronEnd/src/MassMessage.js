import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class Filter extends  Component{
  constructor(props){
    super(props);
    this.state={
      filter:{
          gender:"All",
          typeForSearch:"All",
          ageForSearch:"All",
          cityForSearch:"All"
        },
        message:null
    }
    // this.checkWithFilter=this.checkWithFilter.bind(this);

    this.ontypeForSearchChange=this.ontypeForSearchChange.bind(this);
    this.onAgeForSearchChange=this.onAgeForSearchChange.bind(this)
    this.onCityForSearch=this.onCityForSearch.bind(this);
    this.onGenderChange=this.onGenderChange.bind(this);
    this.onMessageChange=this.onMessageChange.bind(this);

    this.getCitiesList=this.getCitiesList.bind(this);
    this.getAgeRangeList=this.getAgeRangeList.bind(this);
    this.getTypeForSearchList=this.getTypeForSearchList.bind(this);
    }

    onMessageChange(e){
      this.setState({message: e.target.value})
    }
    ontypeForSearchChange(e){
      var tmpForUpdate=this.state.filter;
      tmpForUpdate.typeForSearch=e.target.value
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

    // checkWithFilter(user){
    //   var now = new Date();
    //   var age;
    //   age=parseInt(user.birthDay.split('-')[0]);
    //   age=parseInt(now.getFullYear())-age;
    //   var from=parseInt(this.state.filter.ageForSearch.split(' ')[0]);
    //   var to=parseInt(this.state.filter.ageForSearch.split(' ')[2]);
    //   // настраиваем промежуток "от 53 и более", тут нет точной границы для
    //   //конечного возраста, поэтому ставим произвольное недостижимое число
    //   if(from==53)
    //     to=200;
    //     var userId=this.props.Store.roles.filter(x=> x.roleName=="User")[0].id;//Получаем id роли юзера
    //
    //   if((user.genderForSearch==this.state.filter.genderForSearch || this.state.filter.genderForSearch=="All")  &&
    //        (user.city==this.state.filter.cityForSearch || this.state.filter.cityForSearch=="All") &&
    //        ((age>=from && age<=to) || this.state.filter.ageForSearch=="All") &&
    //        (this.state.filter.gender==user.gender || this.state.filter.gender=="All")&&
    //         user.roleid== userId)
    //     return user.id
    // }

  sendMassMessage()
  {
    // var filteredUserList=this.props.Store.users.map(function(user){
    //       return this.checkWithFilter(user);
    //     }.bind(this))
    //     filteredUserList=filteredUserList.filter(x=>x!=undefined)
    //     console.log(filteredUserList);

    // var filter={
    //   gender:this.state.gender,
    //   typeForSearch:this.state.typeForSearch,
    //   ageForSearch:this.state.ageForSearch,
    //   cityForSearch:this.state.cityForSearch
    // }



    //{to: filteredUserList,content: this.state.message,from: this.props.Store.myPage.id}
    console.log(this.state.filter);
    fetch(this.props.Store.Url["Messages"], {
     method: 'post',
     body: JSON.stringify({gender:this.state.filter.gender, typeForSearch:this.state.filter.typeForSearch,
                          ageForSearch:this.state.filter.ageForSearch, cityForSearch:this.state.filter.cityForSearch,
                          content: this.state.message, from: this.props.Store.myPage.id}),//body: JSON.stringify(filteredUserList,"qwer",4)
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

  getCitiesList(){
    return this.props.Store.formData.cities.map(function(city){
      return   <option key={city.id} value={city.cityName} defaultValue={city.cityName}>{city.cityName}</option>
      })
  }
  getAgeRangeList(){
    return this.props.Store.formData.ageForSearch.map(function(range){
      return   <option key={range.id} value={range.rangeOfAge} defaultValue={range.rangeOfAge}>{range.rangeOfAge}</option>
      })
  }
  getTypeForSearchList(){
    return this.props.Store.formData.typeForSearch.map(function(type){
      return   <option key={type.id} value={type.typeName} defaultValue={type.typeName}>{type.typeName}</option>
      })
  }


  render(){
    return <form encType="multipart/form-data">
                 <select onChange={this.onGenderChange} value={this.state.filter.gender} >
                     <option value="All">All</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                </select>
                <select onChange={this.ontypeForSearchChange} value={this.state.filter.typeForSearch}>
                    <option value="All">All</option>
                    {this.getTypeForSearchList()}
                </select>

                <select onChange={this.onAgeForSearchChange} value={this.state.filter.ageForSearch}>
                    <option value="All">All</option>
                    {this.getAgeRangeList()}
                </select>

                <select onChange={this.onCityForSearch} value={this.state.filter.cityForSearch}>
                    <option value="All">All</option>
                    {this.getCitiesList()}
                </select>

                <input type="text"
                placeholder="Message"
                       value={this.state.message}
                       onChange={this.onMessageChange}/>

               <button className="btn" onClick={(e)=>{
                                 e.preventDefault();
                                 this.sendMassMessage();}}>
                                 Send
               </button>

           </form>
  }
}
export default connect(
    (state) => ({
      Store: state
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
