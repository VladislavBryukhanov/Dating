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
    public class SiteUsersController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/SiteUsers
        //[CustomAuthorization(1,"User")]
        public object GetSiteUsers()//IQueryable<SiteUser>
        {
            //if (AuthentificController.GetAccess() != "Access denied!")


            ////удаляем конфиденциальную информ, такую как пароль и id сессии
            //return db.SiteUsers.Select(x => new {
            //    x.id,
            //    x.avatar,
            //    x.name,
            //    x.email,
            //    x.birthDay,
            //    x.gender,
            //    x.city,
            //    x.weight,
            //    x.height,
            //    x.education,
            //    x.welcome,
            //    x.genderForSearch,
            //    x.ageForSearch,
            //    x.cityForSearch,
            //    x.roleId,
            //    x.online,
            //    x.dateOfEdit
            //});
            //dynamic dbUser= db.SiteUsers.Select(x => new
            //{
            //    x.id,
            //    x.name,
            //    x.email,
            //    x.birthDay,
            //    x.gender,
            //    x.city,
            //    x.weight,
            //    x.height,
            //    x.education,
            //    x.welcome,
            //    x.genderForSearch,
            //    x.ageForSearch,
            //    x.cityForSearch,
            //    x.roleId,
            //    x.online,
            //    x.dateOfEdit
            //}).ToList();

            /*
            //List<dynamic> UserList =new List<dynamic>();
            List<ClientUser> UserList = new List<ClientUser>();
            ClientUser tmpCU;
            string avatarBase64;
            Avatar avatar;
            foreach(SiteUser user in db.SiteUsers)
            {
                tmpCU = new ClientUser(user);

                avatar = db.Avatars.FirstOrDefault(x => x.siteUserId == tmpCU.id);
                if (avatar != null)//Если у данного пользователя была ава, иначе ава по умолчанию
                    avatarBase64 = avatar.base64;
                else
                    //avatarBase64 = db.Avatars.FirstOrDefault(x => x.siteUserId == 0).base64;//Это изображение по умолчанию, оно есть в базе с момента ее создания
                    avatarBase64 = "empty";

                tmpCU.roleName= avatarBase64 = db.Roles.FirstOrDefault(x => x.id == tmpCU.id).roleName;


                tmpCU.avatarBase64 = avatarBase64;
                UserList.Add(tmpCU);

            }*/
            //UserList.Add(new ClientUser(dbUser[0]));
            //int id;
            //Avatar ava;
            //string avatar;
            //foreach (dynamic user in dbUser)
            //{
            //    id = user.id;
            //    ava = db.Avatars.FirstOrDefault(x => x.siteUserId == id);
            //    if (ava != null)
            //        avatar = ava.base64;
            //    else
            //        avatar = db.Avatars.FirstOrDefault(x => x.siteUserId == 0).base64;//Это изображение по умолчанию, оно есть в базе с момента ее создания
            //    user.avatar = avatar;
            //    UserList.Add(user);
            //}
            //return UserList;
            List<ClientUser> users=new List<ClientUser>();
            foreach(SiteUser user in db.SiteUsers)
            {
                users.Add(new ClientUser(user));
            }
            return users;
            //return db.SiteUsers;
        }

        // GET: api/SiteUsers/5
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult GetSiteUser(int id)
        {
            SiteUser siteUser = db.SiteUsers.Find(id);
            if (siteUser == null)
            {
                return NotFound();
            }
            //удаляем конфиденциальную информ, такую как пароль и id сессии
            //object safeDate=new
            //    {
            //    siteUser.id,
            //    siteUser.avatar,
            //    siteUser.name,
            //    siteUser.email,
            //    siteUser.birthDay,
            //    siteUser.gender,
            //    siteUser.city,
            //    siteUser.weight,
            //    siteUser.height,
            //    siteUser.education,
            //    siteUser.welcome,
            //    siteUser.genderForSearch,
            //    siteUser.ageForSearch,
            //    siteUser.cityForSearch,
            //    siteUser.roleId,
            //    siteUser.online,
            //    siteUser.dateOfEdit
            //};
            ClientUser user = new ClientUser(siteUser);
            return Ok(user);
        }

        // PUT: api/SiteUsers/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutSiteUser(SiteUser siteUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            //CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            //if (!CheckAccess.IsAccess(cookie, siteUser.id, "User"))
            //    return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));
            using (var ldb = new DatingContext())
            {
                //Если не авторизирован как админ и изменил роль, то блокируем доступ, т к никто кроме админа роль менять не в состоянии
                //if(!Admin && siteUser.roleId!=db.Roles.FirstOrDefault(x=>x.roleName=="User").id;)
                //return null;


                //находим пользователя, от корого собираемся редактировать, для того, чтобы при редактировании не потерять id сессии
                //и пароль, которые от клиента могли бы не прийти и могут обнулиться из за этого
                SiteUser user = ldb.SiteUsers.FirstOrDefault(x => x.id == siteUser.id);
                    //копируем сессию и пароль(если не был отправлен новый) пришедший объект и применяем редактирование
                    if (siteUser.password == null)
                        siteUser.password = user.password;
                    siteUser.sessionId = user.sessionId;
                    siteUser.dateOfEdit = DateTime.Now;


     

                int AdminId = db.Roles.FirstOrDefault(x => x.roleName == "Admin").id;
                int ModerId = db.Roles.FirstOrDefault(x => x.roleName == "Moder").id;

                if ((user.roleId == AdminId) || //Запрещаем не админам реактировать админа
                 ((siteUser.roleId == AdminId || siteUser.roleId == ModerId) && (user.roleId != AdminId && siteUser.roleId != ModerId)) ||//Только админ может дать юзеру дали роль модера или админа
                 ((siteUser.roleId != AdminId && siteUser.roleId != ModerId) && (user.roleId == AdminId && siteUser.roleId == ModerId)))//Только админ может понизить модера или админа в роли(до юзера или забанить)
                {
                    CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
                    if (!CheckAccess.IsAccess(cookie, siteUser.id, "Admin"))
                        return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));
                }
                else
                {
                    CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
                    if (!CheckAccess.IsAccess(cookie, siteUser.id, "User"))
                        return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));
                }

            }


            db.Entry(siteUser).State = EntityState.Modified;
           
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteUserExists(siteUser.id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        
            return CreatedAtRoute("DefaultApi", new { id = siteUser.id }, siteUser);
        }

        // POST: api/SiteUsers
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult PostSiteUser([FromBody]SiteUser siteUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            siteUser.roleId = db.Roles.FirstOrDefault(x=>x.roleName=="User").id;
            siteUser.dateOfEdit = DateTime.Now;
            db.SiteUsers.Add(siteUser);
            db.SaveChanges();

            //IHttpActionResult tmp = CreatedAtRoute("DefaultApi", new { id = siteUser.id }, siteUser);
            Hobby DefaultHobbies = new Hobby();
            DefaultHobbies.siteUserid = siteUser.id;
            db.Hobbies.Add(DefaultHobbies);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = siteUser.id }, siteUser);
        }

        // DELETE: api/SiteUsers/5
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult DeleteSiteUser([FromBody]int id)
        {
            SiteUser siteUser = db.SiteUsers.Find(id);
            if (siteUser == null)
            {
                return NotFound();
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, 0, "Admin"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            List<Avatar> avatar=db.Avatars.Where(x=>x.siteUserId== id).ToList();
            List<DialogList> dialogList = db.DialogLists.Where(x => x.firstUserId == id || x.secondUserId == id).ToList();//?
            List<Dialog> dialogs = db.Dialogs.Where(x => x.from == id || x.to == id).ToList();//?
            List <FriendList> friends = db.Friends.Where(x => x.who == id || x.with == id).ToList();
            List <Gallery> gallery = db.Galleries.Where(x => x.siteUserid == id).ToList();
            List <GuestList> guests = db.Guests.Where(x => x.who == id).ToList();
            List <Hobby> hobby = db.Hobbies.Where(x => x.siteUserid == id).ToList();
            List <LikeList> likes = db.LikeList.Where(x => x.from == id || x.to == id).ToList();

            db.Avatars.RemoveRange(avatar);
            db.DialogLists.RemoveRange(dialogList);
            db.Dialogs.RemoveRange(dialogs);
            db.Friends.RemoveRange(friends);
            db.Galleries.RemoveRange(gallery);
            db.Guests.RemoveRange(guests);
            db.Hobbies.RemoveRange(hobby);
            db.LikeList.RemoveRange(likes);
            db.SiteUsers.Remove(siteUser);

            db.SaveChanges();

            return Ok(siteUser);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SiteUserExists(int id)
        {
            return db.SiteUsers.Count(e => e.id == id) > 0;
        }

       
    }
}