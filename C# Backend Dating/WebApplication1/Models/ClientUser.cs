using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class ClientUser
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        //public string password { get; set; }//
        public DateTime birthDay { get; set; }
        public string gender { get; set; }
        public string city { get; set; }
        public int weight { get; set; }
        public int height { get; set; }
        public string education { get; set; }
        public string welcome { get; set; }
        public string typeForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }
        public int roleid { get; set; }//Admin/moder/user/banned
        public bool online { get; set; }//online/offline
        //public string sessionId { get; set; }
        public DateTime dateOfEdit { get; set; }
        public ClientUser(){ }
        public ClientUser(SiteUser user)

        {
            using (DatingContext db = new DatingContext())
            {
                this.id = user.id;
                //this.avatarBase64 = avatarBase64;
                this.name = user.name;
                this.email = user.email;
                this.birthDay = user.birthDay;

                if (user.gender)
                    this.gender = "Male";
                else
                    this.gender = "Female";



                this.weight = user.weight;
                this.height = user.height;
                this.welcome = user.welcome;
                this.roleid = user.roleid;
                this.online = user.online;
                this.dateOfEdit = user.dateOfEdit;

                int id = user.cityid;
                this.city = db.Cities.FirstOrDefault(x => x.id == id).cityName;

                id = user.educationid;
                this.education = db.Education.FirstOrDefault(x => x.id == id).educationName;

                id = user.typeForSearchid;
                this.typeForSearch = db.TypeForSearch.FirstOrDefault(x => x.id == id).typeName;

                id = user.ageForSearchid;
                this.ageForSearch = db.AgeForSearch.FirstOrDefault(x => x.id == id).rangeOfAge;

                id = user.cityForSearchid;
                this.cityForSearch = db.Cities.FirstOrDefault(x => x.id == id).cityName;

            }
        }
    }
}