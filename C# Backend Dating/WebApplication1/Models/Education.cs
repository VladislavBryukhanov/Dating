using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Education
    {
        [Key]
        public int id { get; set; }
        public string educationName { get; set; }
    }
}