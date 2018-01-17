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

        //private static readonly Dictionary<int, WebSocket> Clients = new Dictionary<int, WebSocket>();
        private List<GuestList> guests;
        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        public async Task GetGuestList(AspNetWebSocketContext context,int id)
        {

                using (DatingContext db = new DatingContext())
                {
                    guests = db.Guests.Where(x => x.to == id).ToList();
                }

                string json = JsonConvert.SerializeObject(guests);
                byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);

                await context.WebSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);


        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            // Получаем сокет клиента из контекста запроса
            var clientSocket = context.WebSocket;
            // Слушаем его
            var buffer = new ArraySegment<byte>(new byte[1024]);
            // Ожидаем данные от него
            var result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);

            //context.Stores.OrderBy(sort).Skip(skipRows).Take(pageSize).ToList();
            byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых битов, чтобы он не содержал мусор

            int id = 0;
            if (cleanBuffer.Length > 0)
                id = Convert.ToInt32(Encoding.UTF8.GetString(buffer.Array));

            if (clientSocket.State == WebSocketState.Open)
            {
                Thread closing = new Thread(async () => await GetUsers.isClosedConnection(clientSocket));
                closing.Start();
            }
            while (clientSocket.State == WebSocketState.Open)
            {
                //var res = clientSocket.ReceiveAsync(buffer, CancellationToken.None);//Единственный ответ, который мы можем получить- инф о закрытии сокета и => мы завершим его обработку
                await GetGuestList(context, id);
                Thread.Sleep(3000);
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