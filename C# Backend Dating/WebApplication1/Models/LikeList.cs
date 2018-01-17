using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class LikeList
    {
        [Key]
        public int id { get; set; }
        public int from { get; set; }//user whitch send like
        public int to { get; set; }//user whitch was liked

        [ForeignKey("from")]
        private SiteUser siteUserfrom { get; set; }
        [ForeignKey("to")]
        private SiteUser siteUserto { get; set; }

    }
}