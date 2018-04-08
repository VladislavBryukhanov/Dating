using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class HobbyOfUser
    {
        [Key]
        public int id { get; set; }
        public int hobbyid { get; set; }
        public HobbyList hobby { get; set; }
        public int siteUserid { get; set; }
        private SiteUser siteUser { get; set; }
    }
}