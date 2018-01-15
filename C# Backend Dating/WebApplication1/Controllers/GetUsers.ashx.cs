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
    /// Сводное описание для GetUsers
    /// </summary>
    public class GetUsers : IHttpHandler
    {

        //private static WebSocket clientSocket;
        private Filter clientFilter;
       // private List<ClientUser> ResponseUsers;
        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        public static async Task<bool> close(WebSocket soc)//Асинхроннно узнаем закрыт ли вебсокет на клиенте, чтобы остановить его обработку в случае закрытия
        {
            WebSocket socket = soc;
            var buffer = new ArraySegment<byte>(new byte[1024]);
            WebSocketReceiveResult res = await socket.ReceiveAsync(buffer, CancellationToken.None);//Мы получаем от веб сокета за все время его существования 2 сообщения- при создании id и при закрытии сообщение о том что соединение разорвано, в данном методе мы асинхронно ждем сообщение о закрытии сокета, дабы не держать его открытым вечно
            if (res.MessageType == WebSocketMessageType.Close)
                return true;
            else
                return false;
        }
        private async Task  SortByFilter(Filter clientData, AspNetWebSocketContext context)// List<ClientUser>
        {
            int from = 0;
            int to = 0;
            if (clientData.ageForSearch != "All")
            {
                 from = Convert.ToInt32(clientData.ageForSearch.Split(' ')[0]);
                 to = Convert.ToInt32(clientData.ageForSearch.Split(' ')[2]);

                if (from == 53)
                    to = 200;
            }

            if (clientData.nameForSearch == null)
                clientData.nameForSearch = "";
            using (DatingContext db = new DatingContext())
            {
                List<SiteUser> SUsers=db.SiteUsers.Where(x =>
                ((DateTime.Now.Year - x.birthDay.Year >= from && DateTime.Now.Year - x.birthDay.Year <= to) || clientData.ageForSearch == "All")
                && x.name.Contains(clientData.nameForSearch)
                && (x.cityForSearch == clientData.cityForSearch || clientData.cityForSearch=="All")
                && (x.genderForSearch == clientData.genderForSearch || clientData.genderForSearch=="All")
                ).OrderBy(x=>x.name).ToList();

                List<ClientUser> userList=new List<ClientUser>();
                foreach (SiteUser user in SUsers)
                {
                    userList.Add(new ClientUser(user));
                }

                string json = JsonConvert.SerializeObject(userList);
                byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);
                await context.WebSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                //return userList;
            }
                //return ResponseUsers;
        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            // Получаем сокет клиента из контекста запроса
            var clientSocket = context.WebSocket;
            var buffer = new ArraySegment<byte>(new byte[1024]);
            // Ожидаем данные от него
            var result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);

            //context.Stores.OrderBy(sort).Skip(skipRows).Take(pageSize).ToList();
            byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых битов, чтобы он не содержал мусор
            string json = Encoding.UTF8.GetString(cleanBuffer);
            if (cleanBuffer.Length > 0)
                clientFilter = JsonConvert.DeserializeObject<Filter>(json);

            bool isClosed = false;
            if (clientSocket.State == WebSocketState.Open)
            {
                Thread closing = new Thread(() => isClosed = GetUsers.close(clientSocket).Result);
                closing.Start();
            }
            while (clientSocket.State == WebSocketState.Open)
            {
                //var res = clientSocket.ReceiveAsync(buffer, CancellationToken.None);//Единственный ответ, который мы можем получить- инф о закрытии сокета и => мы завершим его обработку
                await SortByFilter(clientFilter, context);
                Thread.Sleep(3000);
            }
            if (isClosed == true)
            {
                clientSocket.Dispose();
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