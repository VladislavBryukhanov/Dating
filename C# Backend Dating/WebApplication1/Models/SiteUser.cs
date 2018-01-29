using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class SiteUser
    {
        [Key]
        public int id { get; set; }
        //public string avatar { get; set; }//base64
        //public int avatarId { get; set; }//base64
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public DateTime birthDay { get; set; }

        //public string gender { get; set; }
        public bool gender { get; set; }

        //public string city { get; set; }
        public int weight { get; set; }
        public int height { get; set; }
        //public string education { get; set; }
        public string welcome { get; set; }
        //public string genderForSearch { get; set; }
        //public string ageForSearch { get; set; }
        //public string cityForSearch { get; set; }
        public bool online { get; set; }//online/offline
        public string sessionId { get; set; }
        public DateTime dateOfEdit { get; set; }


        public int roleid { get; set; }//Admin/moder/user/banned
        private Roles role { get; set; }

        public int cityid { get; set; }
        public int educationid { get; set; }
        public int typeForSearchid { get; set; }
        public int ageForSearchid { get; set; }
        public int cityForSearchid { get; set; }


        public SiteUser() { }

        public SiteUser(EditUser user)

        {
            using (DatingContext db = new DatingContext())
            {

                this.password = user.password;
                this.sessionId = user.sessionId;

                this.id = user.id;
                //this.avatarBase64 = avatarBase64;
                this.name = user.name;
                this.email = user.email;
                this.birthDay = user.birthDay;

                if (user.gender== "Male")
                    this.gender = true;
                else
                    this.gender = false;

                this.weight = user.weight;
                this.height = user.height;
                this.welcome = user.welcome;
                this.roleid = user.roleid;
                this.online = user.online;
                this.dateOfEdit = user.dateOfEdit;


                string name = user.city;
                this.cityid = db.Cities.FirstOrDefault(x => x.cityName == name).id;

                name = user.education;
                this.educationid = db.Education.FirstOrDefault(x => x.educationName == name).id;

                name = user.typeForSearch;
                this.typeForSearchid = db.TypeForSearch.FirstOrDefault(x => x.typeName == name).id;

                name = user.ageForSearch;
                this.ageForSearchid = db.AgeForSearch.FirstOrDefault(x => x.rangeOfAge == name).id;

                name = user.cityForSearch;
                this.cityForSearchid = db.Cities.FirstOrDefault(x => x.cityName == name).id;


            }
        }
    }
}