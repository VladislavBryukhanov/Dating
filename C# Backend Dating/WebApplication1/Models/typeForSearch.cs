using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class TypeForSearch
    {
        [Key]
        public int id { get; set; }
        public string typeName { get; set; }
    }
}