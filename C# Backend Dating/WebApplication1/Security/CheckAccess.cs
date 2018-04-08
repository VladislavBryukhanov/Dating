using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Web;
using WebApplication1.Models;

namespace WebApplication1.Security
{
    public class CheckAccess
    {
        public static bool IsAccess(CookieHeaderValue cookie, int id, string allowedRole)
        {
            //По факту существует 2 allowedRole- юзер, которая означает, что данные доступны всем(кроме забаненного) и Админ, означающая,что доступ только у админа, нет того, что может юзер, но не может модер и того, что может модер, но не может админ
            DatingContext db = new DatingContext();
            SiteUser siteUser = new SiteUser();
            if (cookie != null)
            {
                string sessionId = cookie["UserSession"].Value;
                SiteUser authDate = JsonConvert.DeserializeObject<SiteUser>(sessionId);
                siteUser = db.SiteUsers.FirstOrDefault((x) => x.sessionId == authDate.sessionId &&
                                                                x.id == authDate.id &&
                                                                x.roleid == authDate.roleid);
            }
            if (siteUser != null)
            {
                if(allowedRole!= "Admin")//Модератор=Админ, но он не имеет доступа к редактированию админской страницы и ролей юзеров(кроме бан/разбан)это исключительно админская привилегия => разграничиваем
                {
                    if (siteUser.roleid == db.Roles.FirstOrDefault(x => x.roleName == "Admin").id ||
                        siteUser.roleid == db.Roles.FirstOrDefault(x => x.roleName == "Moder").id ||
                        siteUser.roleid == db.Roles.FirstOrDefault(x => x.roleName == allowedRole).id && id == siteUser.id)
                        return true;
                    else
                        return false;
                }
                else  if (siteUser.roleid == db.Roles.FirstOrDefault(x => x.roleName == "Admin").id)
                    return true;
                else
                    return false;

            }
            else
                return false;
        }
    }
}