using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Hobby
    {
        public int id { get; set; }
        public int siteUserid { get; set; }
        public bool animals { get; set; }
        public bool music { get; set; }
        public bool sport { get; set; }
        public bool traveling { get; set; }
        public bool cinema { get; set; }
        public bool dance { get; set; }
        public bool theatre { get; set; }
    }
}