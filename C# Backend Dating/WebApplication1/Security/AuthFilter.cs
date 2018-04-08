using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using WebApplication1.Models;

namespace WebApplication1.Security
{
    public class CustomAuthorizationAttribute : Attribute, IAuthorizationFilter
    {
        private string[] usersList;
        private int id;
        //private CookieHeaderValue cookie;
        public CustomAuthorizationAttribute( int id, params string[] users)
        {
            this.usersList = users;
            this.id = id;
            //CookieHeaderValue cookie = HttpRequestMessage.Headers.GetCookies("UserSession").FirstOrDefault();
            //this.cookie = req.Headers.GetCookies("UserSession").FirstOrDefault();
        }
        //public CustomAuthorizationAttribute(HttpRequestMessage req)
        //{
        //    this.cookie = req.Headers.GetCookies("UserSession").FirstOrDefault();
        //}
        //public CustomAuthorizationAttribute(params int[] id)
        //{
        //    this.id = id;
        //}
        public Task<HttpResponseMessage> ExecuteAuthorizationFilterAsync(HttpActionContext actionContext,
                        CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            IPrincipal principal = actionContext.RequestContext.Principal;

            if (principal == null || !usersList.Contains(principal.Identity.Name))
            {
                return Task.FromResult<HttpResponseMessage>(
                       actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized));
            }
            else
            {
                return continuation();
            }
        }
        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}
