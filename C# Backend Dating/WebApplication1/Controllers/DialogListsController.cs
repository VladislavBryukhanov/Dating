using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using WebApplication1.Models;
using WebApplication1.Security;

namespace WebApplication1.Controllers
{
    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*", SupportsCredentials = true)]
    public class DialogListsController : ApiController
    {
        private DatingContext db = new DatingContext();


        //// GET: api/DialogLists/5
        [ResponseType(typeof(DialogList))]
        public IHttpActionResult GetDialogList(int id)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            /*
                        List<Dialog> dialogList = db.Dialogs.Where(x => x.from == id || x.to == id).Distinct().ToList();
            if (dialogList == null)
            {
                return NotFound();
            }
            List<int> usersId = new List<int>();
            for (int i = 0; i < dialogList.Count; i++)
            {
                int userId;
                if (dialogList[i].to != id && !usersId.Contains(dialogList[i].to) && !usersId.Contains(dialogList[i].from))
                    userId = dialogList[i].to;
                else
                    userId = dialogList[i].from;

                usersId.Add(userId);
            }
            */
            List<DialogList> dialogList = db.DialogLists.Where(x => x.firstUserId == id || x.secondUserId == id).ToList();
            if (dialogList == null)
            {
                return NotFound();
            }

            List<int> usersId = new List<int>();
            for (int i = 0; i < dialogList.Count; i++)
            {
                int userId;
                if (dialogList[i].firstUserId != id && !usersId.Contains(dialogList[i].firstUserId) && !usersId.Contains(dialogList[i].secondUserId))
                    userId = dialogList[i].firstUserId;
                else
                    userId = dialogList[i].secondUserId;

                usersId.Add(userId);
            }

            return Ok(LikeListsController.SelectionWithId(usersId.ToArray()));
        }


        // POST: api/DialogLists
        [ResponseType(typeof(DialogList))]
        public IHttpActionResult PostDialogList(DialogList dialogList)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, dialogList.firstUserId, "User") && !CheckAccess.IsAccess(cookie, dialogList.secondUserId, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            if (db.DialogLists.FirstOrDefault(x => x.firstUserId == dialogList.firstUserId &&
                                                   x.secondUserId == dialogList.secondUserId) == null)//создаем новый диалог в списке если до этого он не был создан
            {
                db.DialogLists.Add(dialogList);
                db.SaveChanges();
            }
            else
                return BadRequest(ModelState);

            return CreatedAtRoute("DefaultApi", new { id = dialogList.id }, dialogList);
        }

        // DELETE: api/DialogLists/5
        [ResponseType(typeof(DialogList))]
        public IHttpActionResult DeleteDialogList([FromBody]int[] id)
        {

            List<DialogList> removeDialogLists=new List<DialogList>();
            //List<Dialog> removeDialogs = new List<Dialog>();
            for (int i = 0; i < id.Length; i++)
            {
                int currentId = id[i];
                removeDialogLists.Add(db.DialogLists.FirstOrDefault(x => x.id == currentId));
                //removeDialogs.Add(db.Dialogs.FirstOrDefault(x => x.dialogid == currentId ));
            }


            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, removeDialogLists[0].firstUserId, "User") && !CheckAccess.IsAccess(cookie, removeDialogLists[0].secondUserId, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            if (removeDialogLists.Count == 0)// || removeDialogs.Count == 0)
            {
                return NotFound();
            }
            if (removeDialogLists.Count == 1)// && removeDialogs.Count == 1)
            {
                db.DialogLists.Remove(removeDialogLists[0]);
                //db.Dialogs.Remove(removeDialogs[0]);
            }
            else
            {
                db.DialogLists.RemoveRange(removeDialogLists);
                //db.Dialogs.RemoveRange(removeDialogs);
            }


            db.SaveChanges();

            return Ok("Success");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DialogListExists(int id)
        {
            return db.DialogLists.Count(e => e.id == id) > 0;
        }
    }
}
 