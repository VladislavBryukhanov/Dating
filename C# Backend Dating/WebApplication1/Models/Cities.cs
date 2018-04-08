using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models
{
    public class Cities
    {
        [Key]
        public int id { get; set; }
        public string cityName { get; set; }
    }
}