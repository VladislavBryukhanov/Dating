using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Gallery
    {
        [Key]
        public int id { get; set; }
        public string content { get; set; }//byte[]
        public int siteUserid { get; set; }
        private SiteUser siteUser { get; set; }
    }
}