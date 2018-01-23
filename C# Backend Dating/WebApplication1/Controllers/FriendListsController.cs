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
    public class FriendListsController : ApiController
    {
        private DatingContext db = new DatingContext();

        private object SelectionWithId(int[] id, List<FriendList> fullFavoriteList)
        {
            List<ClientUser> userList = new List<ClientUser>();
            using (DatingContext db = new DatingContext())
            {
                for (int i = 0; i < id.Length; i++)
                {
                    int currentId = id[i];
                    userList.Add(new ClientUser(db.SiteUsers.FirstOrDefault(x => x.id == currentId)));
                }
            }
            List<Avatar> avatars = AvatarsController.GetAvatars(id);

            return new { userList, avatars, id, fullFavoriteList };
        }

        // GET: api/FriendLists/5
        [ResponseType(typeof(FriendList))]
        public IHttpActionResult GetFriendList(int id, int page)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<FriendList> fullFavoriteList = db.Friends.Where(x => x.who == id).ToList();

            int startNum = (page-1) * 12;
            List<FriendList> friendList = fullFavoriteList.OrderBy(x => x.id).Skip(startNum).Take(12).ToList();//db.Friends.Where(x => x.who == id).OrderBy(x => x.id).Skip(0).Take(12).ToList();
            if (friendList == null)
            {
                return NotFound();
            }
            List<int> usersId = new List<int>();
            for(int i=0;i< friendList.Count; i++)
            {
                usersId.Add(friendList[i].with);
            }
            
            return Ok(SelectionWithId(usersId.ToArray(), fullFavoriteList));
        }

        
        // POST: api/FriendLists
        [ResponseType(typeof(FriendList))]
        public IHttpActionResult PostFriendList(FriendList friendList)
        {

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