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
        public string gender { get; set; }
        public string city { get; set; }
        public int weight { get; set; }
        public int height { get; set; }
        public string education { get; set; }
        public string welcome { get; set; }
        public string genderForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }
        public bool online { get; set; }//online/offline
        public string sessionId { get; set; }
        public DateTime dateOfEdit { get; set; }


        public int roleid { get; set; }//Admin/moder/user/banned
        private Roles role { get; set; }
    }
}