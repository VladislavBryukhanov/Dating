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
        public string gender { get; set; }
        public string nameForSearch { get; set; }
        public string genderForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }

        public int[] getUsersWithId { get; set; }
        public int page { get; set; }

        public Filter() { }
        public Filter(SiteUser user)
        {
            this.id = user.id;
            this.gender = user.gender;
            this.genderForSearch = user.genderForSearch;
            this.ageForSearch = user.ageForSearch;
            this.cityForSearch = user.cityForSearch;
        }

    }
}