using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.WebSockets;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class GetLikes : IHttpHandler
    {
        private static readonly Dictionary<int, WebSocket> users = new Dictionary<int, WebSocket>();
        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
 
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            WebSocket clientSocket = context.WebSocket;
            var buffer = new ArraySegment<byte>(new byte[1024]);
            var result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);
            byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых байтов, чтобы он не содержал мусор
            int id = 0;
            if (cleanBuffer.Length > 0)
                id = Convert.ToInt32(Encoding.UTF8.GetString(buffer.Array));

            if (!users.ContainsKey(id))//Если в списке диалогов(подключенных клиентов) уже есть клиент, добавляем его(или их)
            {
                users.Add(id, clientSocket);
            }

            while (true)
            {
                result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);
                if (clientSocket.State != WebSocketState.Open)
                {
                    users.Remove(id);
                }
                cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();
                string json = Encoding.UTF8.GetString(cleanBuffer);
                LikeList like = JsonConvert.DeserializeObject<LikeList>(json);

                using (DatingContext db = new DatingContext())
                {
                    string action;

                    //LikeList likeExists = db.LikeList.FirstOrDefault(x => (x.from == like.from && x.to == like.to) || (x.from == like.to && x.to == like.from));
                    LikeList likeExists = db.LikeList.FirstOrDefault(x => x.from == like.from && x.to == like.to);
                    if (likeExists != null)
                    {
                        like = likeExists;
                        db.LikeList.Remove(likeExists);
                        action = "Remove";
                    }
                    else
                    {
                        db.LikeList.Add(like);
                        action = "Add";
                    }

                    await db.SaveChangesAsync();

                    if (users.ContainsKey(like.to))
                    {
                        WebSocket ws = users[like.to];
                        object response = new { like, action };
                        json = JsonConvert.SerializeObject(response);
                        cleanBuffer = Encoding.UTF8.GetBytes(json);
                        if (ws.State == WebSocketState.Open)
                        {
                            await ws.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                            await users[id].SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                    }
                }
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}