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
    public class GalleriesController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/Galleries
        //public IQueryable<Gallery> GetGalleries()
        //{
        //    return db.Galleries;
        //}

        // GET: api/Galleries/5
        [ResponseType(typeof(Gallery))]
        public IHttpActionResult GetGallery(int id)
        {
            List<Gallery> gallery = db.Galleries.Where(x => x.siteUserid == id).ToList();

            //var dataset = db.Galleries
            //                        .Where(x => x.SiteUserid == id);
            if (gallery.Count == 0)
            {
                return NotFound();
            }

            return Ok(gallery);
        }

        // PUT: api/Galleries/5
        //[ResponseType(typeof(void))]
        //public IHttpActionResult PutGallery(int id, Gallery gallery)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != gallery.id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(gallery).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!GalleryExists(id))
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

        // POST: api/Galleries
        [ResponseType(typeof(Gallery))]
        public IHttpActionResult PostGallery(List<Gallery> gallery)
        {
            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(ModelState); //модель невалидна т к приходит null в качестве id
            //}
            if (gallery.Count == 0)
                return NotFound();

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, gallery[0].siteUserid, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            int siteUserid = gallery[0].siteUserid;//gallery[0].siteUserid -все siteUserid в массиве одинаковы, т к это галлерея 1 пользователся
            List<Gallery> usersGalleryFromDB = db.Galleries.Where(x => x.siteUserid == siteUserid).ToList();


            if (gallery[0].content == null)//значит, что всё было удалено и стоит очистить бд
            {
                for (int i = 0; i < usersGalleryFromDB.Count; i++)
                {
                        db.Galleries.Remove(usersGalleryFromDB[i]);
                }
                db.SaveChanges();
                return Ok(gallery);
            }


            for (int i = 0; i < usersGalleryFromDB.Count; i++)
            {
                //for (int j = 0; j < gallery.Count; j++)
                //gallery[j].content.Contains(usersGalleryFromDB[i].content);
                //var test = gallery.Find(x => x.content.Contains(usersGalleryFromDB[i].content));

                //Поиск вхождения старых данных в новых(если в новых данныъ нет старых, значит они удаляются из базы)
                if (gallery.Find(x => x.content.Contains(usersGalleryFromDB[i].content)) == null)
                    //gallery.Contains(usersGalleryFromDB[j].content);
                    //if (gallery.IndexOf(usersGalleryFromDB[j],0)==-1)
                    db.Galleries.Remove(usersGalleryFromDB[i]);
            }

            //List<Gallery> gallery = db.Galleries.Where(x => x.siteUserid == id).ToList();
            //List<Gallery> tmp = db.Galleries.Where(x => x.id != gallery[0].id &&
            //                              x.content != gallery[0].content).ToList();
            for (int i=0; i < gallery.Count; i++)
            {
                string content = gallery[i].content;

                //var test = db.Galleries.Where(x => x.id == id &&
                //                          x.content == content).ToList();

                if (db.Galleries.Where(x => x.content == content).ToList().Count == 0) 
                db.Galleries.Add(gallery[i]);
            }
            db.SaveChanges();

            //return CreatedAtRoute("DefaultApi", new { id = gallery.id }, gallery);
            return Ok(gallery);
        }

        // DELETE: api/Galleries/5
        //[ResponseType(typeof(Gallery))]
        //public IHttpActionResult DeleteGallery(int id)
        //{
        //    Gallery gallery = db.Galleries.Find(id);
        //    if (gallery == null)
        //    {
        //        return NotFound();
        //    }

        //    db.Galleries.Remove(gallery);
        //    db.SaveChanges();

        //    return Ok(gallery);
        //}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GalleryExists(int id)
        {
            return db.Galleries.Count(e => e.id == id) > 0;
        }
    }
}