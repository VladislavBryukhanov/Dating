using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
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

        //private List<Filter> Filters=new List<Filter>();
        private Dictionary<Guid, List<int>> getUserListFor = new Dictionary<Guid, List<int>>();
        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        public static async Task<bool> isClosedConnection(WebSocket socket)//Асинхроннно узнаем закрыт ли вебсокет на клиенте, чтобы остановить его обработку в случае закрытия
        {
            var buffer = new ArraySegment<byte>(new byte[1024]);
            WebSocketReceiveResult res = await socket.ReceiveAsync(buffer, CancellationToken.None);//Мы получаем от веб сокета за все время его существования 2 сообщения- при создании id и при закрытии сообщение о том что соединение разорвано, в данном методе мы асинхронно ждем сообщение о закрытии сокета, дабы не держать его открытым вечно
            if (res.MessageType == WebSocketMessageType.Close)
                return true;
            else
                return false;
        }

        //public List<Avatar> GetAvatars(int[] id)
        //{
        //    List<Avatar> siteAvatars=new List<Avatar>();
        //    using (DatingContext db = new DatingContext())
        //    {
        //        for (int i = 0; i < id.Length; i++)
        //        {
        //            int currentId = id[i];
        //            siteAvatars.Add(db.Avatars.FirstOrDefault(x=>x.siteUserId == currentId));
        //        }
        //    }

        //    List<Avatar> clientAvatars=new List<Avatar>();
        //    foreach (Avatar avatar in siteAvatars)
        //    {
        //        string AvatarBase64 = (avatar.base64).Substring((avatar.base64).IndexOf(',') + 1);//конвертим js base64 строку в c# строку (убираем заголовок)
        //        FileInfo fileInfo = new FileInfo(AvatarBase64);
        //        byte[] bytes = new byte[fileInfo.Length];
        //        using (FileStream fs = fileInfo.OpenRead())
        //        {
        //            fs.Read(bytes, 0, bytes.Length);
        //        }
        //        string NewBase64 = "data:image / jpg; base64," + Convert.ToBase64String(bytes);//Добавляем к base64 header, который в C# почему-то не генерируется, но необъодимый js для отображения изображению
        //        avatar.base64 = NewBase64;
        //        clientAvatars.Add(avatar);
        //    }

        //    return clientAvatars;
        //}

        public async Task GetNewFilterOrClose(WebSocket wsocket, Guid wsid)//, int myId)
        {
            while (wsocket.State == WebSocketState.Open)
            {
                var buffer = new ArraySegment<byte>(new byte[1024]);
                    WebSocketReceiveResult res = await wsocket.ReceiveAsync(buffer, CancellationToken.None);//Мы получаем от веб сокета за все время его существования 2 сообщения- при создании id и при закрытии сообщение о том что соединение разорвано, в данном методе мы асинхронно ждем сообщение о закрытии сокета, дабы не держать его открытым вечно

                byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();
                string json = Encoding.UTF8.GetString(cleanBuffer);

                List<int> usersId = new List<int>();
                if (cleanBuffer.Length > 0)
                    getUserListFor[wsid] = JsonConvert.DeserializeObject<List<int>>(json);
                //if (cleanBuffer.Length > 0)
                //    Filters[Filters.FindIndex(x => x.id == myId)] = JsonConvert.DeserializeObject<Filter>(json);

                try
                {
                    await GetCurrentUsers(getUserListFor[wsid].ToArray(), wsocket);
                }
                catch(Exception ex)
                {

                }
                //catch(ObjectDisposedException ex)//Объект(вебсокет скорее всего) удален(disposed)
                //{
                //    break;
                //}
                //catch(InvalidOperationException ex)//Операция уже выполняется
                //{
                //    break;
                //}
            }
        }

        //private async Task  SortByFilter(Filter clientData, WebSocket WSocket, bool isNewAva)// List<ClientUser>
        //{
        //    string json;
        //    if (clientData.getUsersWithId != null)
        //    {
        //        List<ClientUser> userList = new List<ClientUser>();
        //        using (DatingContext db = new DatingContext())
        //        {
        //            for (int i = 0; i < clientData.getUsersWithId.Length; i++)
        //            {
        //                int currentId = clientData.getUsersWithId[i];
        //                userList.Add(new ClientUser(db.SiteUsers.FirstOrDefault(x => x.id == currentId)));
        //            }
        //        }
        //        List<Avatar> avatars = GetAvatars(clientData.getUsersWithId);
        //        object sendData = new { userList, avatars };
        //        json = JsonConvert.SerializeObject(sendData);
        //    }
        //    else
        //    {
        //        int from = 0;
        //        int to = 0;
        //        if (clientData.ageForSearch != "All")
        //        {
        //            from = Convert.ToInt32(clientData.ageForSearch.Split(' ')[0]);
        //            to = Convert.ToInt32(clientData.ageForSearch.Split(' ')[2]);

        //            if (from == 53)
        //                to = 200;
        //        }

        //        if (clientData.nameForSearch == null)
        //            clientData.nameForSearch = "";
        //        using (DatingContext db = new DatingContext())
        //        {
        //            List<SiteUser> SUsers = db.SiteUsers.Where(x =>
        //              ((DateTime.Now.Year - x.birthDay.Year >= from && DateTime.Now.Year - x.birthDay.Year <= to) || clientData.ageForSearch == "All")
        //              && x.name.Contains(clientData.nameForSearch)
        //              && (x.city == clientData.cityForSearch || clientData.cityForSearch == "All")
        //              && (x.genderForSearch == clientData.genderForSearch || clientData.genderForSearch == "All")
        //              && x.id != clientData.id
        //            ).OrderBy(x => x.name).Skip(0).Take(12).ToList();

        //            SUsers.Add(db.SiteUsers.FirstOrDefault(x => x.id == clientData.id));

        //            List<ClientUser> userList = new List<ClientUser>();
        //            foreach (SiteUser user in SUsers)
        //            {
        //                userList.Add(new ClientUser(user));
        //            }

        //            if (isNewAva)
        //            {
        //                List<int> id = new List<int>();
        //                for (int i = 0; i < userList.Count; i++)
        //                {
        //                    id.Add(userList[i].id);
        //                }
        //                List<Avatar> avatars = GetAvatars(id.ToArray());
        //                object sendData = new { userList, avatars };
        //                json = JsonConvert.SerializeObject(sendData);
        //            }
        //            else
        //                json = JsonConvert.SerializeObject(userList);
        //        }
        //    }
        //    byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);
        //        await WSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
        //}
        //private async Task  SortByFilter(Filter clientData, WebSocket WSocket, bool isNewAva)// List<ClientUser>
        //{
        //    string json;
        //    if (clientData.getUsersWithId != null)
        //    {
        //        List<ClientUser> userList = new List<ClientUser>();
        //        using (DatingContext db = new DatingContext())
        //        {
        //            for (int i = 0; i < clientData.getUsersWithId.Length; i++)
        //            {
        //                int currentId = clientData.getUsersWithId[i];
        //                userList.Add(new ClientUser(db.SiteUsers.FirstOrDefault(x => x.id == currentId)));
        //            }
        //        }
        //        List<Avatar> avatars = GetAvatars(clientData.getUsersWithId);
        //        object sendData = new { userList, avatars };
        //        json = JsonConvert.SerializeObject(sendData);
        //    }
        //    else
        //    {
        //        int from = 0;
        //        int to = 0;
        //        if (clientData.ageForSearch != "All")
        //        {
        //            from = Convert.ToInt32(clientData.ageForSearch.Split(' ')[0]);
        //            to = Convert.ToInt32(clientData.ageForSearch.Split(' ')[2]);

        //            if (from == 53)
        //                to = 200;
        //        }

        //        if (clientData.nameForSearch == null)
        //            clientData.nameForSearch = "";
        //        using (DatingContext db = new DatingContext())
        //        {
        //            List<SiteUser> SUsers = db.SiteUsers.Where(x =>
        //              ((DateTime.Now.Year - x.birthDay.Year >= from && DateTime.Now.Year - x.birthDay.Year <= to) || clientData.ageForSearch == "All")
        //              && x.name.Contains(clientData.nameForSearch)
        //              && (x.city == clientData.cityForSearch || clientData.cityForSearch == "All")
        //              && (x.genderForSearch == clientData.genderForSearch || clientData.genderForSearch == "All")
        //              && x.id != clientData.id
        //            ).OrderBy(x => x.name).Skip(0).Take(12).ToList();

        //            SUsers.Add(db.SiteUsers.FirstOrDefault(x => x.id == clientData.id));

        //            List<ClientUser> userList = new List<ClientUser>();
        //            foreach (SiteUser user in SUsers)
        //            {
        //                userList.Add(new ClientUser(user));
        //            }

        //            if (isNewAva)
        //            {
        //                List<int> id = new List<int>();
        //                for (int i = 0; i < userList.Count; i++)
        //                {
        //                    id.Add(userList[i].id);
        //                }
        //                List<Avatar> avatars = GetAvatars(id.ToArray());
        //                object sendData = new { userList, avatars };
        //                json = JsonConvert.SerializeObject(sendData);
        //            }
        //            else
        //                json = JsonConvert.SerializeObject(userList);
        //        }
        //    }
        //    byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);
        //        await WSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
        //}
        private async Task GetCurrentUsers(int[] idOfUsers, WebSocket WSocket)// List<ClientUser>
        {
            List<ClientUser> userList = new List<ClientUser>();
            using (DatingContext db = new DatingContext())
            {
                for (int i = 0; i < idOfUsers.Length; i++)
                {
                    int currentId = idOfUsers[i];
                    userList.Add(new ClientUser(db.SiteUsers.FirstOrDefault(x => x.id == currentId)));
                }
            }
            string json = JsonConvert.SerializeObject(userList);
            byte[] cleanBuffer = Encoding.UTF8.GetBytes(json);
            await WSocket.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            Guid wsId = Guid.NewGuid();//Уникальный идентификатор вебсокета через который мы будет обращатся и редактировать массив id для выборки юзеров
            // Получаем сокет клиента из контекста запроса
            var clientSocket = context.WebSocket;
            var buffer = new ArraySegment<byte>(new byte[1024]);
            // Ожидаем данные от него
            var result = await clientSocket.ReceiveAsync(buffer, CancellationToken.None);

            //context.Stores.OrderBy(sort).Skip(skipRows).Take(pageSize).ToList();
            byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых битов, чтобы он не содержал мусор
            string json = Encoding.UTF8.GetString(cleanBuffer);

            //List<int> usersId = new List<int>();
            //if (cleanBuffer.Length > 0)
            //    usersId = JsonConvert.DeserializeObject<List<int>>(json);
            if (cleanBuffer.Length > 0)
                getUserListFor[wsId] = JsonConvert.DeserializeObject<List<int>>(json);
            //Filters.Add(clientFilter);
            //int clientId = clientFilter.id;

            if (clientSocket.State == WebSocketState.Open)
            {
                    //Thread closing = new Thread(async () => await GetNewFilterOrClose(clientSocket, wsId));//, clientId));
                    Thread closing = new Thread(() => GetNewFilterOrClose(clientSocket, wsId));//, clientId));
                closing.Start();
            }

            //bool getFirstAva = true;
            while (clientSocket.State == WebSocketState.Open)
            {
                await GetCurrentUsers(getUserListFor[wsId].ToArray(), clientSocket);
                //getFirstAva = false;
                Thread.Sleep(30000);
            }
            //Filters.RemoveAt(Filters.FindIndex(x => x.id == clientId));

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