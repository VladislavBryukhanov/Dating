using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*")]
    public class RolesController : ApiController
    {
        private DatingContext db = new DatingContext();

        // GET: api/Roles
        public IQueryable<Roles> GetRoles()
        {
            return db.Roles;
        }

      
    }
}