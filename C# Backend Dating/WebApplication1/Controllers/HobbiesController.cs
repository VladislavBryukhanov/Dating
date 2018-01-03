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

        // GET: api/Hobbies/5
        [ResponseType(typeof(Hobby))]
        public IHttpActionResult GetHobby(int id)
        {
            Hobby hobby = db.Hobbies.FirstOrDefault(x=>x.siteUserid == id);
            //Hobby hobby = db.Hobbies.FirstOrDefault((x) => x.id == id);

            if (hobby == null)
            {
                return NotFound();
            }

            return Ok(hobby);
        }

        // PUT: api/Hobbies/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutHobby(Hobby hobby)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, hobby.siteUserid, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            db.Entry(hobby).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HobbyExists(hobby.id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

      

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
            return db.Hobbies.Count(e => e.id == id) > 0;
        }
    }
}