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
    /// <summary>
    /// Сводное описание для GetGuests
    /// </summary>
    public class GetGuests : IHttpHandler
    {

        ////private static readonly Dictionary<int, WebSocket> Clients = new Dictionary<int, WebSocket>();
        //private List<GuestList> guests;
        //public void ProcessRequest(HttpContext context)
        //{
        //    //Если запрос является запросом веб сокета
        //    if (context.IsWebSocketRequest)
        //        context.AcceptWebSocketRequest(WebSocketRequest);
        //}
        //public async Task GetGuestList(AspNetWebSocketContext context,int id)
        //{

        //        using (DatingContext db = new DatingContext())
        //        {
        //            guests = db.Guests.Where(x => x.to == id).ToList();
        //        }

        //        string json = JsonConvert.SerializeObject(guests);
        //        byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);

        //        await context.WebSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);


        //}
        //private async Task WebSocketRequest(AspNetWebSocketContext context)
        //{
        //    // Получаем сокет клиента из контекста запроса
        //    var clientSocket = context.WebSocket;
        //    // Слушаем его
        //    var buffer = new ArraySegment<byte>(new byte[1024]);
        //    // Ожидаем данные от него
        //    var result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);

        //    //context.Stores.OrderBy(sort).Skip(skipRows).Take(pageSize).ToList();
        //    byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых битов, чтобы он не содержал мусор

        //    int id = 0;
        //    if (cleanBuffer.Length > 0)
        //        id = Convert.ToInt32(Encoding.UTF8.GetString(buffer.Array));

        //    if (clientSocket.State == WebSocketState.Open)
        //    {
        //        Thread closing = new Thread(async () => await GetUsers.isClosedConnection(clientSocket));
        //        closing.Start();
        //    }
        //    while (clientSocket.State == WebSocketState.Open)
        //    {
        //        //var res = clientSocket.ReceiveAsync(buffer, CancellationToken.None);//Единственный ответ, который мы можем получить- инф о закрытии сокета и => мы завершим его обработку
        //        await GetGuestList(context, id);
        //        Thread.Sleep(30000);
        //    }
        //}

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
                GuestList guest = JsonConvert.DeserializeObject<GuestList>(json);
                guest.lastVisit = DateTime.Now;

                using (DatingContext db = new DatingContext())
                {
                    
                    //LikeList likeExists = db.LikeList.FirstOrDefault(x => (x.from == like.from && x.to == like.to) || (x.from == like.to && x.to == like.from));
                    GuestList guestExists = db.Guests.FirstOrDefault(x => x.who == guest.who &&
                                                                           x.to == guest.to);
                    if ((guest.lastVisit - guestExists.lastVisit).Minutes >= GuestListsController.guestExpire)
                    {
                        if (guestExists != null)
                        {
                            guest = guestExists;
                            guest.count++;
                            guest.lastVisit = DateTime.Now;
                            db.Entry(guest).State = System.Data.Entity.EntityState.Modified;
                        }
                        else
                        {
                            guest.count = 1;
                            db.Guests.Add(guest);
                        }
                        await db.SaveChangesAsync();

                        if (users.ContainsKey(guest.to))
                        {
                            WebSocket ws = users[guest.to];
                            json = JsonConvert.SerializeObject(guest);
                            cleanBuffer = Encoding.UTF8.GetBytes(json);

                            await users[id].SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                            if (ws.State == WebSocketState.Open)
                            {
                                await ws.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                            }
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


// GetGuestList(context);
//Task task = Task.Delay(1500, CancellationToken.None);

//                try
//                {
//                    await task;
//                }
//                catch (TaskCanceledException)
//                {
//                    return;
//                }