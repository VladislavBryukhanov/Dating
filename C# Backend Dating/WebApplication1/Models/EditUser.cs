using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class EditUser: ClientUser
    {
        public string sessionId { get; set; }
        public string password { get; set; }

    }
}