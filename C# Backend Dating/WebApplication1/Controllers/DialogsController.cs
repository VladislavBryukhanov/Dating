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


        // GET: api/Dialogs/5
        [ResponseType(typeof(Dialog))]
        public IHttpActionResult GetDialog(int id)
        {
 

            List<Dialog> GetAllMsg = db.Dialogs.Where(x => x.dialogId == id).ToList();
            if (GetAllMsg.Count == 0)
            {
                return NotFound();
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, GetAllMsg[0].to, "User") && !CheckAccess.IsAccess(cookie, GetAllMsg[0].from, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            return Ok(GetAllMsg);
        }


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


                msg.dialogId = dl.id;
                msg.time = DateTime.Now;
                msg.to = to;
                msg.from = mm.from;
                msg.content = mm.content;
                msg.content = mm.content;
                db.Dialogs.Add(msg);
                db.SaveChanges();

            }
            List<DialogList> GetAllMsg = db.DialogLists.Where(x => x.firstUserId == mm.from || x.secondUserId== mm.from).ToList();
            return Ok(GetAllMsg);
        }


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

    }
}