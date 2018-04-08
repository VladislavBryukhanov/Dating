using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using System.Web.WebSockets;
using WebApplication1.Models;
using WebApplication1.Security;

namespace WebApplication1.Controllers
{

    public class DialogsController : ApiController
    {
        private DatingContext db = new DatingContext();

        private List<SiteUser> SortWithFilter(Filter filter, string gender)
        {
            bool isAllGender = false;
            if (gender == "Male")
                filter.gender = true;
            else if (gender == "Female")
                filter.gender = false;
            else
                isAllGender = true;

            if (filter.nameForSearch == null)
                filter.nameForSearch = "";
            int from = 0;
            int to = 0;
            int ageFilterid = filter.ageForSearch;
            string ageForSearch = db.AgeForSearch.FirstOrDefault(x => x.id == ageFilterid).rangeOfAge;
            if (ageForSearch != "All")
            {
                from = Convert.ToInt32(ageForSearch.Split(' ')[0]);
                if (from == 53)
                    to = 200;
                else
                    to = Convert.ToInt32(ageForSearch.Split(' ')[2]);
            }
            if (filter.nameForSearch == null)
                filter.nameForSearch = "";
            using (DatingContext db = new DatingContext())
            {
                List<SiteUser> SUsers = db.SiteUsers.Where(x =>
                  ((DateTime.Now.Year - x.birthDay.Year >= from && DateTime.Now.Year - x.birthDay.Year <= to) || filter.ageForSearch == -1)
                  && (x.cityid == filter.cityForSearch || filter.cityForSearch == -1)
                  && (x.typeForSearchid == filter.typeForSearch || filter.typeForSearch == -1)
                  && (x.gender == filter.gender || isAllGender)
                  && x.id != filter.id
                ).ToList();

                return SUsers;
            }
        }


        // GET: api/Dialogs/5
        [ResponseType(typeof(Dialog))]
        public IHttpActionResult GetDialog(int id)
        {
 

            List<Dialog> GetAllMsg = db.Dialogs.Where(x => x.dialogId == id).ToList();
            if (GetAllMsg.Count == 0)
            {
                return NotFound();
            }

            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (!CheckAccess.IsAccess(cookie, GetAllMsg[0].to, "User") && !CheckAccess.IsAccess(cookie, GetAllMsg[0].from, "User"))
                return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));

            return Ok(GetAllMsg);
        }

        // POST: api/Dialogs
        [ResponseType(typeof(Dialog))]//Массовая рассылка для админа, юзеры отсылают сообщения через веб сокеты
        public IHttpActionResult PostDialog([FromBody]MassMessages mm)//MassMessages mm)//[FromBody]int[] to, [FromBody]string msg, [FromBody]int who)
        {
            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(ModelState);
            //}
            Dialog msg = new Dialog();
            DialogList dl = new DialogList();

            Filter filter = new Filter();

            string name = mm.cityForSearch;
            filter.cityForSearch = db.Cities.FirstOrDefault(x => x.cityName == name).id;
            name = mm.typeForSearch;
            filter.typeForSearch = db.TypeForSearch.FirstOrDefault(x => x.typeName == name).id;
            name = mm.ageForSearch;
            filter.ageForSearch = db.AgeForSearch.FirstOrDefault(x => x.rangeOfAge == name).id;
            filter.id = mm.from;

            List<SiteUser> userForSend = SortWithFilter(filter, mm.gender);

            foreach (SiteUser to in userForSend)
            {
                dl = db.DialogLists.FirstOrDefault(x => x.firstUserId == mm.from && x.secondUserId == to.id);
                if (dl == null)//создаем новый диалог в списке если до этого он не был создан
                {
                    dl = new DialogList();
                    dl.firstUserId = mm.from;
                    dl.secondUserId = to.id;
                    db.DialogLists.Add(dl);
                    db.SaveChanges();
                }


                msg.dialogId = dl.id;
                msg.time = DateTime.Now;
                msg.to = to.id;
                msg.from = mm.from;
                msg.content = mm.content;
                msg.content = mm.content;
                db.Dialogs.Add(msg);
                db.SaveChanges();

            }
            List<DialogList> GetAllMsg = db.DialogLists.Where(x => x.firstUserId == mm.from || x.secondUserId== mm.from).ToList();
            return Ok(GetAllMsg);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DialogExists(int id)
        {
            return db.Dialogs.Count(e => e.id == id) > 0;
        }

    }
}