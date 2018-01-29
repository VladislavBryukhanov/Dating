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
    public class HobbiesController : ApiController
    {
        private DatingContext db = new DatingContext();

        //// GET: api/Hobbies/5
        //[ResponseType(typeof(Hobby))]
        //public IHttpActionResult GetHobby(int id)
        //{
        //    Hobby hobby = db.Hobbies.FirstOrDefault(x=>x.siteUserid == id);

        //    if (hobby == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(hobby);
        //}
        // GET: api/Hobbies/5
        [ResponseType(typeof(Hobby))]
        public IHttpActionResult GetHobby()
        {
            return Ok(db.HobbiesList);
        }
        [ResponseType(typeof(Hobby))]
        public IHttpActionResult GetHobby(int id)
        {
            //Hobby hobby = db.Hobbies.FirstOrDefault(x => x.siteUserid == id); 
            List<HobbyList> hobbiesOfUser=new List<HobbyList>();
            List<HobbyOfUser> hobbies = db.HobbyOfUsers.Where(x => x.siteUserid == id).ToList();
            foreach(HobbyOfUser hobby in hobbies)
            {
                int hobbyId= hobby.hobbyid;
                hobbiesOfUser.Add(db.HobbiesList.FirstOrDefault(x => x.id == hobbyId));
            }

            if (hobbies.Count == 0)
            {
                return NotFound();
            }

            return Ok(hobbiesOfUser);
        }

        // PUT: api/Hobbies/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutHobby(List<HobbyOfUser> hobby)//Hobby hobby)
        {
            if (hobby.Count==0)
            {
                return BadRequest();
            }
            int userId = hobby[0].siteUserid;
            if (hobby.FirstOrDefault(x=>x.siteUserid!= hobby[0].siteUserid) !=null){
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, userId, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<HobbyOfUser> oldUserHobbies = db.HobbyOfUsers.Where(x => x.siteUserid == userId).ToList();
            foreach(HobbyOfUser oneHobby in oldUserHobbies)
            {
                int oldHobbyId=oneHobby.hobbyid;
                if (hobby.FirstOrDefault(x=>x.hobbyid== oldHobbyId)== null)
                    db.HobbyOfUsers.Remove(oneHobby);
            }

            foreach (HobbyOfUser oneHobby in hobby)
            {
                int newHobbyId = oneHobby.hobbyid;
                if (oldUserHobbies.FirstOrDefault(x => x.hobbyid == newHobbyId) == null)
                    db.HobbyOfUsers.Add(oneHobby);
            }

            //db.Entry(hobby).State = EntityState.Modified;

            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }


        // POST: api/Hobbies/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PostHobby(HobbyList hobby)//Hobby hobby)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, 0, "Admin"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            db.HobbiesList.Add(hobby);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = hobby.id }, hobby);
        }

        // DELETE: api/Hobbies/5
        [ResponseType(typeof(void))]
        public IHttpActionResult DeleteHobby([FromBody]int id)//Hobby hobby)
        {
            if (id==0)
            {
                return BadRequest();
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, 0, "Admin"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            HobbyList hobby = db.HobbiesList.FirstOrDefault(x => x.id == id);
            db.HobbiesList.Remove(hobby);
            db.SaveChanges();

            return Ok();
        }
        //// PUT: api/Hobbies/5
        //[ResponseType(typeof(void))]
        //public IHttpActionResult PutHobby(Hobby hobby)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
        //    if (!CheckAccess.IsAccess(cookie, hobby.siteUserid, "User"))
        //        return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

        //    db.Entry(hobby).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!HobbyExists(hobby.id))
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



        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool HobbyExists(int id)
        {
            return db.HobbyOfUsers.Count(e => e.id == id) > 0;
        }
    }
}