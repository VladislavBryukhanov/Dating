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
    public class GalleriesController : ApiController
    {
        private DatingContext db = new DatingContext();

        //GET: api/Galleries
        public object GetCountGalleries()
        {
            List<object> counter=new List<object>();
            List<int> siteUserid = db.Galleries.Select(x=>x.siteUserid).Distinct().ToList();
            foreach(int id in siteUserid)
            {
                int count = db.Galleries.Count(x => x.siteUserid == id);
                counter.Add(new { id, count });
            }
            return counter.ToArray();
        }

        // GET: api/Galleries/5
        [ResponseType(typeof(Gallery))]
        public IHttpActionResult GetGallery(int id)
        {
            List<Gallery> gallery = db.Galleries.Where(x => x.siteUserid == id).ToList();

            if (gallery.Count == 0)
            {
                return NotFound();
            }

            return Ok(gallery);
        }


        // POST: api/Galleries
        [ResponseType(typeof(Gallery))]
        public IHttpActionResult PostGallery(List<Gallery> gallery)
        {
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

                //Поиск вхождения старых данных в новых(если в новых данныъ нет старых, значит они удаляются из базы)
                if (gallery.Find(x => x.content.Contains(usersGalleryFromDB[i].content)) == null)
                    db.Galleries.Remove(usersGalleryFromDB[i]);
            }

            for (int i=0; i < gallery.Count; i++)
            {
                string content = gallery[i].content;

                if (db.Galleries.Where(x => x.content == content).ToList().Count == 0) 
                db.Galleries.Add(gallery[i]);
            }
            db.SaveChanges();

            return Ok(gallery);
        }


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