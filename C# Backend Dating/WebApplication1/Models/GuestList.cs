using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class GuestList
    {
        [Key]
        public int id { get; set; }
        public int who { get; set; }
        public int to { get; set; }
        public DateTime lastVisit { get; set; }
        public int count { get; set; }

        [ForeignKey("who")]
        private SiteUser siteUserwho { get; set; }
        [ForeignKey("to")]
        private SiteUser siteUserto { get; set; }

    }
}