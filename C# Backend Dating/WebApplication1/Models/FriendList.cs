using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class FriendList
    {
        [Key]
        public int id { get; set; }
        public int who { get; set; }
        public int with { get; set; }

        [ForeignKey("who")]
        private SiteUser siteUserwho { get; set; }
        [ForeignKey("with")]
        private SiteUser siteUserwith { get; set; }
    }
}