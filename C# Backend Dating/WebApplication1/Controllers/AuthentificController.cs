using Newtonsoft.Json;
using System;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [EnableCors(origins: "http://localhost:3000", headers: "*", methods: "*", SupportsCredentials = true)]
    public class AuthentificController : ApiController
    {
            DatingContext db = new DatingContext();
        string PasswordToMD5(string Password)
        {
            using (MD5 md5Hash = MD5.Create())
            {
                byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(Password));

                StringBuilder sBuilder = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }
                return sBuilder.ToString();
            }
        }
        public IHttpActionResult PutResetPasword([FromBody]string email)
        {
            SiteUser user = db.SiteUsers.FirstOrDefault(x => x.email == email);
            if (user == null)
                return BadRequest();
            string passwordGenerator;
            Guid newPas = Guid.NewGuid();
            passwordGenerator = newPas.ToString().Split('-')[0];
            user.password = PasswordToMD5(passwordGenerator);
            db.Entry(user).State = EntityState.Modified;
            db.SaveChanges();

            var fromAddress = new MailAddress("MGDriveTwo@gmail.com", "Dating");
            var toAddress = new MailAddress(email, "To User");
            const string fromPassword = "dalw31523";
            const string subject = "Reset password";
            string body = "Hello, it is your new password:" + passwordGenerator;

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
            };
            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            })
            {
                smtp.Send(message);
            }
            return Ok("OK");
        }
        public object PostLogIn([FromBody]SiteUser LoginData)
        {

            SiteUser siteUser;
            LoginData.password= PasswordToMD5(LoginData.password);
            //if (LoginData.sessionId!=null)
            //     siteUser = db.SiteUsers.FirstOrDefault((x) => x.sessionId == LoginData.sessionId &&
            //                                                   x.id == LoginData.id &&
            //                                                   x.roleId == LoginData.roleId);
            //else
            {
                siteUser = db.SiteUsers.FirstOrDefault((x) => x.password == LoginData.password &&
                                                              x.email == LoginData.email);
                if (siteUser == null)
                    return "Access denied!";
                Guid g;
                g = Guid.NewGuid();
                siteUser.sessionId = g.ToString();
                db.Entry(siteUser).State = EntityState.Modified;
                db.SaveChanges();
            }
            if (siteUser == null)
                return "Access denied!";

            //if (SiteUser.Identity.IsAuthenticated)
            //{
            //    string result = "Ваш логин: " + User.Identity.Name;
            //}
            //if (siteUser != null)
            //    FormsAuthentication.SetAuthCookie(LoginData.Email, true);

            //HttpResponseMessage
            //var vals = new NameValueCollection();
            //vals["SessionId"] = "123456";
            //vals["Role"] = siteUser.Role;

            //var cookie = new CookieHeaderValue("UserSession", vals);

            //var response = Request.CreateResponse<IEnumerable>(HttpStatusCode.OK, db.SiteUsers);
            //response.Headers.AddCookies(new CookieHeaderValue[] { cookie });
            //return response;


            object resp = new { siteUser.id, siteUser.roleId, siteUser.sessionId };
            return resp;
        }
        
        //[MyAuthoriseAttribute(Roles = "admin", Users = "admin@gmail.com")]
        public object GetAccess()
        {
            //CookieHeaderValue namelC= Request.Headers.GetCookies().FirstOrDefault();
            SiteUser siteUser=new SiteUser();
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserSession").FirstOrDefault();
            if (cookie != null)
            {
                //SiteUser siteUser = db.SiteUsers.FirstOrDefault((x) =>  x.sessionId == LoginData.sessionId &&
                //                                                        x.id == LoginData.id &&
                //                                                        x.roleId == LoginData.roleId);
                string sessionId = cookie["UserSession"].Value;
                SiteUser authDate = JsonConvert.DeserializeObject<SiteUser>(sessionId);
                siteUser = db.SiteUsers.FirstOrDefault((x) =>   x.sessionId == authDate.sessionId &&
                                                                x.id == authDate.id &&
                                                                x.roleId == authDate.roleId);

                //siteUser = db.SiteUsers.FirstOrDefault((x) => x.sessionId == sessionId);//Ищем юзера по сессии

                //dynamic acc = JsonConvert.DeserializeObject<object>(sessionId);
                //string id = acc.First.ToString();
                //SiteUser acc = JsonConvert.DeserializeObject<SiteUser>(sessionId);
                //string sessionId = acc.Next();
                //string sessionId = cookie["UserSession"].Value.Trim(new Char[] { '{', '}', ',','/' });
            }
            if (siteUser != null)
                return new { siteUser.id, siteUser.roleId, siteUser.sessionId };
            else 
                return "Access denied!"; 
            //string sessionId = "";

            //CookieHeaderValue cookie2 = Request.Headers.GetCookies("session-id").FirstOrDefault();
            //if (cookie2 != null)
            //{
            //    sessionId = cookie2["session-id"].Value;
            //}

            //var resp = new HttpResponseMessage();

            //var cookie = new CookieHeaderValue("session-id", "12345");
            //cookie.Expires = DateTimeOffset.Now.AddDays(1);
            //cookie.Domain = Request.RequestUri.Host;
            //cookie.Path = "/";

            //resp.Headers.AddCookies(new CookieHeaderValue[] { cookie });
            //return resp;
        }
       
    }
}
