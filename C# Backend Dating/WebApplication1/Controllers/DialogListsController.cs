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

        // GET: api/DialogLists
        //public IQueryable<DialogList> GetDialogLists()
        //{
        //    return db.DialogLists;
        //}

        // GET: api/DialogLists/5
        [ResponseType(typeof(DialogList))]
        public IHttpActionResult GetDialogList(int id)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<DialogList> dialogList = db.DialogLists.Where(x=>x.firstUserId==id || x.secondUserId==id).ToList();
            if (dialogList == null)
            {
                return NotFound();
            }

            return Ok(dialogList);
        }

        //// PUT: api/DialogLists/5
        //[ResponseType(typeof(void))]
        //public IHttpActionResult PutDialogList(int id, DialogList dialogList)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != dialogList.id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(dialogList).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!DialogListExists(id))
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

        //// DELETE: api/DialogLists/5
        //[ResponseType(typeof(DialogList))]
        //public IHttpActionResult DeleteDialogList(int id)
        //{
        //    DialogList dialogList = db.DialogLists.Find(id);
        //    if (dialogList == null)
        //    {
        //        return NotFound();
        //    }

        //    db.DialogLists.Remove(dialogList);
        //    db.SaveChanges();

        //    return Ok(dialogList);
        //}

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