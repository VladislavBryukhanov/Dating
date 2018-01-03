using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using System.Web.WebSockets;
using WebApplication1.Models;
using WebApplication1.Security;

namespace WebApplication1.Controllers
{

    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*", SupportsCredentials = true)]
    public class DialogsController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/DialogLists
        //public IQueryable<Dialog> GetDialog()
        //{
        //    return db.Dialogs;
        //}

        // GET: api/Dialogs/5
        [ResponseType(typeof(Dialog))]
        public IHttpActionResult GetDialog(int id)
        {
 

            List<Dialog> GetAllMsg = db.Dialogs.Where(x => x.dialogid == id).ToList();
            if (GetAllMsg.Count == 0)
            {
                return NotFound();
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, GetAllMsg[0].to, "User") && !CheckAccess.IsAccess(cookie, GetAllMsg[0].from, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            return Ok(GetAllMsg);
        }

        //// PUT: api/Dialogs/5
        //[ResponseType(typeof(void))]
        //public IHttpActionResult PutDialog(int id, Dialog dialog)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != dialog.id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(dialog).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!DialogExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return StatusCode(HttpStatusCode.NoContent);
        //}

        // POST: api/Dialogs
        [ResponseType(typeof(Dialog))]//Массовая рассылка для админа, юзеры отсылают сообщения через веб сокеты
        public IHttpActionResult PostDialog([FromBody]MassMessages mm)//[FromBody]int[] to, [FromBody]string msg, [FromBody]int who)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Dialog msg = new Dialog();
            DialogList dl = new DialogList();
            foreach (int to in mm.to)
            {
                dl = db.DialogLists.FirstOrDefault(x => x.firstUserId == mm.from && x.secondUserId == to);
                if (dl == null)//создаем новый диалог в списке если до этого он не был создан
                {
                    dl = new DialogList();
                    dl.firstUserId = mm.from;
                    dl.secondUserId = to;
                    db.DialogLists.Add(dl);
                    db.SaveChanges();
                }


                msg.dialogid = dl.id;
                msg.time = DateTime.Now;
                msg.to = to;
                msg.from = mm.from;
                msg.content = mm.content;
                msg.content = mm.content;
                db.Dialogs.Add(msg);
                db.SaveChanges();

            }

            //foreach(Dialog d in dialog)
            //{
            //    d.time = DateTime.Now; 
            //    db.Dialogs.Add(d);
            //}
            //db.SaveChanges();
            List<DialogList> GetAllMsg = db.DialogLists.Where(x => x.firstUserId == mm.from || x.secondUserId== mm.from).ToList();
            return Ok(GetAllMsg);
        }

        //[ResponseType(typeof(Dialog))]
        //public IHttpActionResult PostDialog(Dialog dialog)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    dialog.time = DateTime.Now;
        //    db.Dialogs.Add(dialog);
        //    db.SaveChanges();

        //    return CreatedAtRoute("DefaultApi", new { id = dialog.id }, dialog);
        //}


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DialogExists(int id)
        {
            return db.Dialogs.Count(e => e.id == id) > 0;
        }

        //________________________________________________
/*
        private static readonly List<WebSocket> Clients = new List<WebSocket>();

        // Блокировка для обеспечения потокабезопасности
        private static readonly ReaderWriterLockSlim Locker = new ReaderWriterLockSlim();

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

            // Добавляем его в список клиентов
            Locker.EnterWriteLock();
            try
            {
                Clients.Add(socket);
            }
            finally
            {
                Locker.ExitWriteLock();
            }

            // Слушаем его
            while (true)
            {
                var buffer = new ArraySegment<byte>(new byte[1024]);

                // Ожидаем данные от него
                var result = await socket.ReceiveAsync(buffer, CancellationToken.None);


                //Передаём сообщение всем клиентам
                for (int i = 0; i < Clients.Count; i++)
                {

                    WebSocket client = Clients[i];

                    try
                    {
                        if (client.State == WebSocketState.Open)
                        {
                            await client.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                        }
                    }

                    catch (ObjectDisposedException)
                    {
                        Locker.EnterWriteLock();
                        try
                        {
                            Clients.Remove(client);
                            i--;
                        }
                        finally
                        {
                            Locker.ExitWriteLock();
                        }
                    }
                }

            }
        }
        */
        //___
    }
}