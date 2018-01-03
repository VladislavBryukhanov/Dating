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
    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*", SupportsCredentials = true)]//, SupportsCredentials =true
    public class FriendListsController : ApiController
    {
        private DatingContext db = new DatingContext();


        // GET: api/FriendLists/5
        [ResponseType(typeof(FriendList))]
        public IHttpActionResult GetFriendList(int id)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<FriendList> friendList = db.Friends.Where(x => x.who == id).ToList();
            //FriendList friendList = db.Friends.Find(id);
            if (friendList == null)
            {
                return NotFound();
            }

            return Ok(friendList);
        }

        
        // POST: api/FriendLists
        [ResponseType(typeof(FriendList))]
        public IHttpActionResult PostFriendList(FriendList friendList)
        {
            //CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            //if (cookie != null)
            //{
            //   string sessionId = cookie["UserSession"].Value;
            //}

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            FriendList WillReturn;
            FriendList friend = db.Friends.FirstOrDefault(x => x.who == friendList.who &&
                                                             x.with == friendList.with);
            if(friend != null)
            {
                db.Friends.Remove(friend);
                WillReturn = friend;
            }
            else
            {
                db.Friends.Add(friendList);
                WillReturn = friendList;

            }

            db.SaveChanges();

                return CreatedAtRoute("DefaultApi", new { id = WillReturn.id }, WillReturn);
        }
        // DELETE: api/FriendLists/5
        [ResponseType(typeof(FriendList))]
        public IHttpActionResult DeleteFriendList(int id)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            FriendList friendList = db.Friends.Find(id);
            if (friendList == null)
            {
                return NotFound();
            }

            db.Friends.Remove(friendList);
            db.SaveChanges();

            return Ok(friendList);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FriendListExists(int id)
        {
            return db.Friends.Count(e => e.id == id) > 0;
        }
    }
}