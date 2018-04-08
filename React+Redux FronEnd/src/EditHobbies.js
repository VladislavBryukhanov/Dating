import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import {  bindAvatar } from './App.js'
class MyProfile extends  Component{
  constructor(props){
    super(props);
    this.state={
      hobbies: [],
      hobbyName:""
    }
    this.onHobbyNameChanged=this.onHobbyNameChanged.bind(this);
    this.onAddHobby=this.onAddHobby.bind(this);
    this.onRemoveHobby=this.onRemoveHobby.bind(this);
    }

    componentWillMount() {
      fetch(this.props.Store.Url["Hobby"])
      .then(function(response){
       return(response.json());
     })
      .then(result => {
        this.setState({hobbies:result});
      });
    }

    onHobbyNameChanged(e){
      this.setState({hobbyName: e.target.value})
    }

    onAddHobby(e){
      this.setState({hobbyName:""});

      e.preventDefault();
      var hobby={name:this.state.hobbyName};
      fetch(this.props.Store.Url["Hobby"], {
       method: 'post',
       body: JSON.stringify(hobby),
       headers: {
       'Content-Type': 'application/json;charset=utf-8'
     },
     credentials: 'include'})
     .then(function(response){
       return(response.json());
     })
     .then(result => {
       var newHobbies=this.state.hobbies;
       newHobbies.push(result);
       this.setState({hobbies:newHobbies});
     })
    }


    onRemoveHobby(e, hobbyId)
    {
      e.preventDefault();
      fetch(this.props.Store.Url["Hobby"], {
       method: 'Delete',
       body: JSON.stringify(hobbyId),
       headers: {
       'Content-Type': 'application/json;charset=utf-8'
       },
       credentials: 'include'})
       .then(function(response){
         var newHobbies=this.state.hobbies;
         newHobbies=newHobbies.filter(x=>x.id!=hobbyId);
         this.setState({hobbies:newHobbies});
       }.bind(this))

    }


  render(){
    return <form encType="multipart/form-data">
                    <table className="table table-striped">
                      <tbody>
                       {
                         this.state.hobbies.map((hobby)=>{
                           return  <tr key={hobby.id}>
                                      <td>
                                          <span>{hobby.name}</span>
                                      </td>
                                      <td>
                                          <button onClick={(e)=>{this.onRemoveHobby(e, hobby.id)}}className="btn btn-danger">Remove hobby</button>
                                      </td>
                                   </tr>
                         })
                       }
                      </tbody>
                    </table>
                    <input value={this.state.hobbyName} type="text" onChange={this.onHobbyNameChanged}/>
                    <button onClick={this.onAddHobby} className="btn btn-success">Add</button>
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
      }
    })
)(MyProfile);
