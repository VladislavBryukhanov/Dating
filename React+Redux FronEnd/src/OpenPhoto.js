import React, {Component} from 'react';
export class OpenPhoto extends Component{
  constructor(props){
    super(props);
  }
  render(){
    return <div  onClick={this.props.forClose} className="ViewPhotoForm">
                <div>
                  <img className="Photo" src={this.props.image}/>
                </div>
           </div>
  }
}
// <button>X</button>
