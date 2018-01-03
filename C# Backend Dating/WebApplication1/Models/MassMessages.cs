using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class MassMessages
    {
        public int[] to { get; set; }
        public string content { get; set; }
        public int from { get; set; }
    }
}