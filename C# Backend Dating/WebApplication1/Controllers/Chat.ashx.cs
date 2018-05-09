using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.WebSockets;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.ModelBinding;
using System.Web.WebSockets;
using WebApplication1.Models;
using System.Web.Script.Serialization;
//using Microsoft.Rtc.Signaling;
//using Microsoft.AspNet.SignalR.Json;
namespace WebApplication1.Controllers
{
    /// <summary>
    /// Сводное описание для Handler1
    /// </summary>
    public class Handler1 : IHttpHandler
    {

        //список диалогов(содержит ассоциативный массив с максимальным размером в 2 элемента - клиента, в этом массиве хранится
        //пользователь отправитель с ключом id переписки и тот кому сообщение отправлялось(если он запустил чат и 
        //является клиентом вебсокета)
        private static readonly Dictionary<int, List<WebSocket>> Dialogs = new Dictionary<int, List<WebSocket>>();

        public void ProcessRequest(HttpContext context)
        {
            //Если запрос является запросом веб сокета
            if (context.IsWebSocketRequest)
                context.AcceptWebSocketRequest(WebSocketRequest);
        }
        private async Task WebSocketRequest(AspNetWebSocketContext context)
        {
            // Получаем сокет клиента из контекста запроса
            var socket = context.WebSocket;
            // Слушаем его
            while (true)
            {
                var buffer = new ArraySegment<byte>(new byte[1024]);
                // Ожидаем данные от него
                var result = await socket.ReceiveAsync(buffer, CancellationToken.None);

                //Десериализуем пришедший массив баййтов в строку json, а далее записываем его в объект Dialog
                //сохраняем  его в базу
                byte[] cleanBuffer = buffer.Array.Where(b => b != 0).ToArray();//Чистим массив от пустых битов, чтобы он не содержал мусор
                string json = Encoding.UTF8.GetString(cleanBuffer);
                Dialog authDate = JsonConvert.DeserializeObject<Dialog>(json);
                authDate.time = DateTime.Now;

                using (DatingContext db = new DatingContext())
                {
                    db.Dialogs.Add(authDate);
                    await db.SaveChangesAsync();
                }


                json = JsonConvert.SerializeObject(authDate);
                cleanBuffer = Encoding.UTF8.GetBytes(json);

                List<WebSocket> dialogClients = new List<WebSocket>();
                if (Dialogs.ContainsKey(authDate.dialogId))//Если в списке диалогов(подключенных клиентов) уже есть клиент, добавляем его(или их)
                {
                    dialogClients = Dialogs[authDate.dialogId];
                }
                {
                    if (!Dialogs.ContainsKey(authDate.dialogId))
                    {
                        dialogClients.Add(socket);
                        Dialogs.Add(authDate.dialogId, dialogClients);

                    }
                    else if (Dialogs[authDate.dialogId].FirstOrDefault(x => x == socket) == null)//Исключаем дублирование сокета 1-го клиента
                    {
                        dialogClients.Add(socket);
                        Dialogs[authDate.dialogId] = dialogClients;
                    }
                }


                for (int i = 0; i < dialogClients.Count(); i++)
                {
                    WebSocket client = dialogClients[i];
                    try
                    {
                        if (client.State == WebSocketState.Open)
                        {
                            await client.SendAsync(new ArraySegment<byte>(cleanBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                    }
                    catch (ObjectDisposedException)
                    {
                        Dialogs[authDate.dialogId].Remove(client);
                        i--;
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