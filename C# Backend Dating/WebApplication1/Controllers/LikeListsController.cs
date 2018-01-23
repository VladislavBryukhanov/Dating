﻿using System;
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

        public static object SelectionWithId(int[] id)
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

            return new { userList, avatars, id };
        }

        // GET: api/LikeLists/5
        [ResponseType(typeof(LikeList))]
        public IHttpActionResult GetLikeList(int id, int page)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            int startNum = (page-1) * 12;
            List<LikeList> likeList = db.LikeList.Where(x => x.from == id ||
                                                             x.to == id).OrderBy(x => x.id).Skip(startNum).Take(12).ToList();
            if (likeList == null)
            {
                return NotFound();
            }
            List<int> usersId = new List<int>();
            for (int i = 0; i < likeList.Count; i++)
            {
                int userId;
                if (likeList[i].from != id && !usersId.Contains(likeList[i].from) && !usersId.Contains(likeList[i].to))
                    userId = likeList[i].from;
                else
                    userId = likeList[i].to;

                usersId.Add(userId);
            }

            return Ok(SelectionWithId(usersId.ToArray()));
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