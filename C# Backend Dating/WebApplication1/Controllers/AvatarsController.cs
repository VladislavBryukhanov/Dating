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
using System.Reflection;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using WebApplication1.Models;
using WebApplication1.Security;

namespace WebApplication1.Controllers
{
    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*", SupportsCredentials = true)]
    public class AvatarsController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/Avatars
        public IHttpActionResult GetAvatars()
        {

            List<Avatar> avatars= new List<Avatar>();
            foreach(Avatar avatar in db.Avatars)
            {
                var AvatarBase64 = (avatar.base64).Substring((avatar.base64).IndexOf(',') + 1);//конвертим js base64 строку в c# строку (убираем заголовок)
                FileInfo fileInfo = new FileInfo(AvatarBase64);
                byte[] bytes = new byte[fileInfo.Length];
                using (FileStream fs = fileInfo.OpenRead())
                {
                    fs.Read(bytes, 0, bytes.Length);
                }
                string NewBase64 = "data:image / jpg; base64,"+ Convert.ToBase64String(bytes);//Добавляем к base64 header, который в C# почему-то не генерируется, но необъодимый js для отображения изображению
                avatar.base64 = NewBase64;
                avatars.Add(avatar);
            }

            return Ok(avatars);
        }

        // GET: api/Avatars/5
        //[ResponseType(typeof(Avatar))]
        //public IHttpActionResult GetAvatar(int id)
        //{
        //    Avatar avatar = db.Avatars.Find(id);
        //    if (avatar == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(avatar);
        //}

        // PUT: api/Avatars/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutAvatar([FromBody]int siteUserId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, siteUserId, "Moder"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                              x.confirmState == "PrevAva");
            if (oldAvatar != null)
            {
                db.Avatars.Remove(oldAvatar);
                File.Delete(oldAvatar.base64);
            }

            Avatar NewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                               x.confirmState == "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар

            //FileInfo fileInfo = new FileInfo(NewAva.base64);
            //System.IO.File.Move(fileInfo.FullName, fileInfo.DirectoryName + "//Confirmed.jpg");

            NewAva.confirmState = "Confirmed";
            db.Entry(NewAva).State = EntityState.Modified;
            db.SaveChanges();

            return Ok(NewAva);
        }

        // POST: api/Avatars
        [ResponseType(typeof(Avatar))]
        public IHttpActionResult PostAvatar(Avatar avatar)
        {
            string uniqueName = "Ava";//Если у юзера уже была автарака, то новая ава будет называться так, для избежания конфликта имен
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, avatar.siteUserId, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            Avatar prevNewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == avatar.siteUserId &&
                                                               x.confirmState== "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар
            if (prevNewAva != null)
            {
                db.Avatars.Remove(prevNewAva);
                File.Delete(prevNewAva.base64);
            }


            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == avatar.siteUserId &&
                                                              x.confirmState == "Confirmed");//Меняем состояние старой аватарки
            if(oldAvatar!=null)
            {
                oldAvatar.confirmState = "PrevAva";
                db.Entry(oldAvatar).State = EntityState.Modified;
                uniqueName = "Ava"+ oldAvatar.id;
            }

            string path = HttpContext.Current.Server.MapPath("~") 
                                                + "UserFiles\\Avatars\\"
                                                + db.SiteUsers.FirstOrDefault(x => x.id == avatar.siteUserId).email+"\\";

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);


            var base64 = (avatar.base64).Substring((avatar.base64).IndexOf(',') + 1);//Удаляем хэдер, сгенерированный js т к в c# он не воспринимается, как часть base64 строки и нельзя будет с ней  работать
            path += uniqueName + ".jpg";

            var bytes = Convert.FromBase64String(base64);
            using (var imageFile = new FileStream(path, FileMode.Create))
            {
                imageFile.Write(bytes, 0, bytes.Length);
                imageFile.Flush();
            }


            avatar.dateOfChange = DateTime.Now;
            avatar.confirmState = "Waiting";
            avatar.base64 = path;

            db.Avatars.Add(avatar);
            db.SaveChanges();

            avatar.base64 = "data:image / jpg; base64," + base64;//Для того, чтобы вернуть на фронт новый автара, а не бесполезный(для клиента) путь К файлу на сервере
            return CreatedAtRoute("DefaultApi", new { id = avatar.id }, avatar);
        }

        // DELETE: api/Avatars/5
        [ResponseType(typeof(Avatar))]
        public IHttpActionResult DeleteAvatar([FromBody]int siteUserId)
        {

            Avatar oldAvatar = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                              x.confirmState == "PrevAva");//Меняем состояние старой аватарки
            if (oldAvatar != null)
            {
                //FileInfo fileInfo = new FileInfo(oldAvatar.base64);
                //System.IO.File.Move(fileInfo.FullName, fileInfo.DirectoryName + "//Confirmed.jpg");
                oldAvatar.confirmState = "Confirmed";
                db.Entry(oldAvatar).State = EntityState.Modified;
            }

            Avatar NewAva = db.Avatars.FirstOrDefault(x => x.siteUserId == siteUserId &&
                                                               x.confirmState == "Waiting");//Если пользователь изменил мнение и решил изменить отправленный, но еще не подтвержденный аватар
            if (NewAva != null)
            {
                File.Delete(NewAva.base64);
                db.Avatars.Remove(NewAva);

            }

            db.SaveChanges();

            return Ok(oldAvatar);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AvatarExists(int id)
        {
            return db.Avatars.Count(e => e.id == id) > 0;
        }
    }
}