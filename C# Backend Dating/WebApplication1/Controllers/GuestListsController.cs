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
    public class GuestListsController : ApiController
    {
        private DatingContext db = new DatingContext();
        public static int guestExpire = 1;


        // GET: api/GuestLists/5
        [ResponseType(typeof(GuestList))]
        public IHttpActionResult GetGuestList(int id, int page)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));


            int startNum = (page-1) * 12;
            List<GuestList> guestList = db.Guests.Where(x => x.to == id).OrderBy(x => x.id).Skip(startNum).Take(12).ToList();
            if (guestList == null)
            {
                return NotFound();
            }

            List<int> usersId = new List<int>();
            for (int i = 0; i < guestList.Count; i++)
            {
                usersId.Add(guestList[i].who);
            }

            return Ok(LikeListsController.SelectionWithId(usersId.ToArray()));
        }

        [ResponseType(typeof(GuestList))]
        public IHttpActionResult GetGuestList(int id)
        {
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, id, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<GuestList> guests = db.Guests.Where(x => x.to == id).ToList();

            return Ok(guests.ToArray());
        }


        // POST: api/GuestLists
        //[ResponseType(typeof(GuestList))]
        //public IHttpActionResult PostGuestList(GuestList newGuest)
        //{
        //    newGuest.lastVisit = DateTime.Now;
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
        //    if (!CheckAccess.IsAccess(cookie, newGuest.who, "User") && !CheckAccess.IsAccess(cookie, newGuest.to, "User"))
        //        return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

        //    GuestList guest = db.Guests.FirstOrDefault(x => x.who == newGuest.who &&
        //                                                    x.to == newGuest.to);
        //    if(guest==null)
        //    {
        //        newGuest.count = 1;
        //        db.Guests.Add(newGuest);
        //    }
        //    else if((newGuest.lastVisit-guest.lastVisit).Minutes>= guestExpire)
        //    {
        //        guest.count++;
        //        guest.lastVisit = DateTime.Now;
        //        db.Entry(guest).State = EntityState.Modified;
        //    }

        //    db.SaveChanges();

        //    return Ok(newGuest);
        //    }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GuestListExists(int id)
        {
            return db.Guests.Count(e => e.id == id) > 0;
        }
    }
}