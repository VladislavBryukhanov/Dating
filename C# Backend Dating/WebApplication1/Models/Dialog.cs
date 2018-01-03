using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Dialog
    {
        [Key]
        public int id { get; set; }
        public int dialogid { get; set; }
        public int from { get; set; }
        public int to { get; set; }
        public DateTime time { get; set; }
        public string content { get; set; }

    }
}