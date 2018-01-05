import React, {Component} from 'react';
import { connect } from 'react-redux';
class Messages extends Component{
  constructor(props){
    super(props);
    this.state={
      // messages: [],
      dialog:this.props.dialog,
      content: "",
      socket: new WebSocket(this.props.Store.Url["MessageSocket"])
    }
    this.onSendMessage=this.onSendMessage.bind(this);
    this.onMessageChange=this.onMessageChange.bind(this);
    this.createNewDialog=this.createNewDialog.bind(this);
  }
  componentWillMount() {
    this.state.socket.onmessage = function (msg) {
      // this.setState({messages:msg.data});

      // this.props.DispatchAddMessage(msg.data);
      var msg = JSON.parse( msg.data );
      // console.log(msg);
      this.props.DispatchAddMessage(msg);
    }.bind(this);

    // this.state.socket.onerror= function (msg) {
    //   alert(msg);
    // }.bind(this);
    // console.log(this.state.dialog.id);

    // if(this.state.dialog.id!=-1){
      fetch(this.props.Store.Url["Messages"]+"/"+this.state.dialog.id,{credentials: 'include'})//Не безопасно, т к любой юзер сможет читать сообщения подставив эти значения в урл
      .then(function(response){
        if(response.status==404)//Если диалог пуст
          return [];
       return(response.json());
     })
      .then(result => {
            this.props.DispatchLoadMessage(result);
            // this.setState({messages:result});
            // console.log(this.state.messages);
      });
    // }

  }

  componentWillUnmount(){//после закрытия чата закрываем веб сокет, дабы избежать их множественного создания
    this.state.socket.close();
    this.props.DispatchLoadMessage([]);
  }
  onMessageChange(e){
    this.setState({content:e.target.value});
  }
  createNewDialog(){
    // "DialogList":"http://localhost:59088/api/DialogLists",
    fetch(this.props.Store.Url["DialogList"], {
    method: 'post',
    body:  JSON.stringify(this.state.dialog),
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    },
    credentials: 'include'
    })
    .then(function(response){
     return(response.json());
    })
    .then(result => {
      // console.log(result);
        this.props.DispatchAddDialogList(result);
        this.setState({dialog:result});
        this.onSendMessage();
     });
  }
  onSendMessage(){
    if(this.state.dialog.id==-1)//если диалог не был создан, то создаем его и только после этого начинаем общение
      this.createNewDialog();
    else{
      if(this.state.content.trim().length==0)
        return;
      var otherUserId;
      if(this.state.dialog.firstUserId==this.props.Store.myPage.id)
        otherUserId=this.state.dialog.secondUserId;
      else
        otherUserId=this.state.dialog.firstUserId;

      var messageObject={
        dialogid:this.state.dialog.id,
        from:this.props.Store.myPage.id,
        to:otherUserId,
        content:this.state.content
      }
      this.state.socket.send(JSON.stringify(messageObject));
      // this.state.socket.send(messageObject.dialogid);
      // this.state.socket.send(messageObject.from);
      // this.state.socket.send(messageObject.to);
      // this.state.socket.send(messageObject.content);
      this.setState({content:""});
    }
  }
  render(){
    // console.log(this.props.Store.messages);
    return <div>
               {
                 this.props.Store.messages.map(function(msg){
                   // console.log(msg);
                   var time=msg.time.split('.')[0];
                   time=time.replace("T"," ");
                   var msgClass="";
                   if(msg.from==this.props.Store.myPage.id)
                      msgClass="FromMe";
                   else
                      msgClass="ToMe";
                   return  <div class={msgClass}>
                                 <p>
                                 {msg.content}
                                 </p>
                                 <span>
                                 {time}
                                 </span>
                           </div>
                 }.bind(this)
               )}
               <input type="text" value={this.state.content}
                                  onChange={this.onMessageChange}/>
               <button onClick={this.onSendMessage}>Send</button>
           </div>
  }
}
export default connect(
    (state, ownProps) => ({
      Store: state,
      ownProps
    }),
    dispatch => ({
      DispatchAddMessage:(msg)=>{
        dispatch({type:'SendMessage', Message: msg});
      },
      DispatchLoadMessage:(msg)=>{
        dispatch({type:'LoadMessage', Message: msg});
      },
      DispatchAddDialogList:(dl)=>{
        dispatch({type:'AddDialog', DialogList: dl});
      }
    })
)(Messages);
