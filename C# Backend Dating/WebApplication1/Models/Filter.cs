using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Filter
    {
        public int id { get; set; }
        public string gender { get; set; }
        public string nameForSearch { get; set; }
        public string genderForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }

    }
}