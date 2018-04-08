import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import {  bindAvatar } from './App.js'

import Loading from './Layout/bx_loader.gif';

class MyProfile extends  Component{
  constructor(props){
    super(props);
    this.state={
      user:{},
      prevhobby:{},
      hobbies: [],
      userHobby: [],
      isDataLoaded:false,
      avatar:null
    }

    this.onAvatarChange=this.onAvatarChange.bind(this);
    this.getBase64=this.getBase64.bind(this);
    this.onEditData=this.onEditData.bind(this);
    this.editUser=this.editUser.bind(this);
    this.editAvatar=this.editAvatar.bind(this);
    this.editHobby=this.editHobby.bind(this);
    this.onGetOldtAva=this.onGetOldtAva.bind(this);

    this.onGenderChange=  this.onGenderChange.bind(this);
    this.onWelcomeChange=  this.onWelcomeChange.bind(this);
    this.onCityChange=this.onCityChange.bind(this);
    this.onNameChange=this.onNameChange.bind(this);
    this.onEmailChange=this.onEmailChange.bind(this);
    this.onPasswordChange= this.onPasswordChange.bind(this);
    this.onEducationChange=this.onEducationChange.bind(this);
    this.onBirthDayChange=this.onBirthDayChange.bind(this);
    this.onWeightChange=this.onWeightChange.bind(this);
    this.onHeightChange=this.onHeightChange.bind(this);


    }

    componentWillMount() {
      let idUser;

      if(this.props.match.params.id!=undefined){
        idUser=this.props.match.params.id;
        this.getUser();
      }
      else {
        idUser=this.props.Store.myPage.id;
        let userTmp=Object.assign({},this.props.Store.myPage);
        let avatarTmp=this.props.Store.myPage.avatar;
        this.setState({user:userTmp});
        this.setState({avatar:avatarTmp});
        this.setState({isDataLoaded:true});
      }


      fetch(this.props.Store.Url["Hobby"])//Список всех хобби
      .then(function(response){
       return(response.json());
     })
      .then(result => {
        this.setState({hobbies:result});
      });

      fetch(this.props.Store.Url["Hobby"]+"/"+idUser)//загружаем выбранные юзером хобби
      .then(function(response){
        if(response.status==404)//Если у пользователя пустая галлерея
          return [];
       return(response.json());
     })
      .then(result => {
        this.setState({userHobby:result});
        this.setState({prevhobby:Object.assign({},result)});//Позволит нам узнать было ли изменено хобби при редактировании
      });
    }

    getUser() { //for Admin
      fetch(this.props.Store.Url["Users"]+"/"+this.props.match.params.id)
      .then(function(response){
        return response.json();
      })
      .then(function(json){
        return(json);
      })
      .then(result => {
        let avatarTmp;
        let userTmp;
        avatarTmp=result.avatar;
        userTmp=result.siteUser;

        userTmp=bindAvatar([userTmp], avatarTmp)[0];
        this.setState({user:userTmp});
        this.setState({avatar:avatarTmp});

        if(avatarTmp!=null)
          this.props.DispathcLoadAvatars(avatarTmp);
        this.props.DispatchLoadUsers(userTmp);

        this.setState({isDataLoaded:true});
      })
    }


    onGenderChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.gender=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onGenderForSearchChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.genderForSearch=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onAgeForSearchChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.ageForSearch=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onCityChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.city=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onNameChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.name=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onEmailChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.email=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onPasswordChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.password=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onEducationChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.education=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onBirthDayChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.birthDay=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onWelcomeChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.welcome=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onWeightChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.weight=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onHeightChange(e){
      let tmpForUpdate=this.state.user;
      tmpForUpdate.height=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onAvatarChange(e){
      this.getBase64(e.target.files[0]);
    }
    getBase64(file) {
            let reader = new FileReader();
            reader.onload = () => {
                let ChangeMyAvatar =Object.assign({}, this.state.user.avatar);//копирование объекта, если просто присвоить, то копируется ссылка и изменяя поля этого объекта будут меняться и поля стора
                ChangeMyAvatar.base64 = reader.result;
                ChangeMyAvatar.siteUserId = this.state.user.id;
                this.setState({avatar:ChangeMyAvatar});

                this.editAvatar(this.state.avatar);//Установка аватарки сразу после ее загрузки без нажатия кнопки сохранить
            };
            reader.readAsDataURL(file);
    }
    onEditData(){
          this.editUser(this.state.user);
          if(this.state.userHobby!=this.state.prevhobby){
             this.editHobby(this.state.userHobby);
           }
   }
   onGetOldtAva(e){
     e.preventDefault();
     fetch(this.props.Store.Url["Avatar"], {
      method: 'delete',
      body: JSON.stringify(this.state.user.id),
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
      },
      credentials: 'include'
     }).then(function(response){
      return(response.json());
     })
     .then(result => {
       let delNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.state.user.id &&
                                                       x.confirmState=="Waiting")[0];
       this.props.DispatchDelAvatar(delNewAva);

       let setOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.state.user.id &&
                                                                        x.confirmState=="PrevAva")[0];
        if(setOldAva!=undefined){
          setOldAva.confirmState="Confirmed";//Сомнительное действие 1
          this.props.DispatchEditAvatar(setOldAva);
        }
        else
          setOldAva=this.props.Store.avatar.filter(x=> x.id == "None")[0];

        let newPage=Object.assign({},this.state.user);
        newPage=bindAvatar([newPage], [setOldAva])[0];
        // newPage.avatar=setOldAva;//Сомнительное действие
        this.props.DispatchEditUser(newPage);
        console.log(newPage);
        if(this.props.match.params.id==undefined  ||
           this.props.match.params.id==this.props.Store.myPage.id)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
          this.props.DispatchMyPage(newPage);
          this.setState({user:newPage});
     })
   }
    editAvatar(avatar){
      fetch(this.props.Store.Url["Avatar"], {
       method: 'post',
       body: JSON.stringify(avatar),
       headers: {
       'Content-Type': 'application/json;charset=utf-8'
       },
       credentials: 'include'
     }).then(function(response){
       return(response.json());
     })
     .then(result => {
       this.props.DispatchAddAvatar(result);

       let myAva=Object.assign({},this.state.user.avatar);
       myAva.confirmState="PrevAva";
       this.props.DispatchEditAvatar(myAva);

       let newPage=Object.assign({},this.state.user);
       newPage=bindAvatar([newPage], [result])[0];
       // newPage.avatar=this.props.Store.avatar.filter(x=> x.id== "Clock")[0];
       this.props.DispatchEditUser(newPage);

       if(this.props.match.params.id==undefined ||
          this.props.match.params.id==this.props.Store.myPage.id)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
            this.props.DispatchMyPage(newPage);
       this.setState({user:newPage});
       //при изменении (myAva.confirmState или myPage.avatar) объект в сторе тоже изменяется на это значение и
       //диспатч не отработает изменения, а это нарушает логику редакс
       //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?

     })
    }

  getCitiesList(){
    return this.props.Store.formData.cities.map(function(city){
      return   <option key={city.id} value={city.cityName} defaultValue={city.cityName}>{city.cityName}</option>
      })
  }
  getEducationList(){
    return this.props.Store.formData.education.map(function(education){
      return   <option key={education.id} value={education.educationName} defaultValue={education.educationName}>{education.educationName}</option>
      })
  }
  editUser(user)
  {
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
         result.avatar=this.state.user.avatar;
         this.props.DispatchEditUser(result);
         if(this.props.match.params.id==undefined ||
            this.props.match.params.id==this.props.Store.myPage.id)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
              this.props.DispatchMyPage(result);
         })
  }

  editHobby(hobbies)
  {
    let userHobbies=[];
    let userid = this.props.Store.myPage.id;
    if(this.props.match.params.id!=undefined)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
      userid = this.props.match.params.id;
    for(let i=0;i<hobbies.length;i++){
      let oneHobby={
         hobbyid: hobbies[i].id,
         siteUserid: userid
      }
      userHobbies.push(oneHobby);
    }
    fetch(this.props.Store.Url["Hobby"], {
     method: 'put',
     body: JSON.stringify(userHobbies),
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
   },
   credentials: 'include'})
  }
  render(){
    if(!this.state.isDataLoaded){
      return <div className="Loading"><img src={Loading}/></div>
    }

    let ownerOfGal="";
    if(this.props.match.params.id!=undefined)//Если мы редактируем чью-то страницу, значит мы админ
      ownerOfGal="/"+this.props.match.params.id;//то добавляем роут к галлерее
    let btnGetOldAvatar="";
    if(this.state.user.avatar.id=="Clock")
      btnGetOldAvatar=<button className="btn btn-danger" onClick={this.onGetOldtAva}>Return to the old avatar</button>

    return <form encType="multipart/form-data">
              <div className="LeftEditBlock">
                <div className="EditBlock">
                    <p className="EditTitle">Photos</p>
                    <label>Change avatar</label>
                    <input type="file" onChange={this.onAvatarChange}/>
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault();
                                          this.props.history.push('/HomePage/MyGallery'+ownerOfGal);}}>
                                          Edit gallery
                    </button>
                    {btnGetOldAvatar}
                </div>
                <div className="EditBlock">
                    <p className="EditTitle">Personal information</p>
                    <label>City</label>
                    <select className="form-control" onChange={this.onCityChange} value={this.state.user.city}>
                        {this.getCitiesList()}
                    </select>

                    <div className="HalfBlock">
                        <label>Name</label>
                        <input className="form-control" type="text"
                               value={this.state.user.name}
                               onChange={this.onNameChange}/>
                    </div>
                    <div className="HalfBlock">
                        <label>Email</label>
                        <input className="form-control" type="email"
                               pattern="^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,3}$"
                               value={this.state.user.email}
                               onChange={this.onEmailChange}/>
                    </div>
                    <div className="HalfBlock">
                        <label>Password</label>
                        <input className="form-control" type="password"
                               onChange={this.onPasswordChange}/>
                    </div>
                    <div className="HalfBlock">
                        <label>Birthday</label>
                        <input className="form-control" type="date" value={this.state.user.birthDay.split('T')[0]} onChange={this.onBirthDayChange}/>
                    </div>
                    <label>Education</label>
                    <select className="form-control" onChange={this.onEducationChange} value={this.state.user.education}>
                        {this.getEducationList()}
                    </select>

                    <label>Welcome message</label>
                    <textarea className="Welcome form-control"
                          onChange={this.onWelcomeChange}>
                          {this.state.user.welcome}
                    </textarea>

                </div>
              </div>


              <div className="LeftEditBlock">
                <div className="EditBlock">
                    <p className="EditTitle">Appearance</p>
                    <label>Gender</label>
                    <select className="form-control" onChange={this.onGenderChange} value={this.state.user.gender} >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <div className="HalfBlock">
                        <label>Weight</label>
                        <input className="form-control" type="text"
                               value={this.state.user.weight}
                               onChange={this.onWeightChange}/>
                    </div>
                    <div className="HalfBlock">
                        <label>Height</label>
                        <input className="form-control" type="text"
                               value={this.state.user.height}
                               onChange={this.onHeightChange}/>
                    </div>
                </div>

                <div className="EditBlock">
                    <p className="EditTitle">Hobbies</p>
                    <table className="table table-striped">
                      <tbody>
                       {
                         this.state.hobbies.map((hobby)=>{
                           // console.log(this.state.userHobby);
                           let isChecked=false;
                           if(this.state.userHobby.filter(x=>x.name==hobby.name)[0]!=undefined)
                              isChecked=true;
                           return  <tr key={hobby.id}>
                                      <td>
                                          <span>{hobby.name}</span>
                                          <input checked={isChecked} onChange={(e)=>{
                                                let oneHobby = this.state.userHobby;
                                                if(e.target.checked){
                                                  oneHobby.push(hobby);
                                                }
                                                else {
                                                  oneHobby=oneHobby.filter(x=>x.id!=hobby.id);
                                                }
                                                // oneHobby.animals = e.target.checked;
                                                // response.push(<li>{hobby.name}</li>);
                                                this.setState({ userHobby: oneHobby });}} type="checkbox"/>
                                      </td>
                                   </tr>
                         })
                       }
                      </tbody>
                    </table>

               </div>
               <button className="SaveChangesBtn" onClick={(e)=>{
                                 e.preventDefault();
                                 this.onEditData();}}>
                                 Save
               </button>
              </div>


           </form>
  }
}
export default connect(
    (state) => ({
      Store: state
    }),
    dispatch => ({
      DispatchMyPage:(user)=>{
        dispatch({type:'MyPage', Users: user});
      },
      DispatchEditUser:(user)=>{
        dispatch({type:'EditUser', Users: user});
      },
      DispatchEditAvatar:(ava)=>{
        dispatch({type:'EditAvatar', Avatar: ava});
      },
      DispatchAddAvatar:(ava)=>{
        dispatch({type:'AddAvatar', Avatar: ava});
      },
      DispatchLoadUsers:(user)=>{
      dispatch({type:'LoadUser', Users: user});
      },
      DispathcLoadAvatars:(avatar)=>{
        dispatch({type:"LoadAvatar", Avatar: avatar})
      },
      DispatchDelAvatar:(ava)=>{
        dispatch({type:'DelAvatar', Avatar: ava});
      }
    })
)(MyProfile);
