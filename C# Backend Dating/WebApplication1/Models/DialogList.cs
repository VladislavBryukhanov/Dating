using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    }
}