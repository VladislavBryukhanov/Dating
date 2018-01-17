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
        public string genderForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }
        public int roleid { get; set; }//Admin/moder/user/banned
        public bool online { get; set; }//online/offline
        //public string sessionId { get; set; }
        public DateTime dateOfEdit { get; set; }
        public ClientUser(SiteUser user)

        {
            this.id = user.id;
            //this.avatarBase64 = avatarBase64;
            this.name = user.name;
            this.email = user.email;
            this.birthDay = user.birthDay;
            this.gender = user.gender;
            this.city = user.city;
            this.weight = user.weight;
            this.height = user.height;
            this.education = user.education;
            this.welcome = user.welcome;
            this.genderForSearch = user.genderForSearch;
            this.ageForSearch = user.ageForSearch;
            this.cityForSearch = user.cityForSearch;
            this.roleid = user.roleid;
            this.online = user.online;
            this.dateOfEdit = user.dateOfEdit;
        }
    }
}