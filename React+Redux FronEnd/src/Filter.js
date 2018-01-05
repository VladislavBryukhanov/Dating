import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class Filter extends  Component{
  constructor(props){
    super(props);
    this.state={
      user:this.props.Store.myPage,
      onlineFilter:this.props.Store.myPage.onlineFilter,
      nameFilter:this.props.Store.myPage.nameFilter
    }
    this.onEditUser=this.onEditUser.bind(this);

    this.onGenderForSearchChange=this.onGenderForSearchChange.bind(this);
    this.onAgeForSearchChange=this.onAgeForSearchChange.bind(this)
    this.onCityForSearch=this.onCityForSearch.bind(this);
    this.onStatusFilterChange=this.onStatusFilterChange.bind(this);
    this.onFilterNameChange=this.onFilterNameChange.bind(this);
    this.getUsers=this.getUsers.bind(this);


    }


    onGenderForSearchChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.genderForSearch=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onAgeForSearchChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.ageForSearch=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onCityForSearch(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.cityForSearch=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onStatusFilterChange(e){
      this.setState({onlineFilter: e.target.checked})
    }
    onFilterNameChange(e){
      this.setState({nameFilter: e.target.value})
    }

    getUsers(){
      fetch(this.props.Store.Url["Users"])
                .then(function(response){
                  return response.json();
                })
                .then(function(json){
                  return(json);
                })
                .then(result => {
                  var user=result;
                  for(var i=0;i<user.length;i++){
                    var avatarList=this.props.Store.avatar.filter(x=> x.siteUserId== user[i].id);
                    var userAvatar=null;
                    if(avatarList.length!=0){//Если было найдено значение
                        for(var j=0;j<avatarList.length;j++){
                          if(avatarList[j].confirmState=="Confirmed")
                              userAvatar=avatarList[j];//.base64;
                        }
                        if(userAvatar==null)
                            userAvatar=this.props.Store.avatar.filter(x=> x.siteUserId == -1)[0];
                      }
                    else//Иначе дефолтное значение с айди 0
                        userAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];//.base64;
                    user[i].avatar=userAvatar;
                  }
                  this.props.DispatchLoadUsers(user);
                  this.props.ownProps.history.push('/HomePage');
                });
       }
  onEditUser(user)
  {
    // console.log(user);
    fetch(this.props.Store.Url["Users"], {
     method: 'put',
     body: JSON.stringify(user),
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
     },
     credentials: 'include'
   }).then(function(response){
     return(response.json());
   })
   .then(result => {
     result.avatar=this.props.Store.myPage.avatar;

     this.props.DispatchEditUser(result);//Когда уберу конфиденциальную инфу, то можно будет и не обновлять
     result.onlineFilter=this.state.onlineFilter;
     result.nameFilter=this.state.nameFilter;

     this.props.DispatchMyPage(result);
     this.getUsers();
   })
  }

  render(){
    return <form encType="multipart/form-data" class="Filter  form-group col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12">

                <div class="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Find by name</label>
                    <input class="form-control" type="text"
                           value={this.state.nameFilter}
                           onChange={this.onFilterNameChange}/>
                </div>

                <div class="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>I search for</label>
                    <select class="form-control" onChange={this.onGenderForSearchChange} value={this.state.user.genderForSearch}>
                        <option value="All">All</option>
                        <option value="Couple">Couple</option>
                        <option value="Friends">Friends</option>
                        <option value="Chat">Chat</option>
                    </select>
                </div>

                <div class="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>The age range</label>
                    <select class="form-control" onChange={this.onAgeForSearchChange} value={this.state.user.ageForSearch}>
                        <option value="All">All</option>
                        <option value="18 to 24 years">18 to 24 years</option>
                        <option value="25 to 31 years">25 to 31 years</option>
                        <option value="32 to 38 years">32 to 38 years</option>
                        <option value="39 to 45 years">39 to 45 years</option>
                        <option value="46 to 52 years">46 to 52 years</option>
                        <option value="53 years and more">53 years and more</option>
                    </select>
                </div>

                <div class="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>City of living</label>
                    <select class="form-control" onChange={this.onCityForSearch} value={this.state.user.cityForSearch}>
                        <option value="All">All</option>
                        <option value="Washington">Washington</option>
                        <option value="Moscow">Moscow</option>
                        <option value="Pekin">Pekin</option>
                    </select>
                </div>

                <div >
                    <label>Online </label>
                    <input   checked={this.state.onlineFilter} onChange={this.onStatusFilterChange} type="checkbox"/>
                </div>

                <button class="btn btn-primary col-md-12  col-sm-12  col-xs-12" onClick={(e)=>{
                                  e.preventDefault();
                                  this.onEditUser(this.state.user);
                                  this.props.ownProps.history.push('/HomePage')}}>
                                  Find
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
      DispatchMyPage:(user)=>{
        dispatch({type:'MyPage', Users: user});
      },
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchLoadUsers:(user)=>{
      dispatch({type:'LoadUser', Users: user});
      }
    })
)(Filter);
