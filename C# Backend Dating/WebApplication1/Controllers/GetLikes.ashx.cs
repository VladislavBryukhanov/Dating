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
    /// Сводное описание для GetLikes
    /// </summary>
    public class GetLikes : IHttpHandler
    {
        private List<LikeList> likes;
        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        public async Task GetLikeList(AspNetWebSocketContext context, int id)
        {

            using (DatingContext db = new DatingContext())
            {
                likes = db.LikeList.Where(x => x.from == id ||
                                               x.to == id).ToList();
            }

            string json = JsonConvert.SerializeObject(likes);
            byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);

            try
            {
                await context.WebSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);

            }
            catch (ObjectDisposedException)
            {
                context.WebSocket.Dispose();
            }

        }


        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            // Получаем сокет клиента из контекста запроса
            WebSocket clientSocket = context.WebSocket;
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
                await GetLikeList(context, id);
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