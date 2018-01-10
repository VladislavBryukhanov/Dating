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
    public class LikeListsController : ApiController
    {
        private DatingContext db = new DatingContext();


        // GET: api/LikeLists/5
        [ResponseType(typeof(LikeList))]
        public IHttpActionResult GetLikeList(int id)
         {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<LikeList> likeList = db.LikeList.Where(x => x.from == id ||
                                                             x.to == id).ToList();
            if (likeList == null)
            {
                return NotFound();
            }

            return Ok(likeList);
        }

     

        // POST: api/LikeLists
        [ResponseType(typeof(LikeList))]
        public IHttpActionResult PostLikeList(LikeList likeList)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            LikeList WillReturn;
            LikeList like = db.LikeList.FirstOrDefault(x => x.from == likeList.from &&
                                                            x.to == likeList.to);


            if (like != null)
            {
                db.LikeList.Remove(like);
                WillReturn = like;
            }
            else
            {
                db.LikeList.Add(likeList);
                WillReturn = likeList;
            }

            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = WillReturn.id }, WillReturn);
        }

        

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool LikeListExists(int id)
        {
            return db.LikeList.Count(e => e.id == id) > 0;
        }
    }
}