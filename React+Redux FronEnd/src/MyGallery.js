import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import Trash from './Layout/trash.png';

class MyGallery extends  Component{
  constructor(props){
    super(props);
    this.state = {
      Gallery: [],
      ownerOfGallery: this.props.Store.myPage.id
    }
    this.onGalleryChange = this.onGalleryChange.bind(this);
    this.removeFromBuffer = this.removeFromBuffer.bind(this);
    this.onPostFiles = this.onPostFiles.bind(this);
  }

  componentWillMount() {
    let  owner;
    if(this.props.match.params.id) {
        owner = this.props.match.params.id;
    } else {
        owner = this.props.Store.myPage.id;
    }
    this.setState({ownerOfGallery: owner});
    //setState не успеват выполнится и в фетч идет занчение по умолчанию (null), посему используем let

    fetch(this.props.Store.Url["Gallery"]+"/"+owner, {
      method: 'get',
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
      }})
      .then(function(response){
        if(response.status==404)//Если у пользователя пустая галлерея
          return [];
        return response.json();
      })
      .then(function(json){
        return(json);
      })
      .then(result => {
        this.setState({Gallery:result});
      });
  }

  onPostFiles(e) {
    e.preventDefault();
    var contentForSending;
    if(this.state.Gallery.length > 0) {
        contentForSending = this.state.Gallery;
    } else{
      contentForSending = [];
      contentForSending[0] = {siteUserid: this.state.ownerOfGallery};//Если мы удалим все изображения то на сервер полетит id юзера, у которого мы сможем удалить контент
    }
    console.log(contentForSending);

    fetch(this.props.Store.Url["Gallery"], {
      method: 'post',
      body: JSON.stringify(contentForSending),
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
      },
      credentials: 'include'
    })
  }

  onGalleryChange(e){
    for (let i = 0; i < e.target.files.length; i++) {
            this.getBase64(e.target.files[i], i);
    }
    this.forceUpdate();
  }

  getBase64(file, index) {
       var reader = new FileReader();
       reader.onload = () => {
           let GalleryModel = {
               id:-1,
               content: null,
               siteUserid: null
           };

           GalleryModel.content = reader.result;
           GalleryModel.siteUserid = this.state.ownerOfGallery;

           let GalleryTmp=this.state.Gallery;
           GalleryTmp.push(GalleryModel);

           this.setState({ Gallery: GalleryTmp });
       };
       reader.readAsDataURL(file);
   }

  removeFromBuffer(img){
     let index=this.state.Gallery.indexOf(img);
     var newGallery=this.state.Gallery;
     newGallery.splice(index, 1);
     this.setState(this.state.Gallery: newGallery);
  }

  render(){
    return <div>
            <form>
                <input type="file" multiple onChange={this.onGalleryChange}/>
                <button className="btn btn-success" onClick={this.onPostFiles}>Save</button>
            </form>
                 {
                   this.state.Gallery.map(function(img) {
                         return <div className="GalleryEdit">
                                       <img width="200px" src={img.content}/>
                                       <img onClick={(e)=>{
                                             e.preventDefault();
                                             this.removeFromBuffer(img);
                                           }} className="RemoveBtn" src={Trash}/>
                                </div>
                   }.bind(this))
               }

           </div>

  }
}
export default connect(
    (state) => ({
      Store: state
    })
)(MyGallery);
