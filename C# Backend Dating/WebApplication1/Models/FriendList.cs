using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

    }
}