using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Filter
    {
        public int id { get; set; }
        public bool isOnline { get; set; }
        public bool gender { get; set; }
        public string nameForSearch { get; set; }
        public int typeForSearch { get; set; }
        public int ageForSearch { get; set; }
        public int cityForSearch { get; set; }

        public int[] getUsersWithId { get; set; }
        public int page { get; set; }

        public Filter() { }
        public Filter(SiteUser user)
        {
            this.id = user.id;
            this.gender = user.gender;
            this.typeForSearch = user.typeForSearchid;
            this.ageForSearch = user.ageForSearchid;
            this.cityForSearch = user.cityForSearchid;
        }

    }
}