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
      // user:Object.assign({},this.props.Store.myPage),
      // avatar:this.props.Store.myPage.avatar
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
        // console.log(this.state.hobby);
      });
      // if(this.props.Store.avatar.base64.length!=0)

      // var tmpAvatar=this.props.Store.avatar.filter(x=> x.siteUserId== this.props.Store.myPage.id);
      // if(tmpAvatar.length!=0)
      //     tmpAvatar=tmpAvatar[0].base64;
      // else
      //     tmpAvatar=  this.props.Store.avatar.filter(x=> x.siteUserId== 0)[0].base64;
      //     this.setState({avatar:tmpAvatar});

    //  .then(function(response){
    //    console.log(response);
    //     this.setState({hobby:response});
    //     console.log(this.state.hobby);
    //   });
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
              //this.props.DispatchAddAvatar(ChangeMyPage);
              // this.onEditUser(this.props.Store.myPage);
          };
          reader.readAsDataURL(file);
  }
  onEditData(){
    // if(this.state.avatar!=null && this.state.avatar.base64!=this.props.Store.myPage.avatar.base64){
    //   this.editAvatar(this.state.avatar);
    // }
    // if(this.props.Store.myPage!=this.state.user){
        this.editUser(this.state.user);
    // }
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
     //
     // var myAva=Object.assign({},this.props.Store.myPage.avatar);
     // myAva.confirmState="PrevAva";//Сомнительное действие 1
     // this.props.DispatchEditAvatar(myAva);
     console.log(result);
     // var myPage=Object.assign({},this.props.Store.myPage);
     // myPage.avatar=this.props.Store.avatar.filter(x=> x.siteUserId== -1)[0];//Сомнительное действие 2
     // this.props.DispatchEditUser(myPage);
     // this.props.DispatchMyPage(myPage);

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
     // result.data
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
     // this.props.DispatchDelAvatar(result);
     console.log(result);
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



     // var myPage=this.state.user;
     // myPage.avatar=this.props.Store.avatar.filter(x=> x.siteUserId== this.props.Store.myPage.id)[0];
     //
     // this.props.DispatchEditUser(myPage);//Когда уберу конфиденциальную инфу, то можно будет и не обновлять
   })
  }

  editUser(user)
  {
    // console.log(user);
    // if(this.state.avatar!=null && this.props.Store.avatar.base64==undefined){
    //   var userAvatar={
    //     base64:this.state.avatar.base64,
    //     siteUserId:this.props.Store.myPage.id
    //   }
    //   this.sendAvatar(userAvatar);
    // }else
    // var avatar=this.props.Store.avatar.filter(x=> x.siteUserId== this.props.Store.myPage.id);
    // if(avatar.length!=0)
        // avatar=avatar[0].base64;
    // else
        // avatar=  this.props.Store.avatar.filter(x=> x.siteUserId== 0)[0].base64;;
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
    // console.log(hobby);
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
      btnGetOldAvatar=<button onClick={this.onGetOldtAva}>Return to the old avatar</button>

    return <form encType="multipart/form-data">
                <input type="file" onChange={this.onAvatarChange}/>
                <button onClick={(e)=>{e.preventDefault();
                                      this.props.ownProps.history.push('/HomePage/MyGallery'+ownerOfGal);}}>
                                      Gallery
                </button>
                <select onChange={this.onGenderChange} value={this.state.user.gender} >
                    <option value=""></option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select onChange={this.onCityChange} value={this.state.user.city}>
                    <option value=""></option>
                    <option value="Washington">Washington</option>
                    <option value="Moscow">Moscow</option>
                    <option value="Pekin">Pekin</option>
                </select>

                <input type="text"
                       value={this.state.user.name}
                       onChange={this.onNameChange}/>
                <input type="email"
                       pattern="^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,3}$"
                       value={this.state.user.email}
                       onChange={this.onEmailChange}/>
                <input type="password"
                       onChange={this.onPasswordChange}/>
                <input type="text"
                       value={this.state.user.weight}
                       onChange={this.onWeightChange}/>
                <input type="text"
                       value={this.state.user.height}
                       onChange={this.onHeightChange}/>
                <select onChange={this.onEducationChange} value={this.state.user.education}>
                    <option value=""></option>
                    <option value="Basic">Base</option>
                    <option value="Middle">Middle</option>
                    <option value="College">College</option>
                    <option value="Universitet">Universitet</option>
                    <option value="Post-graduate">Post-graduate</option>
                    <option value="Other">Other</option>
                </select>
                <input type="date" value={this.state.user.birthDay.split('T')[0]} onChange={this.onBirthDayChange}/>
                <input type="text"
                       value={this.state.user.welcome}
                       onChange={this.onWelcomeChange}/>
                <div>
                    <input checked={this.state.hobby.animals} onChange={this.onAnimalsChange} type="checkbox"/>animals
                    <input checked={this.state.hobby.music} onChange={this.onMusicChange} type="checkbox"/>music
                    <input checked={this.state.hobby.sport} onChange={this.onSportChange} type="checkbox"/>sport
                    <input checked={this.state.hobby.traveling} onChange={this.onTravelingChange} type="checkbox"/>traveling
                    <input checked={this.state.hobby.cinema} onChange={this.onCinemaChange} type="checkbox"/>cinema
                    <input checked={this.state.hobby.dance} onChange={this.onDanceChange} type="checkbox"/>dance
                    <input checked={this.state.hobby.theatre} onChange={this.onTheatreChange} type="checkbox"/>theatre
               </div>
                <button onClick={(e)=>{
                                  e.preventDefault();
                                  this.onEditData();}}>
                                  Save
                </button>
                {btnGetOldAvatar}

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
