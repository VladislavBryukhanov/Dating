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
using System.Security.Cryptography;
using System.Text;
using System.Web;
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



        private object SortByFilter(Filter filter, int page)// List<ClientUser>
        {
            if (filter.nameForSearch == null)
                filter.nameForSearch = "";
            //if (filter.isOnline)

            int startNum = (page-1) * 12;
            int from = 0;
            int to = 0;
            if (filter.ageForSearch != "All")
            {

                from = Convert.ToInt32(filter.ageForSearch.Split(' ')[0]);
                if (from == 53)
                    to = 200;
                else
                    to = Convert.ToInt32(filter.ageForSearch.Split(' ')[2]);

   
            }
            if (filter.nameForSearch == null)
                filter.nameForSearch = "";
            using (DatingContext db = new DatingContext())
            {
                List<SiteUser> SUsers = db.SiteUsers.Where(x =>
                  ((DateTime.Now.Year - x.birthDay.Year >= from && DateTime.Now.Year - x.birthDay.Year <= to) || filter.ageForSearch == "All")
                  && x.name.Contains(filter.nameForSearch)
                  && (x.city == filter.cityForSearch || filter.cityForSearch == "All")
                  && (x.genderForSearch == filter.genderForSearch || filter.genderForSearch == "All")
                  && x.id != filter.id
                  && (x.online== filter.isOnline || x.online==true)//online == false тогда фильтр по онлайну отключени и true || false делает выборку всего "игнорируя" этот пункт, если же включен, то выходит true||true тоесть фильтр по онлайну работает
                  && x.name.Contains(filter.nameForSearch)
                ).OrderBy(x => x.name).Skip(startNum).Take(12).ToList();

                SUsers.Add(db.SiteUsers.FirstOrDefault(x => x.id == filter.id));

                List<ClientUser> userList = new List<ClientUser>();
                foreach (SiteUser user in SUsers)
                {
                    userList.Add(new ClientUser(user));
                }

                List<int> id = new List<int>();//На фронтеэнде его отправим в вебсокет обновления статуса
                for (int i = 0; i < userList.Count; i++)
                {
                    id.Add(userList[i].id);
                }
                List<Avatar> avatars = AvatarsController.GetAvatars(id.ToArray());
                //object sendData = new { userList, avatars };
                return new { userList, avatars, id };
            }
        }

        string PasswordToMD5(string Password)
        {
            using (MD5 md5Hash = MD5.Create())
            {
                byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(Password));

                StringBuilder sBuilder = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }
                return sBuilder.ToString();
            }
        }
        
        //// GET: api/SiteUsers
        //public object GetSiteUsers()
        //{
         
        //    List<ClientUser> users=new List<ClientUser>();
        //    foreach(SiteUser user in db.SiteUsers)
        //    {
        //        users.Add(new ClientUser(user));
        //    }
        //    return users;
        //}

        // GET: api/SiteUsers
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult GetSiteUsers(int id, int page)
        {
            SiteUser siteUser = db.SiteUsers.Find(id);
            if (siteUser == null)
            {
                return NotFound();
            }
            //SortByFilter(new Filter(siteUser));
            return Ok(SortByFilter(new Filter(siteUser), page));
        }

        // GET: api/SiteUsers
        //[HttpPost]
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult GetOneSiteUser(int id)
        {
            ClientUser siteUser = new ClientUser(db.SiteUsers.Find(id));
            if (siteUser == null)
            {
                return NotFound();
            }
            //Avatar avatar = db.Avatars.FirstOrDefault(x => x.siteUserId == id &&
            //                                             x.confirmState == "Confirmed");
            List<Avatar> avatar = AvatarsController.GetAvatars(new int[1] {id});

            return Ok(new { siteUser, avatar });
        }

        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult GetSiteUsers(int id, int page, string name, bool isOnline)
        {
            SiteUser siteUser = db.SiteUsers.Find(id);
            if (siteUser == null)
            {
                return NotFound();
            }
            Filter filter = new Filter(siteUser);
            filter.nameForSearch = name;
            filter.isOnline = isOnline;
            //SortByFilter(new Filter(siteUser));
            return Ok(SortByFilter(filter, page));
        }

        // PUT: api/SiteUsers
        [ResponseType(typeof(void))]
        public IHttpActionResult PutSiteUser(SiteUser siteUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            using (var ldb = new DatingContext())
            {
                //находим пользователя, от корого собираемся редактировать, для того, чтобы при редактировании не потерять id сессии
                //и пароль, которые от клиента могли бы не прийти и могут обнулиться из за этого
                SiteUser user = ldb.SiteUsers.FirstOrDefault(x => x.id == siteUser.id);
                //копируем сессию и пароль(если не был отправлен новый) пришедший объект и применяем редактирование
                if (siteUser.password == null)
                    siteUser.password = user.password;
                else
                    siteUser.password= PasswordToMD5(siteUser.password);
                siteUser.sessionId = user.sessionId;
                siteUser.dateOfEdit = DateTime.Now;

     

                int AdminId = db.Roles.FirstOrDefault(x => x.roleName == "Admin").id;
                int ModerId = db.Roles.FirstOrDefault(x => x.roleName == "Moder").id;

                if ((user.roleid == AdminId) || //Запрещаем не админам реактировать админа
                 ((siteUser.roleid == AdminId || siteUser.roleid == ModerId) && (user.roleid != AdminId && siteUser.roleid != ModerId)) ||//Только админ может дать юзеру дали роль модера или админа
                 ((siteUser.roleid != AdminId && siteUser.roleid != ModerId) && (user.roleid == AdminId && siteUser.roleid == ModerId)))//Только админ может понизить модера или админа в роли(до юзера или забанить)
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

            ClientUser clientUser = new ClientUser(siteUser);

            //return Ok(SortByFilter(new Filter(siteUser),1));
            return CreatedAtRoute("DefaultApi", new { id = clientUser.id }, clientUser);
        }


        // POST: api/SiteUsers
        [ResponseType(typeof(SiteUser))]
        public IHttpActionResult PostSiteUser([FromBody]SiteUser siteUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if(db.SiteUsers.FirstOrDefault(x=>x.email==siteUser.email)!=null)
            {
                return BadRequest("Email already exist!");
            }
            siteUser.password = PasswordToMD5(siteUser.password);
            siteUser.roleid = db.Roles.FirstOrDefault(x=>x.roleName=="User").id;
            siteUser.dateOfEdit = DateTime.Now;
            db.SiteUsers.Add(siteUser);
            db.SaveChanges();

            Hobby DefaultHobbies = new Hobby();
            DefaultHobbies.siteUserid = siteUser.id;
            db.Hobbies.Add(DefaultHobbies);
            db.SaveChanges();

            ClientUser clientUser = new ClientUser(siteUser);
            return CreatedAtRoute("DefaultApi", new { id = clientUser.id }, clientUser);
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

            //List<Avatar> avatar=db.Avatars.Where(x=>x.siteUserId== id).ToList();
            //List<DialogList> dialogList = db.DialogLists.Where(x => x.firstUserId == id || x.secondUserId == id).ToList();//?
            //List<Dialog> dialogs = db.Dialogs.Where(x => x.from == id || x.to == id).ToList();//?
            //List <FriendList> friends = db.Friends.Where(x => x.who == id || x.with == id).ToList();
            //List <Gallery> gallery = db.Galleries.Where(x => x.siteUserid == id).ToList();
            //List <GuestList> guests = db.Guests.Where(x => x.who == id).ToList();
            //List <Hobby> hobby = db.Hobbies.Where(x => x.siteUserid == id).ToList();
            //List <LikeList> likes = db.LikeList.Where(x => x.from == id || x.to == id).ToList();

            //db.Avatars.RemoveRange(avatar);
            //db.DialogLists.RemoveRange(dialogList);
            //db.Dialogs.RemoveRange(dialogs);
            //db.Friends.RemoveRange(friends);
            //db.Galleries.RemoveRange(gallery);
            //db.Guests.RemoveRange(guests);
            //db.Hobbies.RemoveRange(hobby);
            //db.LikeList.RemoveRange(likes);
            //db.SiteUsers.Remove(siteUser);
            string path = HttpContext.Current.Server.MapPath("~")
                                            + "UserFiles\\"
                                            + db.SiteUsers.FirstOrDefault(x => x.id == siteUser.id).email + "\\";

            if (!Directory.Exists(path))
                Directory.Delete(path, true); //true - если директория не пуста удаляем все ее содержимое

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