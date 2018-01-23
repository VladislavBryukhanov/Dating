import React, {Component} from 'react';
import { connect } from 'react-redux';
class Messages extends Component{
  constructor(props){
    super(props);
    this.state={
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
      var msg = JSON.parse( msg.data );
      this.props.DispatchAddMessage(msg);
    }.bind(this);

      fetch(this.props.Store.Url["Messages"]+"/"+this.state.dialog.id,{credentials: 'include'})//Не безопасно, т к любой юзер сможет читать сообщения подставив эти значения в урл
      .then(function(response){
        if(response.status==404)//Если диалог пуст
          return [];
       return(response.json());
      })
      .then(result => {
            this.props.DispatchLoadMessage(result);
      });
  }

  componentWillUnmount(){//после закрытия чата закрываем веб сокет, дабы избежать их множественного создания
    this.state.socket.close();
    this.props.DispatchLoadMessage([]);
  }
  onMessageChange(e){
    this.setState({content:e.target.value});
  }
  createNewDialog(){
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
        this.props.DispatchAddDialogList(result);

        // var dialogUsers=bindAvatar(result.userList, result.avatars);
        this.props.DispatchLoadDalogUsers(this.props.user);

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
      this.setState({content:""});
    }
  }
  render(){
    return <div>
               {
                 this.props.Store.messages.map(function(msg){
                   var time=msg.time.split('.')[0];
                   time=time.replace("T"," ");
                   var msgclassName="";
                   if(msg.from==this.props.Store.myPage.id)
                      msgclassName="FromMe";
                   else
                      msgclassName="ToMe";
                   return  <div className={msgclassName}>
                                 <p>
                                    {msg.content}
                                 </p>
                                 <span>
                                    {time}
                                 </span>
                           </div>
                 }.bind(this)
               )}
               <textarea  contenteditable="true" value={this.state.content}
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
      },
      DispatchLoadDalogUsers:(users)=>{
        dispatch({type:"LoadDalogUsers", DUsers: users})
      }
    })
)(Messages);
