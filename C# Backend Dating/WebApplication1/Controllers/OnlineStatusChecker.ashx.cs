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
    /// <summary>
    /// Сводное описание для OnlineStatusChecker
    /// </summary>
    public class OnlineStatusChecker : IHttpHandler
    {

        // Список всех клиентов
        private static readonly Dictionary<int, WebSocket> Clients = new Dictionary<int, WebSocket>();

        public void ProcessRequest(HttpContext context)
        {
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            var socket = context.WebSocket;
            int id=0;
            while (true)
            {
                var buffer = new ArraySegment<byte>(new byte[64]);
                var result = await socket.ReceiveAsync(buffer, CancellationToken.None);//При подключенном сокете сообщения не приходит, при разрыве приходит массив нулей

                byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();
                if (cleanBuffer.Length>0)
                {
                    id = Convert.ToInt32(Encoding.UTF8.GetString(buffer.Array));
                    if (!Clients.ContainsKey(id))//Исключаем дублирование сокета клиента
                    {
                        Clients.Add(id, socket);
                        using (DatingContext db = new DatingContext())
                        {
                            SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == id);
                            user.online = true;
                            await db.SaveChangesAsync();
                        }
                    }
                }
                try
                {
                    if(socket.State == WebSocketState.CloseReceived)
                    {
                        using (DatingContext db = new DatingContext())
                        {
                            SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == id);
                            user.online = false;
                            await db.SaveChangesAsync();
                        }
                        Clients.Remove(id);
                    }
                }
                catch (ObjectDisposedException)
                {
                    using (DatingContext db = new DatingContext())
                    {
                        SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == id);
                        user.online = false;
                        await db.SaveChangesAsync();
                    }
                    Clients.Remove(id);
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

/* // Список всех клиентов
        private static readonly Dictionary<int, WebSocket> Clients = new Dictionary<int, WebSocket>();

        public void ProcessRequest(HttpContext context)
        {
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            var socket = context.WebSocket;
            while (true)
            {
                var buffer = new ArraySegment<byte>(new byte[64]);
                var result = await socket.ReceiveAsync(buffer, CancellationToken.None);//При подключенном сокете сообщения не приходит, при разрыве приходит массив нулей

                byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();
                if(cleanBuffer.Length>0)
                {
                    int id = Convert.ToInt32(Encoding.UTF8.GetString(buffer.Array));
                    if (!Clients.ContainsKey(id))//Исключаем дублирование сокета клиента
                    {
                        Clients.Add(id, socket);
                        using (DatingContext db = new DatingContext())
                        {
                            SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == id);
                            user.online = true;
                            await db.SaveChangesAsync();
                        }

                    }

                }


                for (int i = 0; i < Clients.Keys.Count; i++)
                {
                    WebSocket client = Clients.ElementAt(i).Value;
                    int clientId = Clients.ElementAt(i).Key;

                    try
                    {
                        if(client.State == WebSocketState.CloseReceived)
                        {
                            using (DatingContext db = new DatingContext())
                            {
                                SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == clientId);
                                user.online = false;
                                await db.SaveChangesAsync();
                            }
                            Clients.Remove(clientId);
                            i--;
                        }
                    }
                    catch (ObjectDisposedException)
                    {
                        using (DatingContext db = new DatingContext())
                        {
                            SiteUser user = db.SiteUsers.FirstOrDefault(x => x.id == clientId);
                            user.online = false;
                            await db.SaveChangesAsync();
                        }
                        Clients.Remove(clientId);
                        i--;
                    }
                }

            }
        }

    */