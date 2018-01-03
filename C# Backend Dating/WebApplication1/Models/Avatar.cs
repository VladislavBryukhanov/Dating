using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Avatar
    {
        public int id { get; set; }
        public int siteUserId { get; set; }
        public string base64 { get; set; }
        public DateTime dateOfChange { get; set; }
        public string confirmState { get; set; }
    }
}