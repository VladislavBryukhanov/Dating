using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class DialogList
    {
        [Key]
        public int id { get; set; }
        public int firstUserId { get; set; }
        public int secondUserId { get; set; }

        [ForeignKey("firstUserId")]
        private SiteUser siteUserfirstUserId { get; set; }
        [ForeignKey("secondUserId")]
        private SiteUser siteUsersecondUserId { get; set; }
    }
}