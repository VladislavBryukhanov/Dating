import React, { Component } from 'react';
import { connect } from 'react-redux';

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state={
      gender:"",
      genderForSearch:"",
      ageForSearch:"",
      city:"",
      cityForSearch:"",
      birthDay:"",
      name:"",
      email:"",
      password:"",
      education:"",

      NextStep:null
    }
    this.onGenderChange=  this.onGenderChange.bind(this);
    this.onGenderForSearchChange=this.onGenderForSearchChange.bind(this);
    this.onAgeForSearchChange=this.onAgeForSearchChange.bind(this)
    this.onCityChange=this.onCityChange.bind(this);
    this.onNameChange=this.onNameChange.bind(this);
    this.onEmailChange=this.onEmailChange.bind(this);
    this.onPasswordChange= this.onPasswordChange.bind(this);
    this.onEducationChange=this.onEducationChange.bind(this);
    this.onBirthDayChange=this.onBirthDayChange.bind(this);

    this.getCitiesList=this.getCitiesList.bind(this);
    this.getAgeRangeList=this.getAgeRangeList.bind(this);
    this.getTypeForSearchList=this.getTypeForSearchList.bind(this);
    this.getEducationList=this.getEducationList.bind(this);

    this.toNextStep= this.toNextStep.bind(this);
    this.onSubmit=this.onSubmit.bind(this);
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
  getEducationList(){
    return this.props.Store.formData.education.map(function(education){
      return   <option key={education.id} value={education.educationName} defaultValue={education.educationName}>{education.educationName}</option>
      })
  }

  onGenderChange(e){
    this.setState({gender: e.target.value})
  }
  onGenderForSearchChange(e){
    this.setState({genderForSearch: e.target.value})
  }
  onAgeForSearchChange(e){
    this.setState({ageForSearch: e.target.value})
  }
  onCityChange(e){
    this.setState({city: e.target.value})
  }
  onNameChange(e){
    this.setState({name: e.target.value})
  }
  onEmailChange(e){
    this.setState({email: e.target.value})
  }
  onPasswordChange(e){
    this.setState({password: e.target.value})
  }
  onEducationChange(e){
    this.setState({education: e.target.value})
  }
  onBirthDayChange(e){
    this.setState({birthDay: e.target.value})
  }
  getFirstForm(){
    return <div className="regFirstForm">
                <h2>Create your profile for free</h2>
                <form className="form-group col-md-10 col-md-offset-1 col-sm-12 col-xs-12" encType="multipart/form-data">
                      <div className="form-group col-md-2 col-md-offset-1 col-sm-2 col-sm-offset-1 col-xs-12">
                          <label>Gender</label>
                          <select className="form-control" onChange={this.onGenderChange} >
                              <option defaultValue=""></option>
                              <option value="true">Male</option>
                              <option value="false">Female</option>
                          </select>
                      </div>

                      <div className="form-group col-md-2 col-sm-2 col-xs-12">
                          <label>I am looking for</label>
                          <select className="form-control" onChange={this.onGenderForSearchChange}>
                              <option defaultValue=""></option>
                              {this.getTypeForSearchList()}
                          </select>
                      </div>

                      <div className="form-group col-md-2 col-sm-2 col-xs-12">
                          <label>Age for search</label>
                          <select className="form-control" onChange={this.onAgeForSearchChange}>
                              <option defaultValue=""></option>
                              {this.getAgeRangeList()}
                          </select>
                      </div>

                      <div className="form-group col-md-2 col-sm-2 col-xs-12">
                          <label>City</label>
                          <select className="form-control" onChange={this.onCityChange}>
                              <option defaultValue=""></option>
                              {this.getCitiesList()}
                          </select>
                      </div>
                      <div className="form-group col-md-2 col-sm-2 col-xs-12">
                          <br/>
                          <button className="RegNext" onClick={(e)=>{e.preventDefault(); this.toNextStep();}}>Next</button>
                      </div>
                 </form>
                 <p className="form-group col-md-12 col-sm-12 col-xs-12">Join us to meet people! Today we are more than 900,000 registered</p>
             </div>
  }
  getSecondForm(){
    //Делаем так,чтобы возраст <18 лет не мог быть выбран
    var maxDate=new Date();
    var day=maxDate.getDate();
    var month=(maxDate.getMonth()+1);
    if(day < 10)
      day="0"+day;
    if(month < 10)
      month="0"+month;
    maxDate=maxDate.getFullYear()-18+"-"+month+"-"+day;

    return <form className="regSecondForm form-group col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12" onSubmit={this.onSubmit} encType="multipart/form-data">
                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Full Name</label>
                    <input className="form-control" type="text"
                           onChange={this.onNameChange}/>
                </div>
                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Email</label>
                    <input className="form-control" type="email"
                           pattern="^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,3}$"
                           onChange={this.onEmailChange}/>
                </div>

                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Password</label>
                    <input className="form-control" type="password"
                           onChange={this.onPasswordChange}/>
                </div>

                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Education</label>
                    <select className="form-control" onChange={this.onEducationChange}>
                        <option selected="selected" value=""></option>
                        {this.getEducationList()}
                    </select>
                </div>

                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <label>Birthday</label>
                    <input className="form-control" type="date" max={maxDate}  onChange={this.onBirthDayChange}/>
                </div>
                <div className="form-group col-md-6  col-sm-6  col-xs-12">
                    <br/>
                    <input className="RegNext" type="submit" value="Next"/>
                </div>
           </form>
  }
  toNextStep(){
    if(this.state.gender!=""&&
    this.state.genderForSearch!=""&&
    this.state.ageForSearch!=""&&
    this.state.city!="")
      this.setState({NextStep:true});
    else
      alert("Please fill all fields");
  }
  onSubmit(e){
        e.preventDefault();
        if(
        this.state.name!=""&&
        this.state.email!=""&&
        this.state.password!=""&&
        this.state.education!=""&&
        this.state.birthDay!=""
      ){
          this.props.onAddUserSubmit({ gender: this.state.gender,
                                       genderForSearch: this.state.genderForSearch,
                                       ageForSearch: this.state.ageForSearch,
                                       city: this.state.city,
                                       cityForSearch: this.state.city,
                                       name: this.state.name,
                                       email: this.state.email,
                                       password: this.state.password,
                                       education: this.state.education,
                                       birthDay: this.state.birthDay
                                      });
        }
        else if(this.props.StoreUsers.filter(x=>x.email==this.state.email)[0]!=null)
          alert("This email already registered");
        else
          alert("Please fill all fields");
  }
  render(){
    if(!this.state.NextStep)
        return this.getFirstForm();
    else
        return this.getSecondForm();
  }
}
export default connect(
    (state) => ({
      Store: state
    })
)(Registration);
