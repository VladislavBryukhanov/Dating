import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
class MyProfile extends  Component{
  constructor(props){
    super(props);
    this.state={
      user:{},
      prevhobby:{},
      hobby: {},
      avatar:null
    }

    this.onAvatarChange=this.onAvatarChange.bind(this);
    this.getBase64=this.getBase64.bind(this);
    this.onEditData=this.onEditData.bind(this);
    this.editUser=this.editUser.bind(this);
    this.editAvatar=this.editAvatar.bind(this);
    this.editHobby=this.editHobby.bind(this);
    this.onGetOldtAva=this.onGetOldtAva.bind(this);

    this.onAnimalsChange=this.onAnimalsChange.bind(this);
    this.onMusicChange=this.onMusicChange.bind(this);
    this.onSportChange=this.onSportChange.bind(this);
    this.onTravelingChange=this.onTravelingChange.bind(this);
    this.onCinemaChange=this.onCinemaChange.bind(this);
    this.onDanceChange=this.onDanceChange.bind(this);
    this.onTheatreChange=this.onTheatreChange.bind(this);

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
      var userTmp;
      var avatarTmp;
      var idUser;

      console.log(this.props.match.params.id);
      if(this.props.match.params.id!=undefined){
        idUser=this.props.match.params.id;
        userTmp=Object.assign({},this.props.Store.users.filter(x=>x.id==idUser)[0]);
        avatarTmp=userTmp.avatar;
      }
      else {
        idUser=this.props.Store.myPage.id;
        userTmp=Object.assign({},this.props.Store.myPage),
        avatarTmp=this.props.Store.myPage.avatar;
      }

      this.setState({user:userTmp});
      this.setState({avatar:avatarTmp});

      fetch(this.props.Store.Url["Hobby"]+"/"+idUser)
      .then(function(response){
       return(response.json());
     })
      .then(result => {
        this.setState({hobby:result});
        this.setState({prevhobby:Object.assign({},result)});//Позволит нам узнать было ли изменено хобби при редактировании
      });
    }

    onAnimalsChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.animals = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onMusicChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.music = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onSportChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.sport = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onTravelingChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.traveling = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onCinemaChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.cinema = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onDanceChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.dance = e.target.checked;
      this.setState({ hobby: oneHobby });
    }
    onTheatreChange(e){
      let oneHobby = this.state.hobby;
      oneHobby.theatre = e.target.checked;
      this.setState({ hobby: oneHobby });
    }


    onGenderChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.gender=e.target.value
      this.setState({user: tmpForUpdate})
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
    onCityChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.city=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onNameChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.name=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onEmailChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.email=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onPasswordChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.password=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onEducationChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.education=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onBirthDayChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.birthDay=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onWelcomeChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.welcome=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onWeightChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.weight=e.target.value
      this.setState({user: tmpForUpdate})
    }
    onHeightChange(e){
      var tmpForUpdate=this.state.user;
      tmpForUpdate.height=e.target.value
      this.setState({user: tmpForUpdate})
    }
  onAvatarChange(e){
    this.getBase64(e.target.files[0]);
  }
  getBase64(file) {
          var reader = new FileReader();
          reader.onload = () => {
              var ChangeMyAvatar =Object.assign({}, this.state.user.avatar);//копирование объекта, если просто присвоить, то копируется ссылка и изменяя поля этого объекта будут меняться и поля стора
              ChangeMyAvatar.base64 = reader.result;
              ChangeMyAvatar.siteUserId = this.state.user.id;
              this.setState({avatar:ChangeMyAvatar});

              this.editAvatar(this.state.avatar);//Установка аватарки сразу после ее загрузки без нажатия кнопки сохранить
          };
          reader.readAsDataURL(file);
  }
  onEditData(){
        this.editUser(this.state.user);
        if(this.state.hobby!=this.state.prevhobby){
           this.editHobby(this.state.hobby);
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
     var delNewAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.state.user.id &&
                                                     x.confirmState=="Waiting")[0];
     this.props.DispatchDelAvatar(delNewAva);

     var setOldAva=this.props.Store.avatar.filter(x=>x.siteUserId==this.state.user.id &&
                                                                      x.confirmState=="PrevAva")[0];
      if(setOldAva!=undefined){
        setOldAva.confirmState="Confirmed";//Сомнительное действие 1
        this.props.DispatchEditAvatar(setOldAva);
      }
      else
        setOldAva=this.props.Store.avatar.filter(x=> x.siteUserId == 0)[0];

      var newPage=Object.assign({},this.state.user);
      newPage.avatar=setOldAva;//Сомнительное действие
      this.props.DispatchEditUser(newPage);
      if(this.props.match.params.id==undefined)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
        this.props.DispatchMyPage(newPage);
        this.setState({user:newPage});
   })
 }
  editAvatar(avatar){
    console.log(avatar);
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
     // console.log(result);
     this.props.DispatchAddAvatar(result);

     var myAva=Object.assign({},this.state.user.avatar);
     myAva.confirmState="PrevAva";
     this.props.DispatchEditAvatar(myAva);

     var newPage=Object.assign({},this.state.user);
     newPage.avatar=this.props.Store.avatar.filter(x=> x.siteUserId== -1)[0];
     this.props.DispatchEditUser(newPage);

     if(this.props.match.params.id==undefined)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
        this.props.DispatchMyPage(newPage);
        this.setState({user:newPage});
     //при изменении (myAva.confirmState или myPage.avatar) объект в сторе тоже изменяется на это значение и
     //диспатч не отработает изменения, а это нарушает логику редакс
     //стоит копировать объекту для значения и отдельно диспатчить их в редакс для отчетности?

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
         if(this.props.match.params.id==undefined)//Если страница принадлежит нам, а не админ зашел для ее редактирования, то редактируем свою стр в сторе
            this.props.DispatchMyPage(result);
         })
  }

  editHobby(hobby)
  {
    fetch(this.props.Store.Url["Hobby"], {
     method: 'put',
     body: JSON.stringify(hobby),
     headers: {
     'Content-Type': 'application/json;charset=utf-8'
   },
   credentials: 'include'})
  }
  render(){
    var ownerOfGal="";
    if(this.props.match.params.id!=undefined)//Если мы редактируем чью-то страницу, значит мы админ
      ownerOfGal="/"+this.props.match.params.id;//то добавляем роут к галлерее
    var btnGetOldAvatar="";
    if(this.state.user.avatar.siteUserId==-1)
      btnGetOldAvatar=<button class="btn btn-danger" onClick={this.onGetOldtAva}>Return to the old avatar</button>

    return <form encType="multipart/form-data">
              <div class="LeftEditBlock">
                <div class="EditBlock">
                    <p class="EditTitle">Photos</p>
                    <label>Change avatar</label>
                    <input type="file" onChange={this.onAvatarChange}/>
                    <button class="btn btn-primary" onClick={(e)=>{e.preventDefault();
                                          this.props.ownProps.history.push('/HomePage/MyGallery'+ownerOfGal);}}>
                                          Edit gallery
                    </button>
                    {btnGetOldAvatar}
                </div>
                <div class="EditBlock">
                    <p class="EditTitle">Personal information</p>
                    <label>City</label>
                    <select class="form-control" onChange={this.onCityChange} value={this.state.user.city}>
                        <option value=""></option>
                        <option value="Washington">Washington</option>
                        <option value="Moscow">Moscow</option>
                        <option value="Pekin">Pekin</option>
                    </select>

                    <div class="HalfBlock">
                        <label>Name</label>
                        <input class="form-control" type="text"
                               value={this.state.user.name}
                               onChange={this.onNameChange}/>
                    </div>
                    <div class="HalfBlock">
                        <label>Email</label>
                        <input class="form-control" type="email"
                               pattern="^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,3}$"
                               value={this.state.user.email}
                               onChange={this.onEmailChange}/>
                    </div>
                    <div class="HalfBlock">
                        <label>Password</label>
                        <input class="form-control" type="password"
                               onChange={this.onPasswordChange}/>
                    </div>
                    <div class="HalfBlock">
                        <label>Birthday</label>
                        <input class="form-control" type="date" value={this.state.user.birthDay.split('T')[0]} onChange={this.onBirthDayChange}/>
                    </div>
                    <label>Education</label>
                    <select class="form-control" onChange={this.onEducationChange} value={this.state.user.education}>
                        <option value=""></option>
                        <option value="Basic">Base</option>
                        <option value="Middle">Middle</option>
                        <option value="College">College</option>
                        <option value="Universitet">Universitet</option>
                        <option value="Post-graduate">Post-graduate</option>
                        <option value="Other">Other</option>
                    </select>

                    <label>Welcome message</label>
                    <textarea class="Welcome form-control"
                          onChange={this.onWelcomeChange}>
                          {this.state.user.welcome}
                    </textarea>

                </div>
              </div>


              <div class="LeftEditBlock">
                <div class="EditBlock">
                    <p class="EditTitle">Appearance</p>
                    <label>Gender</label>
                    <select class="form-control" class="form-control" onChange={this.onGenderChange} value={this.state.user.gender} >
                        <option value=""></option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <div class="HalfBlock">
                        <label>Weight</label>
                        <input class="form-control" class="form-control" type="text"
                               value={this.state.user.weight}
                               onChange={this.onWeightChange}/>
                    </div>
                    <div class="HalfBlock">
                        <label>Height</label>
                        <input class="form-control" class="form-control" type="text"
                               value={this.state.user.height}
                               onChange={this.onHeightChange}/>
                    </div>
                </div>

                <div class="EditBlock">
                    <p class="EditTitle">Hobbies</p>
                    <table class="table table-striped">
                      <tbody>
                        <tr>
                            <td><span>Animals</span> <input checked={this.state.hobby.animals} onChange={this.onAnimalsChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Music</span> <input checked={this.state.hobby.music} onChange={this.onMusicChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Sport</span> <input checked={this.state.hobby.sport} onChange={this.onSportChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Traveling</span> <input checked={this.state.hobby.traveling} onChange={this.onTravelingChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Cinema</span> <input checked={this.state.hobby.cinema} onChange={this.onCinemaChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Dance</span> <input checked={this.state.hobby.dance} onChange={this.onDanceChange} type="checkbox"/></td>
                        </tr>
                        <tr>
                            <td><span>Theatre</span> <input checked={this.state.hobby.theatre} onChange={this.onTheatreChange} type="checkbox"/></td>
                        </tr>
                      </tbody>
                    </table>

               </div>
               <button class="SaveChangesBtn" onClick={(e)=>{
                                 e.preventDefault();
                                 this.onEditData();}}>
                                 Save
               </button>
              </div>


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
      DispatchEditAvatar:(ava)=>{
        dispatch({type:'EditAvatar', Avatar: ava});
      },
      DispatchAddAvatar:(ava)=>{
        dispatch({type:'AddAvatar', Avatar: ava});
      },
      DispatchDelAvatar:(ava)=>{
        dispatch({type:'DelAvatar', Avatar: ava});
      }
    })
)(MyProfile);
