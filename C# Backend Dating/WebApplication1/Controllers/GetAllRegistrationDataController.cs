using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class GetAllRegistrationDataController : ApiController
    {
        private DatingContext db = new DatingContext();
        public object GetData()
        {
            //под id -1 в базе хранится пункт All который нет смысла выводить в списке данных
            List<Cities> cities = db.Cities.Where(x =>  x.id != -1).OrderBy(x=>x.cityName).ToList();
            List<AgeForSearch> ageForSearch = db.AgeForSearch.Where(x => x.id != -1).OrderBy(x => x.rangeOfAge).ToList();
            List<TypeForSearch> typeForSearch = db.TypeForSearch.Where(x => x.id != -1).OrderBy(x => x.typeName).ToList();
            List<Education> education = db.Education.Where(x => x.id != -1).OrderBy(x => x.educationName).ToList();
            object data = new
            {
                cities,
                ageForSearch,
                typeForSearch,
                education
            };
            return data;
        }
    }
}
