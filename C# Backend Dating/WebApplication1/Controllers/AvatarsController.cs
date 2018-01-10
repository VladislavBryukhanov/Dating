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
    public class AvatarsController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/Avatars
        public IQueryable<Avatar> GetAvatars()
        {
            return db.Avatars;
        }

        // GET: api/Avatars/5
        [ResponseType(typeof(Avatar))]
        public IHttpActionResult GetAvatar(int id)
        {
            Avatar avatar = db.Avatars.Find(id);
            if (avatar == null)
            {
                return NotFound();
            }

            return Ok(avatar);
        }

        // PUT: api/Avatars/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutAvatar([FromBody]int siteUserId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, siteUserId, "Moder"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                              x.confirmState == "PrevAva");
            if (oldAvatar != null)
                db.Avatars.Remove(oldAvatar);

            Avatar NewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                               x.confirmState == "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар
            NewAva.confirmState = "Confirmed";
            db.Entry(NewAva).State = EntityState.Modified;
            db.SaveChanges();

            return Ok(NewAva);
        }

        // POST: api/Avatars
        [ResponseType(typeof(Avatar))]
        public IHttpActionResult PostAvatar(Avatar avatar)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, avatar.siteUserId, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            Avatar prevNewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == avatar.siteUserId &&
                                                               x.confirmState== "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар
            if (prevNewAva != null)
            {
                db.Avatars.Remove(prevNewAva);
            }


            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == avatar.siteUserId &&
                                                              x.confirmState == "Confirmed");//Меняем состояние старой аватарки
            if(oldAvatar!=null)
            {
                oldAvatar.confirmState = "PrevAva";
                db.Entry(oldAvatar).State = EntityState.Modified;
            }


            avatar.dateOfChange = DateTime.Now;
            avatar.confirmState = "Waiting";//

            db.Avatars.Add(avatar);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = avatar.id }, avatar);
        }

        // DELETE: api/Avatars/5
        [ResponseType(typeof(Avatar))]
        public IHttpActionResult DeleteAvatar([FromBody]int siteUserId)
        {

            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                              x.confirmState == "PrevAva");//Меняем состояние старой аватарки
            if (oldAvatar != null)
            {
                oldAvatar.confirmState = "Confirmed";
                db.Entry(oldAvatar).State = EntityState.Modified;
            }

            Avatar NewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                               x.confirmState == "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар
            if (NewAva != null)
                db.Avatars.Remove(NewAva);

            db.SaveChanges();

            return Ok(oldAvatar);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AvatarExists(int id)
        {
            return db.Avatars.Count(e => e.id == id) > 0;
        }
    }
}