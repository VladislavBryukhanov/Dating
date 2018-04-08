using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class MassMessages
    {
        //public Filter to { get; set; }
        public string gender { get; set; }
        public string typeForSearch { get; set; }
        public string ageForSearch { get; set; }
        public string cityForSearch { get; set; }

        public string content { get; set; }
        public int from { get; set; }
    }
}