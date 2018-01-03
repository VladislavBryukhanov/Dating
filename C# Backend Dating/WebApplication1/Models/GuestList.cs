using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    }
}