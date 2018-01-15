using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
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

        ////GET: api/Galleries
        public object GetCountGalleries()
        {
            List<object> counter = new List<object>();
            List<int> siteUserid = db.Galleries.Select(x => x.siteUserid).Distinct().ToList();
            foreach (int id in siteUserid)
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

            List<Gallery> clientGallery= new List<Gallery>();
            foreach(Gallery img in gallery)
            {
                var imgBase64 = (img.content).Substring((img.content).IndexOf(',') + 1);//конвертим js base64 строку в c# строку (убираем заголовок)
                FileInfo fileInfo = new FileInfo(imgBase64);
                byte[] bytes = new byte[fileInfo.Length];
                using (FileStream fs = fileInfo.OpenRead())
                {
                    fs.Read(bytes, 0, bytes.Length);
                }
                string NewBase64 = "data:image / jpg; base64,"+ Convert.ToBase64String(bytes);//Добавляем к base64 header, который в C# почему-то не генерируется, но необъодимый js для отображения изображению
                img.content = NewBase64;
                clientGallery.Add(img);
            }

            return Ok(clientGallery);
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
            string path = HttpContext.Current.Server.MapPath("~")
                                        + "UserFiles\\Gallery\\"
                                        + db.SiteUsers.FirstOrDefault(x => x.id == siteUserid).email + "\\";


            List<Gallery> usersGalleryFromDB = db.Galleries.Where(x => x.siteUserid == siteUserid).ToList();


            if (gallery[0].content == null)//значит, что всё было удалено и стоит очистить бд
            {
                for (int i = 0; i < usersGalleryFromDB.Count; i++)
                {
                        db.Galleries.Remove(usersGalleryFromDB[i]);
                        File.Delete(usersGalleryFromDB[i].content);
                }
                db.SaveChanges();
                return Ok(gallery);
            }


            for (int i = 0; i < usersGalleryFromDB.Count; i++)
            {

                //Поиск вхождения старых данных в новых(если в новых данныъ нет старых, значит они удаляются из базы)
                if (gallery.Find(x => x.content.Contains(usersGalleryFromDB[i].content)) == null)
                {
                    db.Galleries.Remove(usersGalleryFromDB[i]);
                    File.Delete(usersGalleryFromDB[i].content);
                }
            }

            for (int i=0; i < gallery.Count; i++)
            {
                string content = gallery[i].content;

                if (db.Galleries.Where(x => x.content == content).ToList().Count == 0)
                {

                    if (!Directory.Exists(path))
                        Directory.CreateDirectory(path);
                    var base64 = (gallery[i].content).Substring((gallery[i].content).IndexOf(',') + 1);

                    string fileName = String.Format(@"{0}.jpg", System.Guid.NewGuid());


                    var bytes = Convert.FromBase64String(base64);
                    using (var imageFile = new FileStream(path + fileName, FileMode.Create))
                    {
                        imageFile.Write(bytes, 0, bytes.Length);
                        imageFile.Flush();
                    }
                    gallery[i].content = path + fileName;
                    db.Galleries.Add(gallery[i]);

                }
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